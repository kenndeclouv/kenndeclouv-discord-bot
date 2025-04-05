const { SlashCommandBuilder, EmbedBuilder, SelectMenuBuilder } = require("discord.js");
const checkCooldown = require("../../helpers/checkCooldown");
const checkPermission = require("../../helpers/checkPermission");
const { UserPet, Pet } = require("../../database/models");
const Inventory = require("../../database/models/inventory");
const User = require("../../database/models/User");
require("dotenv").config();
const { Op } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pet")
    .setDescription("Atur pet yang ada di sistem")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambah pet baru")
        .addStringOption((option) => option.setName("name").setDescription("Nama pet").setRequired(true))
        .addStringOption((option) => option.setName("icon").setDescription("Icon (emoji) untuk pet").setRequired(true))
        .addStringOption((option) => option.setName("rarity").setDescription("Rarity of the pet").addChoices({ name: "Common", value: "common" }, { name: "Rare", value: "rare" }, { name: "Epic", value: "epic" }, { name: "Legendary", value: "legendary" }).setRequired(true))
        .addStringOption((option) => option.setName("bonus_type").setDescription("Tipe bonus (XP atau Money)").addChoices({ name: "XP", value: "xp" }, { name: "Money", value: "money" }).setRequired(true))
        .addIntegerOption((option) => option.setName("bonus_value").setDescription("Nilai bonus").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("Tampilkan semua pet yang ada di sistem"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Hapus pet yang ada di sistem")
        .addStringOption((option) => option.setName("name").setDescription("Nama pet yang ingin dihapus").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("adopt")
        .setDescription("Adopsi pet secara random")
        .addStringOption((option) => option.setName("name").setDescription("Nama pet").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("feed").setDescription("Beri makan petmu!"))
    .addSubcommand((subcommand) => subcommand.setName("play").setDescription("Bermain dengan petmu!"))
    .addSubcommand((subcommand) => subcommand.setName("info").setDescription("Lihat info petmu!"))
    .addSubcommand((subcommand) => subcommand.setName("use").setDescription("Gunakan petmu dan dapatkan bonus!"))
    .addSubcommand((subcommand) => subcommand.setName("gacha").setDescription("Gacha petmuu!"))
    .addSubcommand((subcommand) => subcommand.setName("sell").setDescription("Jual petmu!"))
    .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Lihat papan peringkat petmu!"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("editname")
        .setDescription("Edit nama petmu!")
        .addStringOption((option) => option.setName("name").setDescription("Nama pet baru").setRequired(true))
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });
    try {
      // add pet
      if (subcommand === "add") {
        const name = interaction.options.getString("name");
        const icon = interaction.options.getString("icon");
        const rarity = interaction.options.getString("rarity");
        const bonusType = interaction.options.getString("bonus_type");
        const bonusValue = interaction.options.getInteger("bonus_value");

        if (!checkPermission(interaction.member)) {
          return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
        }

        await Pet.create({ name, icon, rarity, bonusType, bonusValue });
        return interaction.editReply({ content: `✅ Pet **${name}** berhasil ditambahkan!` });
      }

      // list pet
      if (subcommand === "list") {
        const pets = await Pet.findAll();
        if (!pets.length) {
          return interaction.editReply({ content: "❌ Tidak ada pet di sistem!" });
        }

        const embed = new EmbedBuilder()
          .setTitle("> Daftar Pet")
          .setDescription("sistem discord ini memiliki pet yang bisa kamu adopsi dan main bersamanya, pet pet tersebut adalah")
          .setColor("Green")
          .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `sistem akan memberikan bonus setiap 15 menit` });
        pets.forEach((pet) =>
          embed.addFields({
            name: `> ${pet.icon} ${pet.name}`,
            value: `**tingkat**: ${pet.rarity}\n**bonus**: ${pet.bonusType.toUpperCase()} +${pet.bonusValue}`,
          })
        );

        return interaction.editReply({ embeds: [embed] });
      }

      // delete pet
      if (subcommand === "delete") {
        const name = interaction.options.getString("name");
        const deleted = await Pet.destroy({ where: { name } });
        if (!checkPermission(interaction.member)) {
          return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
        }
        if (deleted) {
          return interaction.editReply({ content: `✅ Pet **${name}** berhasil dihapus!` });
        } else {
          return interaction.editReply({ content: "❌ Pet tidak ditemukan!" });
        }
      }

      // adopt pet
      if (subcommand === "adopt") {
        const userId = interaction.user.id;
        const name = interaction.options.getString("name");
        const existingPet = await UserPet.findOne({ where: { userId, isDead: false }, include: { model: Pet, as: "pet" } });
        if (existingPet) {
          return interaction.editReply({ content: "❌ Kamu sudah punya pet!" });
        }

        const deadPet = await UserPet.findOne({ where: { userId, isDead: true } });
        if (deadPet) {
          await deadPet.destroy();
        }
        const pets = await Pet.findAll();

        const rarities = {
          common: 50,
          rare: 25,
          epic: 20,
          legendary: 5,
        };

        const weightedPets = pets.flatMap((pet) => Array(rarities[pet.rarity]).fill(pet));

        const randomPet = weightedPets[Math.floor(Math.random() * weightedPets.length)];

        // Create user pet
        await UserPet.create({ userId, petId: randomPet.id, petName: name });

        // Create embed
        const embed = new EmbedBuilder()
          .setTitle(`> yeyy kamu berhasil mengadopsi pet!`)
          .setDescription(`${randomPet.icon} **${randomPet.name}** tingkat ${randomPet.rarity} dengan tipe bonus ${randomPet.bonusType} dengan nilai bonus ${randomPet.bonusValue}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Rawat dan main bersama pet barumu ya!` });

        return interaction.editReply({ embeds: [embed] });
      }

      // feed pet
      if (subcommand === "feed") {
        const userId = interaction.user.id;
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });

        if (!userPet) {
          return interaction.editReply({ content: "❌ Kamu belum punya pet untuk diberi makan!" });
        }
        if (userPet.isDead) {
          return interaction.editReply({ content: "💀 petmu sudah mati! kamu dapat mengadopsi pet baru dengan perintah `/pet adopt`" });
        }

        const petFood = await Inventory.findOne({ where: { userId: userId, itemName: "🍪 Pet Food" } });
        if (!petFood) {
          return interaction.editReply({ content: "❌ Kamu belum memiliki makanan untuk pet!" });
        }
        await petFood.destroy();
        userPet.hunger = Math.min(userPet.hunger + 20, 100);
        await userPet.save();

        // Check if hunger exceeds the maximum limit
        if (userPet.hunger >= 100) {
          return interaction.editReply({ content: "🎉 Petmu sudah kenyang!" });
        }

        const embed = new EmbedBuilder()
          .setTitle(`> yeyy kamu berhasil memberi makan pet!`)
          .setDescription(`${userPet.pet.icon} **${userPet.pet.name}** tingkat ${userPet.pet.rarity}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `petmu sekarang memiliki tingkat kelaparan ${userPet.hunger}/100` });

        return interaction.editReply({ embeds: [embed] });
      }

      // play pet
      if (subcommand === "play") {
        const userId = interaction.user.id;
        // Get user's pet
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });
        if (!userPet) {
          return interaction.editReply({ content: "❌ kamu belum memiliki pet!" });
        }
        if (userPet.isDead) {
          return interaction.editReply({ content: "💀 petmu sudah mati! kamu dapat mengadopsi pet baru dengan perintah `/pet adopt`" });
        }
        // Update happiness level
        userPet.happiness = Math.min(userPet.happiness + 20, 100);
        await userPet.save();

        const embed = new EmbedBuilder()
          .setTitle(`> yeyy kamu berhasil bermain dengan pet!`)
          .setDescription(`${userPet.pet.icon} **${userPet.pet.name}** tingkat ${userPet.pet.rarity}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `petmu sekarang memiliki tingkat kebahagiaan ${userPet.happiness}/100` });

        return interaction.editReply({ embeds: [embed] });
      }

      // info pet
      if (subcommand === "info") {
        const userId = interaction.user.id;
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });
        if (!userPet) {
          return interaction.editReply({ content: "❌ kamu belum memiliki pet!" });
        }
        if (userPet.isDead) {
          return interaction.editReply({ content: "💀 petmu sudah mati! kamu dapat mengadopsi pet baru dengan perintah `/pet adopt`" });
        }
        const embed = new EmbedBuilder()
          .setTitle(`> info pet kamuu`)
          .setDescription(`${userPet.pet.icon} ${userPet.pet.name} tingkat ${userPet.pet.rarity} dengan nama ${userPet.petName}, tipe bonus ${userPet.pet.bonusType} dengan nilai ${userPet.pet.bonusValue}, tingkat kebahagiaan ${userPet.happiness}, tingkat kelaparan ${userPet.hunger}, level pet ${userPet.level}`)
          .setColor("Blue")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `sistem akan memberikan bonus ${userPet.pet.bonusType} +${userPet.pet.bonusValue} setiap 15 menit` });

        return interaction.editReply({ embeds: [embed] });
      }

      // use pet
      if (subcommand === "use") {
        // Cooldown check
        const userId = interaction.user.id;
        const user = await User.findOne({ where: { userId } });
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });
        const cooldown = checkCooldown(userPet.lastUse, process.env.PET_COOLDOWN);
        if (cooldown.remaining) {
          return interaction.editReply({ content: `🕒 | kamu dapat menggunakan pet lagi dalam **${cooldown.time}**!` });
        }
        if (!userPet) {
          return interaction.editReply({ content: "❌ kamu belum memiliki pet!" });
        }
        if (userPet.isDead) {
          return interaction.editReply({ content: "💀 petmu sudah mati! kamu dapat mengadopsi pet baru dengan perintah `/pet adopt`" });
        }
        userPet.level += 1;
        let multiplier = 1;
        if (userPet.level >= 30) multiplier = 5;
        else if (userPet.level >= 20) multiplier = 4;
        else if (userPet.level >= 10) multiplier = 3;
        else if (userPet.level >= 5) multiplier = 2;
        user.xp += userPet.pet.bonusValue * multiplier;

        userPet.lastUse = new Date();
        await userPet.save();

        if (userPet.pet.bonusType === "xp") {
          user.xp += userPet.pet.bonusValue * multiplier;
        } else if (userPet.pet.bonusType === "money") {
          user.cash += userPet.pet.bonusValue * multiplier;
        }

        await user.save();
        const embed = new EmbedBuilder()
          .setTitle(`> yeyy kamu berhasil menggunakan pet!`)
          .setDescription(`${userPet.pet.icon} **${userPet.pet.name}** tingkat ${userPet.pet.rarity}, kamu mendapatkan bonus ${userPet.pet.bonusType} +${userPet.pet.bonusValue * multiplier}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `petmu sekarang memiliki level ${userPet.level}` });

        return interaction.editReply({ embeds: [embed] });
      }

      // gacha pet
      if (subcommand === "gacha") {
        const userId = interaction.user.id;
        const user = await User.findOne({ where: { userId } });
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });

        if (!userPet) {
          return interaction.editReply({ content: "❌ Kamu belum memiliki pet untuk digacha!" });
        }

        const cooldown = checkCooldown(userPet.lastGacha, process.env.GACHA_COOLDOWN);
        if (cooldown.remaining) {
          return interaction.editReply({ content: `🕒 | kamu dapat menggacha pet lagi dalam **${cooldown.time}**!` });
        }

        const pet = await Pet.findOne({ where: { id: userPet.petId } });
        const rarity = pet.rarity;

        const rarityChance = {
          common: 0.9, // 90% chance for same rarity
          rare: 0.75, // 75% chance for same rarity
          epic: 0.5, // 50% chance for same rarity
          legendary: 0.1, // 10% chance for same rarity
        };
        const random = Math.random();
        // Determine the rarity of the new pet
        const selectedRarity = random < rarityChance[rarity] ? rarity : random < rarityChance[rarity] + 0.1 ? getHigherRarity(rarity) : rarity;

        // Get the new pet based on the rarity
        const selectedPet = await Pet.findOne({
          where: { rarity: selectedRarity, id: { [Op.ne]: userPet.petId } }, // Exclude current pet
          order: User.sequelize.random(), // Randomize to select one from the rarity pool
        });

        // Calculate the new pet level as 40% of the previous pet's level
        const newLevel = Math.floor(userPet.level * 0.4);

        // Delete the old pet and create the new one
        const petName = `${userPet.petName}`;
        await userPet.destroy();
        await UserPet.create({ userId, petId: selectedPet.id, petName: petName, level: newLevel });

        const embed = new EmbedBuilder()
          .setTitle(`> yeyy kamu berhasil menukar pet!`)
          .setDescription(`${selectedPet.icon} **${selectedPet.name}** tingkat ${selectedPet.rarity} dengan level ${newLevel}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `petmu sekarang memiliki level ${newLevel}` });

        return await interaction.editReply({ embeds: [embed] });
      }

      if (subcommand === "sell") {
        const userId = interaction.user.id;
        const user = await User.findOne({ where: { userId } });
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });
        if (!userPet) {
          return interaction.editReply({ content: "❌ Kamu belum memiliki pet untuk dijual!" });
        }
        // user.cash += userPet.pet.bonusValue;
        const rarity = userPet.pet.rarity;
        const rarityValue = {
          common: 80,
          rare: 150,
          epic: 250,
          legendary: 400,
        };

        const petValue = rarityValue[rarity] * userPet.level;
        user.cash += petValue;
        await userPet.destroy();
        await user.save();
        return interaction.editReply({ content: `✅ Pet berhasil dijual! Kamu mendapatkan ${petValue}` });
      }

      // leaderboard pet
      if (subcommand === "leaderboard") {
        const leaderboard = await UserPet.findAll({
          include: { model: Pet, as: "pet" },
          order: [
            [User.sequelize.literal('CASE WHEN pet.rarity = "common" THEN 1 WHEN pet.rarity = "rare" THEN 2 WHEN pet.rarity = "epic" THEN 3 WHEN pet.rarity = "legendary" THEN 4 END'), "DESC"],
            ["level", "DESC"],
          ],
        });
        const embed = new EmbedBuilder()
          .setTitle(`> Papan Peringkat Pet`)
          .setDescription(leaderboard.length ? leaderboard.map((pet, index) => `${index + 1}. <@${pet.userId}> ${pet.pet.icon} ${pet.pet.rarity} ${pet.pet.name}, level ${pet.level}`).join("\n") : "❌ Tidak ada pet dalam papan peringkat.")
          .setColor("Blue")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      // edit name pet
      if (subcommand === "editname") {
        const userId = interaction.user.id;
        const user = await User.findOne({ where: { userId } });
        const userPet = await UserPet.findOne({ where: { userId }, include: { model: Pet, as: "pet" } });
        const newName = interaction.options.getString("name");
        userPet.petName = newName;
        await userPet.save();
        const embed = new EmbedBuilder()
          .setTitle(`> yeyy nama pet berhasil diubah!`)
          .setDescription(`${userPet.pet.icon} **${userPet.pet.name}** tingkat ${userPet.pet.rarity} dengan nama ${userPet.petName}`)
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `petmu sekarang memiliki nama ${userPet.petName}` })
          .setTimestamp();
        return await interaction.editReply({ embeds: [embed] });
      }
      // Helper function to get a higher rarity
      function getHigherRarity(currentRarity) {
        switch (currentRarity) {
          case "common":
            return "rare";
          case "rare":
            return "epic";
          case "epic":
            return "legendary";
          default:
            return currentRarity;
        }
      }
    } catch (error) {
      console.error("Error during pet command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
