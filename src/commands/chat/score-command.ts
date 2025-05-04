import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { candidateRepo } from '@/database/database.js';

export class ScoreCommand implements Command {
  public name = 'score';

  private _changeValue = 0.05;

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const candidateId = interaction.options.getInteger('candidate', true);
    const scoreParameter = interaction.options.getString(
      'score_parameter',
      true
    );
    const operation = interaction.options.getString('operation', true);
    const value = interaction.options.getInteger('value');

    const { score } = await candidateRepo.getById(candidateId);

    let prev = score[scoreParameter];

    if (prev === undefined) {
      await InteractionUtils.send(interaction, 'No such parameter.');

      return;
    }

    const changeValue = value ? value / 100 : this._changeValue;

    switch (operation) {
      case '+':
        prev += changeValue;

        break;
      case '-':
        prev -= changeValue;

        break;
      default:
        break;
    }

    score[scoreParameter] = parseFloat(
      Math.max(0, Math.min(prev, 100)).toFixed(2)
    );

    await candidateRepo.updateScore(candidateId, score);

    await InteractionUtils.send(interaction, {
      content: 'we changed ' + scoreParameter + ' ' + operation + ' ' + value,
    });
  }

  public async autocomplete(
    _: AutocompleteInteraction,
    option: AutocompleteFocusedOption
  ): Promise<ApplicationCommandOptionChoiceData[]> {
    const data = await candidateRepo.searchByName(option.value);

    return data.map((candidate) => ({
      name: candidate.name,
      value: candidate.id,
    }));
  }
}
