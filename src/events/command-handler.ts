import { EventHandler } from './index.js';
import { Command } from '@/commands/index.js';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
} from 'discord.js';
import { CommandUtils, InteractionUtils } from '@/utils/index.js';
import { StateService } from '@/services/state-service.js';

export class CommandHandler implements EventHandler {
  constructor(
    private commands: Command[],
    private stateService: StateService
  ) {}

  public async process(
    interaction: CommandInteraction | AutocompleteInteraction
  ): Promise<void> {
    if (
      interaction.user.id === interaction.client.user.id ||
      interaction.user.bot
    ) {
      return;
    }

    const commandParts =
      interaction instanceof ChatInputCommandInteraction ||
      interaction instanceof AutocompleteInteraction
        ? ([
            interaction.commandName,
            interaction.options.getSubcommandGroup(false),
            interaction.options.getSubcommand(false),
          ].filter(Boolean) as string[])
        : [interaction.commandName];
    const commandName = commandParts.join(' ');

    const command = CommandUtils.findCommand(this.commands, commandParts);

    if (!command) {
      console.log('command not found', commandName, commandParts);
      return;
    }

    if (interaction instanceof AutocompleteInteraction) {
      if (!command.autocomplete) {
        console.log('autocomplete not found');
        return;
      }

      try {
        const option = interaction.options.getFocused(true);
        const choices = await command.autocomplete(interaction, option);

        InteractionUtils.respond(interaction, choices?.slice(0, 25));
      } catch (error) {
        console.error(error);
      }

      return;
    }

    await command.execute(interaction, this.stateService);
  }
}
