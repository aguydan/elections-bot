import {
  ApplicationCommandType,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import Config from '@/../config/config.json' with { type: 'json' };

export const ChatCommandMetadata: {
  [command: string]: RESTPostAPIApplicationCommandsJSONBody;
} = {
  ELECTION: {
    type: ApplicationCommandType.ChatInput,
    name: 'election',
    description: "We're holding an election!",
    options: [
      {
        name: 'stop',
        description: 'Whether the election should stop after each stage',
        type: 5,
        required: false,
      },
    ],
  },
  NEXT: {
    type: ApplicationCommandType.ChatInput,
    name: 'next',
    description: 'Advance to the next stage in the election',
    options: [
      {
        name: 'election',
        description: 'Election UUID',
        type: 3,
        required: true,
        autocomplete: true,
      },
    ],
  },
  DISCARD: {
    type: ApplicationCommandType.ChatInput,
    name: 'discard',
    description: 'Discard the election prematurely',
    options: [
      {
        name: 'election',
        description: 'Election UUID',
        type: 3,
        required: true,
        autocomplete: true,
      },
    ],
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
        choices: Object.keys(Config.candidateScoreWeights).map((key) => {
          return { name: key, value: key };
        }),
      },
      {
        name: 'operation',
        description: 'Increment or decrement the value of the parameter',
        type: 3,
        required: true,
        choices: [
          { name: '+', value: '+' },
          { name: '-', value: '-' },
        ],
      },
      {
        name: 'value',
        description:
          'The precise value to add to or substract from the parameter',
        type: 4,
        required: false,
        min_value: 0,
        max_value: 100,
      },
    ],
  },
};
