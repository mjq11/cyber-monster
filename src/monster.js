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
    '血液中咖啡因浓度已超过水分子含量。没有冰美式的早晨等于没有灵魂的躯壳。',
    '此生物已进化出对咖啡因的完全免疫力，但仍坚持每日摄入，以维持自我认同。',
  ],
  slacking: [
    '已将摸鱼发展为一门精密科学。能在会议中保持专注表情同时完成三局小游戏。',
    '此生物的生产力呈量子态分布：只有在不被观测时才会真正工作。',
  ],
  takeout: [
    '厨房已退化为快递暂存区。味觉记忆完全由外卖平台评价区图片构建。',
    '与外卖骑手建立了比大多数人际关系更稳定的社交连接。',
  ],
  anxiety: [
    '大脑皮层已被焦虑信号覆盖率达92%。剩余8%用于焦虑自己为什么这么焦虑。',
    '此生物的焦虑不需要具体触发源——它已进化为一种持续运行的后台进程。',
  ],
  latenight: [
    '白天是社畜，凌晨两点变身存在主义哲学家。其生物钟已脱离地球自转周期。',
    '黑眼圈已成为此生物的种族特征，任何遮瑕产品都无法掩盖其深夜进化的痕迹。',
  ],
  social: [
    '拇指已进化出独立意识，能在主人完全无意识的状态下完成400次下滑操作。',
    '此生物的注意力碎片化程度已达纳秒级。超过15秒的内容会触发自动跳过机制。',
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
