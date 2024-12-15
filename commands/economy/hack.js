const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../database/models/User"); // pastikan model User benar
const config = require("../../config");
const checkCooldown = require("../../helpers/checkCooldown");
const Inventory = require("../../database/models/inventory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hack")
    .setDescription("Hack user lain.")
    .addUserOption((option) => option.setName("target").setDescription("User yang ingin di hack").setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const targetUser = interaction.options.getUser("target");
      const user = await User.findOne({ where: { userId: interaction.user.id } });
      const target = await User.findOne({ where: { userId: targetUser.id } });

      // Cooldown check
      const cooldown = checkCooldown(user.lastHack, config.cooldowns.hack);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat meng-hack lainnya dalam **${cooldown.time}**!` });
      }
      // validasi data user
      if (!user || !target) {
        return interaction.editReply({
          content: `❌ | Pengguna atau target tidak ditemukan dalam sistem.`,
        });
      }

      if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
          content: `❌ | kamu tidak dapat meng-hack diri sendiri!`,
        });
      }

      if (target.bank <= 0) {
        return interaction.editReply({
          content: `❌ | Target tidak memiliki uang di bank untuk di-hack.`,
        });
      }

      if (user.bank <= 20) {
        return interaction.editReply({
          content: `❌ | kamu tidak memiliki uang di bank untuk meng-hack.`,
        });
      }

      // buat embed fake hack
      const embed = new EmbedBuilder()
        .setTitle("> Hacking in Progress...")
        .setDescription(`${interaction.user.username} sedang meng-hack ${targetUser.username}... dengan kemungkinan berhasil **${user.hackMastered || 10}%**`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setColor("#f7f7f7")
        .setTimestamp(new Date());

      // kirim embed fake hack
      await interaction.editReply({ embeds: [embed] });

      const desktop = await Inventory.findOne({ where: { userId: user.userId, itemName: "🖥️ Desktop" } });
      let successChance = 1;
      if (desktop) {
        successChance = 1.5;
      }
      // simulasi hasil hack
      setTimeout(async () => {
        const hackResult = Math.random() < (user.hackMastered || 10) / 100 * successChance ? "success" : "failure";

        if (hackResult === "success") {
          // transfer semua uang target ke user
          user.bank += target.bank;
          if (user.hackMastered < 100) {
            user.hackMastered = (user.hackMastered || 10) + 1;
          }
          target.bank = 0;
          await user.save();
          await target.save();

          const successEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> Hack berhasil!")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`🎉 | kamu berhasil meng-hack **${targetUser.username}** dan mendapatkan semua uang di bank mereka!`)
            .setTimestamp()
            .setFooter({
              text: `Diminta oleh ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          await interaction.editReply({ embeds: [successEmbed] });
        } else {
          // penalti jika gagal
          const penalty = Math.floor(Math.random() * 20) + 1;
          if (user.bank >= penalty) {
            user.bank -= penalty;
            target.bank += penalty;
            await user.save();
            await target.save();
          }

          const failureEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("> Hack gagal!")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`❌ | kamu gagal meng-hack **${targetUser.username}** dan kehilangan **${penalty}** uang dari bank kamu.`)
            .setTimestamp()
            .setFooter({
              text: `Diminta oleh ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          await interaction.editReply({ embeds: [failureEmbed] });
        }
      }, 5000); // delay 5 detik
    } catch (error) {
      console.error(error);
      interaction.editReply({
        content: "❌ | Terjadi kesalahan saat mencoba menjalankan perintah ini.",
      });
    }
  },
};
