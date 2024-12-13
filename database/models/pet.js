const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const UserPet = require("./userPet");

const PetSchema = sequelize.define("Pet", {
  name: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, allowNull: false },
  rarity: { type: DataTypes.ENUM("common", "rare", "epic", "legendary"), defaultValue: "common" },
  bonusType: { type: DataTypes.ENUM("xp", "money"), defaultValue: "xp" },
  bonusValue: { type: DataTypes.INTEGER, defaultValue: 10 },
});

PetSchema.associate = (models) => {
  PetSchema.hasMany(models.UserPet, {
    foreignKey: "petId",
    as: "userPets",
  });
};

module.exports = PetSchema;