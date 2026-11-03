# 更新日志 / Changelog

每个版本改了什么。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

Everything that changed, version by version. Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [v1.20a] — 2026-11-03

### 变更 / Changed
- 🧩 **表格怎么写都尽量能读**：列名中文英文都认（「日期｜食物｜蛋白质｜脂肪｜碳水｜蔬菜｜热量」或 date, item…），顺序随意，带单位也行，多余的列忽略，没有列名就按默认顺序读。日期写成 2026/11/3、2026年11月3日、11月3日（没写年份按今年）都行，同一天后面几行日期留空会沿用上一行。数字里带「g」「约」、全角数字、千分位都能读，没填热量会按蛋白质、脂肪、碳水自动算。合计行自动跳过。AI 用竖线排的表格也能读。
  The table is read as forgivingly as possible. Column names work in Chinese or English, in any order, with units; extra columns are ignored, and without a header the default order is used. Dates like 2026/11/3, 2026年11月3日 or 11月3日 (this year) all work, and a blank date continues the day above. Numbers with units, full-width digits or thousands separators are read, missing calories are worked out from protein, fat and carbs, total rows are skipped, and pipe-separated tables from an AI are read too.
- 🤖 **记账 prompt 缩短一半**：格式上的规矩交给推拉机兜底，prompt 只讲要记什么。列名改成中文。
  The bookkeeping prompts are about half as long: formatting is left to track-TOR, so the prompt only says what to record. Column names are now in Chinese.
- 🔗 粘贴分享按钮复制来的整段文字（比如「【腾讯文档】饮食记录 https://…」）也行，推拉机只取里面的网址。
  Pasting the whole text a share button copies (like "【腾讯文档】饮食记录 https://…") works too; only the link is kept.
- 📋 **prompt 更短，不带链接**：两个版本都缩到几行固定文字，屏幕上看到的就是复制出来的内容，输入框里填什么都不会出现在 prompt 里。默认你还没有表格：第一次让 AI 建好「饮食记录」、写上列名、设成知道链接的人可查看并发回链接，已经有就直接用。只记吃了什么，不再要求 AI 额外汇报总计。准备步骤也缩成三步。
  Shorter, link-free prompts: both are a few lines of fixed text, and what you see is what you copy; nothing from the link box appears in them. They assume you have no sheet yet: on first use the AI creates 饮食记录 with the column names, shares it view-only by link and sends the link back. The AI only records what you ate, with no extra totals. The setup is down to three steps.
- ⓘ 按钮改成椭圆：左边 i，右边 + 表示可以展开，展开后变成 − 表示可以收起。
  The ⓘ button is now a pill: i on the left, + on the right to open, − to close.
- 📉 **饮食页两张图合成一张**：去掉了「热量缺口累计」图，只留「摄入与消耗」。标题下面一个小卡片显示「近 7 天热量缺口 1051 kcal（约 136 g 脂肪）」，点一下依次切换 3 / 7 / 14 / 30 天和有记录以来，会记住上次选的。计算公式收进标题旁的「i｜+」按钮，点开才显示。顶部「日均缺口 / 累计缺口 / 约合脂肪」三张卡片和这个卡片是重复信息，已删除。
  The diet page's two charts are now one, and the three summary cards above are gone because the tile says the same thing: the cumulative-gap chart is gone and Intake vs burn stays. A tile under its title shows e.g. "Last 7 days calorie deficit 1051 kcal (about 136 g fat)"; tap it to step through 3 / 7 / 14 / 30 days and since your first log, and it remembers your choice. The formulas sit behind the i | + button next to the title.
- 📋 **数据源输入框左边加了粘贴按钮**：每次点都用剪贴板里的内容覆盖输入框，复制来的是整段分享文字也只留网址。
  A paste button sits at the left of the data source box: each tap replaces the box with the clipboard, keeping only the link if more text came with it.
- 缺口卡片改成两行（上面写时间段，下面写数字和脂肪克数），内容再长也不会把页面撑出屏幕。
  The gap tile is now two lines (the period on top, the number and fat below), so it can no longer push the page wider than the screen.
- 🧱 **更新后不再出现新旧混搭**：手机浏览器会把脚本和样式缓存 10 分钟，更新后可能出现新网页配旧脚本，比如缺口卡片是空的、按钮排版错乱。现在脚本和样式的网址带上内容指纹，文件一变网址就变，旧缓存对不上。
  No more mixed old and new files after an update: the phone's browser may cache scripts and styles for 10 minutes, so a new page could run with old scripts (an empty gap tile, a misplaced button). Scripts and styles now have a content stamp in their URL, so a changed file always has a new address and old cached copies can't be mixed in.

