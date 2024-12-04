import { ButtonInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { Button } from '@/components/buttons/index.js';
import { StateService } from '@/services/state-service.js';
import { UUID_REGEX } from '@/constants/bot.js';

export class ButtonHandler implements EventHandler {
    constructor(
        private buttons: Button[],
        private stateService: StateService
    ) {}

    public async process(interaction: ButtonInteraction): Promise<void> {
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
            return;
        }

        const buttonName = interaction.customId.replace(UUID_REGEX, '');

        if (!buttonName) {
            throw new Error('invalid component name');
        }

        const button = this.buttons.find(button => button.ids.includes(buttonName));

        if (!button) {
            throw new Error('no button with id: ' + buttonName);
        }

        //try catch???
        await button.execute(interaction, this.stateService);
    }
}
