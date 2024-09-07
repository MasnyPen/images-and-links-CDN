const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const users = [
  {
    id: 1,
    username: "user1",
    password: bcrypt.hashSync("password1", 8),
  },
]

// Middleware do weryfikacji JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]

  if (!token) {
    return res.status(403).send({ error: "Brak tokenu autoryzacyjnego" })
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: "Nieprawidłowy token" })
    }

    req.user = decoded
    next()
  })
}
module.exports = { verifyToken, users }
