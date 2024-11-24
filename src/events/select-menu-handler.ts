import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuInteraction,
} from 'discord.js';
import { EventHandler } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { CandidatesMenuFactory } from '@/models/menu-factory.js';
import { candidateRepo } from '@/database/database.js';
import { ElectionMetadata } from '@/models/election-metadata.js';

export class SelectMenuHandler implements EventHandler {
    constructor(private electionMetadata: ElectionMetadata) {}

    public async process(interaction: StringSelectMenuInteraction): Promise<void> {
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) {
            return;
        }

        if (interaction.customId.startsWith('elections-menu')) {
            const metadataId = interaction.customId.replace('elections-menu-', '');

            const candidates = await candidateRepo.getAll();
            const candidatesMenuFactory = new CandidatesMenuFactory();
            const candidatesMenu = candidatesMenuFactory.createMenu(candidates, metadataId);
            const candidatesButton = candidatesMenuFactory.createLinkButton(
                `${FRONTEND_PATH}/candidates/create`
            );

            await InteractionUtils.send(interaction, {
                content:
                    'Create a new candidate or choose at least 2 as participants in the election.',
                components: [candidatesButton, candidatesMenu.menu],
            });

            //controllers
        } else if (interaction.customId.startsWith('candidates-menu')) {
            const metadataId = interaction.customId.replace('candidates-menu-', '');

            const holdElectionButton = new ActionRowBuilder<ButtonBuilder>({
                components: [
                    new ButtonBuilder({
                        custom_id: 'hold-election-button-' + metadataId,
                        label: 'Hold election',
                        style: ButtonStyle.Primary,
                    }),
                ],
            });

            await InteractionUtils.send(interaction, {
                components: [holdElectionButton],
            });

            //controllers
        }

        console.log('interacts with select menu', interaction.customId);
    }
}
