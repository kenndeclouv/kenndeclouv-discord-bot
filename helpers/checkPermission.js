function checkPermission(user) {
  const adminRoleId = process.env.ADMIN_ROLE_ID;
  if (!adminRoleId) {
    throw new Error("ADMIN_ROLE_ID is not set in the environment variables.");
  }

  return user.roles.cache.has(adminRoleId);
}

module.exports = checkPermission;