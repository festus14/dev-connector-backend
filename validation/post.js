const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.text = isEmpty(data.text) ? "" : data.text;

  if (!Validator.isLength(data.text, { max: 3000 }))
    errors.text = "Post length should not exceed 3000";

  if (Validator.isEmpty(data.text)) errors.text = "Text field can not be empty";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
