import { COLLECTOR_TIMER } from '@/constants/discord.js';
import {
    BaseInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    Collection,
    Collector,
    ComponentType,
    InteractionCollector,
    MentionableSelectMenuInteraction,
    Message,
    MessageCollector,
    RoleSelectMenuInteraction,
    Snowflake,
    StringSelectMenuInteraction,
    TextBasedChannel,
    UserSelectMenuInteraction,
} from 'discord.js';

//move these monstrocities elsewhere
export type SupportedComponentType =
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect
    | ComponentType.Button;

export type ComponentTypeToInteraction = {
    [ComponentType.StringSelect]: StringSelectMenuInteraction;
    [ComponentType.UserSelect]: UserSelectMenuInteraction;
    [ComponentType.RoleSelect]: RoleSelectMenuInteraction;
    [ComponentType.MentionableSelect]: MentionableSelectMenuInteraction;
    [ComponentType.ChannelSelect]: ChannelSelectMenuInteraction;
    [ComponentType.Button]: ButtonInteraction;
};

export type SupportedData = Message | ComponentTypeToInteraction[SupportedComponentType];

export type CollectorWrapper<T extends SupportedData> = {
    collector: Collector<Snowflake, T, [Collection<Snowflake, T>]>;
    onCollect: (data: T) => Promise<void>;
};

export class CollectorUtils {
    public static createDashCommandCollector(
        channel: TextBasedChannel,
        command: string,
        onCollect?: (message: Message) => Promise<void>
    ): CollectorWrapper<Message> {
        const collector = new MessageCollector(channel, {
            filter: message => message.content.startsWith(command),
            max: 1,
            time: COLLECTOR_TIMER,
        });

        return { collector, onCollect: onCollect ?? (async () => {}) };
    }

    public static createComponentCollector<T extends SupportedComponentType>(
        interaction: BaseInteraction,
        componentId: string,
        componentType: T,
        onCollect?: (interaction: ComponentTypeToInteraction[T]) => Promise<void>
    ): CollectorWrapper<ComponentTypeToInteraction[T]> {
        const collector = new InteractionCollector<ComponentTypeToInteraction[T]>(
            interaction.client,
            {
                filter: interaction => interaction.customId === componentId,
                componentType,
                max: 1,
                time: COLLECTOR_TIMER,
            }
        );

        return { collector, onCollect: onCollect ?? (async () => {}) };
    }
}
