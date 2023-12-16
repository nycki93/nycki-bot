import { Client as IrcClient } from "irc";
import { Bot, Plugin } from "./types.ts";
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
        this.client.privmsg(CHANNEL, text);
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
        await this.client.connect(SERVER, PORT, IS_TLS);
    }
}

if (import.meta.main) {
    const bot = new IrcBot();
    bot.run();
}