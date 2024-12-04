import {
    APIEmbed,
    AttachmentBuilder,
    ComponentType,
    StringSelectMenuInteraction,
} from 'discord.js';
import { StringSelectMenu } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { CollectorUtils } from '@/utils/collector-utils.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { candidateRepo } from '@/database/database.js';
import { CandidatesMenuFactory } from '@/models/menu-factory.js';
import { FRONTEND_PATH } from '@/constants/frontend.js';
import { API_PATH } from '@/constants/api.js';
import { i18n } from '@/utils/i18n.js';
import { StateName, StateService } from '@/services/state-service.js';

export class PickElectionMenu implements StringSelectMenu {
    public ids = ['pick-election-menu'];

    public async execute(
        prevInteraction: StringSelectMenuInteraction,
        stateService: StateService
    ): Promise<void> {
        const candidates = await candidateRepo.getAll();
        const menuFactory = new CandidatesMenuFactory();
        const menu = menuFactory.createMenu(candidates, metadataId);
        const button = menuFactory.createLinkButton(`${FRONTEND_PATH}/candidates/create`);

        const thumbnail = new AttachmentBuilder(`${API_PATH}/embeds/roman-election.jpg`);

        const pickCandidatesEmbed: APIEmbed = {
            color: 0xf0c445,
            title: i18n.__('embeds.pickCandidates.title'),
            description: i18n.__('embeds.pickCandidates.description'),
            author: {
                name: i18n.__('election.commission'),
            },
            thumbnail: {
                url: 'attachment://roman-election.jpg',
            },
            timestamp: new Date().toISOString(),
        };

        await InteractionUtils.send(prevInteraction, {
            embeds: [pickCandidatesEmbed],
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
                });
            }
        );

        const menuCollector = CollectorUtils.createComponentCollector(
            prevInteraction,
            menu.id,
            ComponentType.StringSelect,
            async interaction => {
                const filtered = candidates.filter(candidate =>
                    interaction.values.includes(candidate.id.toString())
                )!;

                stateService.set(StateName.Election, stateId, prev => ({
                    ...prev,
                    candidates: filtered,
                }));

                const candidatesPickedEmbed: APIEmbed = {
                    color: 0xf0c445,
                    title: i18n.__('embeds.candidatesPicked.title'),
                    description: i18n.__mf('embeds.candidatesPicked.description', {
                        commission: i18n.__('election.commission'),
                    }),
                    author: {
                        name: i18n.__('election.commission'),
                    },
                    fields: filtered.map(candidate => {
                        return {
                            name: i18n.__('candidate'),
                            value: candidate.name,
                            inline: true,
                        };
                    }),
                    timestamp: new Date().toISOString(),
                };

                await InteractionUtils.editReply(prevInteraction, {
                    components: [],
                    embeds: [candidatesPickedEmbed],
                    files: [],
                });
            }
        );

        const manager = new CollectorManager();
        manager.init(dashCommandCollector);
        manager.init(menuCollector);
    }
}
