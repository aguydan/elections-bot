import { APIEmbed, AttachmentBuilder, ButtonInteraction } from 'discord.js';
import { Button } from './index.js';
import { ElectionMetadata } from '@/models/election-metadata.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { ElectionResultsBuilder } from '@/models/election-results-builder.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';

export class HoldElectionButton implements Button {
    public ids = ['hold-election-button'];

    public async execute(
        prevInteraction: ButtonInteraction,
        metadata: ElectionMetadata,
        metadataId: string
    ) {
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

        const data = metadata[metadataId];

        if (!data) {
            console.log('no metadata with uuid: ' + metadataId);
            return;
        }

        const { election, candidates } = data;

        if (!election || !candidates) {
            console.log('no election or candidates provided');
            return;
        }

        const results = (
            await new ElectionResultsBuilder()
                .getTotalScoresFor(candidates)
                .randomize()
                .normalize()
                .getResults(election)
                .save(election.id)
        ).results;

        delete metadata[metadataId];

        const { guild } = prevInteraction;

        if (!guild) {
            console.log('no guild');

            return;
        }

        /*             const members = await guild.members.fetch();
            members
                .filter(v => !v.user.bot)
                .mapValues(v => {
                    v.user.send('Do you accept election results?');
                }); */

        const buffer = await FrontendUtils.getResultsScreenshot(`${FRONTEND_PATH}/results`);
        const image = new AttachmentBuilder(buffer, { name: 'results.jpg' });

        const resultsEmbed: APIEmbed = {
            color: 0xf0c445,
            title: 'The results have arrived!',
            description: JSON.stringify(results),
            timestamp: new Date().toISOString(),
            image: {
                url: `attachment://results.jpg`,
            },
            footer: {
                text: 'Central Election Commitee',
            },
        };

        await InteractionUtils.editReply(prevInteraction, {
            embeds: [resultsEmbed],
            files: [image],
        });
    }
}
