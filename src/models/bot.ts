import {
    ButtonHandler,
    CommandHandler,
    MessageHandler,
    StringSelectMenuHandler,
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

export class Bot {
    private ready = false;

    constructor(
        private token: string,
        private client: Client,
        private commandHandler: CommandHandler,
        private messageHandler: MessageHandler,
        private stringSelectMenuHandler: StringSelectMenuHandler,
        private buttonHandler: ButtonHandler
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on(Events.ClientReady, () => this.onReady());
        this.client.on(Events.InteractionCreate, (interaction: Interaction) =>
            this.onInteraction(interaction)
        );
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

    private async onInteraction(interaction: Interaction): Promise<void> {
        if (!this.ready) return;

        //maybe switch statement?? maybe handlers as an argument since they all do one thing?
        if (
            interaction instanceof CommandInteraction ||
            interaction instanceof AutocompleteInteraction
        ) {
            try {
                await this.commandHandler.process(interaction);
            } catch (error) {
                console.log(error);
            }
        }

        if (interaction instanceof StringSelectMenuInteraction) {
            try {
                await this.stringSelectMenuHandler.process(interaction);
            } catch (error) {
                console.log(error);
            }
        }

        if (interaction instanceof ButtonInteraction) {
            try {
                await this.buttonHandler.process(interaction);
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
