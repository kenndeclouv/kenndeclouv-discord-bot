const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const inviteSchema = sequelize.define(
  "Invite",
  {
    userId: { type: DataTypes.STRING, required: true },
    guildId: { type: DataTypes.STRING, required: true },
    invites: { type: DataTypes.INTEGER, default: 0 },
  },
  {
    tableName: "invites",
    timestamps: false,
  }
);

module.exports = inviteSchema;
