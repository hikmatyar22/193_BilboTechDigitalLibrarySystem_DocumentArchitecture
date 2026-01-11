'use strict';

module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      book_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'ID buku dari Google Books API'
      },
      book_title: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      book_author: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      book_thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      loan_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'dipinjam', 'dikembalikan', 'terlambat'),
        defaultValue: 'pending'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'loans',
      timestamps: true,
      underscored: true
    }
  );

  Loan.associate = (models) => {
    Loan.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Loan;
};