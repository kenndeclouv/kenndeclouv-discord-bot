const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar perintah bot dengan paginasi."),
  async execute(interaction) {
    const commandFolders = fs.readdirSync(path.join(__dirname, ".."));
    const embeds = [];

    // Create home page embed with bot description
    const homeEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Selamat datang di menu bantuan bot!")
      .setDescription("Bot ini menyediakan berbagai perintah. Gunakan tombol di bawah untuk melihat daftar perintah dalam setiap kategori. \n\n**Perintah yang tersedia:**")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini", iconURL: interaction.client.user.displayAvatarURL() });
    embeds.push(homeEmbed);

    for (const folder of commandFolders) {
      if (folder !== "leveling" && folder !== "economy" && folder !== "pet") continue;

      const commandFiles = fs.readdirSync(path.join(__dirname, "..", folder)).filter((file) => file.endsWith(".js"));
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`> Kategori ${folder}`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(`Daftar perintah dalam kategori ${folder}`)
        .setFooter({ text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini", iconURL: interaction.client.user.displayAvatarURL() });

      for (const file of commandFiles) {
        const command = require(path.join(__dirname, "..", folder, file));
        if (command.data.options) {
          command.data.options.forEach((option) => {
            embed.addFields({
              name: `**\`/${command.data.name} ${option.name}\`**`,
              value: option.description || "Tidak ada deskripsi",
            });
          });
        } else {
          embed.addFields({
            name: `**\`/${command.data.name}\`**`,
            value: command.data.description || "Tidak ada deskripsi",
          });
        }
      }

      embeds.push(embed);
    }

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("previous").setLabel("Sebelumnya").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("home").setLabel("Beranda").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("next").setLabel("Berikutnya").setStyle(ButtonStyle.Primary)
    );

    let currentPage = 0;
    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      ephemeral: true,
      components: [buttons],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.customId === "previous") {
        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
      } else if (i.customId === "home") {
        currentPage = 0;
      } else if (i.customId === "next") {
        currentPage = (currentPage + 1) % embeds.length;
      }

      await i.update({ embeds: [embeds[currentPage]], components: [buttons] });
    });

    collector.on("end", async () => {
      await interaction.deleteReply();
    });
  },
};
