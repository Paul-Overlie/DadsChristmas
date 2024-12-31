'use strict';

/** @type {import('sequelize-cli').Migration} */

const {User}=require('../models')
const bcrypt=require("bcryptjs")

let options = {}
if(process.env.NODE_ENV==='production'){
  options.schema=process.env.schema
}

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName:"Joe",
        lastName:"Biden"
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName:"Donald",
        lastName:"Trump"
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName:"Barrack",
        lastName:"Obama"
      },
      {
        email: 'user3@user.io',
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password4'),
        firstName:"George",
        lastName:"Bush"
      },
      {
        email: 'user4@user.io',
        username: 'FakeUser4',
        hashedPassword: bcrypt.hashSync('password5'),
        firstName:"Bill",
        lastName:"Clinton"
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Users"
    const Op = Sequelize.Op
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ["Demo-lition", "FakeUser1",
    "FakeUser2", "FakeUser3", "FakeUser4"]}
    }, {})
  }
};
