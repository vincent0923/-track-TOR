# 更新日志 / Changelog

每个版本改了什么。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

Everything that changed, version by version. Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [v1.06a] — 2026-11-02

### 变更 / Changed
- 🧭 **导航更简洁**：数据和备份只留图标。饮食页搬进数据页，数据页分饮食和图表两个 tab。
  Simpler navigation: Data and Backup are icons only. Diet moves into the data page, which now has Diet and Charts tabs.
- ✏️ **图表上直接记录**：引体、体重和腰围的图表各有一个手写图标，点开填数字，日期默认当天，也可改，按磁盘图标保存并关闭。删除原来的手动记录面板。
  Log right from the chart: pull-ups, weight, and waist each have a pencil icon. Enter a number, keep today or pick another date, then tap the disk icon to save and close. The old manual record panel is gone.
- 🏷️ **标题下方改回 TOR 全称**：躯干优化记录 / Torso Optimisation Record。
  The header tagline is back to the full meaning of TOR.
- 📄 **README 去掉改代码的说明**。
  Removes the code setup instructions from the README.

---

## [v1.05a] — 2026-11-02

### 变更 / Changed
- 🔑 **授权一次，长期有效**：高驰授权到期前自动续期，约半年内打开过一次就不用重新授权。断网或令牌到期时不再显示未连接，令牌被拒绝时先自动续期再试，都失败才请你重新授权。
  Authorize once and it lasts: COROS authorization renews itself, so opening the app about once every six months is enough. Being offline or having an expired token no longer shows you as disconnected. A rejected token renews and retries, and you're only asked to sign in again if that fails too.
- 💾 **进度文件带上高驰授权**：换手机恢复后不用重新授权。这台设备已连接时保留现有授权。
  Progress files include your COROS authorization again, so a new phone needs no new sign-in. A device that's already connected keeps its current authorization.
- ✍️ **重写 README、页面标语和应用描述**，新增[产品说明](docs/PRODUCT.md)，记录产品定位、设计取向和后续计划。
  Rewrites the README, app tagline, and description, and adds [product notes](docs/PRODUCT.md) covering positioning, design principles, and plans.

---

## [v1.04a] — 2026-11-02

### 移除 / Removed
- 🧹 **清掉后端时代的代码**：网页不再请求 `/api/*` 和 `coros-token.json`，保存时也不再把数据发给任何地方；同时删掉云端数据库逻辑和没用到的样式。
  Removes backend-era code: no more requests to `/api/*` or `coros-token.json`, and saving no longer sends data anywhere. Cloud database logic and unused styles are gone too.

### 修复 / Fixed
- ❤️ **静息心率同步**：高驰这个接口只接受 `days` 参数，之前传的是起止日期，现在按天数请求。
  Resting heart rate sync: this COROS tool only takes `days`, but the page was sending a date range. It now asks by number of days.

---

## [v1.03a] — 2026-11-02

### 变更 / Changed
- 💪 **加练搬进每个训练日的面板**：去掉单独的加练卡片，一天的练习都记在当天面板里，默认引体向上，也能加自定义项目。已完成的训练日也能直接加，不用先点「修改记录」。v1.02a 记下的加练会自动搬到对应的训练日。
  Extra practice moves into each session panel. The separate card is gone, so a day's work stays together. It defaults to pull-ups and takes custom exercises. Finished days accept extras without unlocking first. Extras logged in v1.02a move to the matching session automatically.

### 移除 / Removed
- 🧹 删除重复的主页面副本 `推拉机 track-TOR.html`，主页面只留 `index.html`，并精简 `.gitignore`。
  Removes the duplicate `推拉机 track-TOR.html`, keeps `index.html` as the only main page, and trims `.gitignore`.

---

## [v1.02a] — 2026-11-02

### 变更 / Changed
- 🍽️ **饮食页换成饮食账本的版式**：不再顶着目标进度卡，默认只展开最新一天，配色和字号与账本一致，图表默认看 14 天。
  The diet page now uses the ledger layout: no goal card on top, only the latest day expanded, ledger colours and type, and 14-day charts by default.
