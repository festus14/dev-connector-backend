const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.email = isEmpty(data.email) ? "" : data.email;
  data.password = isEmpty(data.password) ? "" : data.password;

  if (!Validator.isEmail(data.email)) errors.email = "Email is invalid";

  if (Validator.isEmpty(data.email))
    errors.email = "Email field can not be empty";

  if (Validator.isEmpty(data.password))
    errors.password = "Password field can not be empty";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
