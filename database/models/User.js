const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const userSchema = sequelize.define(
  "User",
  {
    userId: { type: DataTypes.STRING, required: true, unique: true },
    level: { type: DataTypes.INTEGER, default: 1 },
    xp: { type: DataTypes.INTEGER, default: 0 },
    cash: { type: DataTypes.INTEGER, default: 0 },
    bank: { type: DataTypes.INTEGER, default: 0 },
    bankType: { type: DataTypes.STRING, default: "bca" },
    hackMastered: { type: DataTypes.INTEGER, default: 10, max: 100 },
    careerMastered: { type: DataTypes.INTEGER, default: 1, max: 10 },
    lastDaily: { type: DataTypes.DATE, default: null },
    lastBeg: { type: DataTypes.DATE, default: null },
    lastLootbox: { type: DataTypes.DATE, default: null },
    lastWork: { type: DataTypes.DATE, default: null },
    lastRob: { type: DataTypes.DATE, default: null },
    lastHack: { type: DataTypes.DATE, default: null },
    lastMessage: { type: DataTypes.DATE, default: null },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = userSchema;
