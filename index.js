const { sendAddRolesMessage, handleAddRolesInteraction } = require("./startup/addroles");
const { Collection, REST, Routes, EmbedBuilder } = require("discord.js");
const { sendHomeMessage, handleHomeInteraction } = require("./startup/home");
const { sendRoleInfoMessage } = require("./startup/roleinfo");
const { sendRulesMessage } = require("./startup/rules");
const sequelize = require("./database/sequelize");
const { UserPet } = require("./database/models");
const automodLogic = require("./automodLogic");
const User = require("./database/models/User");
const client = require("./client");
const figlet = require("figlet");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

// GREETING
figlet("KENNDECLOUV's BOT", "Larry 3D", (err, data) => {
  if (err) {
    console.log("Ada yang salah dengan figlet...");
    console.dir(err);
    return;
  }
  console.log(data);
});
// COMMANDS HANDLER
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((category) => {
  const envVarName = `${category.toUpperCase()}_ON`;
  if (process.env[envVarName] === "true") {
    const commandFiles = fs.readdirSync(path.join(commandsPath, category)).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, category, file));
      client.commands.set(command.data.name, command);
    }
    console.log(`${category} enabled`);
  } else {
    console.log(`${category} disabled`);
  }
});
// EVENTS HANDLER
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach((file) => {
  const event = require(`${eventsPath}/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
    console.log(`${event.name} enabled`);
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
    console.log(`${event.name} enabled`);
  }
});
// AUTOMOD
client.on("messageCreate", automodLogic);

// DATABASE CONNECTION
sequelize.sync().then(() => {
  console.log("Database & table telah dibuat!");
});

// DEPLOY COMMANDS
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
const deployCommands = async () => {
  try {
    console.log("🌀 Memulai refresh perintah aplikasi (/)");

    const commands = [];
    fs.readdirSync(commandsPath).forEach((category) => {
      const envVarName = `${category.toUpperCase()}_ON`;
      if (process.env[envVarName] === "true") {
        const commandFiles = fs.readdirSync(`${commandsPath}/${category}`).filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
          const command = require(`${commandsPath}/${category}/${file}`);
          commands.push(command.data.toJSON());
          console.log(`komen yang diload: ${command.data.name}`);
        }
      }
    });
    await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), { body: commands });
    console.log("✅ Berhasil refresh perintah aplikasi (/)");
  } catch (error) {
    console.error("❌ Gagal refresh perintah aplikasi (/):", error);
  }
};
// ONCE READY DEPLOY COMMANDS
client.once("ready", async () => {
  await deployCommands();

  if (process.env.STARTUP === "true") {
    try {
      const HomeChannel = client.channels.cache.get(process.env.HOME_CHANNEL);
      const RulesChannel = client.channels.cache.get(process.env.RULES_CHANNEL);
      const RoleInfoChannel = client.channels.cache.get(process.env.ROLEINFO_CHANNEL);
      const AddRolesChannel = client.channels.cache.get(process.env.ADDROLES_CHANNEL);
      sendHomeMessage(HomeChannel);
      sendRoleInfoMessage(RoleInfoChannel);
      sendAddRolesMessage(AddRolesChannel);
      sendRulesMessage(RulesChannel);
      console.log("✅ server startup suksesss");
    } catch (error) {
      console.error("❌ Error saat mengirim pesan startup:", error);
    }
  }
  client.on("interactionCreate", handleHomeInteraction, handleAddRolesInteraction);

  // pet status update
  setInterval(async () => {
    try {
      const pets = await UserPet.findAll(); // mengambil semua user pet

      for (const pet of pets) {
        // update kelaparan, kebahagiaan, dan kesehatan
        pet.hunger = Math.max(pet.hunger - 5, 0); // kelaparan berkurang tiap interval
        pet.happiness = Math.max(pet.happiness - 10, 0); // kebahagiaan berkurang lebih lambat

        if (pet.hunger <= 0 && pet.happiness <= 0 && !pet.isDead) {
          pet.isDead = true;

          // cari user berdasarkan userId pet
          const user = await User.findOne({ where: { userId: pet.userId, isDead: false } });

          if (user) {
            const embed = new EmbedBuilder().setTitle("💀 Pet Kamu Telah Mati!").setDescription(`Pet kamu telah mati karena kelaparan!`).setColor("Red");

            try {
              // kirim pesan langsung ke user
              const discordUser = await client.users.fetch(user.userId);
              await discordUser.send({ embeds: [embed] });
            } catch (sendErr) {
              console.error(`gagal mengirim pesan ke user ${user.userId}:`, sendErr);
            }
          }
        }

        await pet.save();
      }

      console.log("Pet status updated!");
    } catch (err) {
      console.error("Error updating pet status:", err);
    }
  }, 60 * 60 * 1000); // 1 jam
});
// BOT LOGIN
client.login(process.env.DISCORD_BOT_TOKEN);
