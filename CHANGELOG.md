# 更新日志 / Changelog

每个版本改了什么。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

Everything that changed, version by version. Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [v1.27a] — 2026-11-05

### 新增 / Added
- 📝 日历里每一天的加练下面多了备注栏，可以写在哪练、用了多重的器械等。只写了备注的日子，日历上也会标出来；备注会存进进度文件。
  Each day on the calendar now has a notes box under its extra practice, for where you trained, the weight on the machine and so on. A day with only a note is marked on the calendar too, and notes go into the progress file.

---

## [v1.26a] — 2026-11-05

### 新增 / Added
- 📅 **训练日历**：训练页最上面是月历，练过的日子标上推练（橙）和拉练（蓝）的小圆点，只有加练的日子标一个空心圈。点哪天就在日历下面展开那天：当天完成的训练，加上当天的加练。下面只留接下来 5 次没练的训练，页面短了很多。
  Training calendar: the Train tab opens with a month calendar. Trained days carry push (orange) and pull (blue) dots, and days with only extra practice a hollow ring. Tap a day to open it below: the sessions finished that day plus that day's extra practice. Only the next five unfinished sessions are listed below, so the page is much shorter.
- 🏨 **哪天都能加练**：点今天（或之前任何一天），可以直接记加练，不用挂在某次训练下面。比如出差时酒店有高位下拉，就记一个「高位下拉」。引体加练照样算进引体趋势和目标，进度文件也会带上。
  Extra practice on any day: tap today (or any earlier day) to log extra practice without tying it to a session, say lat pulldowns on a hotel machine. Pull-up extras still count toward the pull-up trend and goal, and the progress file carries them.

---

## [v1.25a] — 2026-11-05

### 新增 / Added
- 🔄 **单独同步一张图**：「健康」里的睡眠、HRV、静息心率图，标题右边各有一个同步按钮，只从高驰拉这一项，比整体同步快。标题左边加了和同步设定里一样的图标。
  Sync one chart: the sleep, HRV and resting HR charts under Health each have a sync button beside the title that pulls only that data from COROS, faster than a full sync. Each title also gets the same icon as in the sync settings.

---

## [v1.24a] — 2026-11-05

### 变更 / Changed
- 🔥 **消化耗能按营养素算**：估算总消耗里的消化耗能，从「摄入 × 9%」改成蛋白质热量 × 25%、碳水 × 8%、脂肪 × 2%。蛋白质吃得多的日子，消耗会算得高一些，更接近实际；没记营养素的日子仍按 9%。
  Digestion burn now follows the nutrients: 25% of protein calories, 8% of carbs and 2% of fat, instead of 9% of all intake. High-protein days count a little more burn, closer to reality; days without nutrients still use 9%.
- 🥩 蛋白质的浅色带改叫「增肌够用区间」（体重 × 1.6 到 2.2 g）。超过上沿不再标成警告：减脂期间多吃蛋白质更顶饱、消化耗能高、更保肌肉。点只分两种：实心是吃够了，空心是没吃够。
  The protein band is now the muscle-building band (body weight × 1.6 to 2.2 g). Going above it is no longer flagged: while cutting, more protein keeps you fuller, costs more to digest and protects muscle. Dots are now just filled (enough) or hollow (short).

---

## [v1.23a] — 2026-11-05

### 新增 / Added
- 🥩 **蛋白质吃够了没**：「摄入与消耗」图右边加了蛋白质轴（g），画出每天记下的蛋白质和合适区间（体重 × 1.6 到 2.2 g，浅色带）。实心点在区间内，空心点是没吃够，带圈的点是超过上限；点图上某一天会显示吃了多少、还差或超出多少。
  Did you eat enough protein? The Intake vs burn chart has a protein axis on the right (grams), with each day's logged protein and the useful range (body weight × 1.6 to 2.2 g, a shaded band). A filled dot is inside the range, a hollow one is short, a ringed one is above the top; tap a day to see how much you had and how far off you were.

---

## [v1.22a] — 2026-11-03

