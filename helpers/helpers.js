const isEnabled = (val) =>
  ["true", "1", "yes"].includes((val || "").toLowerCase());

module.exports = { isEnabled };
