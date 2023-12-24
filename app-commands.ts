import { Bot, Event, Plugin } from './bot.ts';

export class AppCommands implements Plugin {
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
