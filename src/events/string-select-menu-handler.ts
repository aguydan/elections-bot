import { StringSelectMenuInteraction } from 'discord.js';
import { EventHandler } from './index.js';
import { StringSelectMenu } from '@/components/menus/index.js';
import { StateService } from '@/services/state-service.js';
import { RegexUtils } from '@/utils/regex-utils.js';

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
      throw new Error('invalid component name');
    }

    const menu = this.menus.find((menu) => menu.names.includes(menuName));

    if (!menu) {
      throw new Error('no menu with id: ' + menuName);
    }

    //try catch???
    await menu.execute(interaction, this.stateService);

    console.log('interacts with select menu', interaction.customId);
  }
}
