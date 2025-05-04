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
    const args = {
      candidateId: interaction.options.getInteger('candidate', true),
      scoreParameter: interaction.options.getString('score_parameter', true),
      operation: interaction.options.getString('operation', true),
      value: interaction.options.getInteger('value'),
    };

    const { score } = await candidateRepo.getById(args.candidateId);

    let prev = score[args.scoreParameter];

    if (prev == undefined) {
      throw new Error('No such score parameter: ' + args.scoreParameter);
    }

    const changeValue = args.value ? args.value / 100 : this._changeValue;

    switch (args.operation) {
      case '+':
        prev += changeValue;

        break;
      case '-':
        prev -= changeValue;

        break;
      default:
        break;
    }

    score[args.scoreParameter] = parseFloat(
      Math.max(0, Math.min(prev, 100)).toFixed(2)
    );

    await candidateRepo.updateScore(args.candidateId, score);

    await InteractionUtils.send(interaction, {
      content:
        'we changed ' +
        args.scoreParameter +
        ' ' +
        args.operation +
        ' ' +
        args.value,
    });
  }

  public async autocomplete(
    _: AutocompleteInteraction,
    option: AutocompleteFocusedOption
  ): Promise<ApplicationCommandOptionChoiceData[]> {
    const data = await candidateRepo.searchByName(option.value);

    return data.map((candidate) => {
      return { name: candidate.name, value: candidate.id };
    });
  }
}
