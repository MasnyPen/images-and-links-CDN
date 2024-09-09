const mysql = require("mysql2")
const Database = require("better-sqlite3")
require("dotenv/config")

let db

if (process.env.DB_MYSQL == "true") {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  function connect() {
    db.connect(err => {
      if (err) {
        console.error("Błąd połączenia z bazą danych MySQL: " + err.message)
        return
      }
      console.log("Połączono z bazą danych MySQL")
    })
  }
} else {
  db = new Database("database.db")

  function connect() {
    console.log("Połączono z bazą danych SQLite")
    db.prepare(
      `CREATE TABLE IF NOT EXISTS links (
      original_link TEXT NOT NULL,
      link_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
    ).run()
  }
}

module.exports = { db, connect }
