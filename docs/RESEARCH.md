# 外部调研记录（2026-11-10）

> 目的：在动手设计前收集同类产品、事实素材、AdSense 合规要求与 Cloudflare Pages 部署方式。
> 所有结论均来自公开网页，链接见文末。

## 1. 同类科普产品与可借鉴机制

| 产品 | 机制 | 可借鉴点 |
| --- | --- | --- |
| FT Climate Game | 玩家扮演"未来世代部长"，数百个政策决策点，基于 IEA 模型推演 2050 净零路径，结局给出升温预测与分享挑战 | 角色扮演 + 多轮决策 + 结局评分 + 分享 |
| NCAR Choose Our Future | 住房/交通/度假/饮食/消费 5 类生活方式问答 → 个人碳足迹 → SSP 全球排放路径可视化 | 生活化分类、个人→全球的尺度换算 |
| ClimateGame App | 记录真实行为 → 岛屿生态随碳目标变化 | 即时反馈、可视化状态 |
| CO2 PACMAN | 瓦片式模拟，用户测试不同减排行动并即时看到排放/碳汇变化 | 行动-结果即时联动 |
| The Carbon Footprint Game | 给 3 万美元、6 个月，把家庭碳足迹减半，预算与返利博弈 | 预算约束 + 多目标（钱 vs 减排） |
| Terratales | 生活方式选择 + 100 分目标 | 低门槛、短时长、可分享 |

**共性结论**：传播力强的产品都具备
1. 明确角色与目标；2. 每步选择都有**即时数值反馈**；3. 每步附带一句**可记住的知识点**；
4. 有清晰的**通关/评分**；5. 结局可分享。

**市场缺口**：中文、零安装（纯网页）、手机可玩、5–10 分钟、从概念到企业/城市决策逐级递进的 GHG 游戏。

## 2. GHG 事实素材（用于游戏数据与知识页）

- **GHG / CO₂e**：不同温室气体按 GWP（全球增温潜势）折算为二氧化碳当量，统一记账。
- **三大范围（GHG Protocol）**：
  - Scope 1：企业自有/受控来源的直接排放（锅炉、车辆、制冷剂泄漏等）。
  - Scope 2：外购电力、蒸汽、热/冷的间接排放。
  - Scope 3：价值链其他间接排放（采购、运输、差旅、通勤、产品使用等），通常占比最大。
- **七种主要温室气体**：CO₂、CH₄、N₂O、HFCs、PFCs、SF₆、NF₃。
- **GWP 量级参考**：CH₄ ≈ 28、N₂O ≈ 265、SF₆ ≈ 23,500（以 CO₂ = 1 为基准）。
- **EPA 等价换算**：减排量可换算为"少开多少辆车/种多少棵树/多少户家庭用电"，用于结果页增强感知。
- **常见误区**：只买碳信用不减排 ≠ 碳中和；碳中和 = 最大程度减排 + 抵消剩余净排放。

来源：US EPA、GHG Protocol、UCAR。

## 3. Google AdSense × Cloudflare Pages 合规清单

| 要求 | 结论 |
| --- | --- |
| 域名 | **必须自有域名**；`*.pages.dev` 免费子域无法通过审核 |
| ads.txt | 站点根目录 `/ads.txt`，内容 `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`；必须真实可访问 |
| SPA 陷阱 | 缺少 `404.html` 时 Pages 会把不存在的路径回退为首页且返回 200，导致 ads.txt 软 404 → **必须提供 404.html** |
| 隐私政策 | 必须披露 Google 作为第三方供应商使用 Cookie、个性化广告、opt-out 链接 |
| CMP | EEA/UK/瑞士流量需 Google 认证 CMP；可在 AdSense 后台开启 Google 自带 CMP |
| 内容 | 需原创、有清晰导航与足够可评估内容 → 不能只有游戏页，需知识页/关于页 |
| 验证 | 代码片段或 ads.txt 或 meta 标签，脚本需位于每页 `<head>` |
| 其他 | 年满 18、身份验证、HTTPS、内容语言受支持 |

## 4. Cloudflare Pages 部署步骤

```bash
npx wrangler login
npx wrangler pages project create ghg-carbon-game --production-branch main
npx wrangler pages deploy ./public --project-name=ghg-carbon-game
```

- 静态目录即部署目录；`_headers` 可覆盖响应头（如 `ads.txt` 的 Content-Type）。
- 自定义域名：Workers & Pages → 项目 → Custom domains → 绑定；SSL 自动签发。
- 广告投放应提交自定义域名而非 pages.dev 地址。

## 5. 由此确定的设计方向

- **形式**：纯静态单页应用（无框架、无构建），手机优先，5–10 分钟。
- **玩法**：4 个关卡由浅入深（概念测验 → 家庭 → 企业 → 城市政策），每关有预算/支持度/排放多目标与星级，通关解锁下一关。
- **趣味性**：年度决策卡、即时数值动画、随机"你知道吗"、关卡地图、星级与称号、结局分享文案、彩纸庆祝。
- **学习性**：每次选择附一条知识点；独立知识页覆盖 GHG、Scope 1/2/3、CO₂e、净零、碳市场。
- **商业化**：预留 AdSense 配置位、广告位组件、ads.txt 模板、隐私政策与 404 页；发布商 ID 由站点主人在 `config.js` 填入。
- **记录**：所有改动通过 git 提交与 `CHANGELOG.md` 留存（用户要求"每次改动，都在本地记录"）。

## 参考链接

1. FT Climate Game 案例：https://www.commarts.com/project/35130/the-financial-times-climate-game
2. NCAR Choose Our Future：https://scied.ucar.edu/exhibits/ourfuture
3. ClimateGame App：https://ceeweb.org/climategame/mobileapp/
4. The Carbon Footprint Game：https://nmiel.itch.io/the-carbon-footprint-game
5. CO2 PACMAN：https://co2pacman.interreg-euro-med.eu/co2pacman-eu/
6. EPA Scope 1&2：https://www.epa.gov/climateleadership/scopes-1-and-2-emissions-inventorying-and-guidance
7. EPA Determine Emissions Sources：https://www.epa.gov/climateleadership/determine-emissions-sources
8. GHG Protocol FAQ：https://ghgprotocol.org/calculation-tools-faq
9. EPA Equivalencies Calculator：https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references
10. AdSense 连接站点：https://support.google.com/adsense/answer/7584263
11. AdSense 资格要求：https://support.google.com/adsense/answer/9724
12. ads.txt × Cloudflare Pages：https://approvalens.com/guides/ads-txt-on-cloudflare-pages-workers
13. AdSense 2026 要求：https://approvalens.com/guides/adsense-requirements-2026
14. Cloudflare Pages Direct Upload：https://developers.cloudflare.com/pages/get-started/direct-upload/
15. Cloudflare Pages 静态 HTML：https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
