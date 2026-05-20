/**
 * 怪兽生成引擎 — SVG 矢量零部件组合 + 硬核命名
 * 根据用户输入的成分比例和栖息地标签，动态生成怪兽形象和属性
 */

// ============================================================
// 燃料配置
// ============================================================
export const FUELS = [
  { id: 'coffee',    icon: '☕', name: '冰美式',   color: '#8B4513' },
  { id: 'slacking',  icon: '🐟', name: '摸鱼',     color: '#22d3ee' },
  { id: 'takeout',   icon: '🥡', name: '外卖',     color: '#fb923c' },
  { id: 'anxiety',   icon: '😰', name: '焦虑',     color: '#ef4444' },
  { id: 'latenight', icon: '🌙', name: '熬夜',     color: '#7c3aed' },
  { id: 'social',    icon: '📱', name: '社交媒体', color: '#f472b6' },
];

// 活跃时间标签
export const TIME_TAGS = [
  { id: 'midnight',  label: '🌑 深夜 0-3点', icon: '🌑' },
  { id: 'commute',   label: '🚇 通勤时间',   icon: '🚇' },
  { id: 'lunch',     label: '🍜 午休偷闲',   icon: '🍜' },
  { id: 'allday',    label: '📡 全天候在线', icon: '📡' },
  { id: 'weekend',   label: '🛋️ 周末专属',   icon: '🛋️' },
];

// App 标签
export const APP_TAGS = [
  { id: 'threads',    label: 'Threads' },
  { id: 'xiaohongshu',label: '小红书' },
  { id: 'steam',      label: 'Steam' },
  { id: 'bilibili',   label: 'B站' },
  { id: 'douyin',     label: '抖音' },
  { id: 'weibo',      label: '微博' },
  { id: 'netflix',    label: 'Netflix' },
  { id: 'wechat',     label: '微信' },
  { id: 'zhihu',      label: '知乎' },
];

// ============================================================
// 硬核命名生成器
// ============================================================
const NAME_PREFIX = [
  '外包型', '纯种', '低能耗高输出', '夜行性', '半驯化', '野生', '圈养',
  '散养型', '间歇性', '慢性', '急性', '超频', '低频', '自由放牧',
];
const NAME_CORE = {
  coffee:    ['咖啡因驱动', '冰美式续命', '咖啡依赖型', '双倍浓缩'],
  slacking:  ['持续性摸鱼', '带薪养生', '高效摸鱼', '摸鱼特化'],
  takeout:   ['外卖寄生', '外卖续命', '美团依附型', '饿了么共生'],
  anxiety:   ['慢性焦虑', '间歇性焦虑', '深度内耗', '精神过载'],
  latenight: ['长期熬夜', '昼伏夜出', '暗夜觉醒', '深夜进化'],
  social:    ['互联网围观', '信息过载', '数字游荡', '赛博漫游'],
};
const NAME_SUFFIX = [
  '哺乳动物', '无脊椎生物', '摸鱼体', '乐天派', '碳基生物',
  '数据幽灵', '赛博浮游生物', '电子生命体', '亚文化载体', '信息寄生虫',
];

