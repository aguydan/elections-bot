import { i18n } from '@/utils/i18n.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

abstract class MenuFactory {
    public abstract createMenu(
        options: { id: number; name: string }[],
        uuid?: string,
        placeholder?: string
    ): { id: string; menu: ActionRowBuilder<StringSelectMenuBuilder> };

    public createLinkButton(path: string, label?: string) {
        return new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder({
                    label: label ?? i18n.__('menus.linkButton.label'),
                    url: path,
                    style: ButtonStyle.Link,
                }),
            ],
        });
    }
}

export class CandidatesMenuFactory extends MenuFactory {
    public createMenu(
        options: { id: number; name: string }[],
        uuid?: string,
        placeholder?: string
    ) {
        const id = 'pick-candidates-menu-' + (uuid ?? crypto.randomUUID());

        return {
            id,
            menu: new ActionRowBuilder<StringSelectMenuBuilder>({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: id,
                        placeholder: placeholder ?? i18n.__('menus.placeholder'),
                        min_values: 2,
                        max_values: options.length,
                        options: options.map(option => {
                            return {
                                value: option.id.toString(),
                                label: option.name,
                            };
                        }),
                    }),
                ],
            }),
        };
    }
}

export class ElectionsMenuFactory extends MenuFactory {
    public createMenu(
        options: { id: number; name: string }[],
        uuid?: string,
        placeholder?: string
    ) {
        const id = 'pick-election-menu-' + (uuid ?? crypto.randomUUID());

        return {
            id,
            menu: new ActionRowBuilder<StringSelectMenuBuilder>({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: id,
                        placeholder: placeholder ?? i18n.__('menus.placeholder'),
                        max_values: 1,
                        options: options.map(option => {
                            return {
                                value: option.id.toString(),
                                label: option.name,
                            };
                        }),
                    }),
                ],
            }),
        };
    }
}
