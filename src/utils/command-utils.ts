import { Command } from '@/commands/index.js';

export class CommandUtils {
  public static findCommand(
    commands: Command[],
    commandParts: string[]
  ): Command | null {
    for (const command of commands) {
      if (commandParts.includes(command.name)) {
        return command;
      }
    }

    return null;
  }
}
