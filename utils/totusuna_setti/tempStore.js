// utils/totusuna_setti/tempStore.js

const store = new Map();

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {object|null}
 */
function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

/**
 * @param {string} guildId
 * @param {string} userId
 * @param {object} data
 */
function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

module.exports = { get, set };