---

## [v1.19a] — 2026-11-03

### 变更 / Changed
- 🌐 **任何网址都能当数据源**：推拉机不再看表格放在谁家。Google 表格、腾讯文档、自己的电脑或服务器都行，只要能读到表头为 date,item,p,f,c,veg,kcal 的数据。逗号、制表符、分号分隔的文本，网页里的表格，JSON 都能读，常见云表格会自动换成它们的数据出口再读。表头上方有标题行也没关系。读不到时，状态区写明每种读取方式失败在哪一步。
  Any URL works as the data source. track-TOR no longer cares where the table is hosted (Google Sheets, Tencent Docs, your own computer or server), as long as it can read rows under the header date,item,p,f,c,veg,kcal: comma, tab or semicolon separated text, an HTML table, or JSON. Common cloud sheets are read through their data exports automatically, and title rows above the header are skipped. If nothing can be read, the status line says how each attempt failed.
- 腾讯文档版的说明里加上了「把链接粘贴到上面，点拉取」这一步。
  The Tencent Docs instructions now include pasting the link and tapping Pull.

---

## [v1.18a] — 2026-11-03

### 新增 / Added
- 🇨🇳 **记账 prompt 可选腾讯文档版**：说明面板顶部可以切换「Google 表格」和「腾讯文档」，国内时区默认选腾讯文档。腾讯文档版给腾讯 WorkBuddy 用：第一次会让它建好「饮食记录」表格、填表头、设成所有人可查看并把链接发给你，之后每天直接写进表格。复制时如果上面填了腾讯文档链接，会一起带上。推拉机读取腾讯文档的功能还在接入中，粘贴腾讯文档链接会如实提示。
  The bookkeeping prompt now comes in a Tencent Docs version for Tencent WorkBuddy, alongside Google Sheets; the info panel lets you switch, defaulting by time zone. The Tencent version has WorkBuddy set up a 饮食记录 sheet the first time. Reading Tencent Docs in track-TOR isn't connected yet, and pasting a Tencent Docs link says so.

---

## [v1.17a] — 2026-11-03

### 变更 / Changed
- 🤖 **记账 prompt 改成让 AI 直接写表格**：推荐用能连接并编辑 Google 表格的 AI 记账，它把每样食物直接追加到表格里，你只要在推拉机点「拉取」；AI 没法直接写表格时，会把新的行排成表格发给你复制粘贴。prompt 用大白话逐列说明，不再出现 CSV 这类术语。复制 prompt 时自动带上你填的表格链接。
  The bookkeeping prompt now has the AI write rows straight into your Google Sheet; if it can't, it sends the new rows as a table for you to paste. The prompt explains each column in plain words, with no file-format jargon. Copying the prompt fills in your sheet link.

---

## [v1.16a] — 2026-11-03

### 变更 / Changed
- 🔗 **数据源直接用分享链接**：在 Google 表格里点「共享」，把一般访问权限改成「知道链接的任何人」，复制链接粘进来就能拉取，不用再去「发布到网络」。「发布到网络」的 CSV 链接照样能用。读不到时会提示去改共享设置。
  The data source now takes the sheet's ordinary share link: set General access to "Anyone with the link", copy the link, paste it and pull. No more "Publish to web" step, though a published CSV link still works. If the sheet can't be read, it tells you to change the sharing setting.
- 日期写成 31/10/2026 这种日/月/年格式也能读。
  Dates written day-first, like 31/10/2026, are now read correctly.

---

## [v1.15a] — 2026-11-03

### 新增 / Added
- 📊 **饮食数据源：Google Sheets**：饮食页顶部新的「数据源」区块。粘贴 Google Sheets「发布到网络」得到的 CSV 链接，点「拉取」就把表格里的每日饮食读进来。表格里有的日期覆盖本地饮食，其他日期，以及体重、腰围、心率、训练都不动。点 ⓘ 展开说明：怎么准备表格，以及一段可以一键复制给 AI 的记账 prompt。链接只存在你的手机里，不会自动拉取。
  Diet data source: a new block at the top of the diet page. Paste the CSV link from Google Sheets "Publish to web" and tap Pull to bring in your daily food. Dates in the sheet replace the local diet for those days; other dates and your weight, waist, heart rate and training stay as they are. Tap ⓘ for how to set up the sheet and a prompt you can copy to your AI. The link stays on your phone and nothing is pulled until you tap Pull.

