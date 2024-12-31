const express = require('express')
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Username is required'),
  // check('username')
  //   .not()
  //   .isEmail()
  //   .withMessage('Username cannot be an email.'),
  // check('password')
  //   .exists({ checkFalsy: true })
  //   .isLength({ min: 6 })
  //   .withMessage('Password must be 6 characters or more.'),
  // handleValidationErrors
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required")
];

// Sign up
router.post(
    '/',
    validateSignup,
    async (req, res) => {
      let result = validationResult(req)
    let errors={}
    // console.log("result errors:",result.errors)
    if(result.errors.length>0){
        result.errors.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": errors
        })
    }
      const { email, password, username, firstName, lastName } = req.body;
      const hashedPassword = bcrypt.hashSync(password);
      
      let emailedUser = await User.unscoped().findOne({
        where: {email}
      })
      // console.log("email", email, "oldEmail", emailedUser)
      
      if(emailedUser&&emailedUser.email===email) {
        let err = {}
        res.statusCode=500
        err.message="User already exists"
        err.errors={
        email:"User with that email already exists"}
        // console.log(err)
        return res.json(err)
      }

      let namedUser = await User.unscoped().findOne({
        where: {username}
      })
      // console.log("username", username, "namedUsername", namedUser)

      if(namedUser&&namedUser.username===username) {
        let nameErr={
          message: "User already exists",
          errors: {
            username: "User with that username already exists"
          }
        }
        res.statusCode=500
        return res.json(nameErr)
      }
      try{
        const user = await User.create({ firstName, lastName, email, username, hashedPassword });
        
        const safeUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        };
        
        await setTokenCookie(res, safeUser);
        
        return res.json({
          user: safeUser
        });
      }catch(err){res.statusCode = 400
      return res.json({
        "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
        "errors": {
          "email": "Invalid email",
          "username": "Username is required",
          "firstName": "First Name is required",
          "lastName": "Last Name is required"
        }
      })}
      }
      );
      
      module.exports = router;