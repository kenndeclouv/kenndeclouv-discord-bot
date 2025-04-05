const { Events, PermissionsBitField, ChannelType } = require("discord.js");
const Ticket = require("../database/models/ticket"); // Import your Ticket model
const Suggestion = require("../database/models/suggestion"); // Import your Suggestion model

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction && interaction.id) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Check for command permissions
      if (command.permissions) {
        const missingPermissions = command.permissions.filter((permission) => !interaction.guild.members.me.permissions.has(permission));
        if (missingPermissions.length > 0) {
          return await interaction.reply({
            content: `⚠️ | Kamu tidak memiliki permission untuk mengakses command ini: \`${missingPermissions.join(", ")}\`.`,
            ephemeral: true,
          });
        }
      }

      // Additional checks for specific commands
      if (command.name === "mute" || command.name === "unmute") {
        const member = interaction.options.getMember("user");
        if (!member.voice.channel) {
          return await interaction.reply({
            content: `🚫 | The user must be in a voice channel to be ${command.name === "mute" ? "muted" : "unmuted"}.`,
            ephemeral: true,
          });
        }
      }

      try {
        await command.execute(interaction, client); // Pass the client
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "💀 | Ini error yang jarang terjadi di bot.", ephemeral: true });
      }
    } else {
      console.error("Interaksi null atau tidak didefinisikan");
      return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      const { customId } = interaction; // Scope customId within button interaction handling
      const ticketData = await Ticket.findOne({ where: { channelId: interaction.channel.id } });

      // Ticket interactions
      if (ticketData) {
        switch (customId) {
          case "create_ticket":
            await createTicket(interaction, ticketData);
            break;
          case "ticket_claim":
            await claimTicket(interaction); // Implement claimTicket function
            break;
          case "ticket_delete":
            await deleteTicket(interaction); // Implement deleteTicket function
            break;
          case "ticket_transcript":
            await getTranscript(interaction); // Implement getTranscript function
            break;
          default:
            break;
        }
      }
    }
  },
};

async function createTicket(interaction, ticketData) {
  try {
    const userTickets = await Ticket.count({ where: { userId: interaction.user.id, guildId: interaction.guild.id } });
    const ticketNumber = userTickets + 1;
    const channelName = `ticket-${interaction.user.username}-${ticketNumber}`;

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

    await ticketChannel.send({
      content: `Haloo ${interaction.user}! Tiketmu sudah terbuat! Tolong tunggu staff <@&${ticketData.staffRoleId}>, untuk menjawab. `,
    });

    await interaction.reply({ content: `✅ | Tiket dibuat : ${ticketChannel}`, ephemeral: true });

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
    await interaction.reply({ content: "❌ | Error terjadi saat mencoba membuat tiket.", ephemeral: true });
  }
}
