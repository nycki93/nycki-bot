import { AppConsole } from "./app-console.ts";
import { AppDiscord } from "./app-discord.ts";
import { AppIrc } from "./app-irc.ts";
import { AppParrot } from "./app-parrot.ts";
import { AppTictactoe } from "./app-tictactoe.ts";
import { Bot } from './bot.ts';

if (import.meta.main) {
    const bot = new Bot(
        AppConsole, 
        AppDiscord,
        AppIrc, 
        AppParrot, 
        AppTictactoe,
    );
    bot.start();
}
