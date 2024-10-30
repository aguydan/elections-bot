import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { candidateRepo, electionRepo } from '@/database/database.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { ElectionUtils } from '@/utils/election-utils.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';

//probably also need to encapsulate creating menus and buttons or just put them in different place
//this all needs error handling, probably externally
//move EMBEDS elsewhere!!!!

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let prevInteraction: ChatInputCommandInteraction | StringSelectMenuInteraction =
            interaction;
        let currInteraction;

        const elections = await electionRepo.getAll();

        const electionsButton = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({
                    label: 'Create election',
                    url: `${FRONTEND_PATH}/elections/create`,
                    style: ButtonStyle.Link,
                }),
            ],
        });

        const electionsMenuId = crypto.randomUUID();

        const electionsMenu = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: electionsMenuId, //probably should be random so that every command sequence is indeoendent
                    placeholder: 'Choose from the existing',
                    options: elections.map(election => {
                        return {
                            value: election.id.toString(),
                            label: election.name,
                        };
                    }),
                }),
            ],
        });

        await InteractionUtils.send(prevInteraction, {
            content: '👑 Create a new election preset or choose an existing one.',
            components: [electionsButton, electionsMenu],
        });

        currInteraction = await prevInteraction.channel?.awaitMessageComponent({
            filter: interaction => interaction.customId === electionsMenuId,
            componentType: ComponentType.StringSelect,
            time: 120000,
        });

        if (!currInteraction?.values.length) {
            console.log('no election id received');
            return;
        }

        const election = await electionRepo.getById(parseInt(currInteraction.values[0]!));

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

        const candidates = await candidateRepo.getAll();

        const candidatesButton = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({
                    label: 'Create candidate',
                    url: `${FRONTEND_PATH}/candidates/create`,
                    style: ButtonStyle.Link,
                }),
            ],
        });

        const candidatesMenu = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'candidatesMenu',
                    placeholder: 'Choose from the existing',
                    options: candidates.map(candidate => {
                        return {
                            value: candidate.id.toString(),
                            label: candidate.name,
                        };
                    }),
                    min_values: 2,
                    max_values: candidates.length,
                }),
            ],
        });

        await InteractionUtils.send(currInteraction, {
            content: 'Create a new candidate or choose at least 2 as participants in the election.',
            components: [candidatesButton, candidatesMenu],
        });

        //we make the current interaction to be the old interaction after every reply to current interaction
        prevInteraction = currInteraction;

        currInteraction = await prevInteraction.channel?.awaitMessageComponent({
            filter: interaction => interaction.customId === 'candidatesMenu',
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
            filter: interaction => interaction.customId === 'holdElectionButton',
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
            //create new interaction with embed for this error
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
        });
    }
}
