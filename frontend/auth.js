const API =
  "http://localhost:5000/api/auth";



async function register() {

  const name =
    document.getElementById("name").value;

  const phone =
    document.getElementById("phone").value;

  const password =
    document.getElementById("password").value;

  const role =
    document.getElementById("role").value;

  try {

    const response = await fetch(
      `${API}/register`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          phone,
          password,
          role
        })

      }
    );

    const data = await response.json();

    document.getElementById("message")
      .innerHTML = data.message;

  } catch (error) {

    console.log(error);

  }

}



async function login() {

  const phone =
    document.getElementById("phone").value;

  const password =
    document.getElementById("password").value;

  try {

    const response = await fetch(
      `${API}/login`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          phone,
          password
        })

      }
    );

    const data = await response.json();

    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      document.getElementById("message")
        .innerHTML = "Login successful";

      if (data.user.role === "driver") {

        window.location.href =
          "driver.html";

      } else {

        window.location.href =
          "index.html";

      }

    }

  } catch (error) {

    console.log(error);

  }

}