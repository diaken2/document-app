/*Тут по той же схеме как и в LoginPage, записываем данные в состояние и 
отправляем на сервер по запросу для регистрации*/
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userCredentials, setUserCredentials] = useState({
    login: "",
    password: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };

  const createAccount = useCallback(async (e) => {
    if (
      userCredentials.login == "" ||
      userCredentials.password == "" ||
      userCredentials.email == ""
    ) {
      alert("Заполните все поля");
      return;
    }
    const ObjectInfo = {
      login: userCredentials.login,
      pass: userCredentials.password,
      email: userCredentials.email,
    };
    console.log(ObjectInfo);
    await axios
      .post("http://localhost:5000/api/createAccount", ObjectInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.inform === undefined) {
          alert(res.data.message);
          return;
        }
        localStorage.setItem("inform", res.data.inform);
        localStorage.setItem("inform2", res.data.email);
        window.location.reload();
      });
  });

  return (
    <div className="registration-container">
      <div className="registration-form">
        <input
          type="email"
          name="email"
          placeholder="Почта"
          value={userCredentials.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="login"
          placeholder="Логин"
          value={userCredentials.login}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={userCredentials.password}
          onChange={handleChange}
          required
        />

        <button onClick={createAccount}>Подтвердить</button>
        <br />
        <div className="not-have-account-reg">
          Уже есть аккаунт?
          <button onClick={() => navigate("/login")}>Войти</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
