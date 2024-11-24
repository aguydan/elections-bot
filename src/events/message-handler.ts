import { Message } from 'discord.js';
import { EventHandler } from './index.js';

export class MessageHandler implements EventHandler {
    public async process(message: Message): Promise<void> {
        if (message.author.id === message.client.user.id || message.author.bot) {
            return;
        }

        if (message.content.startsWith('-cancel')) {
            message.channel.send('we will cancel all commands now!!!');
        }

        console.log('sends message: ', message.content);
    }
}
