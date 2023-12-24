import { Bot, Event, Plugin } from './bot.ts';

export class AppParrot implements Plugin {
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    start() {}

    handle(e: Event) {
        if (e.type !== 'message') return false;
        this.bot.write(`Squawk! ${e.text}!`)
        return true;
    }
}
