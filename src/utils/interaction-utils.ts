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
        intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
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

            if (intr.deferred || intr.replied) {
                return await intr.followUp({
                    ...options,
                    ephemeral: hidden,
                });
            } else {
                return await intr.reply({
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
        intr: AutocompleteInteraction,
        choices: ApplicationCommandOptionChoiceData[] = []
    ): Promise<void> {
        try {
            return await intr.respond(choices);
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
}
