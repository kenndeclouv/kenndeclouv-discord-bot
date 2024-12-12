const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

require("dotenv").config();

const createHomeEmbed = () => {
  const embed1 = new EmbedBuilder().setColor(0xf7f7f7).setImage("https://i.ibb.co/9vt69HK/Fram.png");
  const embed2 = new EmbedBuilder().setColor(0xf7f7f7).setTitle("> WELCOME TO RPL GUYS SERVER!").setDescription("selamat datang di server rpl guys! server yang bisa membantu kita dalam mengerjakan tugas, update tugas terbaru, dan QNA langsung.\n\nbiar server ini nyaman, seru, dan tetep produktif, sebelum masuk ke channelnya baca duluu yakk rulesnya!").addFields({ name: "🌐 Quick links", value: "<:whitelink:1314510403736178759> [kenndeclouv](https://kenndeclouv.rf.gd)\n<:whiteinstagram:1314506688061243442> [kenndeclouv](https://instagram.com/kenndeclouv)\n<:whitefacebook:1314506794973794355> [kenndeclouv](https://facebook.com/kenndeclouv)", inline: true }, { name: "🌐 Channels", value: "<#1314236534484111373> Rules\n<#1314236534484111375> General\n<#1314480699126054973> Join Forum", inline: true });
  return [embed1, embed2];
};

const createHomeActionRow = () => {
  const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("server_rules").setLabel("Server rules").setStyle(ButtonStyle.Primary).setEmoji("📜"));
  return row;
};

const handleHomeInteraction = async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "server_rules") {
    const { embed1, embed2 } = require("./rules");
    await interaction.reply({
      embeds: [embed1, embed2],
      ephemeral: true,
    });
  }
};

const sendHomeMessage = async (channel) => {
  const [embed1, embed2] = createHomeEmbed();
  const row = createHomeActionRow();
  await channel.send({ embeds: [embed1, embed2], components: [row] });
};

module.exports = {
  sendHomeMessage,
  handleHomeInteraction,
};
