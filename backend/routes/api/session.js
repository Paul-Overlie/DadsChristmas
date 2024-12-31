const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('The provided credentials were invalid'),
    // .withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('The provided credentials were invalid'),
    // .withMessage('Password is required'),
  // handleValidationErrors
];

// Log in
router.post(
    '/',
    validateLogin,
    async (req, res, next) => {
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
      const { credential, password } = req.body;
  
      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
      
      
      if (!user) {
        res.statusCode=400
        return res.json({
          message: "Bad Request",
          errors: {credential: "Email or username is required",
          password: "Password is required"}
        })
        // const error = new Error('Bad Request')
        // error.status = 400
        // error.message = 'Bad Request'
        // error.password = 'Password is required'
        // error.credential = 'Email or username is required'
        // console.log("error here", error)
        // return next(error)
      }

      if (!bcrypt.compareSync(password, user.hashedPassword.toString())) {
        res.statusCode=401
        return res.json({message: "Invalid credentials"})
        // const err = new Error('Login failed');
        // err.status = 401;
        // err.title = 'Login failed';
        // err.errors = { credential: 'The provided credentials were invalid.' };
        // return next(err);
      }
  
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
    }
  );

  // Log out
router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
  );

  // Restore session user
router.get(
    '/',
    async (req, res) => {
      const { user } = req;
      if (user) {
        let use = await User.unscoped().findOne({where:{id:user.id}})
        // console.log("Use:", use)
        const safeUser = {
          id: use.id,
          firstName: use.firstName,
          lastName: use.lastName,
          email: use.email,
          username: use.username,
        };
        return res.json({
          user: safeUser
        });
      } else return res.json({ user: null });
    }
  );

module.exports = router;