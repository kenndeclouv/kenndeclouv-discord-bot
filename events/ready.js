require("dotenv").config();
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} terhubung!`);
    client.user.setPresence({ activities: [{ name: process.env.SET_ACTIVITY }], status: process.env.SET_STATUS });
  },
};
