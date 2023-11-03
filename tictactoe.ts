import { Bot, Event, Plugin } from "./types.ts";

export class TictactoeGame implements Plugin {
    bot: Bot;
    player_x?: string;
    player_o?: string;
    board = Array(9).fill(null).map((_v, i) => (i+1).toString());
    constructor(bot: Bot) {
        this.bot = bot;
    }

    send(e: Event) {
        if (e.type !== 'message') return false;
        const args = e.text.trim().split(/\s+/);
        if (args[0] === 'join') return this.join(e, args);
        if (args[0] === 'play') return this.play(e, args);
        return false;
    }

    join(e: Event, args: string[]) {
        if (this.player_x && this.player_o) {
            this.bot.write('cannot join now, game in progress.');
            return true;
        }
        if (args.length !== 2 || !['x', 'o'].includes(args[1])) {
            this.bot.write('usage: join <x|o>')
            return true;
        }
        if (
            (args[1] === 'x' && this.player_x)
            || (args[1] === 'o' && this.player_o)
        ) {
            this.bot.write('that seat is already occupied!');
            return true;
        }

        // successfully seat new player
        if (args[1] === 'x') {
            this.player_x = e.user;
            this.bot.write(`${e.user} joined as player x.`);
        } else {
            this.player_o = e.user;
            this.bot.write(`${e.user} joined as player o.`);
        }

        if (this.player_x && this.player_o) {
            this.bot.write('game started!');
            this.bot.write(this.draw());
        }

        return true;
    }

    play(e: Event, args: string[]) {
        if (!this.player_x || !this.player_o) {
            this.bot.write('not enough players to begin.');
            return true;
        }

        let team;
        if (e.user === this.player_x) {
            team = 'x';
        } else if (e.user === this.player_o) {
            team = 'o';
        } else {
            this.bot.write('you are not in this game!');
            return true;
        }

        const target = Number(args.length > 1 && args[1]) - 1;
        if (args.length !== 2 || !(target in this.board)) {
            this.bot.write('usage: play <1-9>');
            return true;
        }

        this.board[target] = team;
        this.bot.write(this.draw());
        return true;
    }

    template = ('\n' +
        ' 1 | 2 | 3 \n' +
        '---|---|---\n' +
        ' 4 | 5 | 6 \n' +
        '---|---|---\n' +
        ' 7 | 8 | 9 '
    );
    draw() {
        let r = this.template;
        this.board.forEach((v, i) => {
            r = r.replace((i+1).toString(), v);
        });
        return r;
    }
}