import { APIEmbed, AttachmentBuilder, ButtonInteraction } from 'discord.js';
import { Button } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { ElectionResultsBuilder } from '@/models/election-results-builder.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { StateName, StateService } from '@/services/state-service.js';
import { RegexUtils } from '@/utils/regex-utils.js';

export class HoldElectionButton implements Button {
    public names = ['hold-election-button'];

    public async execute(prevInteraction: ButtonInteraction, stateService: StateService) {
        const stateId = RegexUtils.getStateId(prevInteraction.customId);

        const loadingEmbed: APIEmbed = {
            color: 0xf0c445,
            title: 'Votes are being counted...',
            description: 'Soon the central election commitee will present the results',
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Central Election Commitee',
            },
        };

        await InteractionUtils.send(prevInteraction, {
            embeds: [loadingEmbed],
        });

        const value = stateService.get(StateName.Election, stateId);
        const { election, candidates } = value;

        if (!election || !candidates) {
            console.log('no election or candidates provided');

            return;
        }

        const { results } = await new ElectionResultsBuilder()
            .getTotalScoresFor(candidates)
            .randomize()
            .normalize()
            .getResults(election)
            .save(election.id);

        stateService.delete(StateName.Election, stateId);

        /*         const { guild } = prevInteraction;

        if (!guild) {
            console.log('no guild');

            return;
        } */

        /*             const members = await guild.members.fetch();
            members
                .filter(v => !v.user.bot)
                .mapValues(v => {
                    v.user.send('Do you accept election results?');
                }); */

        const buffer = await FrontendUtils.getResultsImage(`${FRONTEND_PATH}/results`);

        //everything else here should be based on whether buffer was received or not

        const image = new AttachmentBuilder(buffer ? buffer : 'ddsdsdsddsd', {
            name: 'results.jpg',
        });

        const resultsEmbed: APIEmbed = {
            color: 0xf0c445,
            title: 'The results have arrived!',
            description: JSON.stringify(results),
            timestamp: new Date().toISOString(),
            image: {
                url: `attachment://results.jpg`,
            },
        };

        await InteractionUtils.editReply(prevInteraction, {
            embeds: [resultsEmbed],
            files: [image],
        });
    }
}
