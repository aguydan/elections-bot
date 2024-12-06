import {
    APIEmbed,
    AttachmentBuilder,
    ChatInputCommandInteraction,
    ComponentType,
} from 'discord.js';
import { Command } from '../index.js';
import { InteractionUtils } from '@/utils/index.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { ElectionsMenuFactory } from '@/models/menu-factory.js';
import { electionRepo } from '@/database/database.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { CollectorUtils } from '@/utils/collector-utils.js';
import { i18n } from '@/utils/i18n.js';
import { API_PATH, UPLOADS_PATH } from '@/constants/api.js';
import { StateName, StateService } from '@/services/state-service.js';

export class ElectionCommand implements Command {
    public names = ['election'];

    public async execute(
        prevInteraction: ChatInputCommandInteraction,
        stateService: StateService
    ): Promise<void> {
        const stateId = crypto.randomUUID();

        //try catch if api isnt responding
        const elections = await electionRepo.getAll();
        const menuFactory = new ElectionsMenuFactory();
        const menu = menuFactory.createMenu(elections, stateId);
        const button = menuFactory.createLinkButton(`${FRONTEND_PATH}/elections/create`);

        const thumbnail = new AttachmentBuilder(`${API_PATH}/embeds/roman-election.jpg`);

        const pickElectionEmbed: APIEmbed = {
            color: 0xf0c445,
            title: i18n.__('embeds.pickElection.title'),
            description: i18n.__('embeds.pickElection.description'),
            author: {
                name: i18n.__('election.commission'),
            },
            thumbnail: {
                url: 'attachment://roman-election.jpg',
            },
            timestamp: new Date().toISOString(),
        };

        await InteractionUtils.send(prevInteraction, {
            embeds: [pickElectionEmbed],
            components: [button, menu.menu],
            files: [thumbnail],
        });

        const { channel } = prevInteraction;
        if (!channel) {
            throw new Error(i18n.__mf('errors.noChannel', { id: prevInteraction.id }));
        }

        const dashCommandCollector = CollectorUtils.createDashCommandCollector(
            channel,
            '-cancel',
            async () => {
                stateService.delete(StateName.Election, stateId);

                await InteractionUtils.editReply(prevInteraction, {
                    content: i18n.__('dashCommands.cancel'),
                    embeds: [],
                    components: [],
                    files: [],
                });
            }
        );

        const menuCollector = CollectorUtils.createComponentCollector(
            prevInteraction,
            menu.id,
            ComponentType.StringSelect,
            async interaction => {
                const election = elections.find(
                    election => election.id == parseInt(interaction.values[0]!)
                )!;

                stateService.set(StateName.Election, stateId, prev => ({
                    ...prev,
                    election,
                }));

                const thumbnail = new AttachmentBuilder(`${UPLOADS_PATH}/${election.flag_url}`);

                const electionPickedEmbed: APIEmbed = {
                    color: 0xf0c445,
                    title: election.name,
                    description: i18n.__mf('embeds.electionPicked.description', {
                        country: election.country,
                    }),
                    author: {
                        name: i18n.__('election.commission'),
                    },
                    thumbnail: {
                        url: `attachment://${election.flag_url}`,
                    },
                    timestamp: new Date().toISOString(),
                };

                await InteractionUtils.editReply(prevInteraction, {
                    components: [],
                    embeds: [electionPickedEmbed],
                    files: [thumbnail],
                });
            }
        );

        const manager = new CollectorManager();
        manager.init(dashCommandCollector);
        manager.init(menuCollector);
    }
}