// ============================================================
// 行为特征描述
// ============================================================
const TRAIT_TEMPLATES = {
  coffee: [
    '此生物的血管里流淌的不是血液，是常温冰美式。早上没灌第一杯之前，请勿与其进行任何形式的眼神交流，否则后果自负。曾有同事不慎在它咖啡到位前跟它说"早上好"，至今仍在ICU。',
    '进化出了一种罕见的超能力：能在3秒内分辨出瑞幸、Manner和星巴克的冰美式区别，但完全记不住自己上周开会说了什么。简历特长一栏建议写："能同时喝三杯咖啡还手不抖"。',
    '每天的咖啡摄入量已经可以让一头成年大象保持清醒72小时。它的心跳频率和电钻相当接近。最近一次体检，医生看了报告沉默了十秒钟，然后问：你是咖啡机吗？',
  ],
  slacking: [
    '此生物已将"摸鱼"发展成一门国家级非物质文化遗产。它能在老板经过的0.3秒内完成"Alt+Tab → 正经脸 → 假装打字"三连，堪称赛博时代的川剧变脸。据不完全统计，它一天真正工作的时间约为17分钟，其中12分钟在登录系统。',
    '上班时间拥有两个平行宇宙：一个在钉钉上显示"忙碌中"，另一个在马桶上刷完了小红书今日推荐的前200条。它的带薪如厕时间加起来可以申请一个卫生间使用权证书。工位上永远开着一个Excel，但鼠标从来不在Excel的范围内。',
    '已经把"假装很忙"练到了出神入化的境界。PPT永远停在第三页，邮件永远写了一半，会议记录永远"整理中"。同事们都以为它是公司最勤奋的人——毕竟它的电脑从来不锁屏，看起来一直在干活。',
  ],
  takeout: [
    '此生物的厨房已经退化成了一个大型快递暂存中心。灶台上积灰的厚度可以种菜了，但外卖App上的活跃度堪比职业操盘手。它和小区三公里内所有外卖骑手都认识，有几位甚至加了微信互相问好。最近被美团评为"年度尊贵钻石用户"，获奖感言是："谢谢，下一单。"',
    '冰箱里只有三样东西：过期的酸奶、不知道什么时候买的老干妈、以及一瓶活了三个月的矿泉水。但外卖收藏夹里有247家店，每家店的菜单比它背过的所有课文加起来都熟。它对"满25减5"的计算速度超过了NASA的超级计算机。',
    '已经和厨房达成了互不侵犯条约——它不做饭，厨房不生气。它的味觉记忆完全由外卖平台的用户评价图片构建，最近一次亲手下厨是2019年煮泡面，还把锅烧糊了。楼下便利店老板看到它就自动拿塑料袋，这份默契超过了大多数亲密关系。',
  ],
  anxiety: [
    '此生物的焦虑已经焦虑到了一个新的哲学高度——它会因为"今天好像没什么可焦虑的"而焦虑。大脑CPU占用率常年99%，其中98%用于运行"如果...怎么办"模拟器。睡前必须把明天、后天、下周、下个月和退休后可能遇到的所有问题都预演一遍，然后焦虑到失眠，然后焦虑自己为什么失眠。',
    '手机里有23个待办清单App，每个App里都有一个"整理其他待办清单"的待办事项。它能在洗澡的时候同时焦虑工作KPI、房贷利率、全球变暖和今晚吃什么。医生建议它放松，它立刻开始焦虑"我为什么放松不下来"。',
    '此生物的精神状态像一台永远转圈的加载页面——看起来在处理什么重要的事情，实际上什么也没加载出来。它的内心独白一天产出的字数约等于三本《百年孤独》，但没有一个字对解决实际问题有帮助。',
  ],
  latenight: [
    '白天是一坨随时会瘫倒的碳基废物，凌晨两点突然变身精力充沛的超级赛亚人。它的生物钟不是坏了，是跟地球自转反着来的。早上的闹钟对它来说只是一首催眠曲，真正叫醒它的是中午12点外卖骑手的电话。黑眼圈已经不是黑眼圈了，是熊猫的种族天赋。',
    '凌晨三点，别人在做梦，它在纠结一个2008年和同学说错话的社死瞬间。它的夜间活动包括但不限于：刷完三个平台的推荐流、研究量子力学入门视频、给前年的微博点赞、以及思考"如果宇宙是模拟的那我的房租可以不交吗"。第二天早上9点的闹钟响了12遍，它连翻身的力气都没有。',
    '此生物的作息时间表是这样的：凌晨1点-"我该睡了" / 凌晨2点-"看完这个就睡" / 凌晨3点-"最后一个" / 凌晨4点-"算了直接通宵吧" / 早上6点-"好困，睡两小时" / 下午2点-终于醒了。它跟太阳的关系就像同一栋楼的邻居——知道彼此存在，但从不碰面。',
  ],
  social: [
    '此生物的拇指已经产生了独立意识，能在主人完全放空的状态下完成"解锁-打开App-刷200条-关掉-再打开-再刷200条"的完整循环。它的屏幕使用时间报告每周发来一次，每次都像一份判决书。手机电池对它来说不是"用一天"的东西，而是"用到午饭"的东西。',
    '它关注了3700个博主但叫不出其中任何一个人的名字。收藏夹里有1200篇"等会看"的文章，至今没看过一篇。它能在15秒内判断一条短视频值不值得看完，但完全没有能力集中注意力阅读超过三段话的文章。大脑已经被训练成了"短视频解码器"。',
    '此生物醒着的时间有78%在刷手机，剩下的22%在找充电器。它和Wi-Fi的关系比任何人际关系都稳定——断网十秒钟就开始产生戒断反应：手抖、冒汗、反复点击刷新按钮。最近一次主动和真人说超过十句话，是和客服吵流量套餐的问题。',
  ],
};

