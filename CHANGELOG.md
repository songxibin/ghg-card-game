# 本地改动记录（Changelog）

> 用户要求：每次改动都在本地记录；同时每个阶段用 git commit 留痕。

## 2026-11-10

### 1. 外部调研（commit: docs: record external research…）
- 调研同类 GHG/气候科普产品：FT Climate Game、NCAR Choose Our Future、ClimateGame、CO2 PACMAN、Carbon Footprint Game、Terratales。
- 收集 GHG 事实素材：七种温室气体、GWP、Scope 1/2/3、EPA 等价换算。
- 梳理 AdSense × Cloudflare Pages 合规要求：自有域名、ads.txt、404 陷阱、隐私政策、CMP。
- 记录 Pages 部署方式。产出 `docs/RESEARCH.md`。

### 2. 视觉与内容数据（commit: feat: add shared styles and four-level GHG game content）
- 新增 `assets/css/style.css`：深绿碳主题、关卡地图、HUD、选择卡、测验、结算、彩纸、响应式。
- 新增 `assets/js/content.js`：4 关数据（1 关测验 + 3 关模拟），18+ 决策卡、知识点、突发事件与称号。

### 3. 游戏引擎与配置
- 新增 `assets/js/engine.js`：关卡解锁、测验判分、模拟数值、事件、星级、结算、分享、进度持久化。
- 新增 `assets/js/config.js` 与 `assets/js/ads.js`：广告位按配置注入，未配置时不加载外部脚本。

### 4. 页面
- 新增 `index.html`、`play.html`、`learn.html`、`about.html`、`privacy.html`、`404.html`。

### 5. 部署与合规文件
- 新增 `_headers`、`ads.txt`（占位发布商 ID）、`robots.txt`、`sitemap.xml`、`README.md`、`package.json`、`.gitignore`。
