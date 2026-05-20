/**
 * 主入口 — 页面流转、事件绑定、合成动画控制
 */
import './style.css';
import { FUELS, TIME_TAGS, APP_TAGS, generateMonster } from './monster.js';
import { drawMonster, drawSynthAnimation, drawVesselPreview } from './renderer.js';
import { initAudio, toggleSound, isSoundOn, playClick, playSlide, playSelect, playSynth, playBubble, playSuccess } from './sound.js';
import { renderQRCode, generatePoster } from './poster.js';

const $ = (id) => document.getElementById(id);

// ============================================================
// 页面注册
// ============================================================
const pages = {
  welcome:  $('page-welcome'),
  fuel:     $('page-fuel'),
  habitat:  $('page-habitat'),
  routine:  $('page-routine'),
  power:    $('page-power'),
  synth:    $('page-synth'),
  result:   $('page-result'),
};

// ============================================================
// 状态
// ============================================================
const fuelValues = {};
FUELS.forEach(f => fuelValues[f.id] = 0);
const selectedTimes = new Set();
const selectedApps = new Set();
const routineChoices = {};     // 二选一结果
const selectedPowers = new Set();
const selectedWeaknesses = new Set();
let vesselAnimFrame = null;

// ============================================================
// 配置数据
// ============================================================

// 二选一题目
const BINARY_QUESTIONS = [
  { id: 'wake',     a: { emoji: '🌅', label: '早起鸟' },   b: { emoji: '🦉', label: '夜猫子' } },
  { id: 'cook',     a: { emoji: '🍳', label: '自己做饭' }, b: { emoji: '🥡', label: '外卖续命' } },
  { id: 'exercise', a: { emoji: '🏃', label: '偶尔运动' }, b: { emoji: '🛋️', label: '专业躺平' } },
  { id: 'social',   a: { emoji: '🎉', label: '社交达人' }, b: { emoji: '🏠', label: '宅家冠军' } },
  { id: 'plan',     a: { emoji: '📋', label: '计划周密' }, b: { emoji: '🎲', label: '随缘大师' } },
  { id: 'save',     a: { emoji: '🐷', label: '攒钱小能手' }, b: { emoji: '💸', label: '月光艺术家' } },
];

// 超能力选项
const POWERS = [
  { id: 'deadpan',    label: '🎭 面不改色地摸鱼' },
  { id: 'caffeine',   label: '☕ 咖啡因免疫体质' },
  { id: 'nap',        label: '😴 3分钟入睡术' },
  { id: 'excuse',     label: '🗣️ 即兴编借口' },
  { id: 'binge',      label: '📺 一口气看完整季剧' },
  { id: 'memorize',   label: '🧠 记住所有外卖密码' },
  { id: 'deadline',   label: '⏰ deadline前爆发' },
  { id: 'navigate',   label: '🗺️ 哪里打折都知道' },
];

// 弱点选项
const WEAKNESSES = [
  { id: 'alarm',      label: '⏰ 闹钟免疫' },
  { id: 'choice',     label: '🤯 选择困难症' },
  { id: 'procras',    label: '📅 拖延癌晚期' },
  { id: 'scroll',     label: '📱 一刷就停不下来' },
  { id: 'impulse',    label: '💳 冲动消费' },
  { id: 'reply',      label: '💬 已读不回专业户' },
  { id: 'nosleep',    label: '🌙 舍不得睡觉' },
  { id: 'lazy',       label: '🦥 运动过敏' },
];

// ============================================================
// 页面切换
// ============================================================
function navigateTo(page) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[page].classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================================
// 初始化
// ============================================================
function init() {
  initWelcomeBg();
  buildFuelSliders();
  buildTags();
  buildBinaryChoices();
  buildPowerWeaknessTags();
  bindEvents();
}

// 欢迎页背景 DNA 螺旋
function initWelcomeBg() {
  const canvas = $('dna-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let w, h;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = 120;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();

  let offset = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let x = 0; x < w + 12; x += 12) {
      const t = (x + offset) * 0.03;
      const y1 = h / 2 + Math.sin(t) * 30;
      const y2 = h / 2 - Math.sin(t) * 30;
      ctx.fillStyle = `rgba(168,85,247,${0.3 + Math.sin(t) * 0.15})`;
      ctx.beginPath(); ctx.arc(x, y1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(34,211,238,${0.3 - Math.sin(t) * 0.15})`;
      ctx.beginPath(); ctx.arc(x, y2, 2.5, 0, Math.PI * 2); ctx.fill();
      if (Math.abs(Math.sin(t)) < 0.3) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
      }
    }
    offset += 1.2;
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// 构建燃料滑条
// ============================================================
function buildFuelSliders() {
  const container = $('fuel-container');
  FUELS.forEach(f => {
    const div = document.createElement('div');
    div.className = 'fuel-item';
    div.innerHTML = `
      <span class="fuel-icon">${f.icon}</span>
      <div class="fuel-info">
        <div class="fuel-name">${f.name}</div>
        <input type="range" class="fuel-slider" data-fuel="${f.id}" min="0" max="60" value="0" step="5" />
      </div>
      <span class="fuel-value" id="val-${f.id}">0%</span>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.fuel-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const id = e.target.dataset.fuel;
      fuelValues[id] = parseInt(e.target.value);
      $(`val-${id}`).textContent = fuelValues[id] + '%';
      updateTotal();
      playSlide();
    });
  });
}

