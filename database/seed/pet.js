const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Pet = require("../models/pet");

const pets = [
  // Common Pets
  { name: "Cat", icon: "🐱", rarity: "common", bonusType: "xp", bonusValue: 150 },
  { name: "Dog", icon: "🐶", rarity: "common", bonusType: "money", bonusValue: 100 },
  { name: "Rabbit", icon: "🐇", rarity: "common", bonusType: "xp", bonusValue: 150 },
  { name: "Hamster", icon: "🐹", rarity: "common", bonusType: "xp", bonusValue: 150 },
  { name: "Parrot", icon: "🦜", rarity: "common", bonusType: "money", bonusValue: 100 },

  // Rare Pets
  { name: "Fox", icon: "🦊", rarity: "rare", bonusType: "money", bonusValue: 200 },
  { name: "Raccoon", icon: "🦝", rarity: "rare", bonusType: "xp", bonusValue: 270 },
  { name: "Eagle", icon: "🦅", rarity: "rare", bonusType: "money", bonusValue: 200 },
  { name: "Koala", icon: "🐨", rarity: "rare", bonusType: "xp", bonusValue: 270 },
  { name: "Penguin", icon: "🐧", rarity: "rare", bonusType: "money", bonusValue: 200 },

  // Epic Pets
  { name: "Wolf", icon: "🐺", rarity: "epic", bonusType: "xp", bonusValue: 290 },
  { name: "Panda", icon: "🐼", rarity: "epic", bonusType: "xp", bonusValue: 290 },
  { name: "Flamingo", icon: "🦩", rarity: "epic", bonusType: "xp", bonusValue: 290 },
  { name: "Komodo Dragon", icon: "🦎", rarity: "epic", bonusType: "money", bonusValue: 300 },
  { name: "Lion", icon: "🦁", rarity: "epic", bonusType: "xp", bonusValue: 290 },

  // Legendary Pets
  { name: "Phoenix", icon: "🐦‍🔥", rarity: "legendary", bonusType: "xp", bonusValue: 400 },
  { name: "Dragon", icon: "🐉", rarity: "legendary", bonusType: "money", bonusValue: 400 },
  { name: "Unicorn", icon: "🦄", rarity: "legendary", bonusType: "xp", bonusValue: 400 },
  { name: "Cerberus", icon: "🐕‍🦺", rarity: "legendary", bonusType: "money", bonusValue: 400 },
];

const runSeeder = async () => {
  try {
    // Nonaktifkan foreign key constraint
    await sequelize.query("SET foreign_key_checks = 0;");

    // Hapus semua data dari tabel pets
    await Pet.destroy({ truncate: true, cascade: true });
    console.log("All existing pets have been deleted.");

    // Bulk create untuk menambahkan data baru
    await Pet.bulkCreate(pets);
    console.log("Pets seeded successfully");

    // Aktifkan kembali foreign key constraint
    await sequelize.query("SET foreign_key_checks = 1;");
  } catch (error) {
    console.error("Error seeding pets:", error);
  }
};

runSeeder();
