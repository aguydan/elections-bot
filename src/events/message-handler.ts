import { Message } from 'discord.js';
import { EventHandler } from './index.js';

export class MessageHandler implements EventHandler {
    public async process(message: Message): Promise<void> {
        if (message.author.id === message.client.user.id || message.author.bot) {
            return;
        }

        console.log('sends message: ', message.content);
    }
}
