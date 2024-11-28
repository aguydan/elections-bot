import {
    CollectorWrapper,
    ComponentTypeToInteraction,
    SupportedComponentType,
    SupportedData,
} from '@/utils/collector-utils.js';
import {
    Collection,
    Collector,
    InteractionCollector,
    Message,
    MessageCollector,
    Snowflake,
} from 'discord.js';

export class CollectorManager {
    private messageCollectors: Collector<Snowflake, Message, [Collection<Snowflake, Message>]>[];
    private interactionCollectors: Collector<
        Snowflake,
        ComponentTypeToInteraction[SupportedComponentType],
        [Collection<Snowflake, ComponentTypeToInteraction[SupportedComponentType]>]
    >[];

    constructor() {
        this.messageCollectors = [];
        this.interactionCollectors = [];
    }

    public init<T extends SupportedData>(wrapper: CollectorWrapper<T>) {
        const { collector, onCollect } = wrapper;

        collector.on('collect', async data => this.handleCollect(onCollect, data));
        collector.on('end', (collected, reason) => {
            console.log('collector ended: ' + collected.toJSON().toString() + ' ' + reason);
        });

        if (collector instanceof MessageCollector) {
            this.messageCollectors.push(collector);

            return;
        }

        if (collector instanceof InteractionCollector) {
            this.interactionCollectors.push(collector);

            return;
        }
    }

    //strategy pattern? not always stop all collectors
    private async handleCollect<T extends SupportedData>(
        listener: (data: T) => Promise<void>,
        data: T
    ) {
        this.stopCollectors(this.messageCollectors);
        this.stopCollectors(this.interactionCollectors);

        await listener(data);
    }

    private stopCollectors(collectors: Collector<Snowflake, any, [Collection<Snowflake, any>]>[]) {
        for (const collector of collectors) {
            console.log('collectors stopped ');

            collector.stop();
        }

        //delete collectors?
        this.messageCollectors = [];
        this.interactionCollectors = [];
    }
}