### 移除 / Removed
- 去掉 v1.14a 的「网上饮食账本」(diet.json) 读取，饮食只保留 Google Sheets 这一个数据源。
  Removed the v1.14a online diet ledger (diet.json); Google Sheets is now the single diet data source.

---

## [v1.14a] — 2026-11-03

### 新增 / Added
- ☁ **读取网上的饮食账本**：饮食页「+ 记录饮食」旁边的云朵按钮，填一次账本网址，以后每次打开推拉机都自动读取每日饮食。账本里有的日期以账本为准，在推拉机里改过的那天保留你的版本。来自账本的日子在日期旁标一个 ☁。
  Read an online diet ledger: tap the cloud button next to "Log food", enter the ledger link once, and track-TOR reads your daily food every time it opens. The ledger wins for its dates, except days you edited in the app. Days from the ledger show a ☁ next to the date.

---

## [v1.13a] — 2026-11-03

### 变更 / Changed
- 🗂️ **数据合成一份**：训练、身体数据和饮食以前分开存，体重和高驰活动热量还各存了两处。现在每天的身体和高驰数据放在一起，体重只存一份。第一次打开新版时自动搬过去，旧的进度文件照样能导入。
  All records now live in one place: each day's body and COROS numbers together, with weight stored once. Existing data moves over automatically the first time you open this version, and older progress files still import.
- 代码按功能拆成几个文件，网页结构、样式和程序分开。用起来没有变化。
  The code is split into files by feature, with page structure, styles, and scripts kept apart. Nothing changes in use.
- 更新后打开网页总会拿到最新的程序，没网时才用手机里缓存的版本。
  After an update the app always loads the latest code, falling back to the copy on your phone only when offline.

### 修复 / Fixed
- ⚖️ 计算某天的热量消耗时，如果那天没有体重，以前只看饮食里另存的少数几条体重，常常用 64 kg 之类的固定值。现在用你附近几天的真实体重，基础代谢更准。
  On days without a weight, calorie burn used to fall back on a few weights stored only in the diet log, often a fixed value. It now uses your real weights from the nearby days, so BMR is more accurate.
- 在饮食弹窗里记的体重现在也会出现在体重图和「全部记录」里。
  A weight entered in the diet window now also shows in the weight chart and the records list.
- 切换语言时饮食页也会一起切换。
  Switching language now updates the diet page too.

---

## [v1.12a] — 2026-11-03

### 新增 / Added
- 👤 **个人资料面板**：性别、出生年月、身高和现在体重从「目标」里拆出来，单独放在数据页。默认模糊显示，点眼睛或点输入框才看得清，收起面板又会模糊。改「现在体重」会记成当天的手动体重。
  A separate Profile panel on the Data page holds sex, birth month, height, and current weight. Values are blurred until you tap the eye or a field, and blur again when the panel closes. Changing "Weight now" logs a manual weight for today.

### 变更 / Changed
- 🎂 生日只填年和月。
  Birthday is now just year and month.
- 「目标」面板只留引体、体重和腰围三个目标。把目标清空就是取消这个目标。
  The Goals panel keeps only the pull-up, weight, and waist goals. Clearing a box removes that goal.
- ⚡ 数字字体放进仓库，不再从 Google Fonts 加载。打开网页不再访问任何外部网站，国内打开更快。
  The number font is now bundled instead of loaded from Google Fonts, so opening the app makes no outside requests and loads faster in China.
- 整理代码：训练和饮食两部分合到同一层，去掉重复的代码和没用的函数。
  Code cleanup: training and diet code now share one scope, and duplicated and unused code is gone.

### 修复 / Fixed
- 英文界面的目标进度卡不再出现中文括号。
  The goal cards in English no longer show Chinese full-width brackets.

---

## [v1.11a] — 2026-11-03

### 新增 / Added
- 👋 **第一次打开先填资料**：性别、生日、身高、现在体重和三个目标，都可以留空。也可以直接连接高驰，授权后自动同步，并填好性别、生日和身高。
  First open asks for your sex, birthday, height, current weight, and three goals. Everything is optional. You can also connect COROS instead: it syncs right after authorization and fills in sex, birthday, and height.
- 「目标」面板加了性别和生日。没设的目标在进度卡上显示「设目标」，点一下直接打开目标面板。
  The Goals panel now has sex and birthday. A goal you haven't set shows "Set goal" on its card; tap it to open the Goals panel.