### 变更 / Changed
- 🔄 **饮食同步不用再找**：存了表格链接的话，每次打开「饮食」页都会在后台拉取一次，进度动画直接显示在「饮食」标签上（半分钟内重复点不会重复拉）。
  Diet syncs without digging: with a sheet link saved, opening the Diet view pulls it in the background, with the progress fill on the Diet tab itself (tapping again within half a minute doesn't pull twice).
- 「每日记录」改名「饮食记录」，饮食页顶部的「饮食账本」标题和说明去掉了。「饮食记录」旁现在有两个图标：添加图标直接打开手动记录窗口；新的同步图标一按就拉取，同时打开「线上数据」面板。折起面板就关上。
  "Daily logs" is now "Food logs", and the Diet Ledger heading and note at the top of the Diet view are gone. Two icons sit beside Food logs: the add icon opens the manual food log straight away, and the new sync icon pulls at once and opens the Online table panel. Fold the panel to close it.

- 🔊 **音效自己配**：「资料」里新增「音效」（喇叭图标），给每种点击选声音：打勾、整天练完、烟花、切换标签、展开面板、保存、删除、同步开始/完成/失败等。选的时候就能试听，「恢复默认音效」一键还原。新增十几种声音，包括揉纸、剑气、拔剑、重拳、蓄力、金币、升级、号角、八音盒、星光等短旋律。另外加入开源的 ZzFX 音效 52 个（拾取、强化、跳跃、射击、短哔、击中、爆炸、音符各 6 个，加 4 个官方示例），以及经典 8-bit 音效生成器 jsfxr 的 54 个（金币、激光、爆破、升级、受击、弹跳、选择、合成音、点击各 6 个）。全部是手机现场合成，不用下载文件。
  Pick your own sounds: Profile has a new Sound effects panel (speaker icon) to choose a sound for every kind of tap, from ticking a set, finishing the day and fireworks to switching tabs, folding panels, saving, deleting and sync start/done/failed. You hear each one as you choose, and Reset sounds restores the defaults. More than a dozen new sounds, including crumple, sword slash, unsheathe, punch, power-up, coin, level-up, fanfare, music box and sparkle. Plus 52 open-source ZzFX sounds (six each of pickup, power-up, jump, shoot, blip, hit, explosion and note, and four official samples), and 54 from the classic 8-bit generator jsfxr (six each of coin, laser, blast, power-up, hurt, bounce, select, synth and click). All are synthesised on the phone, with nothing to download.

---

## [v1.21a] — 2026-11-03

### 变更 / Changed
- 🧭 **页面结构重排**：一级标签改成「训练 / 图表 / 资料」。「图表」下分三页：饮食、健康（睡眠、HRV、静息心率）、力量（引体、体重、腰围，都是自己填的身体数据）。标签图标统一换成简约线条风格。「资料」（人头加奖杯图标）里是个人资料、目标、备份进度、全部记录、要点，以及新的「图表和同步设定」。原来顶部的备份快捷按钮由「资料」标签取代。上次停在旧图表页的，会打开「健康」。
  The app is reorganised. The top tabs are Train / Charts / Profile. Charts has three views: Diet, Health (sleep, HRV, resting HR) and Strength (pull-ups, weight and waist, the body numbers you log yourself). Tab icons now share one simple line style. Profile (a person-and-trophy icon) holds your profile, goals, backup, all records, the guide, and the new Charts & sync settings. The old backup shortcut is replaced by the Profile tab. If you were last on the old charts view, Health opens.
- 🔌 **自己选同步什么**：「资料 › 图表和同步设定」里可以开关睡眠、HRV、静息心率、体重。关掉的项不再从高驰同步，也不显示它的图表；已经存下的数据保留。「重置图表」也挪到了这里。
  Choose what to sync: under Profile › Charts & sync, switch sleep, HRV, resting HR and weight on or off. What's off isn't synced from COROS and its chart is hidden; data already saved stays. Reset charts moved here too.
- 缺口卡片的「有记录以来」后面显示统计了几天，比如「有记录以来（10 天）」。
  "Since first log" on the gap tile now says how many days it covers, e.g. "Since first log (10 days)".

### 修复 / Fixed
- 隐私模式下，「减脂」目标那一行不再错误地显示成「腰高比 0.000 → …」，直接不显示。
  In privacy view, the fat-loss goal no longer shows a bogus waist-to-height line; that line is simply left out.

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
- 🔄 **拉取和同步互相带上对方**：点数据源的「拉取」会顺便从高驰拉活动热量（没登录高驰就只拉饮食）；点右上角的「同步」会顺便拉饮食数据（只要填了链接）。两个按钮在工作时都有一条从左往右推进的填充，它只是让你感到在进行，不代表真实进度，完成后会填满。
  Pull and Sync now bring the other along: Pull also fetches activity calories from COROS (only the table if you're not connected), and Sync also pulls your diet table when a link is filled in. Both buttons show a left-to-right fill while they work. It's a feeling of progress, not a measurement, and it fills completely when done.
- 📆 **热量缺口只统计过完的日子**：今天的饮食和消耗要到午夜才完整，所以「近 N 天」是指到昨天为止的 N 天，「有记录以来」也不含今天。
  The calorie gap only sums finished days: today isn't complete until midnight, so "last N days" ends yesterday and "since first log" excludes today.
- ⚖️ **消耗估算改了**：以前手表的全部活动热量一律 × 0.5，偏保守。现在按高驰全天卡路里拆开：日常活动（走动、站立等）全算；当天运动记录的热量 × 0.7，因为手表容易高估；骑行如果有功率计 × 0.9，推拉机会看骑行详情里有没有功率数据。读不到运动记录的日子整天按 0.7 算。用 10 月 24 日到 11 月 2 日的数据算，累计缺口从 1062 kcal 变成 2714 kcal（0.14 → 0.35 kg 脂肪），更接近同期体重的变化。
  The burn estimate changed. All watch activity used to count at 0.5, which was too cautious. COROS's daily calories are now split: everyday movement counts in full, logged workouts at 0.7 (watches tend to overestimate them), and rides with a power meter at 0.9 (track-TOR checks the ride details for power data). Days whose workouts can't be read count at 0.7. On the data from 24 Oct to 2 Nov, the total gap goes from 1062 to 2714 kcal (0.14 to 0.35 kg of fat), closer to the weight change in that period.
- 🎨 **图例和图一致**：摄入、估算总消耗是带圆点的线，基础代谢是虚线，缺口、盈余是半透明柱子，图例照着画。点 ⓘ 展开的说明拆成几条，每条前面放它解释的那个图例。
  The legend now matches the chart: intake and estimated burn are lines with dots, BMR is dashed, deficit and surplus are translucent bars. The ⓘ notes are split into short lines, each led by the mark it explains.
- 摄入与消耗图的「i｜+」挪到图表下方左侧，紧挨着它展开的说明，不常用，放在右手拇指不容易误碰的地方。
  The chart's i | + button moved to the bottom left, right above the notes it opens: it's rarely needed, so it's out of the right thumb's way.
- ✍️ **记录框里有测量提示**：图表上点笔图标记录时，空的输入框里显示半透明小字，告诉你怎么量：引体是「下巴过杠的标准引体向上」，体重是「清晨空腹体重」，腰围是「量三次肚脐眼位置，选最大值或者平均值」。一输入就消失，不会被存进去。腰围图下的说明也改成同样的量法。
  The record boxes now show a faint hint on how to measure: strict pull-ups with the chin over the bar, morning weight before eating, waist measured 3 times at the navel taking the largest or the average. It disappears as you type and is never saved. The waist chart caption uses the same method.
- 📥 **添加饮食记录的入口挪到「每日记录」旁边**：点那个列表加号图标，打开数据源面板，里面两项：「线上数据」（粘贴表格链接、拉取）和「手动添加饮食记录」。原来的「+ 记录饮食」按钮和页面上方的数据源区块去掉了。还没有任何记录时，面板默认打开。
  Adding food logs now starts from the icon next to "Daily logs": it opens the data source panel with two parts, "Online table" (paste the link, pull) and "Add a food log by hand". The old "+ Log food" button and the data source block at the top are gone. With no logs yet, the panel starts open.
- ⏱️ **每两小时自动拉一次饮食**：填了表格链接的话，打开推拉机时如果离上次拉取超过两小时，就在后台自动拉取。
  With a table link filled in, opening the app pulls your food in the background when the last pull is over two hours old.
- 「同步」「拉取」按钮的填充动画改成先慢后快，不会一开始冲很快、后面卡住。
  The Sync and Pull fill now starts slow and speeds up, instead of rushing ahead and then stalling.
- 🚫 **记录框只收合理的数字**：腰围 30–180 cm、体重 20–300 kg、引体 0–200 个整数。填的不对，输入框和提示变红，保存按钮变暗按不下去，面板也不会关。清空再保存，还是删除当天那条记录。输入框不再有上下箭头。
  The record boxes only accept sensible numbers: waist 30–180 cm, weight 20–300 kg, pull-ups a whole number from 0 to 200. Anything else turns the box and a hint red and the save button can't be pressed, so the panel stays open. Saving an empty box still deletes that day's record. The up/down arrows are gone.
- 📏 腰围图标换成腰上围一圈软尺，更好认。
  The waist icon is now a tape measure around a waist, which is easier to read.
- 🔥 **新目标：减脂**：把“有记录以来”的热量缺口折算成已经消灭的脂肪（7700 kcal = 1 kg），对比你设的目标公斤数，只算过完的日子。
  New goal, fat loss: the calorie gap since your first log, turned into fat burned (7700 kcal = 1 kg) and compared with your target in kg. Only finished days count.
- 🎯 **目标卡片的图标可以点了**：点引体、腰围、体重、减脂左边的图标，直接跳到「目标」面板里对应的输入框。
  Tap a goal's icon to jump straight to that goal's box in the Goals panel.
- 👁️ **首页显示哪些目标由你选**：「目标」面板顶部有四个开关，可以显示 0 到 4 个，都不选就隐藏首页那一块。
  Choose which goals the top card shows: four switches at the top of the Goals panel, from none to all four. With none, the card is hidden.
- 📏 **「同步」和「拉取」按钮大小固定**：按下后文字变成「同步中…」「读取中…」「已同步 21:24」时，按钮不再变长变短。
  The Sync and Pull buttons keep one size: they no longer grow or shrink when the label changes to Syncing…, Reading… or Synced 21:24.
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
