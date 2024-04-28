/*Это начальный файл бэкенда, который создается 
самым первым при создании бэкенда*/
/*Тут мы импортируем такие библиотеки как:
express: для создания запросов в базе данных, чтобы принять запросы с клиента
mongoose: база данных монгодб
path: библиотека для работы с файлами
routes: наши роуты для получения запроса, которые импортируются из другого файла
*/
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const routes = require("./router/update.route");
app.use(express.json({ extended: true }));
//устанавливаем корс для безопасности
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api", routes);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "build")));
//устанавливаем порт
const PORT = process.env.PORT || 5000;
//подключаемся к базе данных
const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://kocale7808:lcP3mwLhMtbR57fM@cluster0.sdujbp1.mongodb.net/start",
      {}
    );
    app.listen(PORT, () => {
      //если успешно подключились, то появится следующее сообщение:
      console.log("Server has been launched...");
    });
  } catch (e) {
    console.log(e);
  }
};
start();
