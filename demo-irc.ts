import { Client as IrcClient } from "irc";
import { Bot, Event, Plugin } from "./types.ts";
import { Commands } from "./main.ts";
import { TictactoeGame } from "./tictactoe.ts";

const SERVER = 'irc.esper.net';
const PORT = 6697;
const IS_TLS = true;
const CHANNEL = '#nycki';
const NICK = 'nycki-bot';
const PREFIX = 'nb ';

class IrcBot implements Bot {
    plugins: Plugin[];
    client: IrcClient;
    constructor() {
        this.client = new IrcClient({ 
            nick: NICK, 
            channels: [CHANNEL],
        });
        this.plugins = [];
        this.plugins.push(new Commands(this));
        this.plugins.push(new TictactoeGame(this));
    }

    write(text: string) {
        console.log(text);
        for (const line of text.split('\n')) {
            console.log(`<${NICK}> ${line}`);
            this.client.privmsg(CHANNEL, line);
        }
    }

    quit() {
        return;
    }

    async run() {
        this.client.on('join', (m) => {
            const { channel } = m.params;
            if (channel !== CHANNEL) return;
            this.client.privmsg(CHANNEL, 'bot started.');
        });

        this.client.on('privmsg:channel', (m) => {
            const { target, text } = m.params;
            if (target !== CHANNEL) return;

            const name = m.source?.name || 'UNKNOWN';
            console.log(`<${name}> ${text}`);
            
            if (!text.startsWith(PREFIX)) return;
            const command = text.slice(PREFIX.length);
            const e: Event = {
                type: 'message',
                user: name,
                text: command,
            };
            for (const p of this.plugins) {
                const t = p.send(e);
                if (t) break;
            }
        });

        await this.client.connect(SERVER, PORT, IS_TLS);
    }
}

if (import.meta.main) {
    const bot = new IrcBot();
    bot.run();
}
