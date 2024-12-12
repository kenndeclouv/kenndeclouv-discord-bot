const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Tarik uang tunai anda dari bank.')
    .addIntegerOption(option => option.setName('amount').setDescription('Jumlah untuk menarik uang').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = await User.findOne({ 
        where: { userId: interaction.user.id } 
      });

    if (!user || user.bank < amount) {
      return interaction.reply({ content: 'kamu tidak memiliki uang yang cukup di bank untuk menarik uang!', ephemeral: true });
    }

    user.bank -= amount;
    user.cash += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Hasil Menarik Uang")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`${interaction.user.username} menarik **${amount} uang** dari bank.`)
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};