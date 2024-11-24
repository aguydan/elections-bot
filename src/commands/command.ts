import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    CommandInteraction,
} from 'discord.js';

export interface Command {
    names: string[];
    execute(interaction: CommandInteraction, data?: Record<string, any>): Promise<void>;
    autocomplete?(
        interaction: AutocompleteInteraction,
        option: AutocompleteFocusedOption
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
