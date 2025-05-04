import { BaseInteraction } from 'discord.js';

export interface EventHandler {
  process(interaction: BaseInteraction): Promise<void>;
}
