// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { readJSON, writeJSON, ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用のロール設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const filePath = ensureGuildJSON(guildId);
    const data = readJSON(filePath);

    // ロールセレクトメニュー（最大5個まで）
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
      .setMinValues(1)
      .setMaxValues(10);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '👤 管理者ロールを選択してください（複数可）',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    // コンポーネント応答を待機（30秒）
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.RoleSelect,
      time: 30000,
      max: 1,
    });

    collector.on('collect', async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return await selectInteraction.reply({
          content: '❌ この操作はコマンドを実行したユーザーのみが行えます。',
          flags: MessageFlags.Ephemeral,
        });
      }

      const selectedRoleIds = selectInteraction.values;

      if (!data.star_config) data.star_config = {};
      data.star_config.adminRoleIds = selectedRoleIds;

      try {
        writeJSON(filePath, data);
      } catch (err) {
        console.error('❌ JSON保存失敗:', err);
        return await selectInteraction.reply({
          content: '❌ ロールの保存に失敗しました。',
          flags: MessageFlags.Ephemeral,
        });
      }

      console.log(`🛠️ ${interaction.guild.name} (${guildId}) の管理者ロールを更新: ${selectedRoleIds.join(', ')}`);

      await selectInteraction.update({
        content: `✅ 管理者ロールを設定しました: ${selectedRoleIds.map(id => `<@&${id}>`).join(', ')}`,
        components: [],
      });
    });

    collector.on('end', async collected => {
      if (collected.size === 0 && interaction.replied) {
        await interaction.editReply({
          content: '⏱️ 時間切れのためロール設定はキャンセルされました。',
          components: [],
        });
      }
    });
  }
};

