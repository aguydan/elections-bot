import {
  APIEmbed,
  ActionRowBuilder,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextBasedChannel,
} from 'discord.js';
import { InteractionUtils } from '@/utils/interaction-utils.js';
import { i18n } from '@/utils/i18n.js';
import { RegexUtils } from '@/utils/regex-utils.js';
import { ElectionStateService } from '@/models/election-state.js';
import { electionRepo } from '@/database/database.js';
import { StringSelectMenu } from './menu.js';

export class PickElectionMenu implements StringSelectMenu {
  public name = 'pick-election-menu';

  constructor() {
    // we use this method as a callback passed to the state so the context is lost
    this.create = this.create.bind(this);
  }

  public async create(
    stateId: string,
    channel: TextBasedChannel
  ): Promise<void> {
    //get elections from the database
    const elections = await electionRepo.getAll();

    const menu = new ActionRowBuilder<StringSelectMenuBuilder>({
      components: [
        new StringSelectMenuBuilder({
          custom_id: `${this.name}-${stateId}`,
          placeholder: i18n.__('menus.placeholder'),
          max_values: 1,
          options: elections.map((election) => {
            return {
              value: election.id.toString(),
              label: election.name,
            };
          }),
        }),
      ],
    });

    /*     const thumbnail = new AttachmentBuilder(
      `${API_PATH}/embeds/roman-election.jpg`
    ); */

    const embed: APIEmbed = {
      color: 0xf0c445,
      title: i18n.__('embeds.pickElection.title'),
      description: i18n.__('embeds.pickElection.description'),
      author: {
        name: i18n.__('election.commission'),
      },
      thumbnail: {
        url: 'attachment://roman-election.jpg',
      },
      timestamp: new Date().toISOString(),
    };

    await channel.send({
      embeds: [embed],
      components: [menu],
      //       files: [thumbnail],
    });
  }

  public async handle(
    interaction: StringSelectMenuInteraction,
    stateService: ElectionStateService
  ): Promise<void> {
    const stateId = RegexUtils.getStateId(interaction.customId);

    const elections = await electionRepo.getAll();
    const electionId = interaction.values[0] as string;

    const election = elections.find(
      (election) => election.id == Number(electionId)
    );

    if (!election) {
      throw new Error('No election with the id: ' + electionId);
    }

    stateService.set(stateId, (prev) => ({
      ...prev,
      election,
    }));

    /*     const thumbnail = new AttachmentBuilder(
      `${UPLOADS_PATH}/${election.flag_url}`
    ); */

    const electionPickedEmbed: APIEmbed = {
      color: 0xf0c445,
      title: election.name,
      description: i18n.__mf('embeds.electionPicked.description', {
        country: election.country,
      }),
      author: {
        name: i18n.__('election.commission'),
      },
      thumbnail: {
        url: `attachment://${election.flag_url}`,
      },
      timestamp: new Date().toISOString(),
    };

    await InteractionUtils.send(interaction, {
      embeds: [electionPickedEmbed],
      //       files: [thumbnail],
    });

    stateService.nextStep(stateId);
  }
}
