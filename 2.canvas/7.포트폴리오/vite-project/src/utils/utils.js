export function getDistance(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  //피타고라스 sqrt
  return Math.sqrt(dx * dx + dy * dy)
}

export function getAngle(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  //두 점 사이의 각도를 구하는 공식임. 외워두면 유용함.
  return Math.atan2(dy, dx)
}

//얼마나 지워졌는지 % 구하기
export function getScrupedPercent(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height)
  const gap = 32 //4의 배수 적당히 서치. 8개의 픽셀 당 한번씩 탐색. 성능 up
  const total = pixels.data.length / gap
  let count = 0
  for (let i = 0; i < pixels.data.length - 3; i += gap) {
    if (pixels.data[i + 3] === 0) count++
  }

  return Math.round((count / total) * 100)
}

export function drawImageCenter(canvas, ctx, image) {
  const cw = canvas.width
  const ch = canvas.height

  const iw = image.width
  const ih = image.height

  const ir = ih / iw
  const cr = ch / cw

  let sx, sy, sw, sh

  if (ir >= cr) {
    sw = iw
    sh = sw * (ch / cw)
  } else {
    sh = ih
    sw = sh * (cw / ch)
  }

  sx = iw / 2 - sw / 2
  sy = ih / 2 - sh / 2

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cw, ch)
}
