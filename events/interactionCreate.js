const {
  Events,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Ticket = require("../database/models/ticket"); // Import your Ticket model
const TicketCounter = require("../database/models/ticketCounter");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      // slash command
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.permissions) {
          const missingPermissions = command.permissions.filter(
            (permission) =>
              !interaction.guild.members.me.permissions.has(permission)
          );
          if (missingPermissions.length > 0) {
            return await interaction.reply({
              content: `⚠️ | Kamu tidak memiliki permission untuk mengakses command ini: \`${missingPermissions.join(
                ", "
              )}\`.`,
              ephemeral: true,
            });
          }
        }

        if (command.name === "mute" || command.name === "unmute") {
          const member = interaction.options.getMember("user");
          if (!member.voice.channel) {
            return await interaction.reply({
              content: `🚫 | The user must be in a voice channel to be ${
                command.name === "mute" ? "muted" : "unmuted"
              }.`,
              ephemeral: true,
            });
          }
        }

        await command.execute(interaction, client);
        return;
      }

      // button interaction
      if (interaction.isButton()) {
        console.log("✅ Tombol ke-trigger:", interaction.customId);
        const { customId } = interaction;

        // handle tombol "create_ticket"
        if (customId === "create_ticket") {
          const ticketData = await Ticket.findOne({
            where: { guildId: interaction.guild.id },
          });
          if (!ticketData) {
            return interaction.reply({
              content: "❌ | Sistem tiket belum dikonfigurasi.",
              ephemeral: true,
            });
          }

          return await createTicket(interaction, ticketData);
        }

        const ticketData = await Ticket.findOne({
          where: { channelId: interaction.channel.id },
        });
        if (ticketData) {
          switch (customId) {
            case "ticket_claim":
              await claimTicket(interaction);
              break;
            case "ticket_delete":
              await deleteTicket(interaction);
              break;
            case "ticket_transcript":
              await getTranscript(interaction);
              break;
            case "ticket_close":
              await closeTicket(interaction); // nanti kita bikin function ini
              break;
          }
        }
      }
    } catch (err) {
      console.error("❌ Global Interaction Handler Error:", err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "💥 | Ada error saat proses interaksi.",
          ephemeral: true,
        });
      }
    }
  },
};

async function createTicket(interaction, ticketData) {
  // cek apakah user masih punya tiket terbuka
  const existingTicket = await Ticket.findOne({
    where: {
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    },
  });

  if (existingTicket) {
    return await interaction.reply({
      content: `❌ | Kamu masih punya tiket terbuka di <#${existingTicket.channelId}>. Tutup dulu yaa sebelum bikin tiket baru 😋`,
      ephemeral: true,
    });
  }
  console.log("🛠 createTicket() called by:", interaction.user.tag);
  try {
    const newCounter = await TicketCounter.create();
    const ticketNumber = newCounter.id;
    const username = interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8);
    const channelName = `ticket-${username}-${ticketNumber}`;

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: ticketData.staffRoleId,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`🎫 Tiket #${ticketNumber}`)
      .setDescription(
        `haloo ${interaction.user}! tiketmu udah terbuat! tolong tunggu staff <@&${ticketData.staffRoleId}> untuk bantu yaa 🥺💕`
      )
      .setColor(0x00ae86)
      .setTimestamp();

    const ticketButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("❌ Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [ticketButtons],
    });

    await interaction.reply({
      content: `✅ | Tiket telah dibuat : ${ticketChannel}`,
      ephemeral: true,
    });

    const newTicket = new Ticket({
      userId: interaction.user.id,
      channelId: ticketChannel.id,
      guildId: interaction.guild.id,
      ticketNumber: ticketNumber,
      description: "Tiket baru dibuat",
      title: `Tiket #${ticketNumber}`,
      transcriptChannelId: ticketData.transcriptChannelId,
      logsChannelId: ticketData.logsChannelId,
      staffRoleId: ticketData.staffRoleId,
    });

    await newTicket.save();
  } catch (error) {
    console.error("Error saat membuat tiket:", error);
    await interaction.reply({
      content: "❌ | Error terjadi saat mencoba membuat tiket.",
      ephemeral: true,
    });
  }
}
async function closeTicket(interaction) {
  try {
    await interaction.reply({
      content: "🚪 | Tiket akan ditutup dalam 5 detik...",
      ephemeral: true,
    });
    setTimeout(async () => {
      await interaction.channel.delete();
      await Ticket.destroy({
        where: { channelId: interaction.channel.id },
      });
    }, 5000);
  } catch (error) {
    console.error("gagal nutup tiket:", error);
    await interaction.reply({
      content: "❌ | error saat nutup tiket.",
      ephemeral: true,
    });
  }
}
