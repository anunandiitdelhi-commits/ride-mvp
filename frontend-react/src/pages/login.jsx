import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { API_URL }
from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] =
    useState(true);

  const [formData, setFormData] =
    useState({

      name: "",
      phone: "",
      password: "",
      role: "passenger"

    });



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };



  const handleSubmit = async () => {

    try {

      const endpoint = isLogin
        ? "login"
        : "register";

      const response = await fetch(

        `${API_URL}/auth/${endpoint}`,

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(formData)

        }

      );

      const data = await response.json();

      if (isLogin) {

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        if (
          data.user.role === "driver"
        ) {

          navigate("/driver");

        } else {

          navigate("/passenger");

        }

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

    }

  };



  return (

  <div className="page">
    <div
      className="card"
      style={{
        maxWidth: "400px",
        margin: "50px auto"
      }}
    >

      <h1 className="page-title">
        🚕 Ride MVP
      </h1>

      {!isLogin && (

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="input"
        />

      )}

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
        className="input"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="input"
      />

      {!isLogin && (

        <select
          name="role"
          onChange={handleChange}
          className="input"
        >

          <option value="passenger">
            Passenger
          </option>

          <option value="driver">
            Driver
          </option>

        </select>

      )}

      <button
        onClick={handleSubmit}
        className="primary-btn"
      >

        {
          isLogin
          ? "Login"
          : "Register"
        }

      </button>

      <button
        onClick={() =>
          setIsLogin(!isLogin)
        }
        className="primary-btn"
      >

        Switch to {
          isLogin
          ? "Register"
          : "Login"
        }

      </button>

    </div>

  </div>

);

}
