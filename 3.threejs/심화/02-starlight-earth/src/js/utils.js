export function convertLatLngToPos(pos, radius) {
  const x = Math.cos(pos.lat) * Math.sin(pos.lng) * radius
  const y = Math.sin(pos.lat) * radius
  const z = Math.cos(pos.lat) * Math.cos(pos.lng) * radius
  return { x, y, z }
}

export function getGradientCanvas(startColor, endColor) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 1

  const gradient = ctx.createLinearGradient(0, 0, 256, 0)
  gradient.addColorStop(0, startColor)
  gradient.addColorStop(1, endColor)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 1)

  return canvas
}
