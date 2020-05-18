const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.school = isEmpty(data.school) ? "" : data.school;
  data.degree = isEmpty(data.degree) ? "" : data.degree;
  data.fieldOfStudy = isEmpty(data.fieldOfStudy) ? "" : data.fieldOfStudy;
  data.from = isEmpty(data.from) ? "" : data.from;

  if (!isEmpty(data.edu_id) && !Validator.isUUID(data.edu_id))
    errors.experience = "This education doesn't exists";

  if (!Validator.isLength(data.school, { min: 2, max: 100 }))
    errors.school = "School length needs to be between 2 and 100";

  if (Validator.isEmpty(data.school))
    errors.school = "School field can not be empty";

  if (!Validator.isLength(data.degree, { min: 2, max: 50 }))
    errors.degree = "Degree needs to be between 2 and 50";

  if (Validator.isEmpty(data.degree))
    errors.degree = "Degree field can not be empty";

  if (!Validator.isLength(data.fieldOfStudy, { min: 2, max: 50 }))
    errors.fieldOfStudy = "Field of study needs to be between 2 and 50";

  if (Validator.isEmpty(data.fieldOfStudy))
    errors.fieldOfStudy = "Field of study field can not be empty";

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
