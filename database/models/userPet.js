const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Pet = require("./pet");

const UserPetSchema = sequelize.define("UserPet", {
  userId: { type: DataTypes.STRING, allowNull: false },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  petName: { type: DataTypes.STRING, allowNull: false },
  hunger: { type: DataTypes.INTEGER, defaultValue: 100 },
  happiness: { type: DataTypes.INTEGER, defaultValue: 100 },
  lastUse: { type: DataTypes.DATE, defaultValue: null },
  lastGacha: { type: DataTypes.DATE, defaultValue: null },
  isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

UserPetSchema.associate = (models) => {
  UserPetSchema.belongsTo(models.Pet, {
    foreignKey: "petId",
    as: "pet",
  });
};

module.exports = UserPetSchema;
