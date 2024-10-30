import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { candidateRepo } from '@/database/database.js';
import { CandidateScore } from '@/database/schema/candidate.js';

export class ScoreCommand implements Command {
    public names = ['score'];

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        //rename to args or get rid of them, confuse with real options a lot
        const DEFAULT_VALUE = 0.05;

        const args = {
            score_parameter: interaction.options.getString(
                'score_parameter'
            ) as keyof CandidateScore,
            operation: interaction.options.getString('operation'),
            value: interaction.options.getInteger('value'),
        };

        const id = interaction.options.get('candidate')?.value as number | undefined;

        if (!id) {
            throw new Error('no candidate provided');
        }

        const { score } = await candidateRepo.getById(id);

        const prev = score[args.score_parameter];
        const value = args.value ? args.value / 100 : DEFAULT_VALUE;

        if (args.operation == 'increment') {
            score[args.score_parameter] = Number(
                Math.max(0, Math.min(prev + value, 100)).toFixed(2)
            );
        } else {
            score[args.score_parameter] = Number(
                Math.max(0, Math.min(prev - value, 100)).toFixed(2)
            );
        }

        await candidateRepo.updateScore(id, score);

        await InteractionUtils.send(interaction, {
            content: 'we changed ' + args.score_parameter + ' ' + args.operation + ' ' + args.value,
        });
    }

    public async autocomplete(
        _: AutocompleteInteraction,
        option: AutocompleteFocusedOption
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const data = await candidateRepo.searchByName(option.value);

        return data.map(candidate => {
            return { name: candidate.name, value: candidate.id };
        });
    }
}
