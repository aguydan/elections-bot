import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { ElectionStateService } from '@/models/election-state.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';

// Discards the election
export class DiscardCommand implements Command {
  public name = 'discard';

  public async execute(
    interaction: ChatInputCommandInteraction,
    stateService: ElectionStateService
  ): Promise<void> {
    const stateId = interaction.options.getString('election', true);

    stateService.delete(stateId);

    await InteractionUtils.send(interaction, 'Election discarded!');
  }

  public async autocomplete(
    _interaction: AutocompleteInteraction,
    _option: AutocompleteFocusedOption,
    stateService: ElectionStateService
  ): Promise<ApplicationCommandOptionChoiceData[]> {
    return stateService.keys.map((uuid) => ({ name: uuid, value: uuid }));
  }
}
