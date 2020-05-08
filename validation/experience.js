const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.title = isEmpty(data.title) ? "" : data.title;
  data.company = isEmpty(data.company) ? "" : data.company;
  data.from = isEmpty(data.from) ? "" : data.from;

  if (!isEmpty(data.exp_id) && !Validator.isUUID(data.exp_id))
    errors.experience = "This experience doesn't exists";

  if (!Validator.isLength(data.title, { min: 2, max: 40 }))
    errors.title = "Title needs to be between 2 and 40";

  if (Validator.isEmpty(data.title))
    errors.title = "Title field can not be empty";

  if (!Validator.isLength(data.company, { min: 2, max: 50 }))
    errors.company = "Company needs to be between 2 and 50";

  if (Validator.isEmpty(data.company))
    errors.company = "Company field can not be empty";

  if (
    !isEmpty(data.location) &&
    !Validator.isLength(data.location, { min: 2, max: 500 })
  )
    errors.location = "Location needs to be between 2 and 500";

  if (Validator.isEmpty(data.from)) errors.from = "From field can not be empty";

  if (!isEmpty(data.to) && !Validator.isAfter(data.to, data.from))
    errors.to = "To date must be after the from date";

  if (!isEmpty(data.current) && typeof data.current !== "boolean")
    errors.current = "Current field is has to be boolean";

  if (
    !isEmpty(data.description) &&
    !Validator.isLength(data.description, { min: 2, max: 500 })
  )
    errors.description = "Description needs to be between 2 and 500";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
