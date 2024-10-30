import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    CommandInteraction,
} from 'discord.js';

export interface Command {
    names: string[];
    execute(interaction: CommandInteraction): Promise<void>;
    autocomplete?(
        interaction: AutocompleteInteraction,
        option: AutocompleteFocusedOption
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
