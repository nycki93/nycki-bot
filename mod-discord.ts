import { Client, Events, GatewayIntentBits, TextChannel, userMention } from 'discord'
import { Bot, Event, Mod } from "./bot.ts";

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

export class Discord implements Mod {
    bot: Bot;
    config: Config;
    client: Client;
    channel?: TextChannel;
    constructor(bot: Bot) { 
        this.bot = bot;
        this.config = readWriteConfig();
        this.client = new Client({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]});
    }

    async start() {
        this.client.once(Events.ClientReady, async (c) => {
            console.log(`[discord] connected as ${c.user.tag}`);
            const ch = await c.channels.fetch(this.config.channel);
            if (!ch?.isTextBased) {
                console.log(`[discord] can't connect to non-text channel`);
                return;
            }
            this.channel = ch as TextChannel;
            this.bot.write('discord app started.');
        });

        this.client.on(Events.MessageCreate, (m) => {
            if (!m.content.startsWith(this.config.prefix)) return;
            const text = m.content.slice(this.config.prefix.length);
            this.bot.push({
                type: 'message',
                user: userMention(m.author.id),
                text,
            });
        });

        await this.client.login(this.config.token);
    }

    async handle(e: Event) {
        if (e.type === 'write') {
            if (!this.channel) {
                console.log(`[discord] error: unable to write to channel`);
                return false;
            }
            await this.channel.send(e.text);
            return false;
        }
        return false;
    }
}