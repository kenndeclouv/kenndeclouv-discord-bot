const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cash')
    .setDescription('Cek saldo tunai anda.'),
  async execute(interaction) {
    const user = await User.findOne({ 
        where: { userId: interaction.user.id } 
      });
    if (!user) {
      return interaction.reply({ content: 'kamu belum memiliki saldo.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Saldo Tunai")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`**${interaction.user.username}**, kamu memiliki **${user.cash} uang tunai!**`)
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};