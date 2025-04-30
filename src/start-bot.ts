import { Client, REST } from 'discord.js';
import { CommandRegistrationService, StateService } from './services/index.js';
import { Bot } from './models/bot.js';
import { ChatCommandMetadata, Command } from './commands/index.js';
import {
  ButtonHandler,
  CommandHandler,
  MessageHandler,
  StringSelectMenuHandler,
} from './events/index.js';
import { ElectionCommand, ScoreCommand } from './commands/chat/index.js';
import {
  PickCandidatesMenu,
  PickElectionMenu,
  StringSelectMenu,
} from './components/menus/index.js';
import { Button, HoldElectionButton } from './components/buttons/index.js';
import { StateName } from './services/state-service.js';
import Config from '@/../config/config.json';

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents,
  });

  const stateService = new StateService();
  stateService.init(StateName.Election);

  const commands: Command[] = [new ElectionCommand(), new ScoreCommand()];
  const menus: StringSelectMenu[] = [
    new PickElectionMenu(),
    new PickCandidatesMenu(),
  ];
  const buttons: Button[] = [new HoldElectionButton()];

  const commandHandler = new CommandHandler(commands, stateService);
  const messageHandler = new MessageHandler();
  const stringSelectMenuHandler = new StringSelectMenuHandler(
    menus,
    stateService
  );
  const buttonHandler = new ButtonHandler(buttons, stateService);

  const bot = new Bot(
    Config.client.token,
    client,
    commandHandler,
    messageHandler,
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
  console.error('Unhandled rejection:' + reason);
});

start().catch((error) => {
  console.error(error);
});
