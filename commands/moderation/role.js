const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const checkPermission = require("../../helpers/checkPermission");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Menambahkan atau menghapus peran dari pengguna.")
    .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan dimodifikasi").setRequired(true))
    .addRoleOption((option) => option.setName("role").setDescription("Peran yang akan ditambahkan/dihapus").setRequired(true))
    .addStringOption((option) => option.setName("action").setDescription("Pilih apakah akan menambahkan atau menghapus peran.").setRequired(true).addChoices({ name: "Tambah", value: "add" }, { name: "Hapus", value: "remove" })),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!checkPermission(interaction.member)) {
      const embed = new EmbedBuilder().setColor("Red").setDescription("❌ Kamu tidak punya izin untuk menggunakan perintah ini.");
      return interaction.editReply({ embeds: [embed] });
    }
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");
    const action = interaction.options.getString("action");
    const member = await interaction.guild.members.fetch(user.id);

    // Check if the command issuer has permission to manage roles
    if (!interaction.member.permissions.has("MANAGE_ROLES")) {
      const embed = new EmbedBuilder().setColor("Red").setDescription("Kamu tidak memiliki izin untuk mengelola peran.");
      return interaction.editReply({ embeds: [embed] });
    }

    // Add or remove the role based on the action
    const embed = new EmbedBuilder()
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    if (action === "add") {
      // Check if the member already has the role
      if (member.roles.cache.has(role.id)) {
        embed.setColor("Yellow").setDescription(`🎭 | **${user.tag}** sudah memiliki peran **${role.name}**.`);
        return interaction.editReply({ embeds: [embed] });
      } else {
        await member.roles.add(role);
        embed.setColor("Green").setDescription(`🎭 | Peran **${role.name}** telah ditambahkan kepada **${user.tag}**.`);
        return interaction.editReply({ embeds: [embed] });
      }
    } else if (action === "remove") {
      // Check if the member has the role to remove
      if (!member.roles.cache.has(role.id)) {
        embed.setColor("Yellow").setDescription(`🎭 | **${user.tag}** tidak memiliki peran **${role.name}**.`);
        return interaction.editReply({ embeds: [embed] });
      } else {
        await member.roles.remove(role);
        embed.setColor("Green").setDescription(`🎭 | Peran **${role.name}** telah dihapus dari **${user.tag}**.`);
        return interaction.editReply({ embeds: [embed] });
      }
    }
  },
};
