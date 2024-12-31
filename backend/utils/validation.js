// backend/utils/validation.js
const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, res, next) => {
  res.statusCode=400
  res.json({
    message: "Bad Request",
    errors: { credential: "Email or username is required",
            password: "Password is required"}
  })
  // const validationErrors = validationResult(req);

  // if (!validationErrors.isEmpty()) { 
  //   const errors = {};
  //   validationErrors
  //     .array()
  //     .forEach(error => errors[error.path] = error.msg);

  //   const err = Error("Bad request.");
  //   err.errors = errors;
  //   err.status = 400;
  //   err.title = "Bad request.";
  //   next(err);
  // }
  // next();
};

module.exports = {
  handleValidationErrors
};