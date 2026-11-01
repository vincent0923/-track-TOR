#!/usr/bin/env python3
"""
COROS MCP CLI & Local Server for 推拉机 track-TOR (with integrated 饮食账本)
Compatible with official `coros-mcp` (npm install -g coros-mcp) protocol and state format.
"""
import argparse
import base64
import hashlib
import http.cookiejar
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from pathlib import Path

DEFAULT_SCOPES = "openid offline_access mcp.tools"
DEFAULT_CLIENT_NAME = "COROS MCP Gateway CLI"
DEFAULT_REDIRECT_URI = "http://127.0.0.1:43123/callback"
DEFAULT_ISSUER = "https://mcp.coros.com"
DEFAULT_LOGIN_TIMEOUT = 300
DEFAULT_POLL_INTERVAL = 3
DEFAULT_TOOL_CATALOG_TTL_SECONDS = 300

REGIONAL_ISSUER_CACHE_KEYS = {
    "https://mcpcn.coros.com": "cn",
    "https://mcpeu.coros.com": "eu",
    "https://mcpus.coros.com": "us",
}

BASE_DIR = Path(__file__).resolve().parent
# Auto-detect state root across tuilaji and parent dir
def get_state_root():
    env_root = os.environ.get("MCP_CACHE_ROOT")
    if env_root:
        return Path(env_root)
    for cand in [BASE_DIR / ".coros-mcp-state", BASE_DIR.parent / ".coros-mcp-state", Path.home() / ".coros-mcp-skill-gateway-ts"]:
        if cand.exists():
            return cand
    return BASE_DIR / ".coros-mcp-state"

STATE_ROOT = get_state_root()
try:
    us_token = STATE_ROOT / "us" / "token.json"
    flat_token = BASE_DIR / "coros-token.json"
    if not us_token.exists():
        if os.environ.get("COROS_TOKEN_JSON"):
            us_token.parent.mkdir(parents=True, exist_ok=True)
            us_token.write_text(os.environ["COROS_TOKEN_JSON"], encoding="utf-8")
        elif flat_token.exists():
            us_token.parent.mkdir(parents=True, exist_ok=True)
            us_token.write_text(flat_token.read_text(encoding="utf-8"), encoding="utf-8")
except Exception:
    pass
LEDGER_DATA_PATH = BASE_DIR / "ledger-data.json"
DIET_DATA_PATH = BASE_DIR / "diet-data.json"
TRAIN_DATA_PATH = BASE_DIR / "train-data.json"


class AuthFlowError(Exception):
    pass


class JsonStore:
    def __init__(self, file_path: Path):
        self.file_path = file_path

    def load(self):
        if not self.file_path.exists():
            return None
        try:
            return json.loads(self.file_path.read_text(encoding="utf-8"))
        except Exception:
            return None

    def save(self, value):
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = self.file_path.with_suffix(self.file_path.suffix + ".tmp")
        temp_path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.chmod(temp_path, 0o600)
        temp_path.replace(self.file_path)
        os.chmod(self.file_path, 0o600)

    def clear(self):
        if self.file_path.exists():
            self.file_path.unlink()


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class SimpleHttpClient:
    def __init__(self):
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cj),
            NoRedirectHandler(),
        )

    def request(self, method: str, url: str, headers=None, form=None, json_body=None, timeout=15):
        req_headers = dict(headers or {})
        data = None
        if form is not None:
            data = urllib.parse.urlencode(form).encode("utf-8")
            req_headers["Content-Type"] = "application/x-www-form-urlencoded"
        if json_body is not None:
            data = json.dumps(json_body).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        try:
            resp = self.opener.open(req, timeout=timeout)
            return resp.status, dict(resp.headers), resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            return e.code, dict(e.headers), body

    def read_json(self, headers: dict, raw: str):
        if not raw.strip():
            return {}
        ct = ""
        for k, v in headers.items():
            if k.lower() == "content-type":
                ct = v.lower()
                break
        if "text/event-stream" in ct:
            event_payloads = []
            current_lines = []
            for line in raw.splitlines():
                if not line.strip():
                    if current_lines:
                        event_payloads.append("\n".join(current_lines))
                        current_lines = []
                    continue
                if line.startswith("data:"):
                    current_lines.append(line[5:].lstrip())
            if current_lines:
                event_payloads.append("\n".join(current_lines))
            if not event_payloads:
                return {}
            return json.loads(event_payloads[-1])
        return json.loads(raw)


