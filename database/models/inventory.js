const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const inventorySchema = sequelize.define(
  "Inventory",
  {
    userId: { type: DataTypes.STRING, required: true },
    itemName: { type: DataTypes.STRING, required: true },
  },
  {
    tableName: "inventory",
    timestamps: false,
  }
);

module.exports = inventorySchema;
