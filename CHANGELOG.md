# 更新日志 / Changelog

> 每一次「烟花放得比上次更响」的版本记录。
> 遵循 [Keep a Changelog](https://keepachangelog.com/) 的精神，但带点脾气。
>
> Every version where "the fireworks got louder." Follows the spirit of [Keep a Changelog](https://keepachangelog.com/), with attitude.

---

## [v1.01a] — 2026-11-02

### 修复 / Fixed
- 🔒 **新用户不再收到开发者本人的数据**：网页不再加载 `diet-data.json` 和 `train-data.json`，两个文件也已移出仓库。
  New users no longer receive the developer's personal data: the page stops loading these two files, and they are removed from the repo.
- 🧹 **清理已写入的旧数据**：如果浏览器里还留着这批数据，打开时会询问是否清除。只匹配内容完全一致的记录，用户自己记录、同步或改过的数据不会被删。
  If that data is still in a browser, the page asks whether to remove it. Only exact matches are affected, so anything logged, synced or edited by the user stays.

### 新增 / Added
- 🌏 **高驰账号区域选择**：授权时可选中国大陆、欧洲、美国及其他地区，不再固定走美国区；默认值按已存令牌和时区判断。
  COROS account region picker: Mainland China, Europe, or US & other regions, instead of always using the US endpoint. The default comes from any saved token, then the time zone.

---

## [v1.00a] — 2026-11-01

### 里程碑 🎉

产品正式**告别 agent 依赖**，可以独立运作、独立同步了。从操作层面来说，它已经是一个面向大众的产品——只是还没打包成独立 app，所以勇敢地叫自己 **alpha**。

> 从 `v0.83` 一路跳号到 `v1.00a`，不是因为代码翻了一百倍，而是因为它终于**站起来了**（literally，练上身站起来了）。

### 新增 / Added
- 🧹 **大扫除**：清掉了所有「前任」留下的痕迹——Claude、Gemini、Render 这些字串，以及一堆无关文件（`server.py`、`render.yaml`、后端构建包、小程序、relay……全没了）。
- 应用现在是**纯前端直连 COROS**，无后端、无第三方 AI 平台依赖。

### 修复 / Fixed
- 修好一个隐藏 bug：`callCorosToolAdapter` 原来声明成普通函数却偷偷用了 `await`（这种「伪异步」迟早炸），已改为 `async function`。
- 修复 GitHub Pages 部署竞态：连续快速 push 会导致后一次部署被前一次「in progress」卡掉，现在知道要排队了。

### 变更 / Changed
- 版本号 `v0.83` → `v1.00a`。

---

## [v0.83] — 2026-11-01

### 新增 / Added
- 🔐 **纯前端 COROS OAuth 自动授权**：点「授权登录高驰账号」→ 弹高驰登录页 → 自动跳回连接。小白零门槛，不用再复制粘贴什么「token」这种天书。
- ⏰ **3 天备份提醒**：怕你练了三个月忘了备份，它会温柔地戳你一下。

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

### 备注 / Note
- 早期版本曾一度依赖某个 AI 平台（这里不点名了，反正已经分手）。那些痕迹现在都被清干净了。😌

---

## 版本命名规则 / Versioning

| 段 | 含义 |
|---|---|
| `v1` | 主版本——产品已经能独立运作，是「真东西」了 |
| `.00` | 还没到正式 1.0，功能仍在打磨 |
| `a` | **alpha**——还没打包成独立 app，但已经在真实服役 |

> 一句话：**能用，能打，但还没「毕业」。** 等哪天它穿上独立 app 的西装，就把 `a` 去掉，正式 `v1.00`。
