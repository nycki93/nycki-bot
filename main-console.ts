import { TextLineStream } from 'std/streams/text_line_stream.ts';

import { Bot, Event, Plugin } from './types.ts';

class TestBot implements Bot {
    plugins: Plugin[];
    constructor() {
        this.plugins = [];
        this.plugins.push(new ConsoleClient(this));
    }

    write(text: string) {
        console.log(`<bot> ${text}`);
    }

    quit() {
        return false;
    }
}

export class ConsoleClient implements Plugin {
    bot: Bot

    constructor(bot: Bot) {
        this.bot = bot;
        this.listen();
    }

    async listen() {
        const lines = (Deno.stdin.readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TextLineStream())
        );
        for await (const line of lines) {
            console.log(`<console> ${line}`);
        }
    }

    handle(_e: Event) {
        return false;
    }
}

if (import.meta.main) {
    new TestBot();
    let n = 0;
    while (true) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(`tick ${n}`);
        n += 1;
    }
}