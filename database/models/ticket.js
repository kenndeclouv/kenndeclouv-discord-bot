const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ticketSchema = sequelize.define(
  "Ticket",
  {
    userId: { type: DataTypes.STRING, allowNull: false },
    guildId: { type: DataTypes.STRING, allowNull: false },
    channelId: { type: DataTypes.STRING, allowNull: false },
    staffRoleId: { type: DataTypes.STRING, allowNull: false },
    logsChannelId: { type: DataTypes.STRING, allowNull: false },
    transcriptChannelId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "tickets",
    timestamps: false,
  }
);

module.exports = ticketSchema;
