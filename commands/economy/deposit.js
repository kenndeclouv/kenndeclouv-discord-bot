const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Simpan uang tunai anda ke bank.')
    .addIntegerOption(option => option.setName('amount').setDescription('Jumlah untuk menyimpan').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const amount = interaction.options.getInteger('amount');
    const user = await User.findOne({ 
        where: { userId: interaction.user.id } 
      });

    if (!user || user.cash < amount) {
      return interaction.reply({ content: 'kamu tidak memiliki uang tunai yang cukup untuk menyimpan.', ephemeral: true });
    }

    user.cash -= amount;
    user.bank += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Hasil Menyimpan Uang")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`kamu menyimpan **${amount} uang** ke bank!`)
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  }
};
