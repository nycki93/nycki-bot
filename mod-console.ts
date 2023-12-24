import { TextLineStream } from "std/streams/text_line_stream.ts";

import { Bot, Event, Mod } from "./bot.ts";

export class Console implements Mod {
    bot: Bot;
    user: string;

    constructor(bot: Bot) {
        this.bot = bot;
        this.user = 'console';
    }

    start() {
        this.listen();
        this.bot.write('console app started.');
    }

    async listen() {
        const lines = (Deno.stdin.readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TextLineStream())
        );
        for await (const line of lines) {
            // built-in command: simulate switching users
            const tokens = line.trim().split(/\s+/);
            if (tokens[0] === 'be' && tokens.length === 2) {
                this.user = tokens[1];
                console.log(`console name set to ${this.user}`);
                continue;
            }

            // otherwise, pass input to bot
            this.bot.push({ 
                type: 'message', 
                user: this.user, 
                text: line,
            });
        }
    }

    handle(e: Event) {
        if (e.type === 'message') {
            console.log(`<${e.user}> ${e.text}`);
        } else if (e.type === 'write') {
            console.log(`<bot> ${e.text}`);
        }
        return false;
    }
}
