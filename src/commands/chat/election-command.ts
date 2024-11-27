import { ChatInputCommandInteraction, ComponentType, EmbedBuilder } from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { ElectionsMenuFactory } from '@/models/menu-factory.js';
import { electionRepo } from '@/database/database.js';
import { ElectionMetadata } from '@/models/election-metadata.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { CollectorUtils } from '@/utils/collector-utils.js';

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(
        prevInteraction: ChatInputCommandInteraction,
        metadata: ElectionMetadata
    ): Promise<void> {
        const metadataId = crypto.randomUUID();

        const elections = await electionRepo.getAll();
        const menuFactory = new ElectionsMenuFactory();
        const menu = menuFactory.createMenu(elections, metadataId);
        const button = menuFactory.createLinkButton(`${FRONTEND_PATH}/elections/create`);

        await InteractionUtils.send(prevInteraction, {
            content: '👑 Create a new election preset or choose an existing one.',
            components: [button, menu.menu],
        });

        const { channel } = prevInteraction;
        if (!channel) throw new Error("Channel doesn't exist'");

        const dashCommandCollector = CollectorUtils.createDashCommandCollector(
            channel,
            '-cancel',
            async () => {
                delete metadata[metadataId];

                console.log('election command handler, interaction id: ' + prevInteraction.id);

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
                const election = elections.find(
                    election => election.id == Number(interaction.values[0]!)
                )!;

                metadata[metadataId] = { election, participants: null };

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

        const manager = new CollectorManager();
        manager.init(dashCommandCollector);
        manager.init(menuCollector);
    }
}
