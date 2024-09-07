const { exec } = require("child_process")

const gitCloneCommand = `git clone ${process.argv[2]}`

exec(gitCloneCommand)

const gitCloneProcess = exec("git config credential.helper store")

gitCloneProcess.stdout.on("data", data => {
  console.log(`stdout: ${data}`)
})

gitCloneProcess.stderr.on("data", data => {
  console.error(`stderr: ${data}`)
})

gitCloneProcess.on("close", code => {
  if (code === 0) {
    console.log("Klonowanie zakończone pomyślnie.")
  } else {
    console.error(`Proces zakończony kodem błędu: ${code}`)
  }
})

gitCloneProcess.on("error", err => {
  console.error(`Błąd podczas uruchamiania procesu: ${err}`)
})
