const UserPet = require("./userPet");
const Pet = require("./pet");

UserPet.associate({ Pet });
Pet.associate({ UserPet });

module.exports = { UserPet, Pet };