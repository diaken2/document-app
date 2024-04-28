/* Тут всё так же как и в ReceivedDocs, то есть абсолютно тоже 
самое, только тут у нас полученные документы*/
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./SubmittedDocs.css";
const SubmittedDocs = (props) => {
  const [submittedDocuments, setSubmittedDocuments] = useState([]);
  useEffect(() => {
    const newObject = {
      login: localStorage.getItem("inform"),
    };
    console.log(newObject);
    axios
      .post("http://localhost:5000/api/getSubmittedDocs", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setSubmittedDocuments(res.data.submittedDocs);
      });
  }, []);

  const reload = useCallback(async () => {
    const newObject = {
      login: localStorage.getItem("inform"),
    };
    console.log(newObject);
    axios
      .post("http://localhost:5000/api/getSubmittedDocs", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setSubmittedDocuments(res.data.submittedDocs);
      });
  });

  const submitDoc = (idOfDocument, toEmail, login) => {
    const newObject = {
      idOfDocument,
      toEmail,
      login,
    };
    axios
      .post("http://localhost:5000/api/signDocument", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log(res.data.newMyDocs);
        setSubmittedDocuments(res.data.newMyDocs);
      });
  };

  const cancelDoc = (idOfDocument, toEmail, login) => {
    const newObject = {
      idOfDocument,
      toEmail,
      login,
    };
    axios
      .post("http://localhost:5000/api/cancelDocument", newObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log(res.data.newMyDocs);
        setSubmittedDocuments(res.data.newMyDocs);
      });
  };

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
            <th>Дата получения</th>
            <th>От кого</th>
            <th>Статус</th>
            <th>Подписать</th>
            <th>Отменить</th>
          </tr>
        </thead>
        <tbody>
          {submittedDocuments
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
                <td>{item.status}</td>
                {item.hideButton ? null : (
                  <td>
                    <button
                      onClick={() =>
                        submitDoc(
                          item.id,
                          item.from,
                          localStorage.getItem("inform")
                        )
                      }
                      className="sign"
                    >
                      Подписать
                    </button>
                  </td>
                )}
                {item.hideButton ? null : (
                  <td>
                    <button
                      onClick={() =>
                        cancelDoc(
                          item.id,
                          item.from,
                          localStorage.getItem("inform")
                        )
                      }
                      className="cancel"
                    >
                      Отменить
                    </button>
                  </td>
                )}
              </tr>
            ))
            .reverse()}
        </tbody>
      </table>
    </div>
  );
};

export default SubmittedDocs;
