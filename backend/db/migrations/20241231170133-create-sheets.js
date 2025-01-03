'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema=process.env.SCHEMA
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sheets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {model: "Users"},
        onDelete: "CASCADE"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sheets');
  }
};