const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Adjust connection string

const Giveaway = sequelize.define(
  "Giveaway",
  {
    guildId: { type: DataTypes.STRING, allowNull: false },
    channelId: { type: DataTypes.STRING, allowNull: false },
    messageId: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    winners: { type: DataTypes.INTEGER, allowNull: false },
    prize: { type: DataTypes.STRING, allowNull: false },
    participants: { type: DataTypes.JSON, defaultValue: [] },
    ended: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "giveaways",
    timestamps: false,
  }
);

module.exports = Giveaway;
