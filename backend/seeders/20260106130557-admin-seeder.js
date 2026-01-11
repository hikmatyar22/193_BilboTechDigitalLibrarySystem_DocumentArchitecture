'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@perpustakaan.com',
        password: hashedPassword,
        role: 'admin',
        api_key: null
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@perpustakaan.com',
    });
  },
};
