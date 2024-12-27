import { APIEmbed, AttachmentBuilder, ButtonInteraction } from 'discord.js';
import { Button } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { ElectionResultsBuilder } from '@/models/election-results-builder.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { StateName, StateService } from '@/services/state-service.js';
import { RegexUtils } from '@/utils/regex-utils.js';
import { API_PATH } from '@/constants/api.js';
import { i18n } from '@/utils/i18n.js';

export class HoldElectionButton implements Button {
    public names = ['hold-election-button'];

    public async execute(prevInteraction: ButtonInteraction, stateService: StateService) {
        const stateId = RegexUtils.getStateId(prevInteraction.customId);

        const loadingImage = new AttachmentBuilder(`${API_PATH}/embeds/counting-ballots.gif`);

        const loadingEmbed: APIEmbed = {
            color: 0xf0c445,
            title: i18n.__('embeds.countingBallots.title'),
            description: i18n.__('embeds.countingBallots.description'),
            author: {
                name: i18n.__('election.commission'),
            },
            image: {
                url: 'attachment://counting-ballots.gif',
            },
            timestamp: new Date().toISOString(),
        };

        await InteractionUtils.send(prevInteraction, {
            embeds: [loadingEmbed],
            files: [loadingImage],
        });

        const value = stateService.get(StateName.Election, stateId);
        const { election, candidates } = value;

        if (!election || !candidates) {
            throw new Error(
                i18n.__mf('errors.stateLacksData', {
                    state: StateName.Election,
                    value: JSON.stringify(value),
                })
            );
        }

        const builder = await new ElectionResultsBuilder()
            .getTotalScoresFor(candidates)
            .randomize()
            .normalize()
            .getResults(election)
            .save(election.id);

        const results = builder.sortBy('percentage');

        const withResults = results.map(result => {
            const [id, data] = result;
            const candidate = candidates.find(candidate => candidate.id === parseInt(id));

            if (!candidate) {
                throw new Error('No result data for a candidate with id: ' + id);
            }

            return {
                ...candidate,
                ...data,
            };
        });

        //???????
        /*         if (tookPart.length < 2) {
            throw new Error('This shouldnt even happen');
        } */

        const winner = withResults[0]!;
        const losers = withResults.slice(1);

        stateService.delete(StateName.Election, stateId);

        /* 
            this is for sending a message to guild members about whether they want to challenge the results or not

            const { guild } = prevInteraction;

            if (!guild) {
                console.log('no guild');

                return;
            }

            const members = await guild.members.fetch();
            members
                .filter(v => !v.user.bot)
                .mapValues(v => {
                    v.user.send('Do you accept election results?');
                });
        */
        const buffer = await FrontendUtils.getResultsImage(`${FRONTEND_PATH}/results`);

        //everything else here should be based on whether buffer was received or not
        let resultsEmbed: APIEmbed;

        if (buffer) {
            const image = new AttachmentBuilder(buffer, {
                name: 'results.jpg',
            });

            resultsEmbed = {
                color: Number('0x' + winner.color.slice(1)),
                title: i18n.__('embeds.results.title'),
                description: i18n.__('embeds.results.withImage.description', {
                    winner: winner.name,
                }),
                author: {
                    name: i18n.__('election.commission'),
                },
                image: {
                    url: 'attachment://results.jpg',
                },
                timestamp: new Date().toISOString(),
            };

            await InteractionUtils.editReply(prevInteraction, {
                embeds: [resultsEmbed],
                files: [image],
            });
        } else {
            resultsEmbed = {
                color: Number('0x' + winner.color.slice(1)),
                title: i18n.__('embeds.results.title'),
                description: i18n.__('embeds.results.withoutImage.description'),
                fields: [
                    {
                        name: i18n.__('winner'),
                        value: `**${winner.name}** ${winner.percentage.toFixed(2)}% (${winner.popularVote} votes)`,
                        inline: false,
                    },
                    ...losers.map(loser => ({
                        name: i18n.__('loser'),
                        value: `**${loser.name}** ${loser.percentage.toFixed(2)}% (${loser.popularVote} votes)`,
                        inline: true,
                    })),
                ],
                author: {
                    name: i18n.__('election.commission'),
                },
                timestamp: new Date().toISOString(),
            };

            await InteractionUtils.editReply(prevInteraction, {
                embeds: [resultsEmbed],
                files: [],
            });
        }
    }
}
