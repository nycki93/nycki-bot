import { Bot, Event, Mod } from './bot.ts';

export class Parrot implements Mod {
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
