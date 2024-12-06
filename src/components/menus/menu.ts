import { StringSelectMenuInteraction } from 'discord.js';

export interface StringSelectMenu {
    names: string[];
    execute(interaction: StringSelectMenuInteraction, data?: Record<string, any>): Promise<void>;
}
