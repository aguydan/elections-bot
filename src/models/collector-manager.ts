import { CollectedInteraction, InteractionCollector, Message, MessageCollector } from 'discord.js';

export class CollectorManager {
    constructor(
        private collectors: (MessageCollector | InteractionCollector<CollectedInteraction>)[]
    ) {}

    public init() {
        for (const collector of this.collectors) {
            const listener = collector.handleCollect.bind({});

            collector.on('collect', async data => this.handleCollect(listener, data));
        }
    }

    private async handleCollect(
        listener: (...args: unknown[]) => Promise<void>,
        data: Message | CollectedInteraction
    ) {
        this.stopCollectors();

        await listener(data);
    }

    private stopCollectors() {
        for (const collector of this.collectors) {
            collector.stop();
        }
    }
}
