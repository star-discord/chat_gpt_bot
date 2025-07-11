const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_setti:編集:',

  /**
   * 凸スナ本文編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    const uuid = customId.replace(this.customIdStart, '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ データが存在しません。',
        ephemeral: true
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const target = json.totusuna?.instances?.[uuid];

    if (!target) {
      return await interaction.reply({
        content: '⚠ 該当する凸スナが見つかりません。',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`totusuna_edit_modal:${uuid}`)
      .setTitle('📘 凸スナ本文の編集');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  }
};

