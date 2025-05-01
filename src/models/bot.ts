import {
  ButtonHandler,
  CommandHandler,
  StringSelectMenuHandler,
} from '@/events/index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import {
  AutocompleteInteraction,
  ButtonInteraction,
  Client,
  CommandInteraction,
  EmbedBuilder,
  Events,
  Interaction,
  StringSelectMenuInteraction,
} from 'discord.js';

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    private commandHandler: CommandHandler,
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
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (error) {
      console.log(error);
    }
  }

  private async onReady(): Promise<void> {
    const userTag = this.client.user?.tag;

    this.ready = true;

    console.log('Bot is ready!');
  }

  private async onInteraction(interaction: Interaction): Promise<void> {
    if (!this.ready) return;

    try {
      if (
        interaction instanceof CommandInteraction ||
        interaction instanceof AutocompleteInteraction
      ) {
        await this.commandHandler.process(interaction);
      }

      if (interaction instanceof StringSelectMenuInteraction) {
        await this.stringSelectMenuHandler.process(interaction);
      }

      if (interaction instanceof ButtonInteraction) {
        await this.buttonHandler.process(interaction);
      }
    } catch (error) {
      console.error(error);

      const errorEmbed = new EmbedBuilder({
        color: 0xff0000,
        title: '',
        description: '',
        timestamp: new Date().toISOString(),
        footer: {
          text: '',
        },
      });

      InteractionUtils.send(interaction, errorEmbed);
    }
  }
}
