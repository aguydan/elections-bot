import { StateService } from '@/services/state-service.js';
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  CommandInteraction,
} from 'discord.js';

export interface Command {
  name: string;
  execute(
    interaction: CommandInteraction,
    stateService: StateService
  ): Promise<void>;
  autocomplete?(
    interaction: AutocompleteInteraction,
    option: AutocompleteFocusedOption,
    stateService: StateService
  ): Promise<ApplicationCommandOptionChoiceData[]>;
}
