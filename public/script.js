const loginForm = document.getElementById("loginForm")
const cdnDiv = document.getElementById("cdn")

if (localStorage.getItem("token")) {
  loginForm.style.display = "none"
}
if (localStorage.getItem("token")) {
  cdnDiv.style.display = "block"
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
      cdnDiv.style.display = "block"
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
    const response = await fetch("/images", {
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

async function uploadLinks(event) {
  event.preventDefault()
  const field = document.getElementById("link")
  let link = field.value
  const regex =
    /^((https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+)(:\d+)?(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?)$/

  function normalizeUrl(url) {
    if (regex.test(url)) {
      // Jeśli brakuje protokołu, dodaj domyślny "http://"
      if (!/^https?:\/\//i.test(url)) {
        return "http://" + url
      }
      return url // Jeśli jest poprawny, zwróć URL bez zmian
    } else {
      return null // Zwraca null dla niepoprawnych URL
    }
  }

  link = normalizeUrl(link) // Znormalizuj link, nawet jeśli regex go przepuścił

  if (!link) {
    field.value = ""
    alert("Podany tekst nie jest prawidłowym linkiem!")
    return
  }

  const token = localStorage.getItem("token")

  if (!token) {
    alert("Musisz się zalogować, aby skrócić link!")
    return
  }

  const formData = new FormData()
  formData.append("link", link)

  try {
    const response = await fetch("/links", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
      alert("Link skrócony pomyślnie! URL: " + data.url)
    } else {
      alert("Błąd skracania linku: " + data.error)
    }
  } catch (err) {
    alert("Wystąpił błąd: " + err.message)
  } finally {
    field.value = ""
  }
}

function logout() {
  localStorage.removeItem("token")
  loginForm.style.display = "block"
  cdnDiv.style.display = "none"
}
