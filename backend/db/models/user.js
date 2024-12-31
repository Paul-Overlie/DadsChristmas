'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Sheet, {foreignKey: "userId",
      onDelete: "SET NULL"})

      User.hasMany(models.Membership, {foreignKey: "userId",
      onDelete: "SET NULL"})

      User.hasMany(models.Group, {foreignKey: "organizerId",
      onDelete: "SET NULL"})
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  validate: {
    len: [4,30],
    isNotEmail(val) {
      if(Validator.isEmail(val)) {
        throw new Error("Cannot be an email")
      }
    }
  }},
    email: {
      type: DataTypes.STRING,
    allowNull: false,
  unique: true,
validate: {
  len: [3,256],
  isEmail: true
}},
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
    allowNull: false,
  validate: {
    len: [60,60]
  }},
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["username", "hashedPassword", "email", "createdAt", "updatedAt"]
      }
    }
  });
  return User;
};