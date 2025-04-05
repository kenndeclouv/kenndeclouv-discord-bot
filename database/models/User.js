const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const userSchema = sequelize.define(
  "User",
  {
    userId: { type: DataTypes.STRING, allowNull: false, unique: true },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    xp: { type: DataTypes.INTEGER, defaultValue: 1 },
    cash: { type: DataTypes.INTEGER, defaultValue: 0 },
    bank: { type: DataTypes.INTEGER, defaultValue: 0 },
    bankType: { type: DataTypes.STRING, defaultValue: "bca" },
    hackMastered: { type: DataTypes.INTEGER, defaultValue: 10, max: 100 },
    careerMastered: { type: DataTypes.INTEGER, defaultValue: 1, max: 10 },
    lastDaily: { type: DataTypes.DATE, defaultValue: null },
    lastBeg: { type: DataTypes.DATE, defaultValue: null },
    lastLootbox: { type: DataTypes.DATE, defaultValue: null },
    lastWork: { type: DataTypes.DATE, defaultValue: null },
    lastRob: { type: DataTypes.DATE, defaultValue: null },
    lastHack: { type: DataTypes.DATE, defaultValue: null },
    lastMessage: { type: DataTypes.DATE, defaultValue: null },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = userSchema;
