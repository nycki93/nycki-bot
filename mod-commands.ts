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

        const args = text.split(/\s+/);
        if (args[0] === 'load') return this.handleLoad(args);

        return false;
    }

    handleLoad(args: string[]) {
        if (args.length !== 2) {
            this.bot.write('usage: load <mod>');
            return true;
        }
        this.bot.write('loading mod...');
        this.bot.loadMod(args[1]);
        return true;
    }
}
