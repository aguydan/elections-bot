import {
    ButtonHandler,
    CommandHandler,
    MessageHandler,
    SelectMenuHandler,
} from '@/events/index.js';
import {
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Interaction,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';
import { ElectionMetadata } from './election-metadata';

export class Bot {
    private ready = false;

    constructor(
        private token: string,
        private client: Client,
        private commandHandler: CommandHandler,
        private messageHandler: MessageHandler,
        private selectMenuHandler: SelectMenuHandler,
        private buttonHandler: ButtonHandler,
        private metadata: ElectionMetadata
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on(Events.ClientReady, () => this.onReady());
        this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
        this.client.on(Events.MessageCreate, (message: Message) => this.onMessage(message));
    }

    private async login(token: string): Promise<void> {
        try {
            await this.client.login(token);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private async onReady(): Promise<void> {
        const userTag = this.client.user?.tag;

        this.ready = true;
        console.log('ready');
    }

    private async onInteraction(intr: Interaction): Promise<void> {
        if (!this.ready) return;

        //maybe switch statement?? maybe handlers as an argument since they all do one thing?
        if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
            try {
                await this.commandHandler.process(intr, this.metadata);
            } catch (error) {
                console.log(error);
            }
        }

        if (intr instanceof StringSelectMenuInteraction) {
            try {
                await this.selectMenuHandler.process(intr, this.metadata);
            } catch (error) {
                console.log(error);
            }
        }

        if (intr instanceof ButtonInteraction) {
            try {
                await this.buttonHandler.process(intr, this.metadata);
            } catch (error) {
                console.log(error);
            }
        }
    }

    private async onMessage(message: Message): Promise<void> {
        if (!this.ready) return;

        try {
            await this.messageHandler.process(message);
        } catch (error) {
            console.log(error);
        }
    }
}
