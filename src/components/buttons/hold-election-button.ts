import {
  APIEmbed,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  TextBasedChannel,
} from 'discord.js';
import { Button } from './index.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { ElectionResultsBuilder } from '@/models/election-results-builder.js';
import { RegexUtils } from '@/utils/regex-utils.js';
import { i18n } from '@/utils/i18n.js';
import {
  ElectionStage,
  ElectionStateService,
} from '@/models/election-state.js';

export class HoldElectionButton implements Button {
  public name = 'hold-election-button';

  constructor() {
    // we use this method as a callback passed to the state so the context is lost
    this.create = this.create.bind(this);
  }

  public async create(
    stateId: string,
    channel: TextBasedChannel
  ): Promise<void> {
    const button = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          custom_id: `${this.name}-${stateId}`,
          label: i18n.__('buttons.holdElection.label'),
          style: ButtonStyle.Primary,
        }),
      ],
    });

    await channel.send({
      components: [button],
    });
  }

  public async handle(
    interaction: ButtonInteraction,
    stateService: ElectionStateService
  ) {
    const stateId = RegexUtils.getStateId(interaction.customId);

    /*     const loadingImage = new AttachmentBuilder(
      `${API_PATH}/embeds/counting-ballots.gif`
    ); */

    const loadingEmbed: APIEmbed = {
      color: 0xf0c445,
      title: i18n.__('embeds.countingBallots.title'),
      description: i18n.__('embeds.countingBallots.description'),
      author: {
        name: i18n.__('election.commission'),
      },
      image: {
        url: 'attachment://counting-ballots.gif',
      },
      timestamp: new Date().toISOString(),
    };

    await InteractionUtils.send(interaction, {
      embeds: [loadingEmbed],
      //       files: [loadingImage],
    });

    const state = stateService.get(stateId);
    const { election, candidates } = state;

    if (!election || !candidates) {
      throw new Error(
        `Election state by the id ${stateId} lacks required data`
      );
    }

    const builder = new ElectionResultsBuilder()
      .accumulateRawScores(candidates)
      .randomizeScores()
      .normalizeScores()
      .calculateResults(election);

    await builder.save(election.id);

    const results = builder.results;
    results.sort((a, b) => b.percentage - a.percentage);

    const withCandidates = results.map((data) => {
      const candidate = candidates.find(
        (candidate) => candidate.id === data.id
      );

      if (!candidate) {
        throw new Error('No result data for a candidate with id: ' + data.id);
      }

      return {
        ...candidate,
        ...data,
      };
    });

    const winner = withCandidates[0]!;
    const losers = withCandidates.slice(1);

    /*     const buffer = await FrontendUtils.getResultsImage();

    //everything else here should be based on whether buffer was received or not
    let resultsEmbed: APIEmbed;

    if (buffer) {
      const image = new AttachmentBuilder(buffer, {
        name: 'results.jpg',
      });

      resultsEmbed = {
        color: Number('0x' + winner.color.slice(1)),
        title: i18n.__('embeds.results.title'),
        description: i18n.__('embeds.results.withImage.description', {
          winner: winner.name,
        }),
        author: {
          name: i18n.__('election.commission'),
        },
        image: {
          url: 'attachment://results.jpg',
        },
        timestamp: new Date().toISOString(),
      }; */

    /*       await InteractionUtils.editReply(prevInteraction, {
        embeds: [resultsEmbed],
        files: [image],
      });

      return;
    } */

    const resultsEmbed = {
      color: Number('0x' + winner.color.slice(1)),
      title: i18n.__('embeds.results.title'),
      description: i18n.__('embeds.results.withoutImage.description'),
      fields: [
        {
          name: i18n.__('winner'),
          value: `**${winner.name}** ${winner.percentage.toFixed(2)}% (${winner.popularVote} votes)`,
          inline: false,
        },
        ...losers.map((loser) => ({
          name: i18n.__('loser'),
          value: `**${loser.name}** ${loser.percentage.toFixed(2)}% (${loser.popularVote} votes)`,
          inline: true,
        })),
      ],
      author: {
        name: i18n.__('election.commission'),
      },
      timestamp: new Date().toISOString(),
    };

    await InteractionUtils.editReply(interaction, {
      embeds: [resultsEmbed],
      //       files: [],
    });

    stateService.set(stateId, (prev) => ({
      ...prev,
      stage: ElectionStage.FINISHED,
    }));

    stateService.nextStep(stateId);
  }
}
