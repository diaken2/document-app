//Страница авторизации
//Импортируем все необходимые библиотеки
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../register-page/RegisterPage.css";
//Создаем компонент
const LoginPage = () => {
  //создаем состояние
  const [userCredentials, setUserCredentials] = useState({
    login: "",
    password: "",
  });
  //создаем хук навигации для навигации по страницам
  const navigate = useNavigate();
  //Функция которая сохраняет введенные в инпут данные, эту функцию нужно подключить к аттрибуту onChange в инпутах
  const handleChange = (e) => {
    //получаем переданные в аргумент данные с помощью деструктризации
    const { name, value } = e.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };
  //Функция которая отправляет введенные в инпут данные на сервер для входа в систему
  const handleSubmit = useCallback(async (e) => {
    if (userCredentials.login == "" || userCredentials.password == "") {
      alert("Заполните все поля");
      return;
    }
    //создаем объект и задаем ему данные которые сохранили в состояние
    const ObjectInfo = {
      login: userCredentials.login,
      password: userCredentials.password,
    };
    console.log(ObjectInfo);
    //отправляем запрос
    await axios
      .post("http://localhost:5000/api/signAccount", ObjectInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        //если получаем ошибочные данные то появляется окно о том, что данные неверны
        if (res.data.inform === undefined) {
          alert("Данные неверны");
          return;
        }
        //сохраняем в локальное состояние полученные данные и обновляем страницу
        localStorage.setItem("inform", res.data.inform);
        localStorage.setItem("inform2", res.data.email);
        window.location.reload();
      });
  });
  //jsx, тут уже разобраться можно, если в html разбираешься
  return (
    <div className="registration-container">
      <div className="registration-form">
        <input
          type="text"
          name="login"
          placeholder="Логин"
          value={userCredentials?.login}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={userCredentials?.password}
          onChange={handleChange}
          required
        />
        <button onClick={handleSubmit}>Подтвердить</button>
        <br />
        <div className="not-have-account">
          У вас нет аккаунта?
          <button onClick={() => navigate("/register")}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
