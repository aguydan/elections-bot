import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { ElectionUtils } from '@/utils/election-utils.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';
import { CandidatesMenuFactory, ElectionsMenuFactory } from '@/models/menu-factory.js';
import { electionRepo } from '@/database/database.js';
import { ElectionMetadata } from '@/models/election-metadata.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { CollectorUtils } from '@/utils/collector-utils.js';

//probably also need to encapsulate creating menus and buttons or just put them in different place
//this all needs error handling, probably externally

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(
        prevInteraction: ChatInputCommandInteraction,
        electionMetadata: ElectionMetadata
    ): Promise<void> {
        const metadataId = crypto.randomUUID();

        const elections = await electionRepo.getAll();
        const electionsMenuFactory = new ElectionsMenuFactory();
        const electionsMenu = electionsMenuFactory.createMenu(elections, metadataId);
        const electionsButton = electionsMenuFactory.createLinkButton(
            `${FRONTEND_PATH}/elections/create`
        );

        await InteractionUtils.send(prevInteraction, {
            content: '👑 Create a new election preset or choose an existing one.',
            components: [electionsButton, electionsMenu.menu],
        });

        const { channel } = prevInteraction;
        if (!channel) throw new Error("Channel doesn't exist'");

        const dashCommandCollector = CollectorUtils.createDashCommandCollector(
            channel,
            '-cancel',
            async () => {
                delete electionMetadata[metadataId];

                await InteractionUtils.editReply(prevInteraction, {
                    content: 'COMMAND CANCELLED',
                    components: [],
                });
            }
        );

        const menuCollector = CollectorUtils.createMenuCollector(
            prevInteraction,
            electionsMenu.id,
            async interaction => {
                const election = elections.find(
                    election => election.id == Number(interaction.values[0]!)
                )!;

                electionMetadata[metadataId] = { election };

                const electionEmbed = new EmbedBuilder({
                    title: election.name,
                    description:
                        'The election will take place in the country of ' +
                        election.country +
                        ' on ' +
                        election.date,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Central Election Commitee',
                    },
                });

                await InteractionUtils.editReply(prevInteraction, {
                    content: null,
                    components: [],
                    embeds: [electionEmbed],
                });
            }
        );

        new CollectorManager([dashCommandCollector, menuCollector]).init();

        /*         const messageCollector = channel.createMessageCollector({
            filter: message => message.content.startsWith('-cancel'),
            time: 120_000,
        });

        const componentCollector = channel.createMessageComponentCollector({
            filter: interaction => interaction.customId === electionsMenu.id,
            componentType: ComponentType.StringSelect,
            time: 120_000,
        });

        messageCollector.on('collect', async () => {
            messageCollector.stop();
            componentCollector.stop();
            console.log('both collectors stopped');

            delete electionMetadata[metadataId];

            await InteractionUtils.editReply(prevInteraction, {
                content: 'COMMAND CANCELLED',
                components: [],
            });
        });

        componentCollector.on('collect', async interaction => {
            messageCollector.stop();
            componentCollector.stop();

            const election = elections.find(
                election => election.id == Number(interaction.values[0]!)
            )!;

            //don't forget to delete data on cancelling and on finishing election sequence
            electionMetadata[metadataId] = { election };
            console.log(electionMetadata);

            //encapsulate embeds
            const electionEmbed = new EmbedBuilder({
                title: election.name,
                description:
                    'The election will take place in the country of ' +
                    election.country +
                    ' on ' +
                    election.date,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Central Election Commitee',
                },
            });

            await InteractionUtils.editReply(prevInteraction, {
                content: null,
                components: [],
                embeds: [electionEmbed],
            });

            console.log('both collectors stopped');
        });

        //we don't need these two
        messageCollector.on('end', () => {
            console.log('Message collector ended');
        });

        componentCollector.on('end', () => {
            console.log('Component collector ended');
        }); */

        /*
        const candidatesMenuFactory = new CandidatesMenuFactory();
        const candidates = await candidateRepo.getAll();
        const candidatesMenu = candidatesMenuFactory.createMenu(candidates);
        const candidatesButton = candidatesMenuFactory.createLinkButton(
            `${FRONTEND_PATH}/candidates/create`
        );

        await InteractionUtils.send(currInteraction, {
            content: 'Create a new candidate or choose at least 2 as participants in the election.',
            components: [candidatesButton, candidatesMenu.menu],
        });

        //we make the current prevInteraction to be the old interaction after every reply to current interaction
        prevInteraction = currInteraction;

        currInteraction = await prevInteraction.channel?.awaitMessageComponent({
            filter: prevInteraction => interaction.customId === candidatesMenu.id,
            componentType: ComponentType.StringSelect,
            time: 120000,
        });

        if (!currInteraction?.values.length) {
            console.log('no values received');
            return;
        }

        //we probably shouldn't even do this since we have an array of candidates queried some lines before
        const promises = currInteraction.values.map(id => candidateRepo.getById(parseInt(id)));
        const participants = await Promise.all(promises);

        const participantsEmbed = new EmbedBuilder({
            title: election.name,
            description:
                'The election will take place in the country of ' +
                election.country +
                ' on ' +
                election.date,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Central Election Commitee',
            },
        });

        await InteractionUtils.editReply(prevInteraction, {
            content: null,
            components: [],
            embeds: [participantsEmbed],
        });

        const holdElectionButton = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({
                    custom_id: 'holdElectionButton',
                    label: 'Hold election',
                    style: ButtonStyle.Primary,
                }),
            ],
        });

        await InteractionUtils.send(currInteraction, {
            components: [holdElectionButton],
        });

        prevInteraction = currInteraction;

        //Hold election sequence
        currInteraction = await prevInteraction.channel?.awaitMessageComponent({
            filter: prevInteraction => interaction.customId === 'holdElectionButton',
            componentType: ComponentType.Button,
            time: 120000,
        });

        if (!currInteraction) {
            console.log('button press wasnt registered');
            return;
        }

        const loadingEmbed = new EmbedBuilder({
            title: 'Votes are being counted...',
            description: 'Soon the central election commitee will present the results',
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Central Election Commitee',
            },
        });

        await InteractionUtils.send(currInteraction, loadingEmbed);

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

        await InteractionUtils.editReply(currInteraction, {
            embeds: [resultsEmbed],
            files: [image],
        }); */
    }
}
