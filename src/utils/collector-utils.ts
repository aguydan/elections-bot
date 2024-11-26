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

export type ComponentTypeToInteractionType = {
    [ComponentType.StringSelect]: StringSelectMenuInteraction;
    [ComponentType.UserSelect]: UserSelectMenuInteraction;
    [ComponentType.RoleSelect]: RoleSelectMenuInteraction;
    [ComponentType.MentionableSelect]: MentionableSelectMenuInteraction;
    [ComponentType.ChannelSelect]: ChannelSelectMenuInteraction;
    [ComponentType.Button]: ButtonInteraction;
};

export type SupportedData = Message | ComponentTypeToInteractionType[SupportedComponentType];

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
            time: 120_000,
        });

        return { collector, onCollect: onCollect ?? (async () => {}) };
    }

    public static createComponentCollector<T extends SupportedComponentType>(
        interaction: BaseInteraction,
        componentId: string,
        componentType: T,
        onCollect?: (interaction: ComponentTypeToInteractionType[T]) => Promise<void>
    ): CollectorWrapper<ComponentTypeToInteractionType[T]> {
        const collector = new InteractionCollector<ComponentTypeToInteractionType[T]>(
            interaction.client,
            {
                filter: interaction => interaction.customId === componentId,
                componentType,
                max: 1,
                time: 120_000,
            }
        );

        return { collector, onCollect: onCollect ?? (async () => {}) };
    }
}
