const express = require("express")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const { verifyToken, users } = require("./auth.js")
require("dotenv/config")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 3000

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imgs/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4()
    const fileExtension = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${fileExtension}`)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(
        new Error("Dozwolone są tylko obrazy w formacie JPEG, JPG, PNG lub GIF")
      )
    }
  },
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Endpoint logowania
app.post("/login", (req, res) => {
  if (!req.body) return res.status(400).send({ error: "Niepoprawne dane" })
  const { username, password } = req.body

  // Znajdź użytkownika na podstawie nazwy użytkownika
  const user = users.find(u => u.username === username)
  if (!user) {
    return res
      .status(401)
      .send({ error: "Nieprawidłowa nazwa użytkownika lub hasło" })
  }

  // Sprawdź, czy hasło jest poprawne
  const isPasswordValid = bcrypt.compareSync(password, user.password)
  if (!isPasswordValid) {
    return res
      .status(401)
      .send({ error: "Nieprawidłowa nazwa użytkownika lub hasło" })
  }

  // Generowanie tokenu JWT
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h", // Token ważny przez 1 godzinę
    }
  )

  res.send({ token })
})

// Endpoint do przesyłania zdjęć
app.post("/upload", verifyToken, (req, res, next) => {
  upload.single("image")(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .send({ error: "Błąd związany z przesyłaniem pliku: " + err.message })
    } else if (err) {
      return res.status(400).send({ error: err.message })
    }

    // Kontynuowanie, jeśli nie było błędów
    if (!req.file) {
      return res.status(400).send({ error: "Brak pliku do przesłania." })
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`
    res.send({
      message: "Plik przesłany pomyślnie!",
      imageUrl: imageUrl,
    })
  })
})

// Endpoint do serwowania zdjęć
app.use("/images", express.static(path.join(__dirname, "imgs")))

// Serwowanie pliku index.html na ścieżce '/'
app.use("/", express.static(path.join(__dirname, "public")))

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`)
})
