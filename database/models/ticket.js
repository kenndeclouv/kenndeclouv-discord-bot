const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ticketSchema = sequelize.define(
  "Ticket",
  {
    userId: { type: DataTypes.STRING, required: false },
    guildId: { type: DataTypes.STRING, required: false },
    channelId: { type: DataTypes.STRING, required: true },
    staffRoleId: { type: DataTypes.STRING, required: true },
    logsChannelId: { type: DataTypes.STRING, required: true },
    transcriptChannelId: { type: DataTypes.STRING, required: true },
    title: { type: DataTypes.STRING, required: true },
    description: { type: DataTypes.STRING, required: true },
  },
  {
    tableName: "tickets",
    timestamps: false,
  }
);

module.exports = ticketSchema;
