import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import { Bot, Event, Plugin, PluginConstructor } from './types.ts';

class TestBot implements Bot {
    plugins: Plugin[];
    events: Event[];
    resolveNextEvent?: (event: Event) => void;
    constructor(...plugins: PluginConstructor[]) {
        this.events = [];
        this.plugins = [];
        for (const P of plugins) {
            const p = new P(this);
            this.plugins.push(p);
        }
    }

    async start() {
        for (const p of this.plugins) {
            p.start();
        }
        while (true) {
            const e = await this.shift();
            for (const p of this.plugins) {
                p.handle(e);
            }
        }
    }
    
    push(event: Event) {
        if (this.resolveNextEvent) {
            this.resolveNextEvent(event);
            this.resolveNextEvent = undefined;
        } else {
            this.events.push(event);
        }
    }

    shift() {
        if (this.events.length) {
            return Promise.resolve(this.events.shift() as Event);
        } else {
            return new Promise<Event>(r => this.resolveNextEvent = r);
        }
    }
}

class Parrot implements Plugin {
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
    }
}

export class ConsoleClient implements Plugin {
    bot: Bot;
    rl: readline.Interface;

    constructor(bot: Bot) {
        this.bot = bot;
        this.rl = readline.createInterface({
            input: stdin,
            output: stdout,
        });
    }

    start() {
        this.rl.on('line', (line) => {
            this.bot.push({
                type: 'message',
                user: 'console',
                text: line,
            });
        })
    }

    handle(e: Event) {
        if (e.type === 'message') {
            console.log(`<${e.user}> ${e.text}`);
        } else if (e.type === 'write') {
            console.log(`<bot> ${e.text}`);
        }
    }
}

if (import.meta.main) {
    const bot = new TestBot(ConsoleClient, Parrot);
    bot.start();

    let n = 0;
    while (true) {
        await new Promise(r => setTimeout(r, 10_000));
        console.log(`tick ${n}`);
        n += 1;
    }
}