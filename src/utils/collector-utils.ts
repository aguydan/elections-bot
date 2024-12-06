import { COLLECTOR_TIMER } from '@/constants/discord.js';
import { ValueOf } from '@/models/utility-types';
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
export type ComponentTypeToInteraction = {
    [ComponentType.StringSelect]: StringSelectMenuInteraction;
    [ComponentType.UserSelect]: UserSelectMenuInteraction;
    [ComponentType.RoleSelect]: RoleSelectMenuInteraction;
    [ComponentType.MentionableSelect]: MentionableSelectMenuInteraction;
    [ComponentType.ChannelSelect]: ChannelSelectMenuInteraction;
    [ComponentType.Button]: ButtonInteraction;
};

export type Collectable = Message | ValueOf<ComponentTypeToInteraction>;

export type CollectorWrapper<T extends Collectable> = {
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

    public static createComponentCollector<T extends keyof ComponentTypeToInteraction>(
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
