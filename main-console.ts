import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import { Bot, Event, Plugin } from './bot.ts';
import { TictactoeGame } from "./plugin-tictactoe.ts";

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
    const bot = new Bot(ConsoleClient, TictactoeGame);
    bot.start();
}
