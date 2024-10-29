import { EventHandler } from './index.js';
import { Command } from '@/commands/index.js';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import { CommandUtils, InteractionUtils } from '@/utils/index.js';

export class CommandHandler implements EventHandler {
    constructor(private commands: Command[]) {}

    public async process(intr: CommandInteraction | AutocompleteInteraction): Promise<void> {
        //Don't respond to self or other bots
        if (intr.user.id === intr.client.user.id || intr.user.bot) {
            return;
        }

        const commandParts =
            intr instanceof ChatInputCommandInteraction || intr instanceof AutocompleteInteraction
                ? ([
                      intr.commandName,
                      intr.options.getSubcommandGroup(false),
                      intr.options.getSubcommand(false),
                  ].filter(Boolean) as string[])
                : [intr.commandName];
        const commandName = commandParts.join(' ');

        const command = CommandUtils.findCommand(this.commands, commandParts);

        if (!command) {
            console.log('command not found', commandName, commandParts);
            return;
        }

        if (intr instanceof AutocompleteInteraction) {
            if (!command.autocomplete) {
                console.log('autocomplete not found');
                return;
            }

            try {
                const option = intr.options.getFocused(true);
                const choices = await command.autocomplete(intr, option);
                InteractionUtils.respond(intr, choices?.slice(0, 25));
            } catch (error) {
                console.log(error);
            }

            return;
        }

        //NOTE: Anything after this point we should be responding to the interaction

        //check defer types and if deferred
        //get data from database if needed to record the interaction for example

        try {
            await command.execute(intr);
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

            InteractionUtils.send(intr, errorEmbed);
        }
    }
}
