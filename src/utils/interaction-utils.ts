import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  EmbedBuilder,
  InteractionReplyOptions,
  Message,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  WebhookMessageEditOptions,
} from 'discord.js';

const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
  DiscordApiErrors.MaximumActiveThreads,
];

export class InteractionUtils {
  public static async send(
    interaction:
      | CommandInteraction
      | MessageComponentInteraction
      | ModalSubmitInteraction,
    content: string | EmbedBuilder | InteractionReplyOptions,
    hidden: boolean = false
  ): Promise<Message | undefined> {
    try {
      const options: InteractionReplyOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;

      if (interaction.deferred || interaction.replied) {
        return await interaction.followUp({
          ...options,
          ephemeral: hidden,
        });
      } else {
        return await interaction.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
        });
      }
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code === 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async respond(
    interaction: AutocompleteInteraction,
    choices: ApplicationCommandOptionChoiceData[] = []
  ): Promise<void> {
    try {
      return await interaction.respond(choices);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code === 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async editReply(
    interaction:
      | CommandInteraction
      | MessageComponentInteraction
      | ModalSubmitInteraction,
    content: string | EmbedBuilder | WebhookMessageEditOptions
  ): Promise<Message | undefined> {
    try {
      let options: WebhookMessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      return await interaction.editReply(options);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }
}
