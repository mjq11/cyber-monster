/**
 * 海报生成 + 二维码
 */
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export async function renderQRCode(canvas, url) {
  try {
    await QRCode.toCanvas(canvas, url, {
      width: 112,
      margin: 1,
      color: { dark: '#e8e4f0', light: '#00000000' },
    });
    canvas.style.width = '56px';
    canvas.style.height = '56px';
  } catch (e) { console.warn('QR生成失败', e); }
}

export async function generatePoster(el) {
  const canvas = await html2canvas(el, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#13103a',
    width: el.offsetWidth,
    windowWidth: el.offsetWidth,
  });
  return canvas.toDataURL('image/png', 0.95);
}
