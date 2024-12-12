const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const embed = new EmbedBuilder().setColor(0xf7f7f7).setTitle("> Temukan kesukaanmu").setDescription("Suka sesuatu? Kamu bisa add role mu sendiri disini! Klik tombol dibawah untuk mendapatkan role yang kalian mau agar bisa mengakses channel rahasia yang tersembunyi...\n\n**AYO JOIN SEKARANG**").setImage("https://glitchii.github.io/embedbuilder/assets/media/banner.png");
const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("role_MLers").setLabel("MABAR ML").setStyle(ButtonStyle.Primary).setEmoji("📱"), new ButtonBuilder().setCustomId("role_PUBGers").setLabel("WWCD PUBG").setStyle(ButtonStyle.Success).setEmoji("🎮"), new ButtonBuilder().setCustomId("role_ROBLOXers").setLabel("BOCIL ROBLOX").setStyle(ButtonStyle.Danger).setEmoji("💻"), new ButtonBuilder().setCustomId("role_ANIMErs").setLabel("NOBAR ANIME").setStyle(ButtonStyle.Secondary).setEmoji("📺"));
const handleAddRolesInteraction = async (interaction) => {
  if (!interaction.isButton()) return;
  const roleMap = {
    role_MLers: "1314475956592967750",
    role_PUBGers: "1314476298030284860",
    role_ROBLOXers: "1314476103330693161",
    role_ANIMErs: "1314475643408224306",
  };
  const roleId = roleMap[interaction.customId];
  if (!roleId) return;
  const guild = interaction.guild;
  const member = interaction.member;
  const role = guild.roles.cache.get(roleId);
  if (!role) {
    console.error(`Role dengan ID "${roleId}" tidak ditemukan di server.`);
    return;
  }
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    return interaction.reply({
      content: `Role "${role.name}" berhasil dihapus.`,
      ephemeral: true,
    });
  } else {
    await member.roles.add(role);
    return interaction.reply({
      content: `Role "${role.name}" berhasil ditambahkan.`,
      ephemeral: true,
    });
  }
};

function sendAddRolesMessage(channel) {
  channel.send({ embeds: [embed], components: [row] });
}

module.exports = { sendAddRolesMessage, handleAddRolesInteraction };
