import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { EventHandler } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { CandidatesMenuFactory } from '@/models/menu-factory.js';
import { candidateRepo } from '@/database/database.js';
import { ElectionMetadata } from '@/models/election-metadata.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { CollectorUtils } from '@/utils/collector-utils.js';

export class SelectMenuHandler implements EventHandler {
    public async process(
        prevInteraction: StringSelectMenuInteraction,
        metadata: ElectionMetadata
    ): Promise<void> {
        if (
            prevInteraction.user.id === prevInteraction.client.user.id ||
            prevInteraction.user.bot
        ) {
            return;
        }

        if (prevInteraction.customId.startsWith('elections-menu')) {
            const metadataId = prevInteraction.customId.replace('elections-menu-', '');

            const candidates = await candidateRepo.getAll();
            const menuFactory = new CandidatesMenuFactory();
            const menu = menuFactory.createMenu(candidates, metadataId);
            const button = menuFactory.createLinkButton(`${FRONTEND_PATH}/candidates/create`);

            await InteractionUtils.send(prevInteraction, {
                content:
                    'Create a new candidate or choose at least 2 as participants in the election.',
                components: [button, menu.menu],
            });

            const { channel } = prevInteraction;
            if (!channel) throw new Error("Channel doesn't exist'");

            const dashCommandCollector = CollectorUtils.createDashCommandCollector(
                channel,
                '-cancel',
                async () => {
                    delete metadata[metadataId];

                    await InteractionUtils.editReply(prevInteraction, {
                        content: 'COMMAND CANCELLED',
                        components: [],
                    });
                }
            );

            const menuCollector = CollectorUtils.createComponentCollector(
                prevInteraction,
                menu.id,
                ComponentType.StringSelect,
                async interaction => {
                    const participants = candidates.filter(candidate =>
                        interaction.values.includes(candidate.id.toString())
                    )!;

                    //to a different function??
                    const data = metadata[metadataId];

                    if (!data) {
                        metadata[metadataId] = { participants, election: null };
                    } else {
                        data.participants = participants;
                        metadata[metadataId] = data;
                    }

                    console.log(metadata);

                    const participantsEmbed = new EmbedBuilder({
                        description: 'Hello' + participants,
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
                }
            );

            const manager = new CollectorManager();
            manager.init(dashCommandCollector);
            manager.init(menuCollector);
        } else if (prevInteraction.customId.startsWith('candidates-menu')) {
            const metadataId = prevInteraction.customId.replace('candidates-menu-', '');

            //maybe buttons also need a constructor
            const buttonId = 'hold-election-button-' + metadataId;

            const holdElectionButton = new ActionRowBuilder<ButtonBuilder>({
                components: [
                    new ButtonBuilder({
                        custom_id: buttonId,
                        label: 'Hold election',
                        style: ButtonStyle.Primary,
                    }),
                ],
            });

            await InteractionUtils.send(prevInteraction, {
                components: [holdElectionButton],
            });

            const { channel } = prevInteraction;
            if (!channel) throw new Error("Channel doesn't exist'");

            const dashCommandCollector = CollectorUtils.createDashCommandCollector(
                channel,
                '-cancel',
                async () => {
                    delete metadata[metadataId];

                    await InteractionUtils.editReply(prevInteraction, {
                        content: 'COMMAND CANCELLED',
                        components: [],
                    });
                }
            );

            const buttonCollector = CollectorUtils.createComponentCollector(
                prevInteraction,
                buttonId,
                ComponentType.Button
            );

            const manager = new CollectorManager();
            manager.init(dashCommandCollector);
            manager.init(buttonCollector);
        }

        console.log('interacts with select menu', prevInteraction.customId);
    }
}
