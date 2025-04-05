function checkPermission(user) {
  const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
  if (!adminRoleId) {
    throw new Error("DISCORD_ADMIN_ROLE_ID tidak disetting.");
  }

  return user.roles.cache.has(adminRoleId);
}

module.exports = checkPermission;