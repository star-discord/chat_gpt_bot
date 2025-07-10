// commands/totusuna_config.js
const fs = require('fs');
const path = require('path');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('設置済みの凸スナ一覧を表示し、内容の確認・編集ができます'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, `../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '❌ 凸スナ設置情報が存在しません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instances = Object.values(json.totsusuna || {});

    if (instances.length === 0) {
      return interaction.reply({ content: '📭 凸スナはまだ設置されていません。', ephemeral: true });
    }

    const rows = [];

    for (const [i, instance] of instances.entries()) {
      const embed = new EmbedBuilder()
        .setTitle(`📌 凸スナ設置情報 #${i + 1}`)
        .setDescription(instance.body?.slice(0, 150) || '（本文未入力）')
        .setColor(0x00bfff)
        .addFields(
          { name: '設置チャンネル', value: `<#${instance.installChannelId}>`, inline: true },
          {
            name: '複製チャンネル',
            value: Array.isArray(instance.replicateChannelIds)
              ? instance.replicateChannelIds.map(id => `<#${id}>`).join('\n') || 'なし'
              : 'なし',
            inline: true,
          },
        )
        .setFooter({ text: `UUID: ${instance.uuid}` });

      const editButton = new ButtonBuilder()
        .setCustomId(`tousuna_edit_button_${instance.uuid}`)
        .setLabel('⚙ 設定を編集')
        .setStyle(ButtonStyle.Secondary);

      const deleteButton = new ButtonBuilder()
        .setCustomId(`tousuna_delete_button_${instance.uuid}`)
        .setLabel('🗑 本文削除')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(editButton, deleteButton);

      rows.push({ embed, row });
    }

    await interaction.reply({ content: `🛠 設置済み凸スナ一覧：${rows.length}件`, ephemeral: true });

    for (const { embed, row } of rows) {
      await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
    }
  },
};
