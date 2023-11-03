import { Bot, Event, Plugin } from './types.ts';
import { TictactoeGame } from "./tictactoe.ts";

class Commands implements Plugin {
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    send(e: Event) {
        if (e.type !== 'message') return false;
        const text = e.text.trim();
        if (text === 'ping') {
            this.bot.write('pong');
            return true;
        }
        if (['hello', 'hi'].includes(text)) {
            this.bot.write(`hello, ${e.user}!`);
            return true;
        }
        if (['quit', 'exit', 'goodbye'].includes(text)) {
            this.bot.quit();
            return true;
        }
        return false;
    }
}

class TestBot implements Bot {
    plugins: Plugin[];
    done = false;
    user = 'user';
    constructor() {
        this.plugins = [];
        this.plugins.push(new Commands(this));
        this.plugins.push(new TictactoeGame(this));
    }

    write(text: string) {
        console.log(`<bot> ${text}`);
    }

    quit() {
        this.done = true;
    }

    run() {
        while (!this.done) {
            const text = prompt(`<${this.user}>`) || '';

            // simulate switching users
            const tokens = text.trim().split(/\s+/);
            if (tokens[0] === 'be' && tokens.length === 2) {
                this.user = tokens[1];
                continue;
            }
            
            // otherwise, pass input to plugins
            const e: Event = {
                type: 'message',
                user: this.user,
                text: text,
            }
            for (const p of this.plugins) {
                const t = p.send(e);
                if (t) break;
            }
        }
    }
}

if (import.meta.main) {
    const bot = new TestBot();
    bot.run();
}