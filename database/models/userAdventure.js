const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const userAdventureSchema = sequelize.define(
  "userAdventure",
  {
    userId: { type: DataTypes.STRING, required: true, unique: true },
    level: { type: DataTypes.INTEGER, default: 1 },
    xp: { type: DataTypes.INTEGER, default: 0 },
    hp: { type: DataTypes.INTEGER, default: 100 },
    gold: { type: DataTypes.INTEGER, default: 50 },
    strength: { type: DataTypes.INTEGER, default: 10 },
    defense: { type: DataTypes.INTEGER, default: 5 },
    monsterName: { type: DataTypes.STRING, default: null },
    monsterHp: { type: DataTypes.INTEGER, default: 0 },
    monsterStrength: { type: DataTypes.INTEGER, default: 0 },
    monsterGoldDrop: { type: DataTypes.INTEGER, default: 0 },
    monsterXpDrop: { type: DataTypes.INTEGER, default: 0 },
  },
  {
    tableName: "userAdventure",
    timestamps: false,
  }
);

module.exports = userAdventureSchema;
