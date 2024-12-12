const { sendAddRolesMessage, handleAddRolesInteraction } = require("./startup/addroles");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const { sendHomeMessage, handleHomeInteraction } = require("./startup/home");
const { sendRoleInfoMessage } = require("./startup/roleinfo");
const { sendRulesMessage } = require("./startup/rules");
const sequelize = require("./database/sequelize");
const automodLogic = require("./automodLogic");
const figlet = require("figlet");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers],
});
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
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const deployCommands = async () => {
  try {
    console.log("🌀 Memulai refresh perintah aplikasi (/)");

    const commands = [];
    fs.readdirSync(commandsPath).forEach((category) => {
      const commandFiles = fs.readdirSync(`${commandsPath}/${category}`).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`${commandsPath}/${category}/${file}`);
        commands.push(command.data.toJSON());
      }
    });
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Berhasil refresh perintah aplikasi (/)");
  } catch (error) {
    console.error("❌ Gagal refresh perintah aplikasi (/):", error);
  }
};
// ONCE READY DEPLOY COMMANDS
client.once("ready", async () => {
  await deployCommands();

  if (process.env.HOME_STARTUP === "true") {
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
});
// BOT LOGIN
client.login(process.env.TOKEN);
