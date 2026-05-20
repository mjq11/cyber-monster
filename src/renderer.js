/**
 * 怪兽 Canvas 渲染器 — 根据视觉参数绘制动态赛博怪兽
 * 使用纯 Canvas 2D API，无外部图片依赖
 */

/**
 * 绘制完整怪兽
 * @param {HTMLCanvasElement} canvas
 * @param {Object} visual - 来自 monster.js 的 visualParams
 * @param {boolean} animate - 是否启动动画循环
 */
export function drawMonster(canvas, visual, animate = true) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 280;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  let frame = 0;
  const cx = size / 2;
  const cy = size / 2 + 10;

  function render() {
    ctx.clearRect(0, 0, size, size);
    const t = frame * 0.03;
    const breathe = Math.sin(t) * 3;

    // 背景光晕
    const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
    glow.addColorStop(0, hexToRgba(visual.bodyColor, 0.15));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // ---- 翅膀（熬夜 > 25）----
    if (visual.hasWings) {
      ctx.save();
      const wingFlap = Math.sin(t * 2) * 12;
      // 左翅
      ctx.fillStyle = hexToRgba(visual.accentColor, 0.25);
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 20 + breathe);
      ctx.quadraticCurveTo(cx - 100, cy - 60 + wingFlap, cx - 70, cy + 20);
      ctx.quadraticCurveTo(cx - 50, cy, cx - 40, cy - 20 + breathe);
      ctx.fill();
      // 右翅
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy - 20 + breathe);
      ctx.quadraticCurveTo(cx + 100, cy - 60 - wingFlap, cx + 70, cy + 20);
      ctx.quadraticCurveTo(cx + 50, cy, cx + 40, cy - 20 + breathe);
      ctx.fill();
      ctx.restore();
    }

    // ---- 鱼鳍（摸鱼 > 25）----
    if (visual.hasFins) {
      ctx.save();
      const finWave = Math.sin(t * 1.5) * 8;
      ctx.fillStyle = hexToRgba('#22d3ee', 0.3);
      // 左鳍
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + breathe);
      ctx.quadraticCurveTo(cx - 75, cy - 10 + finWave, cx - 60, cy + 30);
      ctx.lineTo(cx - 35, cy + 15 + breathe);
      ctx.fill();
      // 右鳍
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy + breathe);
      ctx.quadraticCurveTo(cx + 75, cy - 10 - finWave, cx + 60, cy + 30);
      ctx.lineTo(cx + 35, cy + 15 + breathe);
      ctx.fill();
      ctx.restore();
    }

    // ---- 身体 ----
    const bodyW = 36 + visual.bodyRound * 0.15;
    const bodyH = 42 + visual.bodyRound * 0.12;
    const bodyGrad = ctx.createRadialGradient(cx, cy + breathe, 10, cx, cy + breathe, bodyW + 10);
    bodyGrad.addColorStop(0, lighten(visual.bodyColor, 30));
    bodyGrad.addColorStop(0.7, visual.bodyColor);
    bodyGrad.addColorStop(1, darken(visual.bodyColor, 30));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + breathe, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();

    // 身体高光
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 12 + breathe, bodyW * 0.5, bodyH * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // ---- 眼睛 ----
    const eyeScale = visual.eyeSize === 'huge' ? 1.5 : visual.eyeSize === 'large' ? 1.25 : 1;
    const eyeR = 10 * eyeScale;
    const eyeY = cy - 12 + breathe;
    const eyeGap = 16;

    // 黑眼圈（熬夜）
    if (visual.darkCircles > 20) {
      const dcAlpha = Math.min(0.5, visual.darkCircles / 200);
      ctx.fillStyle = `rgba(60, 0, 80, ${dcAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cx - eyeGap, eyeY + 3, eyeR + 6, eyeR + 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeGap, eyeY + 3, eyeR + 6, eyeR + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 眼白
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx - eyeGap, eyeY, eyeR, eyeR * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeGap, eyeY, eyeR, eyeR * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔（跟随呼吸微动）
    const pupilShift = Math.sin(t * 0.5) * 2;
    const pupilR = eyeR * 0.55;
    const pupilColor = visual.dominant === 'coffee' ? '#00cc44' : '#111';
    ctx.fillStyle = pupilColor;
    ctx.beginPath();
    ctx.arc(cx - eyeGap + pupilShift, eyeY, pupilR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeGap + pupilShift, eyeY, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔高光
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - eyeGap + pupilShift - 2, eyeY - 2, pupilR * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeGap + pupilShift - 2, eyeY - 2, pupilR * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // ---- 嘴巴 ----
    ctx.strokeStyle = darken(visual.bodyColor, 50);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const mouthY = cy + 10 + breathe;
    if (visual.dominant === 'anxiety') {
      // 焦虑嘴：波浪形
      ctx.moveTo(cx - 10, mouthY);
      ctx.quadraticCurveTo(cx - 5, mouthY - 4, cx, mouthY);
      ctx.quadraticCurveTo(cx + 5, mouthY + 4, cx + 10, mouthY);
    } else if (visual.dominant === 'slacking') {
      // 摸鱼嘴：微笑
      ctx.moveTo(cx - 12, mouthY - 2);
      ctx.quadraticCurveTo(cx, mouthY + 8, cx + 12, mouthY - 2);
    } else {
      // 默认嘴：小圆嘴
      ctx.arc(cx, mouthY + 2, 5, 0, Math.PI);
    }
    ctx.stroke();

    // ---- 小脚 ----
    const footY = cy + bodyH - 5 + breathe;
    ctx.fillStyle = darken(visual.bodyColor, 20);
    ctx.beginPath();
    ctx.ellipse(cx - 14, footY, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 14, footY, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- 咖啡点滴架（coffee > 35）----
    if (visual.hasCoffeeIV) {
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 2;
      // 杆子
      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 50 + breathe);
      ctx.lineTo(cx + 50, cy + 30 + breathe);
      ctx.stroke();
      // 挂钩
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 50 + breathe);
      ctx.lineTo(cx + 55, cy - 50 + breathe);
      ctx.stroke();
      // 袋子
      ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
      ctx.beginPath();
      ctx.roundRect(cx + 42, cy - 48 + breathe, 16, 22, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139,69,19,0.8)';
      ctx.stroke();
      // 管子
      ctx.strokeStyle = 'rgba(139,69,19,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 26 + breathe);
      ctx.quadraticCurveTo(cx + 50, cy - 5, cx + 38, cy + breathe);
      ctx.stroke();
      // 标签
      ctx.fillStyle = '#fff';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ICE', cx + 50, cy - 36 + breathe);
    }

    // ---- 外卖袋（takeout > 30）----
    if (visual.hasBag) {
      const bagFloat = Math.sin(t * 0.8) * 3;
      ctx.fillStyle = 'rgba(251,146,60,0.5)';
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy + 5 + bagFloat, 18, 20, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251,146,60,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // 提手
      ctx.beginPath();
      ctx.arc(cx - 56, cy + 5 + bagFloat, 5, Math.PI, 0);
      ctx.stroke();
    }

    // ---- 闪电头顶（anxiety > 30）----
    if (visual.hasLightning) {
      const flash = Math.sin(t * 5) > 0.3 ? 1 : 0.3;
      ctx.fillStyle = `rgba(251,191,36,${flash * 0.8})`;
      ctx.beginPath();
      const lx = cx + Math.sin(t) * 5;
      const ly = cy - bodyH - 15 + breathe;
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 6, ly + 10);
      ctx.lineTo(lx + 2, ly + 10);
      ctx.lineTo(lx + 8, ly + 22);
      ctx.lineTo(lx, ly + 14);
      ctx.lineTo(lx + 4, ly + 14);
      ctx.closePath();
      ctx.fill();
    }

    // ---- 手机（social > 30）----
    if (visual.hasPhone) {
      const phoneGlow = Math.sin(t * 2) * 0.2 + 0.6;
      ctx.save();
      ctx.translate(cx + 42, cy + 5 + breathe);
      ctx.rotate(0.15);
      // 手机壳
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(-6, -9, 12, 18, 2);
      ctx.fill();
      // 屏幕
      ctx.fillStyle = `rgba(34,211,238,${phoneGlow})`;
      ctx.fillRect(-4, -7, 8, 14);
      ctx.restore();
    }

    // ---- 浮动粒子 ----
    for (let i = 0; i < 6; i++) {
      const px = cx + Math.sin(t + i * 1.1) * (50 + i * 10);
      const py = cy + Math.cos(t + i * 0.8) * (40 + i * 8) + breathe;
      const ps = 1.5 + Math.sin(t + i) * 0.8;
      ctx.fillStyle = hexToRgba(visual.accentColor, 0.3 + Math.sin(t + i) * 0.2);
      ctx.beginPath();
      ctx.arc(px, py, ps, 0, Math.PI * 2);
      ctx.fill();
    }

    frame++;
    if (animate) {
      requestAnimationFrame(render);
    }
  }

  render();
}

/**
 * 绘制合成动画中的容器内液体/粒子效果
 */
export function drawSynthAnimation(canvas, progress, colors) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 200;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;

  // 容器
  ctx.strokeStyle = 'rgba(168,85,247,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.stroke();

  // 液体填充
  const fillH = (progress / 100) * 140;
  const t = Date.now() * 0.003;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.clip();

  // 波浪
  const c1 = colors[0] || '#a855f7';
  const c2 = colors[1] || '#22d3ee';
  const grad = ctx.createLinearGradient(0, size - fillH, 0, size);
  grad.addColorStop(0, hexToRgba(c1, 0.4));
  grad.addColorStop(1, hexToRgba(c2, 0.6));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, size);
  for (let x = 0; x <= size; x++) {
    const y = size - fillH + Math.sin(x * 0.05 + t) * 6 + Math.sin(x * 0.02 + t * 0.7) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fill();

  // 气泡
  for (let i = 0; i < 8; i++) {
    const bx = cx + Math.sin(t + i * 0.9) * 50;
    const by = size - (progress / 100) * fillH * (0.3 + (i / 8) * 0.7) + Math.sin(t * 2 + i) * 8;
    const br = 2 + Math.sin(t + i) * 1.5;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.sin(t + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 绘制容器预览（燃料注入页的实时反馈）
 */
export function drawVesselPreview(canvas, fuelValues) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 200;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const t = Date.now() * 0.002;

  // 容器轮廓
  ctx.strokeStyle = 'rgba(168,85,247,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 70, 80, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 每种燃料用不同颜色的小球表示
  const fuels = [
    { id: 'coffee', color: '#8B4513' },
    { id: 'slacking', color: '#22d3ee' },
    { id: 'takeout', color: '#fb923c' },
    { id: 'anxiety', color: '#ef4444' },
    { id: 'latenight', color: '#7c3aed' },
    { id: 'social', color: '#f472b6' },
  ];

  let idx = 0;
  for (const f of fuels) {
    const val = fuelValues[f.id] || 0;
    const count = Math.floor(val / 8);
    for (let i = 0; i < count; i++) {
      const angle = t + idx * 0.4 + i * 0.6;
      const radius = 20 + i * 6 + Math.sin(t + idx) * 8;
      const px = cx + Math.sin(angle) * radius * 0.8;
      const py = cy + 10 + Math.cos(angle) * radius * 0.6;
      const s = 3 + Math.sin(t + i + idx) * 1.5;
      ctx.fillStyle = hexToRgba(f.color, 0.5 + Math.sin(t + i) * 0.2);
      ctx.beginPath();
      ctx.arc(px, py, s, 0, Math.PI * 2);
      ctx.fill();
    }
    idx++;
  }
}

// ============================================================
// 颜色工具
// ============================================================
function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex, amount) {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amount) {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return `rgb(${r},${g},${b})`;
}
