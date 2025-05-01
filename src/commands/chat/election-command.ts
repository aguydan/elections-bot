import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { ElectionStateService } from '@/models/election-state.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';

export class ElectionCommand implements Command {
  public name = 'election';

  public async execute(
    interaction: ChatInputCommandInteraction,
    stateService: ElectionStateService
  ): Promise<void> {
    const stateId = crypto.randomUUID();

    //initialize state
    stateService.init(stateId);

    const channel = interaction.channel;
    if (!channel) {
      throw new Error('Text channel lost.');
    }

    //set the stop value depending on an argument
    stateService.set(stateId, (prev) => ({
      ...prev,
      stop: false,
      channel: channel,
    }));

    await InteractionUtils.send(interaction, 'replied', true);

    //emit event to dispatch first callback
    stateService.nextStep(stateId, true);
  }
}
