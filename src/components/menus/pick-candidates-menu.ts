import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    StringSelectMenuInteraction,
} from 'discord.js';
import { StringSelectMenu } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { CollectorUtils } from '@/utils/collector-utils.js';
import { CollectorManager } from '@/models/collector-manager.js';
import { i18n } from '@/utils/i18n.js';
import { StateName, StateService } from '@/services/state-service.js';

export class PickCandidatesMenu implements StringSelectMenu {
    public ids = ['pick-candidates-menu'];

    public async execute(
        prevInteraction: StringSelectMenuInteraction,
        stateService: StateService
    ): Promise<void> {
        //maybe buttons also need a constructor
        const buttonId = 'hold-election-button-' + metadataId;

        const button = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({
                    custom_id: buttonId,
                    label: i18n.__('buttons.holdElection.label'),
                    style: ButtonStyle.Primary,
                }),
            ],
        });

        await InteractionUtils.send(prevInteraction, {
            components: [button],
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

        const buttonCollector = CollectorUtils.createComponentCollector(
            prevInteraction,
            buttonId,
            ComponentType.Button
        );

        const manager = new CollectorManager();
        manager.init(dashCommandCollector);
        manager.init(buttonCollector);
    }
}
