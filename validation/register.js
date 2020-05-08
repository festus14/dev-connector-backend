const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.name = isEmpty(data.name) ? "" : data.name;
  data.email = isEmpty(data.email) ? "" : data.email;
  data.password = isEmpty(data.password) ? "" : data.password;
  data.passwordTwo = isEmpty(data.passwordTwo) ? "" : data.passwordTwo;

  if (!Validator.isLength(data.name, { min: 2, max: 30 }))
    errors.name = "Name must be between 2 and 30 characters";

  if (Validator.isEmpty(data.name)) errors.name = "Name field can not be empty";

  if (!Validator.isEmail(data.email)) errors.email = "Email is invalid";

  if (Validator.isEmpty(data.email))
    errors.email = "Email field can not be empty";

  if (!Validator.isLength(data.password, { min: 6, max: 30 }))
    errors.password = "Password must be at least 6 characters";

  if (Validator.isEmpty(data.password))
    errors.password = "Password field can not be empty";

  if (!Validator.equals(data.password, data.passwordTwo))
    errors.passwordTwo = "Passwords doesn't match";

  if (Validator.isEmpty(data.passwordTwo))
    errors.passwordTwo = "Confirm password field is required";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
