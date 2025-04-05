const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const Inventory = require("../../database/models/inventory");
require("dotenv").config();
const checkCooldown = require("../../helpers/checkCooldown");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Coba mencuri uang dari pengguna lain.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna yang ingin kamu mencuri").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const targetUser = interaction.options.getUser("target");
      if (targetUser.id === interaction.user.id) {
        return interaction.editReply({ content: `❌ | kamu tidak dapat mencuri diri sendiri!` });
      }

      const user = await User.findOne({
        where: { userId: interaction.user.id },
      });
      const target = await User.findOne({
        where: { userId: targetUser.id },
      });

      if (!user || !target) {
        return interaction.editReply({ content: `❌ | Entah kamu atau target tidak memiliki akun!` });
      }

      // Cooldown check
      const cooldown = checkCooldown(user.lastRob, process.env.ROB_COOLDOWN);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat mencuri lagi dalam **${cooldown.time}**!` });
      }

      const guard = await Inventory.findOne({ where: { userId: target.userId, itemName: "🚓 Guard" } });
      let poison = null;
      if (!guard) {
        poison = await Inventory.findOne({ where: { userId: target.userId, itemName: "🧪 Poison" } });
      }

      // Randomize the success chance
      let success = false;
      if (guard) {
        success = false;
        await guard.destroy(); // Destroy the guard item after use
      } else if (poison) {
        success = Math.random() < 0.1; // 10% chance of success
      } else {
        success = Math.random() < 0.3; // 30% chance of success
      }

      const robAmount = Math.floor(Math.random() * 201) + 50;

      if (success) {
        // Successful rob
        if (target.cash < robAmount) {
          return interaction.editReply({ content: `❌ | Target tidak memiliki uang yang cukup!` });
        }

        user.cash += robAmount;
        target.cash -= robAmount;
        user.lastRob = new Date();
        await user.save();
        await target.save();

        const embed = new EmbedBuilder().setColor("Green").setTitle("> Hasil Mencuri").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`kamu berhasil mencuri **${robAmount} uang** dari **${targetUser.username}**!`).setTimestamp().setFooter({ text: `sistem`, iconURL: interaction.guild.iconURL() });
        await interaction.editReply({ embeds: [embed] });

        const embedToTarget = new EmbedBuilder().setColor("Red").setTitle("> Kamu dicuri!").setThumbnail(interaction.user.displayAvatarURL()).setDescription(`**${interaction.user.username}** mencuri **${robAmount} uang** dari kamu!`).setTimestamp().setFooter({ text: `sistem`, iconURL: interaction.guild.iconURL() });
        await targetUser.send({ embeds: [embedToTarget] });
      } else {
        // Failed rob, pay the target
        if (user.cash < robAmount) {
          return interaction.editReply({ content: `❌ | kamu tidak memiliki uang yang cukup untuk membayar jika mencuri gagal!` });
        }
        if (poison) {
          const penalty = user.cash;
          user.cash -= penalty;
          target.cash += penalty;
          await poison.destroy(); // Destroy poison item after use
        } else {
          user.cash -= robAmount;
          target.cash += robAmount;
        }

        user.lastRob = new Date();
        await user.save();
        await target.save();

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("> Hasil Mencuri")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`❌ | kamu gagal mencuri dari **${targetUser.username}** dan membayar mereka **${poison ? "semua uang kamu" : robAmount + " uang"}** sebagai denda. ${guard ? "Karena target memiliki guard" : ""} ${poison ? "Karena target memiliki poison" : ""}`)
          .setTimestamp()
          .setFooter({ text: `sistem`, iconURL: interaction.guild.iconURL() });
        await interaction.editReply({ embeds: [embed] });

        const embedToTarget = new EmbedBuilder()
          .setColor("Green")
          .setTitle("> Hasil Mencuri")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`**${interaction.user.username}** berusaha mencuri **${robAmount} uang** dari kamu! tapi gagal dan membayar kamu **${poison ? penalty : robAmount} uang** sebagai denda. ${guard ? "Karena target kamu memiliki guard" : ""} ${poison ? "Karena target kamu memiliki poison" : ""}`)
          .setTimestamp()
          .setFooter({ text: `sistem`, iconURL: interaction.guild.iconURL() });
        await targetUser.send({ embeds: [embedToTarget] });
      }
    } catch (error) {
      console.error("Error during rob command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
