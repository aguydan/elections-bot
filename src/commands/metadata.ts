import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIApplicationCommandsJSONBody;
} = {
    ELECTION: {
        type: ApplicationCommandType.ChatInput,
        name: 'election',
        description: "We're holding an election!",
    },
    // NEWCHAR: {
    //   type: ApplicationCommandType.ChatInput,
    //   name: "newchar",
    //   description: "Create a candidate for the election",
    // },
};
