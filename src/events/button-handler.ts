import { ButtonInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { Button } from '@/components/buttons/index.js';
import { StateService } from '@/services/state-service.js';
import { RegexUtils } from '@/utils/regex-utils.js';

export class ButtonHandler implements EventHandler {
  constructor(
    private buttons: Button[],
    private stateService: StateService
  ) {}

  public async process(interaction: ButtonInteraction): Promise<void> {
    if (
      interaction.user.id === interaction.client.user.id ||
      interaction.user.bot
    ) {
      return;
    }

    const buttonName = RegexUtils.getComponentName(interaction.customId);

    if (!buttonName) {
      throw new Error('Invalid component name');
    }

    const button = this.buttons.find((button) => button.name === buttonName);

    if (!button) {
      throw new Error('No button with the ID: ' + buttonName);
    }

    await button.handle(interaction, this.stateService);

    console.log('Interacts with the button: ' + interaction.customId);
  }
}
