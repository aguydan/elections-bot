import {
  REST,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import Config from '@/../config/config.json' with { type: 'json' };

export class CommandRegistrationService {
  constructor(private rest: REST) {}

  public async process(
    localCmds: RESTPostAPIApplicationCommandsJSONBody[],
    args: string[]
  ): Promise<void> {
    const remoteCmds = (await this.rest.get(
      Routes.applicationCommands(Config.client.id)
    )) as RESTGetAPIApplicationCommandsResult;

    const localCmdsOnRemote = localCmds.filter((localCmd) =>
      remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name)
    );

    const localCmdsOnly = localCmds.filter(
      (localCmd) =>
        !remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name)
    );

    switch (args[3]) {
      case 'register':
        {
          if (localCmdsOnly.length > 0) {
            for (let localCmd of localCmds) {
              await this.rest.post(
                Routes.applicationCommands(Config.client.id),
                {
                  body: localCmd,
                }
              );

              console.log('command action created');
            }
          }

          if (localCmdsOnRemote.length > 0) {
            for (let localCmd of localCmdsOnRemote) {
              await this.rest.post(
                Routes.applicationCommands(Config.client.id),
                {
                  body: localCmd,
                }
              );

              console.log('command action updated');
            }
          }
        }

        return;
    }
  }
}
