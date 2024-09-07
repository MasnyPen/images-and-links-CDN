const loginForm = document.getElementById("loginForm")
const logoutBtn = document.getElementById("logout")
const uploadForm = document.getElementById("uploadForm")

if (localStorage.getItem("token")) {
  loginForm.style.display = "none"
}
if (!localStorage.getItem("token")) {
  logoutBtn.style.display = "none"
}

async function login(event) {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("token", data.token)
      loginForm.style.display = "none"
      logoutBtn.style.display = "block"
      uploadForm.style.display = "block"
      alert("Zalogowano pomyślnie!")
    } else {
      alert("Błąd logowania: " + data.error)
    }
  } catch (err) {
    alert("Wystąpił błąd: " + err.message)
  }
}

async function uploadFile(event) {
  event.preventDefault()

  const fileInput = document.getElementById("file")
  const file = fileInput.files[0]
  const token = localStorage.getItem("token")

  if (!token) {
    alert("Musisz się zalogować, aby przesyłać pliki!")
    return
  }

  const formData = new FormData()
  formData.append("image", file)

  try {
    const response = await fetch("/upload", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
      alert("Plik przesłany pomyślnie! URL: " + data.imageUrl)
    } else {
      alert("Błąd przesyłania pliku: " + data.error)
    }
  } catch (err) {
    alert("Wystąpił błąd: " + err.message)
  }
}

function logout() {
  localStorage.removeItem("token")
  logoutBtn.style.display = "none"
  loginForm.style.display = "block"
  uploadFile.style.display = "none"
  alert("Wylogowano pomyślnie!")
}
