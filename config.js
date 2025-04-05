require("dotenv").config();
const roleReward = [];

Object.keys(process.env).forEach((key) => {
  if (key.startsWith("ROLE_REWARD_LEVEL_")) {
    const level = parseInt(key.replace("ROLE_REWARD_LEVEL_", ""), 10);
    const role = process.env[key];
    if (!isNaN(level) && role) {
      roleReward.push({ level, role });
    }
  }
});

// urutkan dari level kecil ke besar (optional)
roleReward.sort((a, b) => a.level - b.level);

module.exports = {
  roleReward,
};