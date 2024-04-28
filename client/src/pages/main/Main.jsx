//Основная страница с роутами
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../login-page/LoginPage";
import "./Main.css";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import CreateDocument from "../create-document/CreateDocument";
import ReceivedDocs from "../received-documents/ReceivedDocs";
import SubmittedDocs from "../submitted-documents/SubmittedDocs";
import RegisterPage from "../register-page/RegisterPage";
import image from "../create-document/kkk_pixian_ai.png";

const Main = (props) => {
  //функция для изображения или скрытия меню слева
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  //функция для удаления сохраненных данных о пользователя
  const deleteLocalObject = () =>
    new Promise((res) => {
      localStorage.setItem("inform", "");
      localStorage.setItem("inform2", "");
      res();
    });
  //функция для выхода из системы
  const exitButton = async () => {
    await deleteLocalObject();
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <img src={image} alt="" />
        </div>
        <div className="user-email">
          {localStorage.getItem("inform2")}

          {localStorage.getItem("inform") ? (
            <button onClick={exitButton}>Выйти</button>
          ) : null}
        </div>
      </header>
      <div className="main-container">
        {localStorage.getItem("inform") ? (
          <aside className="sidebar">
            <nav>
              <ul>
                <li>
                  <Link to="create-document">Создать документ</Link>
                </li>
                <li>
                  <Link to="received-docs">Отправленные документы</Link>
                </li>
                <li>
                  <Link to="submitted-docs">Полученные документы</Link>
                </li>
              </ul>
            </nav>
          </aside>
        ) : null}
        <main className="content">
          {/*Тут у нас роуты, то есть пути, алгоритм такой: Если у нас есть 
          данные пользователя, то есть роуты ко всем страницам кроме 
          login и register, а если у нас нет данных о пользователя, 
          то есть если мы не зарегистрировались или не
           автоизировались, то у нас есть только роуты login и register  */}
          {localStorage.getItem("inform") ? (
            <Routes>
              <Route exact path="/" element={<CreateDocument />} />

              <Route
                exact
                path="/create-document"
                element={<CreateDocument />}
              />
              <Route exact path="/received-docs" element={<ReceivedDocs />} />
              <Route exact path="/submitted-docs" element={<SubmittedDocs />} />
              <Route exact path="*" element={<CreateDocument />} />
            </Routes>
          ) : (
            <Routes>
              <Route exact path="/register" element={<RegisterPage />} />
              <Route exact path="/login" element={<LoginPage />} />
              <Route exact path="/" element={<LoginPage />} />
              <Route exact path="*" element={<LoginPage />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

export default Main;
