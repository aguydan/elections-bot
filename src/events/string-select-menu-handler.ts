import { StringSelectMenuInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { ElectionMetadata } from '@/models/election-metadata.js';
import { StringSelectMenu } from '@/components/menus/index.js';
import { CUSTOM_ID_REGEX } from '@/constants/bot.js';

export class StringSelectMenuHandler implements EventHandler {
    constructor(
        private menus: StringSelectMenu[],
        private metadata: ElectionMetadata
    ) {}

    public async process(interaction: StringSelectMenuInteraction): Promise<void> {
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
            return;
        }

        const match = interaction.customId.match(CUSTOM_ID_REGEX);

        if (!match) {
            throw new Error('Invalid menu id for: ' + interaction.customId);
        }

        const [menuId, metadataId] = match.slice(1);

        if (!menuId || !metadataId) {
            throw new Error('Something wrong with regex');
        }

        const menu = this.menus.find(menu => menu.ids.includes(menuId));

        if (!menu) {
            throw new Error('no menu with id: ' + menuId);
        }

        await menu.execute(interaction, this.metadata, metadataId);

        console.log('interacts with select menu', interaction.customId);
    }
}
