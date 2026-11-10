# 碳世界 · GHG 闯关实验室

一个纯静态、零依赖的中文温室气体（GHG）科普游戏网站。4 个关卡由浅入深：
概念测验 → 家庭碳账本 → 工厂减排账 → 城市十年。通关解锁、星级评分、进度保存在本机。

- 游戏：`play.html`
- 知识库：`learn.html`
- 落地页：`index.html`
- 部署目标：Cloudflare Pages

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

或使用 `npm run dev`（同样调用 Python 静态服务器）。

## 部署到 Cloudflare Pages

首次部署：

```bash
npx wrangler login
npx wrangler pages project create ghg-carbon-game --production-branch main
npx wrangler pages deploy . --project-name=ghg-carbon-game
```

后续更新：

```bash
npm run deploy
# 等价于：npx wrangler pages deploy . --project-name=ghg-carbon-game
```

部署会包含 `docs/`、`README.md` 等开发文件；`robots.txt` 已禁止抓取 `/docs/`。
如需完全只发布站点文件，可把站点资源移入 `public/` 并部署该目录（同时更新 `_headers` 与 `ads.txt` 位置）。

### 自定义域名

1. Cloudflare 控制台 → Workers & Pages → `ghg-carbon-game` → Custom domains → Set up。
2. 绑定自有域名（Apex 域需托管在 Cloudflare；子域可用 CNAME 指向 `ghg-carbon-game.pages.dev`）。
3. SSL 自动签发。**AdSense 必须提交自有域名，不能提交 `*.pages.dev`。**

## 开启 Google 广告（AdSense）

站点已预留广告位与合规文件，但默认不加载任何广告脚本。上线前按顺序操作：

1. **购买/准备自有域名**并绑定到 Pages。
2. 在 `assets/js/config.js` 填入：
   - `adsenseClient`：`ca-pub-XXXXXXXXXXXXXXXX`
   - `adsenseSlots.leaderboard` / `inline`：AdSense 后台创建的广告单元 ID
   - `contactEmail`：真实可达邮箱（关于页与审核会用到）
3. 把根目录 `ads.txt` 的占位行替换为真实发布商 ID：
   ```
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```
   部署后访问 `https://你的域名/ads.txt`，确认返回纯文本且不是首页 HTML。
4. 在 AdSense 后台添加站点、验证所有权、提交审核。
5. 审核期间/通过后在 **Privacy & messaging** 启用 Google 认证 CMP（覆盖 EEA、英国、瑞士）。
6. 隐私政策已披露 Google Cookie、个性化广告与 opt-out 方式；若广告方案变化请同步更新。

注意：不要点击自己的广告；不要用诱导性文案要求访客点击广告。

## 目录结构

```
index.html            落地页
play.html             游戏（关卡地图 / 测验 / 模拟 / 结算）
learn.html            GHG 知识库（6 章 + 名词小抄）
about.html            关于与联系方式
privacy.html          隐私政策（AdSense 必需）
404.html              自定义 404（避免 ads.txt 软 404）
ads.txt               AdSense 授权卖家文件（占位）
_headers              Cloudflare Pages 响应头
robots.txt / sitemap.xml
assets/css/style.css  全站样式
assets/js/config.js   站点与广告配置
assets/js/ads.js      AdSense 加载器（未配置则不加载）
assets/js/content.js  关卡内容数据
assets/js/engine.js   游戏引擎
docs/RESEARCH.md      外部调研记录
CHANGELOG.md          本地改动记录（每次改动追加）
```

## 内容准确性

游戏数值为科普示意，不对应真实企业的碳盘查结果。事实性内容参考 US EPA、GHG Protocol、IPCC；
正式核算请遵循 ISO 14064 / GHG Protocol。详见 `docs/RESEARCH.md`。
