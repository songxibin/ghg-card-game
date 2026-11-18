/* ============================================================
   关卡内容数据 —— 纯前端静态数据，无任何后端/隐私数据
   单位约定：
   - emissions: 绝对排放量（吨 CO₂e）
   - budget:    绝对预算（万元 or 亿元，见 level.unit）
   - support:   百分点（%）
   ============================================================ */
window.GHG_CONTENT = {
  siteName: "碳世界",
  tagline: "GHG 闯关实验室",
  glossary: [
    { term: "GHG（温室气体）", def: "会吸收并重新辐射热量的气体。主要来自化石燃料燃烧、工业生产、农业和废弃物处理。" },
    { term: "CO₂e（二氧化碳当量）", def: "按全球增温潜势（GWP）把不同温室气体折算成二氧化碳的统一单位，1 吨 CO₂e 才能放在同一张账上比较。" },
    { term: "Scope 1 / 2 / 3", def: "范围一是企业自有来源的直接排放；范围二是外购电力、热力的间接排放；范围三是供应链、差旅、产品使用等价值链排放。" },
    { term: "GWP（全球增温潜势）", def: "单位质量气体在 100 年内相对 CO₂ 的增温能力：CH₄≈28、N₂O≈265、SF₆≈23,500。" },
    { term: "基准年", def: "用于对比的起点年份。减排目标通常表述为“较基准年下降 X%”。" },
    { term: "碳中和 / 净零", def: "先尽可能减排，再用碳汇或碳移除抵消剩余排放，使净排放为零；不等于只买碳信用。" }
  ],
  levels: [
    /* -------------------------------------------------- L1 */
    {
      id: "l1",
      no: 1,
      type: "quiz",
      icon: "🌱",
      difficulty: "入门",
      title: "碳的 ABC",
      subtitle: "4 个概念，决定你后面能不能看懂碳账本",
      intro: "欢迎，新任地球村碳管理员。上任前先补一课：GHG、CO₂e、Scope 和碳中和。答错会立刻看到解释，不扣分。",
      passText: "答对 3 题即可解锁下一关",
      questions: [
        {
          q: "CO₂e（二氧化碳当量）是用来做什么的？",
          options: [
            "表示二氧化碳气体本身的重量",
            "把不同温室气体按增温能力折算成统一的二氧化碳单位",
            "一种可以交易的碳信用",
            "二氧化碳的排放许可证"
          ],
          answer: 1,
          explain: "不同温室气体增温能力差别很大。用 GWP 折算后，1 吨甲烷约等于 28 吨 CO₂e，才能放在同一张账上比较。"
        },
        {
          q: "一家公司外购电力所产生的间接排放，属于哪个范围？",
          options: ["Scope 1（范围一）", "Scope 2（范围二）", "Scope 3（范围三）", "不属于任何范围"],
          answer: 1,
          explain: "燃料在现场燃烧是范围一；外购电力、蒸汽、热力是范围二；供应链、差旅、产品使用等价值链排放是范围三。"
        },
        {
          q: "下列气体中，单位质量的全球增温潜势（GWP）最高的是？",
          options: ["CO₂", "CH₄（甲烷）", "N₂O（氧化亚氮）", "SF₆（六氟化硫）"],
          answer: 3,
          explain: "SF₆ 的 GWP 约为 23,500，是 CO₂ 的上万倍；甲烷约 28，氧化亚氮约 265。少量强温室气体也不能忽视。"
        },
        {
          q: "“碳中和（Net Zero）”更准确的含义是？",
          options: [
            "完全停止一切排放",
            "把排放转移到其他国家",
            "尽量减排后，用碳汇或碳移除抵消剩余排放，使净排放为零",
            "只要购买碳信用就可以"
          ],
          answer: 2,
          explain: "净零 = 先减排 + 抵剩余。只买抵消不减排，是常见的“漂绿”误区。"
        }
      ]
    },

    /* -------------------------------------------------- L2 */
    {
      id: "l2",
      no: 2,
      type: "sim",
      icon: "🏠",
      difficulty: "基础",
      title: "家庭的碳账本",
      subtitle: "一年 30 万元预算，把一户家庭的排放降 30%",
      intro: "你接手了一户四口之家：每年排放 20 吨 CO₂e，预算 30 万元。三年内做三次选择，把排放降到 14 吨以下，同时别让家人反对。",
      passText: "2029 年排放 ≤ 14 tCO₂e，预算不为负，支持度 ≥ 50%",
      unit: { emissions: "tCO₂e", budget: "万元", support: "%" },
      start: { emissions: 20, budget: 30, support: 55 },
      target: { emissions: 14, budget: 0, support: 50 },
      rounds: [
        {
          title: "第 1 年 · 住房",
          hint: "屋顶、家电、供暖，先动哪一块？",
          cards: [
            {
              id: "l2-r1-a", tag: "住房 · 能源", title: "屋顶装光伏",
              desc: "投入 12 万装 8 kW 光伏，自发自用，少买电网电。",
              effects: { emissions: -5, budget: -12, support: 6 },
              fact: "中国电网平均排放因子约 0.5–0.6 kgCO₂e/kWh，屋顶光伏减少的是范围二排放。"
            },
            {
              id: "l2-r1-b", tag: "住房 · 能效", title: "节能家电 + 保温",
              desc: "只花 3 万换一级能效空调、LED 和门窗密封。",
              effects: { emissions: -2, budget: -3, support: 8 },
              fact: "一级能效空调比老旧三级能效每年省电约 30%，是最便宜的减碳方式之一。"
            },
            {
              id: "l2-r1-c", tag: "住房 · 供暖", title: "装地源热泵",
              desc: "花 15 万替换燃气锅炉，用一份电搬运 3–4 份热能。",
              effects: { emissions: -3, budget: -15, support: -4 },
              fact: "热泵效率高，但初装成本高、施工扰民；是否低碳还取决于电网清洁度。"
            }
          ]
        },
        {
          title: "第 2 年 · 出行",
          hint: "每天通勤 30 公里，怎么安排？",
          cards: [
            {
              id: "l2-r2-a", tag: "出行 · 电动化", title: "换一辆纯电动车",
              desc: "花 15 万把家里的燃油车换成电动车。",
              effects: { emissions: -4, budget: -15, support: 5 },
              fact: "电动车是否真低碳取决于电网；中国电网正在快速变绿，全生命周期排放已低于燃油车。"
            },
            {
              id: "l2-r2-b", tag: "出行 · 习惯", title: "公交 + 骑行通勤",
              desc: "不花钱，改用公交和电助力自行车，偶尔打车。",
              effects: { emissions: -2, budget: 0, support: 10 },
              fact: "城市短途出行中，步行和骑行几乎零排放，还最省钱、最健康。"
            },
            {
              id: "l2-r2-c", tag: "出行 · 反例", title: "换一辆大排量 SUV",
              desc: "花 10 万升级座驾，空间更大，油耗也更高。",
              effects: { emissions: 3, budget: -10, support: -6 },
              fact: "燃油车每公里约排放 150–250 gCO₂，大排量车型更高。"
            }
          ]
        },
        {
          title: "第 3 年 · 饮食与消费",
          hint: "餐桌上的排放，比你想的大。",
          cards: [
            {
              id: "l2-r3-a", tag: "饮食 · 结构", title: "每周一天弹性素食",
              desc: "用豆类、谷物替代部分红肉，几乎不增加开支。",
              effects: { emissions: -1.5, budget: 0, support: 2 },
              fact: "牛羊等反刍动物会排放大量甲烷，红肉的碳足迹通常远高于蔬食。"
            },
            {
              id: "l2-r3-b", tag: "消费 · 浪费", title: "减少食物浪费",
              desc: "按需采购、剩菜再利用，把厨余减半。",
              effects: { emissions: -1, budget: 0, support: 6 },
              fact: "全球约 1/3 的食物被浪费，浪费的食物背后是整条供应链的排放。"
            },
            {
              id: "l2-r3-c", tag: "消费 · 采购", title: "买本地当季食材",
              desc: "多花 1 万，优先本地当季农产品。",
              effects: { emissions: -0.5, budget: -1, support: 3 },
              fact: "本地当季食材减少了长途运输和冷链，但“本地”不是万能，生产方式的差异更关键。"
            }
          ]
        }
      ]
    },

    /* -------------------------------------------------- L3 */
    {
      id: "l3",
      no: 3,
      type: "sim",
      icon: "🏭",
      difficulty: "进阶",
      title: "工厂的减排账",
      subtitle: "预算 100 亿，在四个部门之间做取舍",
      intro: "你是一家年排放 1,000 tCO₂e 的制造企业碳负责人。集团给了 100 亿元减排预算，要求把排放降到 550 吨以下。注意：范围一、二、三都要管。",
      passText: "2030 年排放 ≤ 550 tCO₂e，预算不为负，支持度 ≥ 45%",
      unit: { emissions: "tCO₂e", budget: "亿元", support: "%" },
      start: { emissions: 1000, budget: 100, support: 50 },
      target: { emissions: 550, budget: 0, support: 45 },
      rounds: [
        {
          title: "第 1 年 · 能源（范围二）",
          hint: "外购电力是范围二的主战场。",
          cards: [
            {
              id: "l3-r1-a", tag: "范围二 · 绿电", title: "采购绿电（PPA）",
              desc: "签 10 年绿电协议，花 25 亿，降低市场法范围二排放。",
              effects: { emissions: -180, budget: -25, support: -2 },
              fact: "绿电采购需要可追溯的绿证或 PPA，否则可能被质疑“账面减排”。"
            },
            {
              id: "l3-r1-b", tag: "范围二 · 自建", title: "自建屋顶光伏",
              desc: "花 45 亿建园区光伏，自发自用比例更高。",
              effects: { emissions: -220, budget: -45, support: 6 },
              fact: "自发自用比例越高，回收期越短；屋顶资源通常是最先被利用的。"
            },
            {
              id: "l3-r1-c", tag: "范围二 · 反例", title: "维持煤电，等碳价",
              desc: "不改能源结构，赌碳价不会上涨。",
              effects: { emissions: 120, budget: 0, support: -8 },
              fact: "碳价上升会让高碳设备变成“搁浅资产”，等待往往代价更高。"
            }
          ]
        },
        {
          title: "第 2 年 · 工艺（范围一）",
          hint: "自家烟囱和锅炉，归你直接管。",
          cards: [
            {
              id: "l3-r2-a", tag: "范围一 · 能效", title: "余热回收",
              desc: "花 20 亿回收窑炉余热，用于预热和发电。",
              effects: { emissions: -120, budget: -20, support: 3 },
              fact: "工业余热回收通常是投入产出比最高的措施之一。"
            },
            {
              id: "l3-r2-b", tag: "范围一 · 电气化", title: "电炉替代燃煤",
              desc: "花 38 亿改电炉，范围一排放大幅下降。",
              effects: { emissions: -200, budget: -38, support: -4 },
              fact: "电气化把范围一排放转移到范围二，必须同步采购绿电才真正减碳。"
            },
            {
              id: "l3-r2-c", tag: "范围一 · 反例", title: "设备延寿",
              desc: "不改造，延长旧设备寿命，省下 5 亿投资。",
              effects: { emissions: 80, budget: 5, support: -5 },
              fact: "延寿短期省钱，却把高排放锁定十几年，长期成本更高。"
            }
          ]
        },
        {
          title: "第 3 年 · 供应链（范围三）",
          hint: "范围三通常占企业总排放的 70% 以上。",
          cards: [
            {
              id: "l3-r3-a", tag: "范围三 · 供应商", title: "供应商绿色准入",
              desc: "花 8 亿建立供应商碳数据与准入标准。",
              effects: { emissions: -90, budget: -8, support: 0 },
              fact: "范围三通常占比最大，供应链管理是很多企业减排的“隐藏主战场”。"
            },
            {
              id: "l3-r3-b", tag: "范围三 · 物流", title: "空运改海运",
              desc: "花 6 亿调整物流结构，部分空运改海运。",
              effects: { emissions: -60, budget: -6, support: -3 },
              fact: "空运的单位排放约为海运的 20–30 倍，运输方式的选择影响巨大。"
            },
            {
              id: "l3-r3-c", tag: "范围三 · 反例", title: "不做供应链管理",
              desc: "供应商排放不属于自己工厂，先不管。",
              effects: { emissions: 50, budget: 0, support: -2 },
              fact: "范围三虽不在厂区内，却是企业碳足迹的大头，也是客户和监管最关注的部分。"
            }
          ]
        },
        {
          title: "第 4 年 · 抵消与长期主义",
          hint: "减排之后，剩余的排放怎么处理？",
          cards: [
            {
              id: "l3-r4-a", tag: "抵消 · 碳汇", title: "投资造林碳汇",
              desc: "花 10 亿支持本地造林项目，抵消部分排放。",
              effects: { emissions: -60, budget: -10, support: 5 },
              fact: "优质碳汇需满足额外性、永久性、可核查；否则只是“纸面减排”。"
            },
            {
              id: "l3-r4-b", tag: "抵消 · 技术", title: "上 CCUS 捕集",
              desc: "花 35 亿部署碳捕集利用与封存，处理难减排环节。",
              effects: { emissions: -120, budget: -35, support: 2 },
              fact: "CCUS 适合水泥、钢铁等难减排行业，但成本高、能耗大。"
            },
            {
              id: "l3-r4-c", tag: "抵消 · 反例", title: "只买便宜碳信用",
              desc: "花 4 亿购买低价碳信用，宣称“已中和”。",
              effects: { emissions: -40, budget: -4, support: -6 },
              fact: "低价碳信用常被质疑质量与额外性，不能替代真实减排，也容易构成“漂绿”。"
            }
          ]
        }
      ]
    },

    /* -------------------------------------------------- L4 */
    {
      id: "l4",
      no: 4,
      type: "sim",
      icon: "🏙️",
      difficulty: "挑战",
      title: "一座城市的十年",
      subtitle: "850 亿预算、8 次决策、3 次突发事件",
      intro: "你成为一座 100 万人口城市的“气候市长”。2026 年排放 1,000 吨 CO₂e，预算 850 亿元，市民支持度 50%。十年内把排放降到 450 吨以下，并让支持度不低于 55%。中途会有突发事件。",
      passText: "2035 年排放 ≤ 450 tCO₂e，支持度 ≥ 55%，预算不为负",
      unit: { emissions: "tCO₂e", budget: "亿元", support: "%" },
      start: { emissions: 1000, budget: 850, support: 50 },
      target: { emissions: 450, budget: 0, support: 55 },
      rounds: [
        {
          title: "2026 · 电力系统",
          hint: "先动排放最大、也最难动的部分。",
          cards: [
            {
              id: "l4-r1-a", tag: "能源", title: "风光储一体化",
              desc: "花 180 亿建设风电、光伏和储能，替代煤电。",
              effects: { emissions: -220, budget: -180, support: 4 },
              fact: "风光储一体化能同时解决“靠天吃饭”的波动问题，是新型电力系统的核心。"
            },
            {
              id: "l4-r1-b", tag: "能源", title: "煤电灵活性改造",
              desc: "花 60 亿让煤电调峰，为新能源让路。",
              effects: { emissions: -60, budget: -60, support: 2 },
              fact: "煤电灵活性改造是过渡手段，但不能替代新能源装机。"
            },
            {
              id: "l4-r1-c", tag: "能源", title: "新建燃气电厂",
              desc: "花 40 亿上燃气机组，比煤电“干净”一点。",
              effects: { emissions: 80, budget: -40, support: -6 },
              fact: "天然气仍是化石燃料，会锁定长期排放，还面临碳价与资产搁浅风险。"
            }
          ]
        },
        {
          title: "2027 · 工业",
          hint: "工业既是排放大户，也是就业大户。",
          cards: [
            {
              id: "l4-r2-a", tag: "工业", title: "园区能效改造",
              desc: "花 120 亿做余热、电机、蒸汽系统改造。",
              effects: { emissions: -140, budget: -120, support: 5 },
              fact: "工业能效改造往往“花小钱办大事”，还能降低企业用能成本。"
            },
            {
              id: "l4-r2-b", tag: "工业", title: "钢铁电炉 + 绿氢试点",
              desc: "花 220 亿上电炉和绿氢示范，冲击深度脱碳。",
              effects: { emissions: -200, budget: -220, support: -4 },
              fact: "钢铁是难减排行业，绿氢直接还原是少数可行路径之一，但成本仍高。"
            },
            {
              id: "l4-r2-c", tag: "工业", title: "维持现状保就业",
              desc: "不改造，保住短期税收和就业。",
              effects: { emissions: 100, budget: 0, support: -8 },
              fact: "高碳产业推迟转型，未来会面临更严的碳约束和更大的就业冲击。"
            }
          ]
        },
        {
          title: "2028 · 建筑",
          hint: "存量建筑的节能改造，回报慢但体量大。",
          cards: [
            {
              id: "l4-r3-a", tag: "建筑", title: "既有建筑节能改造",
              desc: "花 120 亿做外墙保温、热泵和照明改造。",
              effects: { emissions: -120, budget: -120, support: 8 },
              fact: "建筑运行能耗占城市能耗的大头，存量改造比新建更关键。"
            },
            {
              id: "l4-r3-b", tag: "建筑", title: "新建超低能耗标准",
              desc: "花 60 亿补贴新建建筑执行超低能耗标准。",
              effects: { emissions: -90, budget: -60, support: 6 },
              fact: "超低能耗建筑一次建成、几十年受益，但要防止“重标准、轻落实”。"
            },
            {
              id: "l4-r3-c", tag: "建筑", title: "地标形象工程",
              desc: "花 80 亿建一座“绿色”地标，实际节能有限。",
              effects: { emissions: 20, budget: -80, support: -10 },
              fact: "形象工程是典型的“漂绿”：投入大、减排少，还挤占真正有效的资金。"
            }
          ]
        },
        {
          title: "2029 · 交通",
          hint: "一座城市的通勤方式，决定它的碳曲线。",
          cards: [
            {
              id: "l4-r4-a", tag: "交通", title: "公交与地铁优先",
              desc: "花 200 亿加密地铁、公交专用道和骑行网络。",
              effects: { emissions: -150, budget: -200, support: 10 },
              fact: "公共交通的碳强度远低于私家车，还能缓解拥堵，是城市减排的杠杆。"
            },
            {
              id: "l4-r4-b", tag: "交通", title: "电动车补贴 + 充电桩",
              desc: "花 120 亿补贴购车、建设充电网络。",
              effects: { emissions: -100, budget: -120, support: 6 },
              fact: "电动车减排效果依赖电网清洁度，补贴要避免“富人受益”的公平性问题。"
            },
            {
              id: "l4-r4-c", tag: "交通", title: "扩建高速",
              desc: "花 100 亿扩建高速，刺激汽车出行。",
              effects: { emissions: 60, budget: -100, support: -5 },
              fact: "扩建道路常诱发更多出行需求（诱导需求），长期未必缓解拥堵，更会增加排放。"
            }
          ]
        },
        {
          title: "2031 · 农业与土地",
          hint: "甲烷和碳汇，都藏在这片土地里。",
          cards: [
            {
              id: "l4-r5-a", tag: "农业", title: "稻田节水 + 有机肥",
              desc: "花 40 亿推广节水灌溉和有机肥替代。",
              effects: { emissions: -70, budget: -40, support: 4 },
              fact: "稻田淹水会厌氧产生甲烷，间歇灌溉能显著减少 CH₄ 排放。"
            },
            {
              id: "l4-r5-b", tag: "土地", title: "退耕还林碳汇",
              desc: "花 50 亿退耕还林，增加森林碳汇。",
              effects: { emissions: -90, budget: -50, support: 6 },
              fact: "森林是重要碳汇，但碳汇需要长期管护，火灾和病虫害会逆转成果。"
            },
            {
              id: "l4-r5-c", tag: "土地", title: "开垦湿地建园区",
              desc: "花 20 亿开发湿地，短期增加土地供给。",
              effects: { emissions: 70, budget: -20, support: -12 },
              fact: "湿地是巨大的碳库，排干开垦会把储存的碳重新释放，生物多样性也受损。"
            }
          ]
        },
        {
          title: "2032 · 碳市场",
          hint: "给碳定价，还是继续补贴高碳？",
          cards: [
            {
              id: "l4-r6-a", tag: "碳市场", title: "本地碳市场覆盖工业",
              desc: "花 30 亿建监测核查体系，把工业纳入碳交易。",
              effects: { emissions: -110, budget: -30, support: -5 },
              fact: "碳市场让减排成本最低的企业先减，但配额设定和监测核查决定成败。"
            },
            {
              id: "l4-r6-b", tag: "碳税", title: "碳税 + 居民返还",
              desc: "花 10 亿建立征管系统，税收返还低收入家庭。",
              effects: { emissions: -80, budget: -10, support: -6 },
              fact: "碳税+返还兼顾减排与公平，但若返还设计不当，低收入家庭会更受影响。"
            },
            {
              id: "l4-r6-c", tag: "碳市场", title: "不设碳价，补贴高碳",
              desc: "不设碳价，继续补贴高碳企业保增长。",
              effects: { emissions: 90, budget: -100, support: 2 },
              fact: "补贴高碳企业等于给排放“发奖金”，会延缓转型并加重财政负担。"
            }
          ]
        },
        {
          title: "2034 · 公众生活",
          hint: "减排不只靠工程，也靠每个人的选择。",
          cards: [
            {
              id: "l4-r7-a", tag: "生活", title: "社区共享 + 维修文化",
              desc: "花 40 亿建设共享空间、维修站和二手平台。",
              effects: { emissions: -60, budget: -40, support: 8 },
              fact: "延长产品寿命、共享使用，能从源头减少制造环节的范围三排放。"
            },
            {
              id: "l4-r7-b", tag: "生活", title: "绿色消费标识",
              desc: "花 30 亿建立产品碳标签和绿色消费引导。",
              effects: { emissions: -40, budget: -30, support: 5 },
              fact: "碳标签让消费者看见“隐藏排放”，但标准不统一时会引发混淆。"
            },
            {
              id: "l4-r7-c", tag: "生活", title: "大促销刺激消费",
              desc: "不投入减排，靠消费拉动短期经济。",
              effects: { emissions: 50, budget: 0, support: -5 },
              fact: "过度消费会推高制造、物流和废弃物排放，短期增长换来长期碳债。"
            }
          ]
        },
        {
          title: "2035 · 收官冲刺",
          hint: "最后两年，如何补齐缺口？",
          cards: [
            {
              id: "l4-r8-a", tag: "能源", title: "跨区绿电交易",
              desc: "花 160 亿从外区购入绿电，补齐电力缺口。",
              effects: { emissions: -120, budget: -160, support: 3 },
              fact: "跨区绿电交易能缓解本地资源不足，但输电损耗和通道容量要算清楚。"
            },
            {
              id: "l4-r8-b", tag: "综合", title: "碳汇 + CCUS 组合",
              desc: "花 120 亿组合造林与工业捕集，处理剩余排放。",
              effects: { emissions: -80, budget: -120, support: 2 },
              fact: "剩余排放优先用高质量碳移除处理，避免把难减排问题留给下一代。"
            },
            {
              id: "l4-r8-c", tag: "综合", title: "透支预算买抵消",
              desc: "花 200 亿买大量低价碳信用，冲抵数字。",
              effects: { emissions: -30, budget: -200, support: -8 },
              fact: "透支预算买低价抵消是“账面净零”，会挤占真实减排投资，也容易被监管质疑。"
            }
          ]
        }
      ],
      events: [
        { afterRound: 2, title: "突发事件 · 热浪来袭", text: "连续高温让用电飙升，市民要求更快行动。", effects: { emissions: 20, support: -6, budget: 0 } },
        { afterRound: 4, title: "突发事件 · 能源价格飙升", text: "国际能源价格大涨，财政补贴压力增加。", effects: { emissions: 0, support: -2, budget: -60 } },
        { afterRound: 6, title: "突发事件 · 碳价暴涨", text: "区域碳价上涨，碳市场收入增加，但企业抱怨成本。", effects: { emissions: -20, support: -4, budget: 30 } }
      ]
    }
  ],
  /* 每关通关后的称号 */
  titles: ["碳小白", "家庭碳管家", "企业碳专家", "净零先锋"],
  cheerWords: ["减排不是牺牲，是把账算明白。", "每一次选择，都在给未来投票。", "科学减排，拒绝漂绿。", "净零不是终点，是新的起点。"]
};