- 💾 **备份改成 txt 文件**：点一下存成 `推拉机进度-日期-时间.txt`，恢复时选这个文件。文件含饮食和训练数据，不再包含高驰令牌。旧版进度文本仍可粘贴导入。
  Backups are now a txt file holding diet and training data, without the COROS token. Old progress text can still be pasted in.
- 📖 **点击音效改成轻轻的翻书声**。
  The tap sound is now a soft page turn.

### 新增 / Added
- 💪 **每日加练**：训练页顶部新增加练卡片，不管当天是推日还是拉日都能练，默认引体向上，也能加自定义项目、补记之前的日子。每天最好的一组引体计入引体趋势和目标，不影响推拉训练进度，并随进度文件备份。
  Daily extra practice: a card at the top of the training page works on any day, push or pull. It defaults to pull-ups, takes custom exercises, and can backfill past days. Each day's best pull-up set counts toward the pull-up trend and goal. Program progress isn't affected, and extras are included in the progress file.
- ✍️ **手动记录**：一项一项加食物，加完立即保存；热量留空时按 4/9/4 由营养素算。体重、消耗和备注收进选填区。
  Manual logging: add foods one at a time, each saved right away. Blank kcal is calculated from macros at 4/9/4. Weight, burn and note move to an optional section.

### 移除 / Removed
- 🧹 删除 2026-10-24 之前不连续的饮食记录，图表也不再单独画没记账日子的消耗。
  Removes the patchy diet logs before 2026-10-24, and charts no longer draw burn for days with no food log.

---

## [v1.01a] — 2026-11-02

### 修复 / Fixed
- 🔒 **新用户不再收到开发者本人的数据**：网页不再加载 `diet-data.json` 和 `train-data.json`，两个文件也已移出仓库。
  New users no longer receive the developer's personal data: the page stops loading these two files, and they are removed from the repo.

### 新增 / Added
- 🌏 **高驰账号区域选择**：授权时可选中国大陆、欧洲、美国及其他地区，不再固定走美国区；默认值按已存令牌和时区判断。
  COROS account region picker: Mainland China, Europe, or US & other regions, instead of always using the US endpoint. The default comes from any saved token, then the time zone.

---

## [v1.00a] — 2026-11-01

### 变更 / Changed
- 可以独立运行和同步，不再依赖 AI 助手。还没做成独立 App，所以标为 alpha。
- 改成纯前端直连高驰，移除后端和相关文件。
- 版本号从 `v0.83` 升到 `v1.00a`。

### 修复 / Fixed
- 修复调用高驰的函数缺少 `async` 声明的问题。
- 连续快速推送会让 GitHub Pages 部署失败，现在改为逐次推送。

---

## [v0.83] — 2026-11-01

### 新增 / Added
- 🔐 高驰自动授权：点「授权登录高驰账号」，登录后自动跳回并连接，不用再手动粘贴令牌。
- ⏰ 每 3 天提醒备份。

---

## [v0.8x] — 2026-11-01

### 新增 / Added
- 手动粘贴 COROS token 的同步流程（GitHub Pages 直连时代的过渡方案）。

---

## [v0.x 早期] — 2026-10-31 及之前

### 新增 / Added
- 🏋️ 推拉训练体系（Push / Pull，解锁制进阶）
- 🎆 烟花 + 🔊 音效的游戏化记录
- 📈 趋势图表（MA7 移动平均）
- 🥗 饮食热量账本
- 📲 PWA 离线可用
- 🌗 深浅主题 / ⛶ 全屏
- 💾 微信备份

---

## 版本命名规则 / Versioning

| 段 | 含义 |
|---|---|
| `v1` | 主版本：产品已经能独立运行 |
| `.05` | 次版本：每次上线功能或修复时增加 |
| `a` | alpha：已在日常使用，但还没做成独立 App。做成后去掉 `a` |
