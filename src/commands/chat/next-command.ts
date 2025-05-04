import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { ElectionStateService } from '@/models/election-state.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';

// Advances the election to the next stage
export class NextCommand implements Command {
  public name = 'next';

  public async execute(
    interaction: ChatInputCommandInteraction,
    stateService: ElectionStateService
  ): Promise<void> {
    const stateId = interaction.options.getString('election', true);

    await InteractionUtils.send(interaction, 'replied', true);

    //emit event to dispatch first callback
    stateService.nextStep(stateId, true);
  }

  public async autocomplete(
    _interaction: AutocompleteInteraction,
    _option: AutocompleteFocusedOption,
    stateService: ElectionStateService
  ): Promise<ApplicationCommandOptionChoiceData[]> {
    return stateService.keys.map((uuid) => ({ name: uuid, value: uuid }));
  }
}
