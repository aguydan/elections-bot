import { AttachmentBuilder, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { EventHandler } from './index.js';
import { ElectionMetadata } from '@/models/election-metadata';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { ElectionUtils } from '@/utils/election-utils.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';

export class ButtonHandler implements EventHandler {
    public async process(
        prevInteraction: ButtonInteraction,
        metadata: ElectionMetadata
    ): Promise<void> {
        if (
            prevInteraction.user.id === prevInteraction.client.user.id ||
            prevInteraction.user.bot
        ) {
            return;
        }

        //probably it should be eventually based on the contents of the metadata and not on custom ids
        if (prevInteraction.customId.startsWith('hold-election-button')) {
            const loadingEmbed = new EmbedBuilder({
                title: 'Votes are being counted...',
                description: 'Soon the central election commitee will present the results',
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Central Election Commitee',
                },
            });

            await InteractionUtils.send(prevInteraction, loadingEmbed);

            const metadataId = prevInteraction.customId.replace('hold-election-button-', '');

            const data = metadata[metadataId];

            if (!data) {
                console.log('no metadata with uuid: ' + metadataId);
                return;
            }

            const { election, participants } = data;

            if (!election || !participants) {
                console.log('no election or participants provided');
                return;
            }

            //normalized and modified for each candidate
            const scores = ElectionUtils.getScores(participants);

            const results = ElectionUtils.getResults(election, scores);
            await ElectionUtils.saveResults(election.id, results);

            const buffer = await FrontendUtils.getResultsScreenshot(`${FRONTEND_PATH}/results`);

            if (!buffer) {
                //create new prevInteraction with embed for this error
                throw new Error('something about suspicions voting results');
            }
            const image = new AttachmentBuilder(buffer, { name: 'results.jpg' });

            const resultsEmbed = new EmbedBuilder({
                title: 'The results have arrived!',
                description: JSON.stringify(results),
                timestamp: new Date().toISOString(),
                image: {
                    url: `attachment://results.jpg`,
                },
                footer: {
                    text: 'Central Election Commitee',
                },
            });

            await InteractionUtils.editReply(prevInteraction, {
                embeds: [resultsEmbed],
                files: [image],
            });
        }
    }
}
