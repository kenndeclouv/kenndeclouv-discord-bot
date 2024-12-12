const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const suggestionSchema = sequelize.define(
  "Suggestion",
  {
    guildId: { type: DataTypes.STRING, allowNull: false },
    channelId: { type: DataTypes.STRING, allowNull: false },
    messageId: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "suggestions",
    timestamps: false,
  }
);

module.exports = suggestionSchema;
