//страница с роутами
//Получаем Router из express
const { Router } = require("express");
const router = Router();
const User = require("../model/User");

// Роут который получает запрос от клиента по пути /signDocument и подписывает документы
router.post("/signDocument", async (req, res) => {
  try {
    console.log(req.body);
    //получаем данные и деструктризируем
    const { idOfDocument, toEmail, login } = req.body;
    //получаем данные пользователя из бэкенда
    const my = await User.findOne({ login: login });
    const their = await User.findOne({ email: toEmail });
    //изменяем status в данных о выбранного по id файла с "в ожидании" на "подписано"
    const mySubmittedDocs = my.submittedDocuments;
    const newSubmittedDocs = mySubmittedDocs.map((item) => {
      if (item.id == idOfDocument) {
        return { ...item, status: "Подписан", hideButton: true };
      }
      return item;
    });
    const theirReceivedDocs = their.receivedDocuments;
    const newReceivedDocs = theirReceivedDocs.map((item) => {
      if (item.id == idOfDocument) {
        return { ...item, status: "Подписан" };
      }
      return item;
    });
    console.log(newSubmittedDocs);
    console.log("================================");
    console.log(newReceivedDocs);
    // сохраняем изменяемые данные в бд
    await User.updateOne({ login }, { submittedDocuments: newSubmittedDocs });
    await User.updateOne(
      { email: toEmail },
      { receivedDocuments: newReceivedDocs }
    );
    const my2 = await User.findOne({ login: login });
    //отправляем измененные данные обратно на клиент
    res.json({
      message: "Документы обновлены",
      newMyDocs: my2.submittedDocuments,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});

//роут для установки документа в статус "отмена"
router.post("/cancelDocument", async (req, res) => {
  try {
    /*получаем данные от клиента и десруктризируем*/
    const { idOfDocument, toEmail, login } = req.body;
    //получаем данные о пользователях из базы данных
    const my = await User.findOne({ login: login });
    const their = await User.findOne({ email: toEmail });
    const mySubmittedDocs = my.submittedDocuments;
    //по той же схеме меняем данные и записываем в базу данных, затем отправляем полученные данные на фронт
    const newSubmittedDocs = mySubmittedDocs.map((item) => {
      if (item.id == idOfDocument) {
        return { ...item, status: "Отменён", hideButton: true };
      }
      return item;
    });
    const theirReceivedDocs = their.receivedDocuments;
    const newReceivedDocs = theirReceivedDocs.map((item) => {
      if (item.id == idOfDocument) {
        return { ...item, status: "Отменён" };
      }
      return item;
    });
    console.log(newSubmittedDocs);
    console.log("================================");
    console.log(newReceivedDocs);
    await User.updateOne({ login }, { submittedDocuments: newSubmittedDocs });
    await User.updateOne(
      { email: toEmail },
      { receivedDocuments: newReceivedDocs }
    );
    const my2 = await User.findOne({ login: login });
    res.json({
      message: "Документы обновлены",
      newMyDocs: my2.submittedDocuments,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});

//Роут для отправки на клиент список "отправленных файлов" из базы данных

router.post("/getReceivedDocs", async (req, res) => {
  const { login } = req.body;
  const candidate = await User.findOne({ login });
  res.json({ receivedDocs: candidate.receivedDocuments });
});
//Роут для отправки на клиент список "полученных файлов" из базы данных

router.post("/getSubmittedDocs", async (req, res) => {
  const { login } = req.body;
  const candidate = await User.findOne({ login });
  res.json({ submittedDocs: candidate.submittedDocuments });
});
//функция для создания уникального идентификатора для документов
function uniqueid() {
  var idstr = String.fromCharCode(Math.floor(Math.random() * 25 + 65));
  do {
    var ascicode = Math.floor(Math.random() * 42 + 48);
    if (ascicode < 58 || ascicode > 64) {
      idstr += String.fromCharCode(ascicode);
    }
  } while (idstr.length < 32);

  return idstr;
}

//функция для создания аккаунта
router.post("/createAccount", async (req, res) => {
  try {
    //десруктризация полученных от клиента данных
    const { login, pass, email } = req.body;
    if (!email.split("").includes("@")) {
      return res.status(201).json({ message: "Почта введена неверно" });
    }
    //получение нужного пользователя из базы данных
    const candidate = await User.findOne({ email });
    //если пользователь существует, то выводим сообщение о том, что пользователь существует
    if (candidate) {
      return res
        .status(201)
        .json({ message: "Такой пользователь уже существует" });
    }
    // а иначе создаем нового пользователя с необходимыми данными
    const user = new User({
      login,
      password: pass,
      email,
      receivedDocuments: [],
      submittedDocuments: [],
      hideButtons: false,
    });
    //сохраняем пользователя
    await user.save();
    //получаем сохраненного пользователя и отправляем данные о нем на клиент
    const candidateTwo = await User.findOne({ email });
    res.status(201).json({
      msg: "Пользователь создан",
      inform: candidateTwo.login,
      email: candidateTwo.email,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});
//Роут для отправки документа
router.post("/sendDocument", async (req, res) => {
  try {
    //получаем данные с клиента
    const { login, toEmail, url, nameOfFile } = req.body;
    //создаем дату для того, чтобы в дальнейшем добавить его в объект
    const date = new Date();
    const formattedDate = date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    //получаем данные о адресате и адресанте из базы данных
    const from = await User.findOne({ login });
    const to = await User.findOne({ email: toEmail });
    if (!to) {
      return res.json({ message: "Пользователя с такой почтой не существует" });
    }
    console.log(from);
    console.log(to);
    //создаем новый объект документа
    const newDocumentObj = {
      fileName: nameOfFile,
      url: url,
      data: formattedDate,
      from: from.email,
      to: to.email,
      status: "В ожидании",
      id: uniqueid(),
      hideButton: false,
      additionalInfo: {
        complexData: {
          encryptionKey: "random_generated_encryption_key",
          relatedDocuments: ["doc1", "doc2", "doc3"],
          metadata: {
            createdBy: "user_system_id",
            createdAt: new Date().toISOString(),
            tags: ["important", "confidential"],
          },
        },
      },
    };
    //добавляем новый документ в уже имеющиеся
    let receviedDocumentsOfAndresant = from.receivedDocuments;
    let submittedDocumentsOfAdresat = to.submittedDocuments;
    receviedDocumentsOfAndresant.push(newDocumentObj);
    submittedDocumentsOfAdresat.push(newDocumentObj);
    console.log(receviedDocumentsOfAndresant);
    console.log(submittedDocumentsOfAdresat);
    //сохранить данные в бд
    await User.updateOne(
      { login },
      { receivedDocuments: receviedDocumentsOfAndresant }
    );
    await User.updateOne(
      { email: toEmail },
      { submittedDocuments: submittedDocumentsOfAdresat }
    );
    res.json({ msg: "Документ отправлен" });
  } catch (e) {
    console.log(e);
    return;
  }
});

//роут для входа в систему
router.post("/signAccount", async (req, res) => {
  try {
    //получаем данные с клиента
    const { login, password } = req.body;
    console.log(req.body);
    //ищем по логину пользователя
    const user = await User.findOne({ login });
    //если пользователя нет в базе данных то выводим сообщение пользователь не найден
    if (!user) {
      console.log("Ошибка с логином");
      return res.status(201).json({ message: "Пользователь не найден" });
    }
    console.log(user);

    const isMatch = password == user.password;
    //если пароль неверный то отправляем сообщение о неверном пароле
    if (!isMatch) {
      console.log("Ошибка с паролем");
      return res
        .status(201)
        .json({ message: "Неверный пароль, попробуйте снова" });
    }
    //отправляем данные пользователя обратно на клиент
    res.json({
      msg: "Пользователь создан",
      inform: user.login,
      email: user.email,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});
//экспорт роутеров
module.exports = router;
