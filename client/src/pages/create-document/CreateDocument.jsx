// Страница для отправки документов другому пользователю
/*Импортируем все необходимые библиотеки и хуки, такие как:
React:основная библиотека
useState: хук для хранения данных и обнволения состояния
useCallback: хук для создания калбэков без лишних рендеров
библиотека axios для отправки запросов,
файл CreateDocument.css со стилями
pdf-lib: библиотека для добавления оттиска к пдф
@react-pdf/renderer: библиотека для конвертации текста в пдф
*/
import React, { useState, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import axios from "axios";
import "./CreateDocument.css";
import stampImage from "./stamp_w_trans.png";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});
//Создаем компонент
const CreateDocument = (props) => {
  //Состояние для файла который получаем с инпута "выберите файл"
  const [file, setFile] = useState(null);
  //Состояние для текста которая будет появляется во время загрузки
  const [text, setText] = useState("");
  //состояние для сохранения ссылки на сохраненный в базе данных документ
  const [url, setUrl] = useState({
    fileName: "",
    sendUrl: "",
  });
  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    myText: {
      fontFamily: "Roboto",
    },
  });
  const [textPdf, setTextPdf] = useState("");
  //состояние для сохранения почты получателя
  const [email, setEmail] = useState("");
  /*функция для загрузки выбранного файла на 
 базу данных для дальнейшей отправки выбранному 
 пользователю. При выборе файла, он автоматически отправляется в базу 
 данных, откуда можно получить ссылку на его скачивание для дальнейшего сохранения*/
  const handleFileChange = async (event) => {
    try {
      setText("");
      //Получение расширение добавляемого файла и проверка файла на соответствующее расширение
      const expansion = event.target.files[0].name.split(".");
      const pdfExp = expansion[expansion.length - 1];
      if (pdfExp != "pdf") {
        setFile("");
        document.getElementById("fileInput").value = "";
        setText("");
        alert("Прикрепите pdf файл");
        return;
      }

      setFile(event.target.files[0]);
      const pdfBytes1 = await event.target.files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes1);

      // Загрузка изображения печати
      const imageBytes = await fetch(stampImage).then((res) =>
        res.arrayBuffer()
      );
      const image = await pdfDoc.embedPng(imageBytes);

      // Получение последней страницы PDF
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      // Вставка изображения на последнюю страницу
      lastPage.drawImage(image, {
        x: lastPage.getWidth() - image.width + 240,
        y: lastPage.getHeight() - image.height - 450,
        width: 300,
        height: 120,
      });

      // Сохранение измененного PDF
      const pdfBytes = await pdfDoc.save();

      // Создание нового Blob объекта
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      setText(
        "Началась обработка файла, ничего не делайте, пока обработка не завершится"
      );
      //получение ссылки для сохранения в базу
      const urlForUpload = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${event.target.files[0].name}&overwrite=true`,

        {
          headers: {
            Accept: "application/json",
          
          },
        }
      );
      setText("Получена ссылка для загрузки файла в базу данных");
      console.log(urlForUpload.data.href);
      const dataForDownload = new FormData();
      dataForDownload.append("file", blob);
      dataForDownload.append("user", "hubot");
      const getFile = await axios.post(urlForUpload.data.href, dataForDownload);
      console.log(getFile.data);
      setText("Загрузка файла на диск");
      //сохрарнение файла в бд

      const urlForDownload = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/download?path=${event.target.files[0].name}`,

        {
          headers: {
            Accept: "application/json",
           
          },
        }
      );
      setText(
        "Файл загружен на диск и получена ссылка к файлу, теперь вы можете заполнить остальные данные и отправить файл "
      );
      //сохранение полученной ссылки и имени файла в состоянии url
      setUrl({
        fileName: event.target.files[0].name,
        sendUrl: urlForDownload.data.href,
      });
    } catch (e) {
      //если во время запроса появятся ошибки, они выведутеся в консоль
      console.error(e.error);
    }
  };
  //функция для сохрарнеия введенной вручную ссылки на файл в состояние
  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };
  //функция для сохранения почты в состояние почты
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  //Компонент создаваемого пдф файла
  const MyDocument = ({ pdfText }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.myText}>{pdfText}</Text>
        </View>
      </Page>
    </Document>
  );

  const handlePdfText = (e) => {
    setText("");
    setTextPdf(e.target.value);
  };

  const generatePdfBlob = async () => {
    setText(
      "Началась генерация файла на основе текста, ничего не делайте, пока обработка не завершится"
    );
    const document = <MyDocument pdfText={textPdf} />;
    const asPdf = pdf(); // Инициализирует PDF рендерер
    asPdf.updateContainer(document);
    const blob1 = await asPdf.toBlob(); // Генерирует Blob
    console.log(blob1);

    const pdfBytes1 = await blob1.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes1);

    // Загрузка изображения печати
    const imageBytes = await fetch(stampImage).then((res) => res.arrayBuffer());
    const image = await pdfDoc.embedPng(imageBytes);

    // Получение последней страницы PDF
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    // Вставка изображения на последнюю страницу
    lastPage.drawImage(image, {
      x: lastPage.getWidth() - image.width + 240,
      y: lastPage.getHeight() - image.height - 450,
      width: 300,
      height: 120,
    });

    // Сохранение измененного PDF
    const pdfBytes = await pdfDoc.save();

    // Создание нового Blob объекта
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const nameFile = Math.random() + ".pdf";
    try {
      setText(
        "Началась обработка файла, ничего не делайте, пока обработка не завершится"
      );
      //получение ссылки для сохранения в базу
      const urlForUpload = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${nameFile}&overwrite=true`,

        {
          headers: {
            Accept: "application/json",
         
          },
        }
      );
      setText("Получена ссылка для загрузки файла в базу данных");
      console.log(urlForUpload.data.href);
      const dataForDownload = new FormData();
      dataForDownload.append("file", blob);
      dataForDownload.append("user", "hubot");
      const getFile = await axios.post(urlForUpload.data.href, dataForDownload);
      console.log(getFile.data);
      setText("Загрузка файла на диск");
      //сохрарнение файла в бд
      const urlForDownload = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/download?path=${nameFile}`,

        {
          headers: {
            Accept: "application/json",
          
          },
        }
      );
      setText(
        "Файл загружен на диск и получена ссылка к файлу, теперь вы можете заполнить остальные данные и отправить файл "
      );
      //сохранение полученной ссылки и имени файла в состоянии url
      setUrl({
        fileName: nameFile,
        sendUrl: urlForDownload.data.href,
      });
    } catch (e) {
      //если во время запроса появятся ошибки, они выведутеся в консоль
      console.error(e.error);
    }
  };

  //функция для отправки документа
  const handleSubmit = useCallback(async (e) => {
    //создаем объект с необходимыми данными
    const ObjectInfo = {
      login: localStorage.getItem("inform"),
      url: url.sendUrl,
      toEmail: email,
      nameOfFile: url.fileName,
    };
    console.log(ObjectInfo);
    //отправляем данные по запросу
    await axios
      .post("http://localhost:5000/api/sendDocument", ObjectInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.message) {
          alert(res.data.message);
          return;
        }
        //получаем сообщение о отправке
        alert(res.data.msg);
      });
  });

  //jsx, тут уже разобраться можно, если в html разбираешься

  return (
    <div className="file-sender">
      <div className="textareaInput">
        {!file ? (
          <textarea
            type="text"
            placeholder="Введите текст, который должен конвертироваться"
            value={textPdf}
            onChange={handlePdfText}
            className="input-field2"
          />
        ) : null}
      </div>
      <div>
        {!file ? (
          <button onClick={generatePdfBlob}>
            Генерация pdf файла на основе введенного текста
          </button>
        ) : null}
        <br />
        <br />
        {!textPdf ? (
          <div className="deleteFileInput">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="input-field"
            />{" "}
            <button
              className="deleteFileButton"
              onClick={() => {
                setFile("");
                document.getElementById("fileInput").value = "";
                setText("");
              }}
            >
              Удалить файл
            </button>
          </div>
        ) : null}
        {text}
        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={handleEmailChange}
          className="input-field"
        />
        <button
          // disabled={url === "" || !email === ""}
          onClick={handleSubmit}
          className="submit-btn"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default CreateDocument;
