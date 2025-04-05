const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fixprefix")
    .setDescription("Menambahkan prefix role tertinggi ke nickname member."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.members.fetch();

    // cari semua role yg punya prefix [..] lalu urutkan dari tertinggi
    const prefixRoles = guild.roles.cache
      .filter((role) => /^\[.+?\]/.test(role.name))
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        roleId: role.id,
        prefix: role.name.match(/^\[(.+?)\]/)[0],
        position: role.position,
      }));

    let updated = 0;
    for (const member of guild.members.cache.values()) {
      if (!member.manageable) {
        console.log(
          "Member tidak bisa diatur :" +
            (member.nickname || member.user.username)
        );
      }
      //   if (member.user.bot) continue;

      // cari role prefix yg dimiliki member (ambil yg posisi tertinggi)
      const matching = prefixRoles.find((r) =>
        member.roles.cache.has(r.roleId)
      );
      if (!matching) continue;

      const currentNick = member.nickname || member.user.username;
      const baseName = currentNick.replace(/^\[.+?\]\s?/, ""); // hapus prefix lama kalo ada
      const newNick = `${matching.prefix} ${baseName}`;

      if (currentNick !== newNick) {
        try {
          await member.setNickname(newNick);
          updated++;
        } catch (err) {
          console.warn(`❌ gagal ubah nick ${member.user.tag}: ${err.message}`);
        }
      }
      console.log(
        "role tertinggi bot:",
        interaction.guild.members.me.roles.highest.name
      );
      console.log("role tertinggi member:", member.roles.highest.name);
    }

    return interaction.editReply({
      content: `✅ selesai update prefix ke ${updated} member!`,
    });
  },
};
