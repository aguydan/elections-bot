import { CollectorWrapper, Collectable } from '@/utils/collector-utils.js';
import { Collection, Collector, Snowflake } from 'discord.js';

export class CollectorManager {
    private collectors: Collector<Snowflake, any, [Collection<Snowflake, any>]>[];

    constructor() {
        this.collectors = [];
    }

    public init<T extends Collectable>(wrapper: CollectorWrapper<T>) {
        const { collector, onCollect } = wrapper;

        collector.on('collect', async data => await this.handleCollect(onCollect, data));
        collector.on('end', (collected, reason) => {
            console.log('collector: ' + collector + ', ended because: ' + reason);
        });

        this.collectors.push(collector);
    }

    //strategy pattern? not always stop all collectors
    private async handleCollect<T extends Collectable>(
        listener: (data: T) => Promise<void>,
        data: T
    ) {
        this.stopCollectors();

        await listener(data);
    }

    //rename to execute strategy and move listener call here?
    private stopCollectors() {
        for (const collector of this.collectors) {
            collector.stop();
        }

        /*
         * REMEMBER:
         * Only dispose of collectors AFTER stopping them
         */
        this.collectors = [];
    }
}
