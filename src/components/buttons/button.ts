import { ButtonInteraction } from 'discord.js';

export interface Button {
  names: string[];
  execute(
    interaction: ButtonInteraction,
    data?: Record<string, any>
  ): Promise<void>;
}
