import { StateService } from '@/services/state-service.js';
import { ButtonInteraction, TextBasedChannel } from 'discord.js';

export interface Button {
  name: string;
  create(stateId: string, channel: TextBasedChannel): Promise<void>;
  handle(
    interaction: ButtonInteraction,
    stateService: StateService
  ): Promise<void>;
}
