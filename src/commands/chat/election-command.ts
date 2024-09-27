import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    StringSelectMenuBuilder,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { candidateRepo, electionRepo } from '@/database/database.js';
import { API_PATH } from '@/constants/api.js';

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(intr: ChatInputCommandInteraction): Promise<void> {
        const elections = await electionRepo.getAll();

        //button creation

        const createElectionPresetButton = new ButtonBuilder({
            label: 'Create election preset',
            url: `${API_PATH}/elections/create`,
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

        if (!menuIntr) {
            return;
        }

        const electionId = menuIntr.values[0]!;

        await InteractionUtils.editReply(intr, {
            content: 'Hey this is me' + electionId,
            components: [],
        });

        const candidates = await candidateRepo.getAll();

        //button creation

        const createCandidateButton = new ButtonBuilder({
            label: 'Create candidate preset',
            url: `${API_PATH}/candidates/create`,
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
            content: 'Create a new election preset or choose one of the existing.',
            components: [buttonRow2, candidatesRow],
        });
    }
}
