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
// DOM 引用
// ============================================================
const pages = {
  welcome:  $('page-welcome'),
  fuel:     $('page-fuel'),
  habitat:  $('page-habitat'),
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
let vesselAnimFrame = null;

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
    w = rect.width;
    h = 120;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();

  let offset = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const step = 12;
    for (let x = 0; x < w + step; x += step) {
      const t = (x + offset) * 0.03;
      const y1 = h / 2 + Math.sin(t) * 30;
      const y2 = h / 2 - Math.sin(t) * 30;
      ctx.fillStyle = `rgba(168,85,247,${0.3 + Math.sin(t) * 0.15})`;
      ctx.beginPath(); ctx.arc(x, y1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(34,211,238,${0.3 - Math.sin(t) * 0.15})`;
      ctx.beginPath(); ctx.arc(x, y2, 2.5, 0, Math.PI * 2); ctx.fill();
      // 连接线
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

  // 绑定滑条事件
  container.querySelectorAll('.fuel-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const id = e.target.dataset.fuel;
      fuelValues[id] = parseInt(e.target.value);
      $(`val-${id}`).textContent = fuelValues[id] + '%';
      updateTotal();
      playSlide();
      updateVesselPreview();
    });
  });
}

function updateTotal() {
  const total = Object.values(fuelValues).reduce((s, v) => s + v, 0);
  const fill = $('total-fill');
  const val = $('total-value');
  fill.style.width = Math.min(100, total) + '%';
  val.textContent = total + '%';

  if (total > 100) {
    fill.classList.add('over');
    val.classList.add('over');
  } else {
    fill.classList.remove('over');
    val.classList.remove('over');
  }

  // 只要有输入就可进入下一步
  $('btn-next-step').disabled = total === 0;
}

function updateVesselPreview() {
  drawVesselPreview($('vessel-canvas'), fuelValues);
}

// 持续刷新容器预览
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
    btn.className = 'tag-btn';
    btn.textContent = tag.label;
    btn.dataset.id = tag.id;
    btn.addEventListener('click', () => {
      initAudio();
      btn.classList.toggle('selected');
      if (selectedTimes.has(tag.id)) selectedTimes.delete(tag.id);
      else selectedTimes.add(tag.id);
      playSelect();
    });
    timeContainer.appendChild(btn);
  });

  const appContainer = $('app-tags');
  APP_TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = tag.label;
    btn.dataset.id = tag.id;
    btn.addEventListener('click', () => {
      initAudio();
      btn.classList.toggle('selected');
      if (selectedApps.has(tag.id)) selectedApps.delete(tag.id);
      else selectedApps.add(tag.id);
      playSelect();
    });
    appContainer.appendChild(btn);
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

  // 进入实验室
  $('btn-enter').addEventListener('click', () => {
    initAudio();
    playClick();
    navigateTo('fuel');
    startVesselAnim();
  });

  // 下一步 → 栖息地
  $('btn-next-step').addEventListener('click', () => {
    playClick();
    stopVesselAnim();
    navigateTo('habitat');
  });

  // 开始合成
  $('btn-synthesize').addEventListener('click', () => {
    playClick();
    navigateTo('synth');
    runSynthesis();
  });

  // 保存卡片
  $('btn-save').addEventListener('click', async () => {
    const btn = $('btn-save');
    btn.disabled = true;
    btn.textContent = '⏳ 生成中…';
    try {
      const dataUrl = await generatePoster($('result-card'));
      $('poster-image').src = dataUrl;
      $('share-modal').classList.remove('hidden');
      playSuccess();
    } catch (e) {
      alert('生成失败，请重试');
    } finally {
      btn.disabled = false;
      btn.textContent = '📸 保存怪兽卡片';
    }
  });

  // 重新合成
  $('btn-redo').addEventListener('click', () => {
    playClick();
    // 重置状态
    FUELS.forEach(f => {
      fuelValues[f.id] = 0;
      const slider = document.querySelector(`[data-fuel="${f.id}"]`);
      if (slider) slider.value = 0;
      const valEl = $(`val-${f.id}`);
      if (valEl) valEl.textContent = '0%';
    });
    selectedTimes.clear();
    selectedApps.clear();
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('selected'));
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
  '组装细胞骨架…',
  '激活神经突触…',
  '赛博怪兽正在苏醒…',
];

function runSynthesis() {
  playSynth();
  const statusEl = $('synth-status');
  const fillEl = $('synth-fill');
  const synthCanvas = $('synth-canvas');

  let progress = 0;
  let msgIdx = 0;
  const duration = 2800;
  const tickMs = 50;
  const totalTicks = duration / tickMs;
  let tick = 0;

  // 获取主色
  const sorted = Object.entries(fuelValues).sort(([,a],[,b]) => b - a);
  const topColors = sorted.slice(0, 2).map(([id]) =>
    FUELS.find(f => f.id === id)?.color || '#a855f7'
  );

  const timer = setInterval(() => {
    tick++;
    progress = Math.min(100, Math.round((tick / totalTicks) * 100));
    fillEl.style.width = progress + '%';
    drawSynthAnimation(synthCanvas, progress, topColors);

    if (tick % 7 === 0) {
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

  // 填充数据
  $('monster-name').textContent = `《${monster.name}》`;
  $('monster-species').textContent = monster.species;
  $('trait-desc').textContent = monster.trait;

  navigateTo('result');

  // 绘制怪兽
  setTimeout(() => {
    drawMonster($('monster-canvas'), monster.visual, true);
  }, 300);

  // 二维码
  renderQRCode($('qr-code'), window.location.href.split('?')[0]);

  playSuccess();
}

// ============================================================
// 启动
// ============================================================
init();
