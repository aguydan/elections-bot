import { ActionRowBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder } from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(intr: ChatInputCommandInteraction): Promise<void> {
        const electionPresetsMenu = new StringSelectMenuBuilder({
            custom_id: 'electionPresets',
            placeholder: 'choose the election preset',
            options: [{ value: 'ssss', label: 'dfdffd' }],
        });

        const candidatesMenu = new StringSelectMenuBuilder({
            custom_id: 'candidates',
            placeholder: 'choose the candidates for the election',
            options: [{ value: 'ssss', label: 'dfdffd' }],
        });

        const electionPresetsRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [electionPresetsMenu],
        });
        const candidatesRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [candidatesMenu],
        });

        await InteractionUtils.send(intr, {
            content: 'welcome to our elections!',
            components: [electionPresetsRow, candidatesRow],
        });
    }
}
