import { Client, REST } from 'discord.js';
import { CommandRegistrationService } from './services/index.js';
import { Bot } from './models/bot.js';
import { ChatCommandMetadata, Command } from './commands/index.js';
import {
  ButtonHandler,
  CommandHandler,
  StringSelectMenuHandler,
} from './events/index.js';
import {
  DiscardCommand,
  ElectionCommand,
  NextCommand,
  ScoreCommand,
} from './commands/chat/index.js';
import {
  PickCandidatesMenu,
  PickElectionMenu,
  StringSelectMenu,
} from './components/menus/index.js';
import { Button, HoldElectionButton } from './components/buttons/index.js';
import Config from '@/../config/config.json' with { type: 'json' };
import {
  ElectionStage,
  ElectionState,
  ElectionStateService,
} from './models/election-state.js';

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents,
  });

  const pickElectionMenu = new PickElectionMenu();
  const pickCandidatesMenu = new PickCandidatesMenu();
  const holdElectionButton = new HoldElectionButton();

  // the callback queue is filled backwards because we pop it for efficiency
  const INITIAL_ELECTION_STATE: ElectionState = {
    stage: ElectionStage.ANNOUNCEMENT,
    stop: false,
    callbackQueue: [
      holdElectionButton.create,
      pickCandidatesMenu.create,
      pickElectionMenu.create,
    ],
  };

  const electionStateService = new ElectionStateService(INITIAL_ELECTION_STATE);

  const commands: Command[] = [
    new ElectionCommand(),
    new ScoreCommand(),
    new NextCommand(),
    new DiscardCommand(),
  ];
  const menus: StringSelectMenu[] = [pickElectionMenu, pickCandidatesMenu];
  const buttons: Button[] = [holdElectionButton];

  const commandHandler = new CommandHandler(commands, electionStateService);
  const stringSelectMenuHandler = new StringSelectMenuHandler(
    menus,
    electionStateService
  );
  const buttonHandler = new ButtonHandler(buttons, electionStateService);

  const bot = new Bot(
    Config.client.token,
    client,
    commandHandler,
    stringSelectMenuHandler,
    buttonHandler
  );

  if (process.argv[2] === 'commands') {
    try {
      const rest = new REST().setToken(Config.client.token);
      const commandRegistrationService = new CommandRegistrationService(rest);
      const localCmds = [
        ...Object.values(ChatCommandMetadata).sort((a, b) =>
          a.name > b.name ? 1 : -1
        ),
      ];
      await commandRegistrationService.process(localCmds, process.argv);
    } catch (error) {
      console.error(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit();
  }

  await bot.start();
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection: ' + reason);
});

start().catch((error) => {
  console.error(error);
});
