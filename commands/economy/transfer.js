const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer uang kepada pengguna lain.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna untuk mentransfer uang").setRequired(true))
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah uang untuk mentransfer").setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");

    const giver = await User.findOne({
      where: { userId: interaction.user.id },
    });
    const receiver = await User.findOne({
      where: { userId: target.id },
    });

    if (!giver || giver.bank < amount) {
      return interaction.reply({ content: "kamu tidak memiliki uang di bank yang cukup untuk mentransfer.", ephemeral: true });
    }
    if (!receiver) {
      return interaction.reply({ content: "Pengguna yang dituju tidak memiliki akun. gunakan `/account create` untuk membuat akun.", ephemeral: true });
    }
    if (giver.userId === receiver.userId) {
      return interaction.reply({ content: "kamu tidak dapat mentransfer uang kepada diri sendiri.", ephemeral: true });
    }
    let fee = 0;
    if (giver.bankType !== receiver.bankType) {
      fee = Math.floor(amount * 0.05);
    }
    if (giver.bank < amount + fee) {
      return interaction.reply({ content: "kamu tidak memiliki uang di bank yang cukup untuk menutupi biaya transfer.", ephemeral: true });
    }
    giver.bank -= amount + fee;
    receiver.bank += amount;

    await giver.save();
    await receiver.save();

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const confirmEmbed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("> Konfirmasi Transfer Uang")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`kamu akan mentransfer **${amount} uang** ke **${target.username}** dengan biaya **${fee} uang**. Apakah kamu ingin melanjutkan?`)
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm')
          .setLabel('Konfirmasi')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Batalkan')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      if (i.customId === 'confirm') {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("> Berhasil Transfer Uang")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`kamu berhasil mentransfer **${amount} uang** ke **${target.username}** dengan biaya **${fee} uang**!`)
          .setTimestamp()
          .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
        await i.update({ embeds: [embed], components: [], ephemeral: true });

        const targetEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("> kamu Mendapatkan Transfer Uang")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`kamu menerima **${amount} uang** transfer ke bank anda dari **${interaction.user.username}**!`)
          .setTimestamp()
          .setFooter({ text: `Diberikan oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
        await target.send({ embeds: [targetEmbed] });
      } else if (i.customId === 'cancel') {
        await i.update({ content: 'Transfer dibatalkan.', components: [], ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'Waktu habis. Transfer dibatalkan.', components: [], ephemeral: true });
      }
    });
  },
};
