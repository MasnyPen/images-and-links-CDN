const mysql = require("mysql2")
require("dotenv/config")

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})
function connect() {
  db.connect(err => {
    if (err) {
      console.error("Błąd połączenia z bazą danych: " + err.message)
      return
    }
    console.log("Połączono z bazą danych MySQL")
  })
}

module.exports = { db, connect }
