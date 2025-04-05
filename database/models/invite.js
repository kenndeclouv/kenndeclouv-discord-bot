const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const inviteSchema = sequelize.define(
  "Invite",
  {
    userId: { type: DataTypes.STRING, allowNull: false },
    guildId: { type: DataTypes.STRING, allowNull: false },
    invites: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "invites",
    timestamps: false,
  }
);

module.exports = inviteSchema;
