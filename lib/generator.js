const { v4: uuidv4 } = require("uuid")

const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

function encodeBase62(buffer) {
  let number = BigInt("0x" + Buffer.from(buffer).toString("hex"))
  let base62Str = ""
  while (number > 0) {
    const remainder = Number(number % BigInt(62))
    base62Str = base62[remainder] + base62Str
    number = number / BigInt(62)
  }
  return base62Str
}

function generateShortId() {
  const uuid = uuidv4()
  const buffer = Buffer.from(uuid.replace(/-/g, ""), "hex")

  let base62Id = encodeBase62(buffer)

  return base62Id.substring(0, 6)
}

module.exports = { generate: generateShortId }