def normalize_issuer(issuer: str) -> str:
    return issuer.rstrip("/")


def discover_gateway_issuer(issuer: str) -> str:
    norm = normalize_issuer(issuer)
    if norm != DEFAULT_ISSUER:
        return norm
    try:
        client = SimpleHttpClient()
        status, headers, raw = client.request("GET", f"{norm}/.well-known/openid-configuration", timeout=8)
        if status == 200:
            payload = json.loads(raw)
            if isinstance(payload, dict) and isinstance(payload.get("issuer"), str) and payload["issuer"].startswith("https://"):
                return normalize_issuer(payload["issuer"])
    except Exception as e:
        sys.stderr.write(f"warning: gateway discovery failed, using {norm}: {e}\n")
    return norm


def cache_key_for_issuer(issuer: str) -> str:
    norm = normalize_issuer(issuer)
    if norm in REGIONAL_ISSUER_CACHE_KEYS:
        return REGIONAL_ISSUER_CACHE_KEYS[norm]
    try:
        host = urllib.parse.urlparse(norm).hostname
        if host:
            return host.replace(".", "-")
    except Exception:
        pass
    return "default"


def token_url_safe(nbytes: int) -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(nbytes)).decode("ascii").rstrip("=")


def generate_pkce_verifier() -> str:
    return token_url_safe(32)


def build_pkce_challenge(verifier: str) -> str:
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


def get_header(headers: dict, name: str):
    for k, v in headers.items():
        if k.lower() == name.lower():
            return v
    return None


def extract_code_and_state(callback_url: str):
    parsed = urllib.parse.urlparse(callback_url)
    qs = urllib.parse.parse_qs(parsed.query)
    code = qs.get("code", [""])[0]
    state = qs.get("state", [""])[0]
    if not code or not state:
        raise AuthFlowError("client callback is missing code or state")
    return code, state


def append_login_ticket(authorize_url: str, login_ticket: str) -> str:
    parsed = urllib.parse.urlparse(authorize_url)
    qs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    qs.append(("login_ticket", login_ticket))
    new_query = urllib.parse.urlencode(qs)
    return urllib.parse.urlunparse(parsed._replace(query=new_query))


def token_set_from_response(payload: dict, client_id: str) -> dict:
    access_token = payload.get("access_token")
    refresh_token = payload.get("refresh_token")
    if not access_token or not isinstance(access_token, str):
        raise AuthFlowError("token response is missing access_token")
    if not refresh_token or not isinstance(refresh_token, str):
        raise AuthFlowError("token response is missing refresh_token")
    expires_in = int(payload.get("expires_in", 3600))
    now = int(time.time())
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": payload.get("token_type", "Bearer"),
        "expires_in": expires_in,
        "obtained_at_epoch": now,
        "expires_at_epoch": now + expires_in,
        "client_id": client_id,
    }


def is_expired(token_set: dict) -> bool:
    expires_at = token_set.get("expires_at_epoch", 0)
    return int(time.time()) + 60 >= expires_at


