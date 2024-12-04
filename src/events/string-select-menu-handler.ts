import { StringSelectMenuInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { StringSelectMenu } from '@/components/menus/index.js';
import { StateService } from '@/services/state-service.js';
import { UUID_REGEX } from '@/constants/bot.js';

export class StringSelectMenuHandler implements EventHandler {
    constructor(
        private menus: StringSelectMenu[],
        private stateService: StateService
    ) {}

    public async process(interaction: StringSelectMenuInteraction): Promise<void> {
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
            return;
        }

        const menuName = interaction.customId.replace(UUID_REGEX, '');

        if (!menuName) {
            throw new Error('invalid component name');
        }

        const menu = this.menus.find(menu => menu.ids.includes(menuName));

        if (!menu) {
            throw new Error('no menu with id: ' + menuName);
        }

        //try catch???
        await menu.execute(interaction, this.stateService);

        console.log('interacts with select menu', interaction.customId);
    }
}
