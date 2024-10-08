const express = require("express")
const multer = require("multer")
const path = require("path")
const { verifyToken, users } = require("./lib/auth.js")
require("dotenv/config")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { connect, db } = require("./lib/database.js")
const { generate } = require("./lib/generator.js")

const app = express()
const PORT = process.env.PORT || 3000
connect()

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imgs/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = generate()
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Endpoint logowania
app.post("/login", (req, res) => {
  if (!req.body) return res.status(400).send({ error: "Niepoprawne dane" })
  const { username, password } = req.body

  const user = users.find(u => u.username === username)
  if (!user) {
    return res
      .status(401)
      .send({ error: "Nieprawidłowa nazwa użytkownika lub hasło" })
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password)
  if (!isPasswordValid) {
    return res
      .status(401)
      .send({ error: "Nieprawidłowa nazwa użytkownika lub hasło" })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h", // Token ważny przez 1 godzinę
    }
  )

  res.send({ token })
})

// Endpoint do zdjęć
app.post("/images", verifyToken, (req, res, next) => {
  upload.single("image")(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .send({ error: "Błąd związany z przesyłaniem pliku: " + err.message })
    } else if (err) {
      return res.status(400).send({ error: err.message })
    }

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

app.use("/images", express.static(path.join(__dirname, "imgs")))

// Panel
app.use("/", express.static(path.join(__dirname, "public")))

// linki

app.post("/links", verifyToken, upload.none(), async (req, res, next) => {
  const link = req.body.link

  if (!link) {
    return res.status(400).send({ error: "Brak linku w żądaniu" })
  }

  const regex = new RegExp(
    /^((https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+)(:\d+)?(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?)$/
  )
  if (!regex.test(link)) {
    return res.status(400).send({ error: "Nieprawidłowy link" })
  }

  const linkId = generate()
  const shortenedLink = `${req.protocol}://${req.get("host")}/${linkId}`

  if (process.env.DB_MYSQL == "true") {
    db.query(
      "INSERT INTO links (original_link, link_id) VALUES (?, ?)",
      [link, linkId],
      (err, results) => {
        if (err) {
          return res.status(500).send({ error: "Błąd zapisu w bazie danych" })
        }
        res.send({
          message: "Link skrócony pomyślnie!",
          url: shortenedLink,
        })
      }
    )
  } else {
    try {
      db.prepare(
        "INSERT INTO links (original_link, link_id) VALUES (?, ?)"
      ).run(link, linkId)
      res.send({
        message: "Link skrócony pomyślnie!",
        url: shortenedLink,
      })
    } catch (err) {
      res.status(500).send({ error: "Błąd zapisu w bazie danych" })
    }
  }
})

app.get("/:linkId", (req, res) => {
  const linkId = req.params.linkId

  if (process.env.DB_MYSQL == "true") {
    db.query(
      "SELECT original_link FROM links WHERE link_id = ?",
      [linkId],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).send({ error: "Link nie znaleziony" })
        }

        const originalLink = results[0].original_link
        res.redirect(originalLink)
      }
    )
  } else {
    try {
      const row = db
        .prepare("SELECT original_link FROM links WHERE link_id = ?")
        .get(linkId)
      if (!row) {
        return res.status(404).send({ error: "Link nie znaleziony" })
      }

      const originalLink = row.original_link
      res.redirect(originalLink)
    } catch (err) {
      res.status(500).send({ error: "Błąd zapisu w bazie danych" })
    }
  }
})

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`)
})
