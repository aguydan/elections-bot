import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { candidateRepo, electionRepo } from '@/database/database.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { ElectionUtils } from '@/utils/election-utils.js';
import { FrontendUtils } from '@/utils/frontend-utils.js';

//WE NEED EMBEDS!!!!!!
//probably also need to encapsulate creating menus and buttons or just put them in different place
//this all needs error handling, probably externally

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(intr: ChatInputCommandInteraction): Promise<void> {
        const elections = await electionRepo.getAll();

        //button creation

        const createElectionPresetButton = new ButtonBuilder({
            label: 'Create election preset',
            url: `${FRONTEND_PATH}/elections/create`,
            style: ButtonStyle.Link,
        });

        const electionPresetsMenu = new StringSelectMenuBuilder({
            custom_id: 'electionPresets',
            placeholder: 'Choose election preset',
            options: elections.map(election => {
                return {
                    value: election.id.toString(),
                    label: election.name,
                };
            }),
        });

        const buttonRow = new ActionRowBuilder<ButtonBuilder>({
            components: [createElectionPresetButton],
        });

        const electionPresetsRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [electionPresetsMenu],
        });

        await InteractionUtils.send(intr, {
            content: 'Create a new election preset or choose one of the existing.',
            components: [buttonRow, electionPresetsRow],
        });

        const menuIntr = await intr.channel?.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: 120000,
        });

        if (!menuIntr?.values.length) {
            console.log('no election id received');
            return;
        }

        const electionId = parseInt(menuIntr.values[0]!);

        await InteractionUtils.editReply(intr, {
            content: 'Hey this is me' + electionId,
            components: [],
        });

        const candidates = await candidateRepo.getAll();

        //button creation

        const createCandidateButton = new ButtonBuilder({
            label: 'Create candidate preset',
            url: `${FRONTEND_PATH}/candidates/create`,
            style: ButtonStyle.Link,
        });

        const candidatesMenu = new StringSelectMenuBuilder({
            custom_id: 'candidates',
            placeholder: 'Choose candidate preset',
            options: candidates.map(candidate => {
                return {
                    value: candidate.id.toString(),
                    label: candidate.name,
                };
            }),
            min_values: 2,
            max_values: candidates.length,
        });

        const buttonRow2 = new ActionRowBuilder<ButtonBuilder>({
            components: [createCandidateButton],
        });

        const candidatesRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [candidatesMenu],
        });

        await InteractionUtils.send(menuIntr, {
            content: 'Create a new candidate or choose at least 2 as participants in the election.',
            components: [buttonRow2, candidatesRow],
        });

        const candidatesIntr = await menuIntr.channel?.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: 120000,
        });

        if (!candidatesIntr?.values.length) {
            console.log('no values received');
            return;
        }

        const participantIds = candidatesIntr.values;

        await InteractionUtils.editReply(menuIntr, {
            content: 'Chosen candidates = ' + participantIds,
            components: [],
        });

        //hold election button

        const holdElectionButton = new ButtonBuilder({
            custom_id: 'holdElectionButton',
            label: 'Hold election',
            style: ButtonStyle.Primary,
        });

        const buttonRow3 = new ActionRowBuilder<ButtonBuilder>({
            components: [holdElectionButton],
        });

        await InteractionUtils.send(candidatesIntr, {
            components: [buttonRow3],
        });

        //hold election sequence

        const buttonIntr = await candidatesIntr.channel?.awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 120000,
        });

        if (!buttonIntr) {
            console.log(buttonIntr);
            return;
        }

        const countingEmbed = new EmbedBuilder({
            title: 'Votes are being counted...',
            description: 'Soon the central election commitee will present the results',
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Central Election Commitee',
            },
        });

        await InteractionUtils.send(buttonIntr, countingEmbed);

        //we probably shouldn't even do this since we have an array of candidates queried some lines before
        const promises = participantIds.map(id => candidateRepo.getById(parseInt(id)));
        const participants = await Promise.all(promises);

        //percentages for each candidate
        const percentages = ElectionUtils.getIndividualPercentages(participants);

        const election = await electionRepo.getById(electionId);

        //getIndividualVotes would be more logical and coherent
        const votes = ElectionUtils.getTotalVotes(election);
        await ElectionUtils.saveResults(electionId, percentages, votes);

        const buffer = await FrontendUtils.getResultsImage(`${FRONTEND_PATH}/results`);
        const image = new AttachmentBuilder(buffer, { name: 'results.jpg' });

        const resultsEmbed = new EmbedBuilder({
            title: 'The results have arrived!',
            description: JSON.stringify(percentages),
            timestamp: new Date().toISOString(),
            image: {
                url: `attachment://results.jpg`,
            },
            footer: {
                text: 'Central Election Commitee',
            },
        });

        await InteractionUtils.send(buttonIntr, {
            embeds: [resultsEmbed],
            files: [image],
        });
    }
}
