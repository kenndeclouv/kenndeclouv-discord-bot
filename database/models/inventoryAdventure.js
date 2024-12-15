const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const inventoryAdventureSchema = sequelize.define(
  "inventoryAdventure",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    itemName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
  },
  {
    tableName: "inventoryAdventure",
    timestamps: false,
  }
);

module.exports = inventoryAdventureSchema;
