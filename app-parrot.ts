import { Bot, Event, Plugin } from './bot.ts';

export class AppParrot implements Plugin {
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    start() {}

    handle(e: Event) {
        if (e.type === 'message') {
            this.bot.push({
                type: 'write',
                text: `Squawk! ${e.text}!`,
            });
        }
        return false;
    }
}