class CorosMcpLoginHelper:
    def __init__(self, issuer: str = None):
        raw_issuer = issuer or os.environ.get("MCP_ISSUER_URL", DEFAULT_ISSUER)
        self.issuer = discover_gateway_issuer(raw_issuer)
        self.mcp_url = f"{self.issuer}/mcp"
        self.client_name = DEFAULT_CLIENT_NAME
        self.redirect_uri = DEFAULT_REDIRECT_URI
        self.scopes = DEFAULT_SCOPES
        region = cache_key_for_issuer(self.issuer)
        self.token_store = JsonStore(STATE_ROOT / region / "token.json")
        self.pending_store = JsonStore(STATE_ROOT / region / "pending-login.json")
        self.catalog_store = JsonStore(STATE_ROOT / region / "tool-catalog.json")
        self.http = SimpleHttpClient()

    def register_client(self) -> str:
        status, headers, raw = self.http.request(
            "POST",
            f"{self.issuer}/connect/register",
            json_body={
                "client_name": self.client_name,
                "redirect_uris": [self.redirect_uri],
                "grant_types": ["authorization_code", "refresh_token"],
                "response_types": ["code"],
                "scope": self.scopes,
                "token_endpoint_auth_method": "none",
            },
        )
        payload = self.http.read_json(headers, raw)
        if status not in (200, 201):
            raise AuthFlowError(f"client registration failed ({status}): {payload}")
        cid = payload.get("client_id")
        if not cid:
            raise AuthFlowError("client registration response is missing client_id")
        return cid

    def build_authorize_url(self, client_id: str, challenge: str, state: str) -> str:
        qs = urllib.parse.urlencode({
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": self.redirect_uri,
            "scope": self.scopes,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "resource": self.mcp_url,
            "state": state,
        })
        return f"{self.issuer}/oauth2/authorize?{qs}"

    def create_cli_session(self, client_id: str) -> dict:
        status, headers, raw = self.http.request(
            "POST",
            f"{self.issuer}/api/v1/cli/login-sessions",
            json_body={"clientId": client_id},
        )
        payload = self.http.read_json(headers, raw)
        if status not in (200, 201):
            raise AuthFlowError(f"cli session creation failed ({status}): {payload}")
        for f in ("sessionId", "pollToken", "loginUrl", "expiresAt"):
            if not payload.get(f):
                raise AuthFlowError(f"response is missing {f}")
        return payload

    def start_device_login(self) -> dict:
        client_id = self.register_client()
        verifier = generate_pkce_verifier()
        challenge = build_pkce_challenge(verifier)
        state = token_url_safe(24)
        authorize_url = self.build_authorize_url(client_id, challenge, state)
        cli_session = self.create_cli_session(client_id)
        pending = {
            "issuer": self.issuer,
            "client_id": client_id,
            "verifier": verifier,
            "state": state,
            "authorize_url": authorize_url,
            "session_id": cli_session["sessionId"],
            "poll_token": cli_session["pollToken"],
            "login_url": cli_session["loginUrl"],
            "expires_at": cli_session["expiresAt"],
            "poll_interval": max(1, int(cli_session.get("intervalSeconds") or DEFAULT_POLL_INTERVAL)),
        }
        self.pending_store.save(pending)
        return pending

    def claim_session_once(self, pending: dict = None) -> dict:
        pending = pending or self.pending_store.load()
        if not pending:
            raise AuthFlowError("no pending login session found")
        status, headers, raw = self.http.request(
            "POST",
            f"{self.issuer}/api/v1/cli/login-sessions/{pending['session_id']}/claim",
            headers={"X-Poll-Token": pending["poll_token"]},
        )
        payload = self.http.read_json(headers, raw)
        if status != 200:
            raise AuthFlowError(f"cli session claim failed ({status}): {payload}")
        st = str(payload.get("status", "")).lower()
        if st == "authorized":
            login_ticket = payload.get("loginTicket")
            if not login_ticket:
                raise AuthFlowError("missing loginTicket")
            auth_with_ticket = append_login_ticket(pending["authorize_url"], login_ticket)
            s2, h2, r2 = self.http.request("GET", auth_with_ticket)
            cb_url = get_header(h2, "location")
            if s2 not in (302, 303) or not cb_url:
                raise AuthFlowError(f"service authorization did not return client callback ({s2})")
            code, ret_state = extract_code_and_state(cb_url)
            if ret_state != pending["state"]:
                raise AuthFlowError("state mismatch during authorization")
            token_set = self.exchange_code(pending["client_id"], code, pending["verifier"])
            self.token_store.save(token_set)
            self.pending_store.clear()
            return {"status": "authorized", "token_saved": True}
        return {"status": st, "payload": payload}

    def finish_device_login(self, timeout=DEFAULT_LOGIN_TIMEOUT, interval=DEFAULT_POLL_INTERVAL) -> dict:
        pending = self.pending_store.load()
        if not pending:
            raise AuthFlowError("no pending login session found")
        poll_int = pending.get("poll_interval", interval)
        deadline = time.time() + timeout
        while True:
            res = self.claim_session_once(pending)
            st = res["status"]
            if st == "authorized":
                return self.token_store.load()
            if st == "pending":
                if time.time() >= deadline:
                    raise AuthFlowError("cli session authorization timed out")
                time.sleep(poll_int)
                continue
            raise AuthFlowError(f"cli session returned status: {st}")

    def exchange_code(self, client_id: str, code: str, verifier: str) -> dict:
        status, headers, raw = self.http.request(
            "POST",
            f"{self.issuer}/oauth2/token",
            form={
                "grant_type": "authorization_code",
                "client_id": client_id,
                "code": code,
                "redirect_uri": self.redirect_uri,
                "code_verifier": verifier,
            },
        )
        payload = self.http.read_json(headers, raw)
        if status != 200:
            raise AuthFlowError(f"token exchange failed ({status}): {payload}")
        return token_set_from_response(payload, client_id)

    def refresh(self, token_set: dict) -> dict:
        client_id = token_set.get("client_id") or self.register_client()
        status, headers, raw = self.http.request(
            "POST",
            f"{self.issuer}/oauth2/token",
            form={
                "grant_type": "refresh_token",
                "client_id": client_id,
                "refresh_token": token_set["refresh_token"],
            },
        )
        payload = self.http.read_json(headers, raw)
        if status != 200:
            self.token_store.clear()
            raise AuthFlowError(f"token refresh failed ({status}): {payload}")
        return token_set_from_response(payload, client_id)

    def ensure_token(self) -> dict:
        cached = self.token_store.load()
        if not cached:
            raise AuthFlowError("needs_reauth: no local token cache found, run login first")
        if not is_expired(cached):
            return cached
        refreshed = self.refresh(cached)
        self.token_store.save(refreshed)
        return refreshed

    def build_mcp_headers(self, token_set: dict) -> dict:
        ttype = token_set.get("token_type", "Bearer")
        return {
            "Authorization": f"{ttype} {token_set['access_token']}",
            "Accept": "application/json, text/event-stream",
        }

    def initialize_mcp(self) -> dict:
        token = self.ensure_token()
        status, headers, raw = self.http.request(
            "POST",
            self.mcp_url,
            headers=self.build_mcp_headers(token),
            json_body={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2025-06-18",
                    "capabilities": {},
                    "clientInfo": {"name": self.client_name, "version": "1.0.0"},
                },
            },
        )
        payload = self.http.read_json(headers, raw)
        if status != 200 or "error" in payload:
            raise AuthFlowError(f"mcp initialize failed ({status}): {payload}")
        return token

    def send_mcp_request(self, token_set: dict, req_id: int, method: str, params: dict) -> dict:
        status, headers, raw = self.http.request(
            "POST",
            self.mcp_url,
            headers=self.build_mcp_headers(token_set),
            json_body={
                "jsonrpc": "2.0",
                "id": req_id,
                "method": method,
                "params": params,
            },
            timeout=30,
        )
        payload = self.http.read_json(headers, raw)
        if status != 200 or "error" in payload:
            raise AuthFlowError(f"mcp {method} failed ({status}): {payload}")
        return payload

    def list_tools(self, refresh=False) -> list:
        if not refresh:
            cached = self.catalog_store.load()
            if cached and int(time.time()) - cached.get("fetched_at_epoch", 0) < DEFAULT_TOOL_CATALOG_TTL_SECONDS:
                return cached.get("tools", [])
        token = self.initialize_mcp()
        tools = []
        cursor = None
        req_id = 2
        while True:
            params = {"cursor": cursor} if cursor else {}
            resp = self.send_mcp_request(token, req_id, "tools/list", params)
            res = resp.get("result", {})
            tools.extend(res.get("tools", []))
            cursor = res.get("nextCursor")
            if not cursor:
                self.catalog_store.save({"fetched_at_epoch": int(time.time()), "tools": tools})
                return tools
            req_id += 1

    def call_tool(self, tool_name: str, args: dict) -> dict:
        token = self.initialize_mcp()
        resp = self.send_mcp_request(token, 2, "tools/call", {"name": tool_name, "arguments": args})
        if "result" not in resp:
            raise AuthFlowError(f"mcp tools/call missing result: {resp}")
        return resp["result"]


