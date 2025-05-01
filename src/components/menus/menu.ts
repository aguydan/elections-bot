import { StateService } from '@/services/state-service.js';
import { StringSelectMenuInteraction, TextBasedChannel } from 'discord.js';

export interface StringSelectMenu {
  name: string;
  create(stateId: string, channel: TextBasedChannel): Promise<void>;
  handle(
    interaction: StringSelectMenuInteraction,
    stateService: StateService
  ): Promise<void>;
}
