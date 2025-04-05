require("dotenv").config();
import { REST, Routes } from "discord.js";
import client from "../client"; // Asumsikan client bot di file terpisah

(async () => {
  try {
    console.log("Memulai pengujian slash command...");

    // Ambil semua slash command yang terdaftar
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
    const commands = await rest.get(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID));

    for (const command of commands) {
      try {
        console.log(`Menguji command: /${command.name}`);

        // Simulasi interaction untuk tiap command
        const mockInteraction = {
          commandName: command.name,
          guildId: "1314236534484112370",
          user: { id: "123456789012345678" },
          options: {
            getString: (name) => null,
            getInteger: (name) => null,
          },
          reply: (response) => {
            console.log(`Response: ${response.content}`);
          },
          deferReply: () => {
            console.log("Interaction deferred.");
          },
        };

        // Emit interactionCreate dengan mockInteraction
        client.emit("interactionCreate", mockInteraction);
        console.log(`Command /${command.name} sukses diuji.`);

        // Cek dan tes subcommands jika ada
        if (command.options) {
          for (const subcommand of command.options) {
            try {
              console.log(`Menguji subcommand: /${command.name} ${subcommand.name}`);

              const mockSubcommandInteraction = {
                commandName: subcommand.name,
                guildId: "1314236534484112370",
                user: { id: "123456789012345678" },
                options: {
                  getString: (name) => null,
                  getInteger: (name) => null,
                },
                reply: (response) => {
                  console.log(`Response subcommand: ${response.content}`);
                },
                deferReply: () => {
                  console.log("Interaction deferred.");
                },
              };

              // Emit interactionCreate untuk subcommand
              client.emit("interactionCreate", mockSubcommandInteraction);
              console.log(`Subcommand /${command.name} ${subcommand.name} sukses diuji`);
            } catch (err) {
              console.error(`Error pada subcommand /${command.name} ${subcommand.name}:`, err);
            }
          }
        }
      } catch (err) {
        console.error(`Error pada command /${command.name}:`, err);
      }
    }
    console.log("Pengujian selesai. total command: ", commands.length);
  } catch (err) {
    console.error("Gagal mengambil command atau melakukan pengujian:", err);
  }
})();
