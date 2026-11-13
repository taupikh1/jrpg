/**
 * Browser-side bridge for the pixel-art generator: PixBuf -> canvas.
 */
export function pixBufToCanvas(pb) {
  const canvas = document.createElement('canvas');
  canvas.width = pb.width;
  canvas.height = pb.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(pb.data), pb.width, pb.height), 0, 0);
  }
  return canvas;
}
