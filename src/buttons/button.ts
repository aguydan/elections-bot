import { ButtonInteraction } from 'discord.js';

export interface Button {
    ids: string[];
    execute(intr: ButtonInteraction): Promise<void>;
}
