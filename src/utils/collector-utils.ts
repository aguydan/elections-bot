import {
    BaseInteraction,
    ComponentType,
    InteractionCollector,
    Message,
    MessageCollector,
    StringSelectMenuInteraction,
    TextBasedChannel,
} from 'discord.js';

export class CollectorUtils {
    public static createDashCommandCollector(
        channel: TextBasedChannel,
        command: string,
        onCollect?: (message: Message) => Promise<void>
    ) {
        const collector = new MessageCollector(channel, {
            filter: message => message.content.startsWith(command),
            time: 120_000,
        });

        if (onCollect) collector.handleCollect = onCollect;

        return collector;
    }

    public static createMenuCollector(
        interaction: BaseInteraction,
        componentId: string,
        onCollect?: (interaction: StringSelectMenuInteraction) => Promise<void>
    ) {
        const collector = new InteractionCollector(interaction.client, {
            filter: interaction => interaction.customId === componentId,
            componentType: ComponentType.StringSelect,
            time: 120_000,
        });

        if (onCollect) collector.handleCollect = onCollect;

        return collector;
    }
}
