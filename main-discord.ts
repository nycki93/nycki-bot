import { Client, Events, GatewayIntentBits, TextChannel, userMention } from 'npm:discord.js@14.13.0'

import { Bot, Event, Plugin } from './types.ts';
import { Commands } from './main.ts';
import { TictactoeGame } from "./tictactoe.ts";

type Config = {
    prefix: string,
    token: string,
    channel: string,
}

const DEFAULT_CONFIG = {
    prefix: '!',
    token: '',
    channel: '',
};

function readWriteConfig(path = 'config.json') {
    let config: Config;
    try {
        const json = Deno.readTextFileSync(path);
        config = { ...DEFAULT_CONFIG, ...JSON.parse(json) };
    } catch {
        config = DEFAULT_CONFIG;
    }
    Deno.writeTextFileSync(path, JSON.stringify(config, null, 2));
    return config;
}

class DiscordBot implements Bot {
    plugins: Plugin[];
    config: Config;
    client: Client;
    channel?: TextChannel;
    constructor(config: Config) {
        this.config = config;
        this.plugins = [];
        this.plugins.push(new Commands(this));
        this.plugins.push(new TictactoeGame(this));
        this.client = new Client({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]});
    }

    async write(text: string) {
        if (!this.channel) {
            console.log('[error] unable to write to channel.');
            return;
        }

        console.log(`<bot> ${text}`);
        await this.channel.send(text);
    }

    quit() {
        return;
    }

    run() {
        this.client.once(Events.ClientReady, async c => {
            console.log(`Connected as ${c.user.tag}.`);
            const ch = await c.channels.fetch(this.config.channel);
            if (!ch?.isTextBased) {
                console.log("Can't connect to non-text channel.");
                Deno.exit(1);
            }
            this.channel = ch as TextChannel;
            this.write('bot started.');
        });
    
        this.client.on(Events.MessageCreate, m => {
            if (!m.content.startsWith(this.config.prefix)) return;
            const text = m.content.slice(this.config.prefix.length);
            console.log(`<${m.author.displayName}> ${text}`)

            const e: Event = {
                type: 'message',
                user: userMention(m.author.id),
                text: text,
            }
            for (const p of this.plugins) {
                const t = p.send(e);
                if (t) break;
            }
        });
    
        this.client.login(this.config.token);
    }
}

if (import.meta.main) {
    const config = readWriteConfig();
    const bot = new DiscordBot(config);
    bot.run();
}