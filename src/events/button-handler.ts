import { ButtonInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { ElectionMetadata } from '@/models/election-metadata';
import { Button } from '@/components/buttons/index.js';
import { CUSTOM_ID_REGEX } from '@/constants/bot.js';

export class ButtonHandler implements EventHandler {
    constructor(
        private buttons: Button[],
        private metadata: ElectionMetadata
    ) {}

    public async process(interaction: ButtonInteraction): Promise<void> {
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
            return;
        }

        const match = interaction.customId.match(CUSTOM_ID_REGEX);

        if (!match) {
            throw new Error('Invalid button id for: ' + interaction.customId);
        }

        const [buttonId, metadataId] = match.slice(1);

        if (!buttonId || !metadataId) {
            throw new Error('Something wrong with regex');
        }

        const button = this.buttons.find(button => button.ids.includes(buttonId));

        if (!button) {
            throw new Error('no button with id: ' + buttonId);
        }

        //try catch???
        await button.execute(interaction, this.metadata, metadataId);
    }
}