- 🚪 **登出高驰**：在「备份进度」面板里。可以保留全部数据，也可以只清除高驰同步来的体重、睡眠、HRV、静息心率和活动热量，手动记录都留着。要确认两次才会登出。
  Log out of COROS from the Back up panel. Keep all data, or delete only what COROS synced (weight, sleep, HRV, resting heart rate, activity calories) while keeping your manual entries. Logging out takes two confirmations.

### 变更 / Changed
- 基础代谢按你自己的性别、生日和身高计算，不再用写死的默认值。
  Basal metabolic rate now uses your own sex, birthday, and height instead of built-in defaults.
- 连接高驰的窗口加了提示：授权失败就稍等一分钟再试，或换个区域，不要连续点。失败时的提示也一样。
  The COROS connect window now advises waiting a minute or trying another region if authorization fails, and not tapping repeatedly. Failure messages say the same.
- 高驰授权成功后自动关掉登录页，不用自己关。高驰拒绝授权时也会提示原因，不再没有反应。
  The COROS login page now closes itself after you authorize, and a refused authorization shows the reason instead of doing nothing.

### 移除 / Removed
- 去掉手动粘贴高驰令牌，只保留一键授权。
  Removed manual COROS token pasting; one-tap authorization is the only way to connect.

### 修复 / Fixed
- 新用户第一次打开不再立刻弹出「该备份进度了」，5 天后才提醒。
  New users no longer see "Time to back up" the moment they first open the app; the first reminder comes after 5 days.
- 😴 当晚还没出分时，高驰返回的 0 分不再被记成睡眠评分。之前存下的 0 分会自动清掉，等真实分数出来再补上。
  A 0 sleep score, which COROS returns before the night is scored, is no longer saved. Zeros already saved are removed automatically, and the real score fills in once it's ready.

---

## [v1.10a] — 2026-11-03

### 修复 / Fixed
- 😴 **睡眠评分同步不到**：高驰的回复格式解析得太死，整批睡眠评分都读不出来。现在能正确读取，第一次同步还会补回更早的记录。
  Sleep scores failed to sync because the COROS reply was parsed too strictly. They now come through, and the first sync also fills in older nights.
- 多行的同步提示不再被圆形背景裁掉文字。
  Long sync messages are no longer clipped by the rounded background.

---

## [v1.09a] — 2026-11-02

### 变更 / Changed
- 🧮 **估算不再覆盖已填的总热量**：总热量留空时，计算器按钮照常填入估算值；已有数字时只显示“估算 1592，差额 +252”。差额超过 100 kcal 时，提醒检查有无酒精、酱料等卡路里估算。
  The calculator no longer overwrites a total you've entered. It fills in the estimate only when the field is blank; otherwise it shows the estimate and the difference, and flags differences over 100 kcal so you can check for alcohol, sauces, and the like.

---

## [v1.08a] — 2026-11-02

### 新增 / Added
- 🧮 **估算总热量**：手动记录饮食时，蛋白质、脂肪、碳水都填好后，计算器按钮由灰变橙，按下按 4/9/4 填入估算的总热量，方便粗略核对。
  Estimate calories: once protein, fat, and carbs are filled in, the calculator button turns orange. Tap it to fill in an estimate (4/9/4 kcal per gram) as a rough cross-check.

### 变更 / Changed
- ✏️ 饮食页的编辑按钮改用手写图标，与图表上的记录按钮一致。
  The diet page's edit button now uses the same pencil icon as the charts.

---

## [v1.07a] — 2026-11-02

### 变更 / Changed
- 🍽️ **饮食记录更简单**：主界面只填总热量和蛋白质、脂肪、碳水、蔬菜，只有总热量必填，数字可以直接从别的 App 或 AI 抄过来。想逐项记就进「当日明细」。磁盘图标保存并收起面板。
  Simpler diet logging: enter total calories plus protein, fat, carbs, and veg. Only calories are required. Use Day details to log item by item. The disk icon saves and closes.
- 📊 **目标进度常驻**：数据页的饮食和图表两个 tab 都显示目标进度，切换时不再跳动。
  Goals stay visible on both data tabs, so switching no longer makes the page jump.

### 修复 / Fixed
- 弹窗关闭图标对正圆心，输入框的焦点边框不再被裁掉。
  The close icon is centred in its circle, and input focus borders are no longer cut off.

### 移除 / Removed
- 删除每日饮食的分享图片功能。
  Removes the daily diet share image.

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
- ⚖️ **许可证改为保留所有权利**：不再以 MIT 授权。此前已按 MIT 发布的版本仍适用 MIT。
  The license is now all rights reserved instead of MIT. Versions already published under MIT stay under MIT.

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
