'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    api_key: {
      type: DataTypes.STRING,
      unique: true
    },
    api_key_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true,        // ✅ UBAH dari false ke true
    underscored: true        // ✅ TAMBAHKAN ini agar pakai created_at/updated_at
  });

  return User;
};