function updateTotal() {
  const total = Object.values(fuelValues).reduce((s, v) => s + v, 0);
  const fill = $('total-fill');
  const val = $('total-value');
  fill.style.width = Math.min(100, total) + '%';
  val.textContent = total + '%';
  if (total > 100) { fill.classList.add('over'); val.classList.add('over'); }
  else { fill.classList.remove('over'); val.classList.remove('over'); }
  $('btn-next-step').disabled = total === 0;
}

function startVesselAnim() {
  function loop() {
    drawVesselPreview($('vessel-canvas'), fuelValues);
    vesselAnimFrame = requestAnimationFrame(loop);
  }
  loop();
}
function stopVesselAnim() {
  if (vesselAnimFrame) { cancelAnimationFrame(vesselAnimFrame); vesselAnimFrame = null; }
}

// ============================================================
// 构建标签
// ============================================================
function buildTags() {
  const timeContainer = $('time-tags');
  TIME_TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn'; btn.textContent = tag.label;
    btn.addEventListener('click', () => {
      initAudio(); btn.classList.toggle('selected');
      if (selectedTimes.has(tag.id)) selectedTimes.delete(tag.id);
      else selectedTimes.add(tag.id);
      playSelect();
    });
    timeContainer.appendChild(btn);
  });

  const appContainer = $('app-tags');
  APP_TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn'; btn.textContent = tag.label;
    btn.addEventListener('click', () => {
      initAudio(); btn.classList.toggle('selected');
      if (selectedApps.has(tag.id)) selectedApps.delete(tag.id);
      else selectedApps.add(tag.id);
      playSelect();
    });
    appContainer.appendChild(btn);
  });
}

// ============================================================
// 构建二选一题目
// ============================================================
function buildBinaryChoices() {
  const container = $('binary-choices');
  BINARY_QUESTIONS.forEach(q => {
    const row = document.createElement('div');
    row.className = 'binary-row';
    row.innerHTML = `
      <button class="binary-option" data-qid="${q.id}" data-val="a">
        <span class="binary-emoji">${q.a.emoji}</span>${q.a.label}
      </button>
      <button class="binary-option" data-qid="${q.id}" data-val="b">
        <span class="binary-emoji">${q.b.emoji}</span>${q.b.label}
      </button>
    `;
    // 绑定点击事件
    row.querySelectorAll('.binary-option').forEach(btn => {
      btn.addEventListener('click', () => {
        initAudio();
        // 同行中取消其他选中
        row.querySelectorAll('.binary-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        routineChoices[btn.dataset.qid] = btn.dataset.val;
        playSelect();
      });
    });
    container.appendChild(row);
  });
}

// ============================================================
// 构建超能力 & 弱点标签
// ============================================================
function buildPowerWeaknessTags() {
  const powerContainer = $('power-tags');
  POWERS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn'; btn.textContent = p.label;
    btn.addEventListener('click', () => {
      initAudio();
      if (selectedPowers.has(p.id)) {
        selectedPowers.delete(p.id);
        btn.classList.remove('selected');
      } else if (selectedPowers.size < 2) {
        selectedPowers.add(p.id);
        btn.classList.add('selected');
      }
      playSelect();
    });
    powerContainer.appendChild(btn);
  });

  const weakContainer = $('weakness-tags');
  WEAKNESSES.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn'; btn.textContent = w.label;
    btn.addEventListener('click', () => {
      initAudio();
      if (selectedWeaknesses.has(w.id)) {
        selectedWeaknesses.delete(w.id);
        btn.classList.remove('selected');
      } else if (selectedWeaknesses.size < 2) {
        selectedWeaknesses.add(w.id);
        btn.classList.add('selected');
      }
      playSelect();
    });
    weakContainer.appendChild(btn);
  });
}