// ============================================================
// 核心生成函数
// ============================================================

/**
 * 根据用户选择生成怪兽数据
 * @param {Object} fuelValues - {coffee: 30, slacking: 20, ...}
 * @param {string[]} selectedTimes - ['midnight', 'commute']
 * @param {string[]} selectedApps - ['threads', 'bilibili']
 * @returns {Object} 怪兽完整数据
 */
export function generateMonster(fuelValues, selectedTimes, selectedApps) {
  // 找到占比最高的成分
  const sorted = Object.entries(fuelValues)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const dominant = sorted[0]?.[0] || 'slacking';
  const secondary = sorted[1]?.[0] || 'social';

  // 生成名称
  const prefix = pickRandom(NAME_PREFIX);
  const core = pickRandom(NAME_CORE[dominant] || NAME_CORE.slacking);
  const suffix = pickRandom(NAME_SUFFIX);
  const fullName = `${prefix}${core}${suffix}`;

  // 生成物种学名
  const speciesName = `Homo Digitalis ${dominant.charAt(0).toUpperCase() + dominant.slice(1)}ensis`;

  // 生成属性值
  const stats = generateStats(fuelValues, selectedTimes, selectedApps);

  // 生成行为特征
  const trait = pickRandom(TRAIT_TEMPLATES[dominant] || TRAIT_TEMPLATES.slacking);

  // 怪兽视觉参数
  const visualParams = {
    dominant,
    secondary,
    fuelValues,
    selectedTimes,
    selectedApps,
    bodyColor: FUELS.find(f => f.id === dominant)?.color || '#a855f7',
    accentColor: FUELS.find(f => f.id === secondary)?.color || '#22d3ee',
    eyeSize: fuelValues.coffee > 30 ? 'large' : fuelValues.latenight > 30 ? 'huge' : 'normal',
    hasWings: fuelValues.latenight > 25,
    hasFins: fuelValues.slacking > 25,
    hasCoffeeIV: fuelValues.coffee > 35,
    hasBag: fuelValues.takeout > 30,
    hasLightning: fuelValues.anxiety > 30,
    hasPhone: fuelValues.social > 30,
    darkCircles: Math.min(100, fuelValues.latenight * 2.5),
    bodyRound: Math.min(100, fuelValues.takeout * 2),
  };

  return {
    name: fullName,
    species: speciesName,
    stats,
    trait,
    visual: visualParams,
  };
}

function generateStats(fuelValues, selectedTimes, selectedApps) {
  const total = Object.values(fuelValues).reduce((s, v) => s + v, 0) || 1;
  return [
    {
      icon: '⚡', label: '精神能量',
      value: Math.max(10, 100 - (fuelValues.anxiety || 0) * 1.5 - (fuelValues.latenight || 0)),
      color: '#fbbf24',
    },
    {
      icon: '🐟', label: '摸鱼指数',
      value: Math.min(100, (fuelValues.slacking || 0) * 2.5 + 15),
      color: '#22d3ee',
    },
    {
      icon: '☕', label: '咖啡依赖',
      value: Math.min(100, (fuelValues.coffee || 0) * 2.5),
      color: '#8B4513',
    },
    {
      icon: '🌙', label: '夜行指数',
      value: Math.min(100, (fuelValues.latenight || 0) * 2 + (selectedTimes.includes('midnight') ? 30 : 0)),
      color: '#7c3aed',
    },
    {
      icon: '📱', label: '屏幕沉迷',
      value: Math.min(100, (fuelValues.social || 0) * 1.8 + selectedApps.length * 8),
      color: '#f472b6',
    },
    {
      icon: '💪', label: '社会适应',
      value: Math.max(5, 60 - (fuelValues.anxiety || 0) * 0.8 - (fuelValues.latenight || 0) * 0.5),
      color: '#34d399',
    },
  ];
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
