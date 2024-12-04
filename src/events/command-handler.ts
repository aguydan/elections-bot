import { EventHandler } from './index.js';
import { Command } from '@/commands/index.js';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import { CommandUtils, InteractionUtils } from '@/utils/index.js';
import { StateService } from '@/services/state-service.js';

export class CommandHandler implements EventHandler {
    constructor(
        private commands: Command[],
        private stateService: StateService
    ) {}

    public async process(interaction: CommandInteraction | AutocompleteInteraction): Promise<void> {
        //Don't respond to self or other bots
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
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
                console.log(error);
            }

            return;
        }

        //NOTE: Anything after this point we should be responding to the interaction

        //check defer types and if deferred
        //get data from database if needed to record the interaction for example

        try {
            await command.execute(interaction, this.stateService);
        } catch (error) {
            console.log(error);

            const errorEmbed = new EmbedBuilder({
                color: 0xff0000,
                title: 'The voting polls decimated!',
                description:
                    'A terrible tragedy took place that undermines where we stand as a country. Elections will be rescheduled',
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Central Election Commitee',
                },
            });

            InteractionUtils.send(interaction, errorEmbed);
        }
    }
}
