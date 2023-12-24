import { Bot, Event, Mod } from './bot.ts';

export class Commands implements Mod {
    bot: Bot;
    constructor(bot: Bot) { this.bot = bot }

    start() {}

    handle(e: Event) {
        if (e.type !== 'message') return false;
        const text = e.text.trim();
        if (text === 'ping') {
            this.bot.write(`${e.user} pong`);
            return true;
        }
        if (['hello', 'hi'].includes(text)) {
            this.bot.write(`hello, ${e.user}!`);
            return true;
        }
        return false;
    }
}
