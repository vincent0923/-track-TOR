# 推拉机 track-TOR · 躯干优化记录器

> *Torso Optimisation Record* —— 给骑行佬的上身力量训练账本。
> 一个纯前端、零后端、自带烟花和音效的「肌肉养成手帐」。
>
> 🇬🇧 English version → [scroll down](#english) or [click here](#english)

---

## 这是什么？

**一句话**：你在骑行界可能已经是大腿，但上半身嘛……我们懂。👀

「推拉机」是一个给骑行爱好者用的**上身力量训练记录器**。骑车的日子，你的腿在变强、心肺在变强，唯独上半身——那个趴着不动的躯干——默默沦为「坐在坐垫上的装饰品」。

这个 app 就是来解决这件事的：

- **推**（Push）与**拉**（Pull）两套训练体系，从引体向上开始，逐级解锁
- 每次完成一组，**放烟花 + 放音效**，把「记录训练」这件事做得像打通了一关游戏
- **图表**把每一分进步量化成看得见的曲线，让你对着屏幕说「哦，原来我真的在变壮」
- 终极目标：练出一副**线条优美、穿骑行服也不心虚的上身躯干**

> **TOR 是什么？** `Torso Optimisation Record` —— 躯干优化记录。
> **Track 是什么？** 追踪、记录、跟着一条路走。骑车的都懂：没有 track，就没有 PR。

---

## 功能一览

| 模块 | 干什么的 |
|---|---|
| 🏋️ 推拉训练 | 上身力量训练记录，分「推 / 拉」两组，解锁制进阶 |
| 💪 每日加练 | 每个训练日的面板里都能加练，默认引体向上，也能加自定义项目，一天的练习都记在一起 |
| 🎆 烟花 + 🔊 音效 | 每完成一组就放烟花，把记录变成游戏 |
| 📈 趋势图表 | 引体、体重、腰围、睡眠、HRV、静息心率的 MA7 移动平均曲线 |
| ⌚ 高驰 COROS 同步 | 一键授权，自动拉取体重、腰围、睡眠、HRV、静息心率 |
| 🥗 饮食账本 | 手动记录每一项食物，热量可由蛋白质 / 脂肪 / 碳水自动算，图表看缺口 |
| 📐 身体指标 | 腰高比等量化指标，看着数字往好方向走 |
| 📲 PWA 离线可用 | 装到手机主屏，没网也能记 |
| 🌗 深浅主题 / ⛶ 全屏 | 白天晚上都能用，全屏沉浸 |
| 💾 进度文件备份 | 把饮食和训练进度存成 txt 文件放在手机里，换个设备选这个文件就能恢复 |

---

## 为什么是「骑行佬」？

- 骑行练腿和心肺，唯独**上身长期闲置**
- 上身力量对**控车、摇车、爬坡、长时间低姿**都有实打实的帮助
- 更重要的是：**穿骑行服好看**。别装了，你懂。

---

## 快速开始

### 在线使用（推荐，零安装）

直接打开 👉 **https://vincent0923.github.io/Track-TOR/**

1. 右上角「**连接高驰**」→ 选择账号所在区域（中国大陆 / 欧洲 / 美国及其他地区）→「**授权登录高驰账号**」→ 走一遍 COROS 登录授权
2. 点「**同步**」，拉取你的体重 / 腰围 / 睡眠 / HRV / 静息心率
3. 开始记训练，看着烟花噼里啪啦，图表往上走

### 装到手机主屏（PWA）

- iPhone（Safari）：分享按钮 →「添加到主屏幕」
- Android（Chrome）：菜单 →「安装应用」

装完后它就像个原生 app 一样全屏运行，还能离线用。

### 本地跑（想改代码的话）

```bash
git clone https://github.com/vincent0923/Track-TOR.git
cd Track-TOR
# 直接用任意静态服务器打开，例如：
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080/
```

纯前端，没有构建步骤，没有依赖，改完 `index.html` 刷新即可。

---

## 技术栈（简单到令人发指）

- **纯 HTML / CSS / 原生 JS** —— 单文件 `index.html`，零框架、零依赖
- **无后端** —— 数据存在浏览器 `localStorage`，直连 COROS OAuth
- **PWA** —— `manifest.json` + Service Worker，离线可用
- **GitHub Pages** —— 部署即上线

> 一个文件搞定一切。没有 server.py，没有 render.yaml，没有「上一个 AI 帮你搭的后端」。
> 那些前任留下的东西，已经清干净了。😌

---

## 项目结构

```
Track-TOR/
├── index.html                 # 主应用（单文件，所有逻辑都在这里）
├── manifest.json              # PWA 清单
├── sw.js                      # Service Worker（离线缓存）
├── icon-192.png / icon-512.png / icon.svg   # 图标
├── CHANGELOG.md               # 更新日志
└── .gitignore
```

---

## 隐私说明

- 你的数据存在**你自己的浏览器里**（`localStorage`），不上传任何服务器
- 连接高驰时，只在**你的浏览器**和 COROS 官方之间直连授权，不经过任何中间人
- 没有账号、没有云同步、没有「我们收集了你的数据」

> 说白了：**你的肌肉数据，只有你自己看得到。** 我们（以及任何第三方）都碰不到。

---

## 版本

当前版本：**v1.04a**（alpha）

产品已剥离 agent 依赖、可独立运作与同步，从操作层面已是面向大众的产品；但尚未打包成独立 app，故处于 alpha 阶段。

---

## 许可

MIT License（见 [LICENSE](LICENSE)）。

---

<a name="english"></a>

# 推拉机 track-TOR · Torso Optimisation Record

> *Torso Optimisation Record* — the upper-body strength ledger for cyclists.
> A pure-frontend, zero-backend "muscle journal" with fireworks and sound effects built in.
>
> 🇨🇳 中文版 → [回到顶部](#推拉机-track-tor--躯干优化记录器)

---

## What is this?

**One-liner**: You might already be a monster on the bike, but your upper body? ...Yeah, we know. 👀

「推拉机」(literally "push-pull machine") is an **upper-body strength tracker for cyclists**. All those miles have made your legs and lungs strong — while your torso quietly became "the ornament sitting on the saddle."

This app exists to fix exactly that:

- **Push** and **Pull** training systems, starting from pull-ups and unlocking progressively
- Every completed set fires off **fireworks + sound effects**, turning "logging a workout" into clearing a game level
- **Charts** quantify every bit of progress into a curve you can actually *see* — so you can say "oh, I really am getting bigger"
- The endgame: a **well-sculpted upper body** that doesn't look embarrassed in a cycling jersey

> **What's TOR?** `Torso Optimisation Record`.
> **What's track?** To follow, to log, to stay on the path. Cyclists get it: no track, no PR.

---

## Features

| Module | What it does |
|---|---|
| 🏋️ Push/Pull training | Upper-body strength logging, split into Push / Pull, unlock-based progression |
| 💪 Extra practice | Every session panel has an extra practice section, pull-ups by default or any custom exercise, so a day's work stays together |
| 🎆 Fireworks + 🔊 Sound | Every set → fireworks, turning logging into a game |
| 📈 Trend charts | MA7 moving averages for pull-ups, weight, waist, sleep, HRV, resting HR |
| ⌚ COROS sync | One-tap OAuth; auto-pulls weight, waist, sleep, HRV, resting HR |
| 🥗 Diet ledger | Log each food by hand, kcal can be calculated from protein / fat / carbs, charts show your calorie gap |
| 📐 Body metrics | Waist-to-height ratio and other quantifiable numbers |
| 📲 PWA offline | Install to home screen, works offline |
| 🌗 Light/dark theme / ⛶ Fullscreen | Comfortable day or night, immersive fullscreen |
| 💾 Progress file backup | Save diet and training progress as a txt file on your phone, then pick that file to restore on any device |

---

## Why cyclists?

- Cycling builds legs and cardio, but **the upper body stays on vacation**
- Upper-body strength genuinely helps with **bike control, sprinting out of the saddle, climbing, and holding a low aero position**
- And more importantly: **it makes you look good in a jersey**. Don't pretend you don't care.

---

## Quick start

### Use it online (recommended, zero install)

Just open 👉 **https://vincent0923.github.io/Track-TOR/**

1. Tap **Connect COROS** (top-right) → choose your account region (Mainland China / Europe / US & other regions) → **Authorize COROS account** → go through COROS login/authorization
2. Tap **同步** to pull your weight / waist / sleep / HRV / resting HR
3. Start logging workouts and watch the fireworks go off while the chart climbs

### Install to home screen (PWA)

- iPhone (Safari): Share → "Add to Home Screen"
- Android (Chrome): Menu → "Install app"

It then runs fullscreen like a native app, and works offline.

### Run locally (if you want to hack on it)

```bash
git clone https://github.com/vincent0923/Track-TOR.git
cd Track-TOR
python3 -m http.server 8080
# open http://localhost:8080/
```

Pure frontend — no build step, no dependencies. Edit `index.html`, refresh, done.

---

## Tech stack (ridiculously simple)

- **Vanilla HTML / CSS / JS** — a single `index.html`, zero frameworks, zero dependencies
- **No backend** — data lives in your browser's `localStorage`, direct COROS OAuth
- **PWA** — `manifest.json` + Service Worker for offline use
- **GitHub Pages** — push to deploy

> One file does everything. No `server.py`, no `render.yaml`, no "backend the previous AI set up for you."
> Those exes' leftovers have been cleaned out. 😌

---

## Project structure

```
Track-TOR/
├── index.html                 # Main app (single file, all logic lives here)
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (offline cache)
├── icon-192.png / icon-512.png / icon.svg   # Icons
├── CHANGELOG.md               # Changelog
└── .gitignore
```

---

## Privacy

- Your data lives in **your own browser** (`localStorage`) — nothing is uploaded to any server
- Connecting COROS happens **directly between your browser and COROS** — no middleman
- No accounts, no cloud sync, no "we collected your data"

> In plain English: **your muscle data is visible only to you.** We (or any third party) can't touch it.

---

## Version

Current: **v1.04a** (alpha)

The product has dropped its agent dependency and works & syncs independently — operationally it's already a consumer product; it just isn't packaged as a standalone app yet, hence alpha.

---

## License

MIT License (see [LICENSE](LICENSE)).
