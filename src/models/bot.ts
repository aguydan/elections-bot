import { CommandHandler, MessageHandler, SelectMenuHandler } from '@/events/index.js';
import {
    AutocompleteInteraction,
    Client,
    CommandInteraction,
    Events,
    Interaction,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';

export class Bot {
    private ready = false;

    constructor(
        private token: string,
        private client: Client,
        private commandHandler: CommandHandler,
        private messageHandler: MessageHandler,
        private selectMenuHandler: SelectMenuHandler
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

        if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
            try {
                await this.commandHandler.process(intr);
            } catch (error) {
                console.log(error);
            }
        }

        if (intr instanceof StringSelectMenuInteraction) {
            try {
                await this.selectMenuHandler.process(intr);
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