def load_diet_data() -> dict:
    for p in (DIET_DATA_PATH, LEDGER_DATA_PATH):
        if p.exists():
            try:
                return json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                pass
    return {"days": {}, "coros": {}, "weights": {}}

def save_diet_data(data: dict):
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    for p in (DIET_DATA_PATH, LEDGER_DATA_PATH):
        temp = p.with_suffix(".json.tmp")
        temp.write_text(payload, encoding="utf-8")
        temp.replace(p)

def load_train_data() -> dict:
    if TRAIN_DATA_PATH.exists():
        try:
            return json.loads(TRAIN_DATA_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "sessions": {},
        "metrics": {},
        "settings": {"h": 168, "hC": 168, "hSrc": "coros", "w": 61, "z": 78, "p": 10}
    }

def save_train_data(data: dict):
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    temp = TRAIN_DATA_PATH.with_suffix(".json.tmp")
    temp.write_text(payload, encoding="utf-8")
    temp.replace(TRAIN_DATA_PATH)

def load_ledger_data() -> dict:
    return load_diet_data()

def save_ledger_data(data: dict):
    save_diet_data(data)

class TuilajiRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _send_json(self, code: int, obj: dict):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Main HTML
        if path in ("/", "/index.html", "/推拉机 track-TOR.html", "/推拉机%20track-TOR.html"):
            html_file = BASE_DIR / "推拉机 track-TOR.html"
            if not html_file.exists():
                html_file = BASE_DIR / "index.html"
            if html_file.exists():
                content = html_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
                self.end_headers()
                self.wfile.write(content)
                return

        # 2. PWA static assets
        if path in ("/manifest.json", "/sw.js", "/icon-192.png", "/icon-512.png", "/icon.svg"):
            asset_file = BASE_DIR / path.lstrip("/")
            if asset_file.exists():
                if path.endswith(".json"):
                    ct = "application/json"
                elif path.endswith(".js"):
                    ct = "application/javascript"
                elif path.endswith(".png"):
                    ct = "image/png"
                else:
                    ct = "image/svg+xml"
                content = asset_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        # 3. Data APIs
        if path in ("/api/diet", "/api/data"):
            data = load_diet_data()
            helper = CorosMcpLoginHelper()
            data["_coros_connected"] = helper.token_store.load() is not None
            pending = helper.pending_store.load()
            data["_coros_pending_url"] = pending.get("login_url") if pending else None
            self._send_json(200, data)
            return

        if path == "/api/train":
            data = load_train_data()
            self._send_json(200, data)
            return

        # 4. COROS Status
        if path == "/api/coros/status":
            try:
                helper = CorosMcpLoginHelper()
                connected = helper.token_store.load() is not None
                pending = helper.pending_store.load()
                if not connected and pending:
                    try:
                        res = helper.claim_session_once(pending)
                        if res.get("status") == "authorized":
                            connected = True
                            pending = None
                    except Exception:
                        pass
                self._send_json(200, {
                    "connected": connected,
                    "issuer": helper.issuer,
                    "pending_login_url": pending.get("login_url") if pending else None,
                })
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        self._send_json(404, {"error": "not_found"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(raw_body) if raw_body else {}
        except Exception:
            body = {}

        if path in ("/api/diet", "/api/data"):
            data = load_diet_data()
            for k in ("days", "coros", "weights"):
                if k in body and isinstance(body[k], dict):
                    data[k] = body[k]
            save_diet_data(data)
            self._send_json(200, {"ok": True})
            return

        if path == "/api/train":
            data = load_train_data()
            for k in ("sessions", "metrics", "settings"):
                if k in body and isinstance(body[k], dict):
                    data[k] = body[k]
            save_train_data(data)
            self._send_json(200, {"ok": True})
            return

        if path == "/api/coros/login-start":
            try:
                helper = CorosMcpLoginHelper(body.get("issuer"))
                pending = helper.start_device_login()
                self._send_json(200, {
                    "login_url": pending["login_url"],
                    "issuer": helper.issuer,
                    "expires_at": pending["expires_at"],
                })
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        if path == "/api/coros/call":
            try:
                helper = CorosMcpLoginHelper(body.get("issuer"))
                if helper.token_store.load() is None and helper.pending_store.load() is not None:
                    helper.claim_session_once()
                tool_name = body.get("tool")
                args = body.get("arguments") or {}
                res = helper.call_tool(tool_name, args)
                self._send_json(200, res)
            except AuthFlowError as e:
                msg = str(e)
                code = "needs_reauth" if "needs_reauth" in msg or "login first" in msg or "refresh failed" in msg else "mcp_error"
                self._send_json(401 if code == "needs_reauth" else 500, {"error": msg, "code": code})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        self._send_json(404, {"error": "not_found"})


def main():
    parser = argparse.ArgumentParser(description="推拉机 track-TOR PWA & COROS MCP Local Server")
    parser.add_argument("command", nargs="?", default="serve", choices=[
        "login-start", "login-finish", "login-status", "list-tools",
        "describe-tool", "call-tool", "logout", "serve", "help"
    ])
    parser.add_argument("--issuer", default=None)
    parser.add_argument("--tool", default=None)
    parser.add_argument("--arguments-json", default="{}")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface to bind (default: 0.0.0.0 for LAN access)")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8765")))
    parser.add_argument("--timeout", type=int, default=DEFAULT_LOGIN_TIMEOUT)
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()

    if args.command == "help":
        parser.print_help()
        return 0

    if args.command == "serve":
        server = ThreadingHTTPServer((args.host, args.port), TuilajiRequestHandler)
        print(f"Serving 推拉机 track-TOR PWA on http://{args.host}:{args.port}")
        sys.stdout.flush()
        server.serve_forever()
        return 0

    helper = CorosMcpLoginHelper(args.issuer)
    try:
        if args.command == "login-start":
            pending = helper.start_device_login()
            print("Open this link in a browser to log in:")
            print(pending["login_url"])
            return 0
        if args.command == "login-finish":
            helper.finish_device_login(timeout=args.timeout)
            print("login ok")
            return 0
        if args.command == "login-status":
            if helper.token_store.load():
                print("authenticated token found")
                return 0
            pending = helper.pending_store.load()
            if not pending:
                print("no pending login session")
            else:
                try:
                    res = helper.claim_session_once(pending)
                    if res.get("status") == "authorized":
                        print("login ok (claimed authorized session)")
                        return 0
                except Exception:
                    pass
                print("pending login session found")
                print(pending["login_url"])
            return 0
        if args.command == "call-tool":
            if not args.tool:
                raise AuthFlowError("call-tool requires --tool")
            parsed_args = json.loads(args.arguments_json)
            print(json.dumps(helper.call_tool(args.tool, parsed_args), ensure_ascii=False, indent=2))
            return 0
        if args.command == "logout":
            helper.token_store.clear()
            helper.pending_store.clear()
            print("local token cache cleared")
            return 0
    except Exception as e:
        sys.stderr.write(f"error: {e}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
