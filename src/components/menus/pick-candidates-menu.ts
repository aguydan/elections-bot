import {
  APIEmbed,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextBasedChannel,
} from 'discord.js';
import { StringSelectMenu } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { i18n } from '@/utils/i18n.js';
import { RegexUtils } from '@/utils/regex-utils.js';
import { candidateRepo } from '@/database/database.js';
import {
  ElectionStage,
  ElectionStateService,
} from '@/models/election-state.js';

export class PickCandidatesMenu implements StringSelectMenu {
  public name = 'pick-candidates-menu';

  constructor() {
    // we use this method as a callback passed to the state so the context is lost
    this.create = this.create.bind(this);
  }

  public async create(
    stateId: string,
    channel: TextBasedChannel
  ): Promise<void> {
    const candidates = await candidateRepo.getAll();

    const menu = new ActionRowBuilder<StringSelectMenuBuilder>({
      components: [
        new StringSelectMenuBuilder({
          custom_id: `${this.name}-${stateId}`,
          placeholder: i18n.__('menus.placeholder'),
          min_values: 2,
          max_values: candidates.length,
          options: candidates.map((candidate) => {
            return {
              value: candidate.id.toString(),
              label: candidate.name,
            };
          }),
        }),
      ],
    });

    /*     const thumbnail = new AttachmentBuilder(
      `${API_PATH}/embeds/roman-election.jpg`
    ); */

    const pickCandidatesEmbed: APIEmbed = {
      color: 0xf0c445,
      title: i18n.__('embeds.pickCandidates.title'),
      description: i18n.__('embeds.pickCandidates.description'),
      author: {
        name: i18n.__('election.commission'),
      },
      thumbnail: {
        url: 'attachment://roman-election.jpg',
      },
      timestamp: new Date().toISOString(),
    };

    await channel.send({
      embeds: [pickCandidatesEmbed],
      components: [menu],
      //       files: [thumbnail],
    });
  }

  public async handle(
    interaction: StringSelectMenuInteraction,
    stateService: ElectionStateService
  ): Promise<void> {
    const stateId = RegexUtils.getStateId(interaction.customId);
    const candidates = await candidateRepo.getAll();

    const filtered = candidates.filter((candidate) =>
      interaction.values.includes(candidate.id.toString())
    )!;

    stateService.set(stateId, (prev) => ({
      ...prev,
      stage: ElectionStage.CANDIDATES_SELECTED,
      candidates: filtered,
    }));

    const candidatesPickedEmbed: APIEmbed = {
      color: 0xf0c445,
      title: i18n.__('embeds.candidatesPicked.title'),
      description: i18n.__mf('embeds.candidatesPicked.description', {
        commission: i18n.__('election.commission'),
      }),
      author: {
        name: i18n.__('election.commission'),
      },
      fields: filtered.map((candidate) => {
        return {
          name: i18n.__('candidate'),
          value: `**${candidate.name}**`,
          inline: true,
        };
      }),
      timestamp: new Date().toISOString(),
    };

    await InteractionUtils.send(interaction, {
      embeds: [candidatesPickedEmbed],
    });

    stateService.nextStep(stateId);
  }
}
