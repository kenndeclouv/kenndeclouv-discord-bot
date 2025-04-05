const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const inventorySchema = sequelize.define(
  "Inventory",
  {
    userId: { type: DataTypes.STRING, allowNull: false },
    itemName: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "inventory",
    timestamps: false,
  }
);

module.exports = inventorySchema;
