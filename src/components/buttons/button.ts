import { ButtonInteraction } from 'discord.js';

export interface Button {
    ids: string[];
    execute(
        interaction: ButtonInteraction,
        data?: Record<string, any>,
        ...args: unknown[]
    ): Promise<void>;
}
