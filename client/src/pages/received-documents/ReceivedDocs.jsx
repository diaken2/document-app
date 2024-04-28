//Страница с отправленными документами
//импортируем необходимые модули и стили
import React, { useEffect, useState, useCallback } from "react";
import "./ReceivedDocs.css";
import axios from "axios";
//создаем компонент
const ReceivedDocs = (props) => {
  //создаем состояние в которую будем сохранять полученные от сервера документы
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  /*функция которая 1 раз при загрузке страницы 
  отправит запрос на бэкенд и получит из базы 
  данных полученные дкоументы пользователя*/
  useEffect(() => {
    //создаем объект который затем по запросу отправляем на сервер
    const newObject = {
      login: localStorage.getItem("inform"),
    };
    console.log(newObject);
    //создаение запроса
    axios
      .post("http://localhost:5000/api/getReceivedDocs", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        //полученные данные сохраняем в состояние
        setReceivedDocuments(res.data.receivedDocs);
      });
  }, []);
  /*функция для кнопки "обновить", которая 
повторяет функцию 
сверху, но уже не 1 раз при загрузке сервера,
а каждый раз при нажатии кнопки. То есть при нажатии кнопки
"обновить" отправляется
запрос на сервер и получаем нужные данные*/
  const reload = useCallback(async () => {
    const newObject = {
      login: localStorage.getItem("inform"),
    };
    console.log(newObject);
    axios
      .post("http://localhost:5000/api/getReceivedDocs", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setReceivedDocuments(res.data.receivedDocs);
      });
  });
  //jsx, тут уже разобраться можно, если в html разбираешься
  return (
    <div>
      <button onClick={reload} className="reloadButton">
        Обновить
      </button>
      <table>
        <thead>
          <tr>
            <th>Название файла</th>
            <th>Файл</th>
            <th>Дата отправки</th>
            <th>Кому отправлено</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {receivedDocuments
            .map((item) => (
              <tr key={item.id}>
                <td>{item.fileName}</td>
                <td>
                  <a href={item.url} download>
                    Скачать
                  </a>
                </td>
                <td>{item.data}</td>
                <td>{item.to}</td>
                <td
                  style={{
                    color:
                      item.status === "Подписан"
                        ? "green"
                        : item.status === "В ожидании"
                        ? "orange"
                        : "red",
                  }}
                >
                  {item.status}
                </td>
              </tr>
            ))
            .reverse()}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivedDocs;
