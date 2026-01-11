'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loans', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      // ✅ UBAH: Simpan ID buku dari Google Books API
      book_id: {
        type: Sequelize.STRING(255),  // Contoh: "gCtazG4ZXlQC"
        allowNull: false,
        comment: 'ID buku dari Google Books API'
      },

      // ✅ TAMBAH: Snapshot data buku saat dipinjam
      book_title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },

      book_author: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      book_thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL thumbnail cover buku'
      },

      loan_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      return_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Tanggal actual pengembalian'
      },

      status: {
        type: Sequelize.ENUM('pending', 'dipinjam', 'dikembalikan', 'terlambat'),
        defaultValue: 'pending',
        comment: 'pending = menunggu approval admin'
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Catatan admin atau user'
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Tambah index untuk performa
    await queryInterface.addIndex('loans', ['user_id']);
    await queryInterface.addIndex('loans', ['status']);
    await queryInterface.addIndex('loans', ['book_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loans');
  }
};