import { Commands } from "./mod-commands.ts";
import { Console } from "./mod-console.ts";
import { Discord } from "./mod-discord.ts";
import { Irc } from "./mod-irc.ts";
import { Parrot } from "./mod-parrot.ts";
import { Tictactoe } from "./mod-tictactoe.ts";
import { Bot } from './bot.ts';

if (import.meta.main) {
    const bot = new Bot(
        Console, 
        Discord,
        Irc, 
        Commands,
        Tictactoe,
        Parrot, 
    );
    bot.start();
}
