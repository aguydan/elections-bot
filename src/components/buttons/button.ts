import { ButtonInteraction } from 'discord.js';

export interface Button {
    ids: string[];
    execute(interaction: ButtonInteraction, data?: Record<string, any>): Promise<void>;
}