// ============================================================
// 事件绑定
// ============================================================
function bindEvents() {
  // 音效开关
  $('sound-toggle').addEventListener('click', () => {
    initAudio();
    const on = toggleSound();
    $('sound-icon').textContent = on ? '🔊' : '🔇';
  });

  // 欢迎 → 燃料
  $('btn-enter').addEventListener('click', () => {
    initAudio(); playClick();
    navigateTo('fuel');
    startVesselAnim();
  });

  // 燃料 → 栖息地
  $('btn-next-step').addEventListener('click', () => {
    playClick(); stopVesselAnim();
    navigateTo('habitat');
  });

  // 栖息地 → 日常作息
  $('btn-to-routine').addEventListener('click', () => {
    playClick();
    navigateTo('routine');
  });

  // 日常作息 → 超能力
  $('btn-to-power').addEventListener('click', () => {
    playClick();
    navigateTo('power');
  });

  // 超能力 → 合成
  $('btn-synthesize').addEventListener('click', () => {
    playClick();
    navigateTo('synth');
    runSynthesis();
  });

  // 保存卡片
  $('btn-save').addEventListener('click', async () => {
    const btn = $('btn-save');
    btn.disabled = true; btn.textContent = '⏳ 生成中…';
    try {
      const dataUrl = await generatePoster($('result-card'));
      $('poster-image').src = dataUrl;
      $('share-modal').classList.remove('hidden');
      playSuccess();
    } catch (e) {
      alert('生成失败，请重试');
    } finally {
      btn.disabled = false; btn.textContent = '📸 保存怪兽卡片';
    }
  });

  // 重新合成
  $('btn-redo').addEventListener('click', () => {
    playClick();
    FUELS.forEach(f => {
      fuelValues[f.id] = 0;
      const slider = document.querySelector(`[data-fuel="${f.id}"]`);
      if (slider) slider.value = 0;
      const valEl = $(`val-${f.id}`);
      if (valEl) valEl.textContent = '0%';
    });
    selectedTimes.clear(); selectedApps.clear();
    selectedPowers.clear(); selectedWeaknesses.clear();
    Object.keys(routineChoices).forEach(k => delete routineChoices[k]);
    document.querySelectorAll('.tag-btn, .binary-option').forEach(b => b.classList.remove('selected'));
    updateTotal();
    navigateTo('fuel');
    startVesselAnim();
  });

  // 关闭弹窗
  $('btn-close-modal').addEventListener('click', () => $('share-modal').classList.add('hidden'));
  $('share-modal').querySelector('.modal-backdrop').addEventListener('click', () => $('share-modal').classList.add('hidden'));
}

// ============================================================
// 合成动画
// ============================================================
const SYNTH_MSGS = [
  '正在解析数字基因组…',
  '提取赛博 DNA 片段…',
  '注入能量成分…',
  '编译生物特征向量…',
  '匹配栖息地基因型…',
  '融合日常作息数据…',
  '注入超能力基因…',
  '组装细胞骨架…',
  '激活神经突触…',
  '赛博怪兽正在苏醒…',
];

function runSynthesis() {
  playSynth();
  const statusEl = $('synth-status');
  const fillEl = $('synth-fill');
  const synthCanvas = $('synth-canvas');

  let progress = 0, msgIdx = 0, tick = 0;
  const duration = 2800, tickMs = 50;
  const totalTicks = duration / tickMs;

  const sorted = Object.entries(fuelValues).sort(([,a],[,b]) => b - a);
  const topColors = sorted.slice(0, 2).map(([id]) =>
    FUELS.find(f => f.id === id)?.color || '#a855f7'
  );

  const timer = setInterval(() => {
    tick++;
    progress = Math.min(100, Math.round((tick / totalTicks) * 100));
    fillEl.style.width = progress + '%';
    drawSynthAnimation(synthCanvas, progress, topColors);
    if (tick % 6 === 0) {
      msgIdx = (msgIdx + 1) % SYNTH_MSGS.length;
      statusEl.textContent = SYNTH_MSGS[msgIdx];
      playBubble();
    }
    if (progress >= 100) {
      clearInterval(timer);
      statusEl.textContent = '合成完成 ✦';
      setTimeout(showResult, 500);
    }
  }, tickMs);
}

// ============================================================
// 显示结果
// ============================================================
function showResult() {
  const monster = generateMonster(
    fuelValues,
    [...selectedTimes],
    [...selectedApps]
  );

  // 将二选一和超能力/弱点信息融入特征描述
  let extraTraits = '';
  if (routineChoices.wake === 'b') extraTraits += '夜间活动能力+200%。';
  if (routineChoices.cook === 'b') extraTraits += '与外卖骑手建立了深厚的革命友谊。';
  if (routineChoices.exercise === 'b') extraTraits += '肌肉已退化为装饰性组织。';
  if (routineChoices.social === 'b') extraTraits += '社交能力已降至安全模式。';
  if (routineChoices.plan === 'b') extraTraits += '命运对它来说只是一个建议。';
  if (routineChoices.save === 'b') extraTraits += '工资到账到花光的速度突破光速。';

  if (selectedPowers.size > 0) {
    const powerNames = [...selectedPowers].map(id => POWERS.find(p => p.id === id)?.label || '').join('、');
    extraTraits += `\n\n🔮 超能力：${powerNames}`;
  }
  if (selectedWeaknesses.size > 0) {
    const weakNames = [...selectedWeaknesses].map(id => WEAKNESSES.find(w => w.id === id)?.label || '').join('、');
    extraTraits += `\n💀 致命弱点：${weakNames}`;
  }

  const fullTrait = monster.trait + (extraTraits ? '\n\n' + extraTraits : '');

  $('monster-name').textContent = `《${monster.name}》`;
  $('monster-species').textContent = monster.species;
  $('trait-desc').textContent = fullTrait;

  navigateTo('result');

  setTimeout(() => {
    drawMonster($('monster-canvas'), monster.visual, true);
  }, 300);

  renderQRCode($('qr-code'), window.location.href.split('?')[0]);
  playSuccess();
}

// ============================================================
// 启动
// ============================================================
init();
