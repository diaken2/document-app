//модель базы данных пользователя
const { Schema, model } = require("mongoose");
const schema = new Schema({
  login: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  receivedDocuments: {
    type: Array,
  },
  submittedDocuments: {
    type: Array,
  },
});
module.exports = model("User", schema);
