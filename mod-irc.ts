import { Client } from 'irc/mod.ts';
import { PrivmsgEvent } from "irc/plugins/privmsg.ts";

import { Bot, Event, Mod } from './bot.ts';

const SERVER = 'irc.esper.net';
const PORT = 6697;
const IS_TLS = true;
const CHANNEL = '#nycki';
const NICK = 'nycki-bot';
const PREFIX = 'nb ';

export class Irc implements Mod {
    bot: Bot;
    client: Client;
    constructor(bot: Bot) {
        this.bot = bot;
        this.client = new Client({
            nick: NICK,
            channels: [CHANNEL],
        });
        this.client.on('privmsg:channel', (m: PrivmsgEvent) => {
            const { target, text } = m.params;
            if (target !== CHANNEL) return;
            if (!text.startsWith(PREFIX)) return;

            this.bot.push({ 
                type: 'message', 
                user: m.source?.name || 'UNKNOWN',
                text: text.slice(PREFIX.length),
            });
        });
    }

    async start() {
        await this.client.connect(SERVER, PORT, IS_TLS);
        this.client.join(CHANNEL);
        await new Promise<void>(r => {
            this.client.once('join', () => r());
        });
        this.bot.write('irc app started.');
    }

    handle(e: Event) {
        if (e.type === 'write') {
            for (const line of e.text.split('\n')) {
                this.client.privmsg(CHANNEL, line);
            }
        }
        return false;
    }
}
