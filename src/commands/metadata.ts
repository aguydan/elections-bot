import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIApplicationCommandsJSONBody;
} = {
    ELECTION: {
        type: ApplicationCommandType.ChatInput,
        name: 'election',
        description: "We're holding an election!",
        // options: { recount }
    },
    SCORE: {
        type: ApplicationCommandType.ChatInput,
        name: 'score',
        description: 'Manipulate the score of a candidate',
        options: [
            {
                name: 'candidate',
                description: 'The candidate',
                type: 4,
                required: true,
                autocomplete: true,
            },
            {
                name: 'score_parameter',
                description: "The parameter from the candidate's score",
                type: 3,
                required: true,
                choices: Object.keys(Config.candidateScoreWeights).map(key => {
                    return { name: key, value: key };
                }),
            },
            {
                name: 'operation',
                description: 'Increment or decrement the value of the parameter',
                type: 3,
                required: true,
                choices: [
                    { name: 'increment', value: 'incr' },
                    { name: 'decrement', value: 'decr' },
                ],
            },
            {
                name: 'value',
                description: 'The precise value to add to or substract from the parameter',
                type: 4,
                required: false,
                min_value: 0,
                max_value: 100,
            },
        ],
    },
    // NEWCHAR: {
    //   type: ApplicationCommandType.ChatInput,
    //   name: "newchar",
    //   description: "Create a candidate for the election",
    // },
};
