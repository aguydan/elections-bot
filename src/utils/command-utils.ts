import { Command } from '@/commands/index.js';

export class CommandUtils {
  public static findCommand(
    commands: Command[],
    commandParts: string[]
  ): Command | null {
    console.log(commands);
    for (const command of commands) {
      if (commandParts.includes(command.name)) {
        return command;
      }
    }

    return null;

    /*         let found = [...commands];
        let closestMatch: Command | null = null;

        for (let [index, commandPart] of commandParts.entries()) {
            found = found.filter(command => command.name === commandPart);

            if (found.length === 0) {
                return closestMatch;
            }

            if (found.length === 1) {
                return found[0]!;
            }

            let exactMatch = found.find(command => command.name.length === index + 1);

            if (exactMatch) {
                closestMatch = exactMatch;
            }
        } */

    return closestMatch;
  }
}
