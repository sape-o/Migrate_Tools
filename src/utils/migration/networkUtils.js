export function cidrToSubnetMask(cidr) {
  const bits = parseInt(cidr, 10)
  if (isNaN(bits) || bits < 0 || bits > 32) return null

  let mask = []
  let remainingBits = bits

  for (let i = 0; i < 4; i++) {
    if (remainingBits >= 8) {
      mask.push(255)
      remainingBits -= 8
    } else {
      let val = 0
      for (let j = 7; j >= 8 - remainingBits; j--) {
        val += Math.pow(2, j)
      }
      mask.push(val)
      remainingBits = 0
    }
  }

  return mask.join('.')
}