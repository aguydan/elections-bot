import { StringSelectMenuInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { StringSelectMenu } from '@/components/menus/index.js';
import { RegexUtils } from '@/utils/regex-utils.js';
import { StateService } from '@/services/state-service.js';

export class StringSelectMenuHandler implements EventHandler {
  constructor(
    private menus: StringSelectMenu[],
    private stateService: StateService
  ) {}

  public async process(
    interaction: StringSelectMenuInteraction
  ): Promise<void> {
    if (
      interaction.user.id === interaction.client.user.id ||
      interaction.user.bot
    ) {
      return;
    }

    const menuName = RegexUtils.getComponentName(interaction.customId);

    if (!menuName) {
      throw new Error('Invalid component name');
    }

    const menu = this.menus.find((menu) => menu.name === menuName);

    if (!menu) {
      throw new Error('No menu with ID: ' + menuName);
    }

    await menu.handle(interaction, this.stateService);

    console.log('Interacts with the select menu: ' + interaction.customId);
  }
}
