// utils/totusuna_setti/buttons/本文削除.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({ content: '⚠️ データファイルが見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (!json.totsusuna || !json.totsusuna[uuid]) {
      return await interaction.reply({ content: '⚠️ 指定された設置は存在しません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const target = json.totsusuna[uuid];

    // メッセージ削除（可能であれば）
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`メッセージ削除に失敗: ${err.message}`);
    }

    // JSONから削除
    delete json.totsusuna[uuid];
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '🗑 本文を削除しました。', flags: InteractionResponseFlags.Ephemeral });
  },
};
