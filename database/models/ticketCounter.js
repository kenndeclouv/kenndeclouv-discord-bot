const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const TicketCounter = sequelize.define(
  "TicketCounter",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "ticketCounters",
    timestamps: false,
  }
);

module.exports = TicketCounter;
