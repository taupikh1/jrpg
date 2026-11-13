/**
 * Browser-only helper to build placeholder pixel-art textures for demos.
 */
export function createProceduralImage(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    draw(ctx, width, height);
  }
  return canvas;
}

/**
 * @returns {Record<string, HTMLCanvasElement>}
 */
export function buildDemoTextures() {
  const sky = createProceduralImage(240, 180, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a1030');
    g.addColorStop(0.6, '#3a2858');
    g.addColorStop(1, '#5a3a2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f0e8c0';
    ctx.beginPath();
    ctx.arc(180, 40, 18, 0, Math.PI * 2);
    ctx.fill();
  });

  const grass = createProceduralImage(32, 32, (ctx) => {
    ctx.fillStyle = '#2d6a3a';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#3a7a48';
    for (let i = 0; i < 12; i++) {
      const x = (i * 7) % 32;
      const y = (i * 11) % 32;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  const tree = createProceduralImage(32, 48, (ctx) => {
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(13, 28, 6, 20);
    ctx.fillStyle = '#1a5a2a';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(32, 28);
    ctx.lineTo(0, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a7a3a';
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(28, 26);
    ctx.lineTo(4, 26);
    ctx.closePath();
    ctx.fill();
  });

  const rock = createProceduralImage(24, 24, (ctx) => {
    ctx.fillStyle = '#6a6a70';
    ctx.beginPath();
    ctx.moveTo(4, 20);
    ctx.lineTo(2, 10);
    ctx.lineTo(12, 2);
    ctx.lineTo(22, 8);
    ctx.lineTo(20, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a8a90';
    ctx.fillRect(8, 8, 6, 4);
  });

  // 64x32 sheet: 4 walk frames on row 0, 1 idle on row 1
  const hero = createProceduralImage(64, 32, (ctx) => {
    const colors = ['#e8c84a', '#d4b43a', '#c0a02a', '#d4b43a'];
    for (let i = 0; i < 4; i++) {
      const ox = i * 16;
      ctx.fillStyle = colors[i];
      ctx.fillRect(ox + 4, 2, 8, 8); // head
      ctx.fillStyle = '#4a6aaa';
      ctx.fillRect(ox + 5, 10, 6, 6); // body
      // legs alternate
      ctx.fillStyle = '#3a3a5a';
      if (i % 2 === 0) {
        ctx.fillRect(ox + 5, 16, 2, 6);
        ctx.fillRect(ox + 9, 16, 2, 4);
      } else {
        ctx.fillRect(ox + 5, 16, 2, 4);
        ctx.fillRect(ox + 9, 16, 2, 6);
      }
    }
    // idle row
    ctx.fillStyle = '#e8c84a';
    ctx.fillRect(4, 18, 8, 8);
    ctx.fillStyle = '#4a6aaa';
    ctx.fillRect(5, 26, 6, 6);
  });

  return { sky, grass, tree, rock, hero };
}
