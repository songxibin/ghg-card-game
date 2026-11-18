# 本地改动记录（Changelog）

> 用户要求：每次改动都在本地记录；同时每个阶段用 git commit 留痕。

## 2026-11-11

### 6. 体验优化
- `404.html` 内部链接与静态资源改为根路径（`/assets/...`、`/index.html`），避免在任意错误路径下访问时 CSS/JS 再次 404。
- `play.html` 单页多屏模式配套样式：`.screen` 默认隐藏、仅 `.active` 显示，新增淡入上移动画并尊重 `prefers-reduced-motion`。
- 移动端不再隐藏顶部导航链接，窄屏下 4 个入口保持可点（已验证 390px 宽度不溢出）。
- 引擎年份改为按回合映射的 `YEAR_PLAN`：L2 2027–2029、L3 2027–2030、L4 八回合跳过 2030/2033 覆盖 2026–2035，与各关通关文案中的年份一致。
- 结算按钮文案简化为「查看成绩 →」；三星阈值由目标排放的 80% 放宽到 90%。
- 结算页「碳积分」指标去重：模拟关自动追加、测验关保持原样，避免重复展示。
- 隐私政策措辞微调（「不提供账号注册，也不需要提交个人信息即可游玩」）。
- （2026-11-18 补充）关卡数据中 L4 各回合的年份前缀同步为 2031/2032/2034/2035，与引擎 `YEAR_PLAN` 一致，避免数据层与页面展示年份脱节。

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
