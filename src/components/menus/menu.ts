import { StringSelectMenuInteraction } from 'discord.js';

export interface StringSelectMenu {
    ids: string[];
    execute(interaction: StringSelectMenuInteraction, data?: Record<string, any>): Promise<void>;
}
