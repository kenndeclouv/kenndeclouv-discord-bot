const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Koneksi ke Sequelize

const AutoMod = sequelize.define('AutoMod', {
  guildId: { type: DataTypes.STRING, allowNull: false },
  antiInvites: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiLinks: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiSpam: { type: DataTypes.BOOLEAN, defaultValue: false },
  whitelist: { type: DataTypes.JSON, defaultValue: [] }, // Menggunakan tipe JSON untuk array
  leveling: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = AutoMod;
