type Event = {
    type: 'message'
    text: string
}

interface Bot {
    write: (text: string) => void,
    quit: () => void,
}

interface Plugin {
    send: (event: Event) => boolean,
}

class Commands implements Plugin {
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    send(e: Event) {
        if (e.type !== 'message') return false;
        const text = e.text.trim();
        if (text === 'ping') {
            this.bot.write('pong');
            return true;
        } else if (
            text === 'quit'
            || text === 'exit'
            || text === 'goodbye'
        ) {
            this.bot.quit();
            return true;
        }
        return false;
    }
}

class TictactoeGame implements Plugin {
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    send(e: Event) {
        if (e.type !== 'message') return false;
        const args = e.text.trim().split(/\s+/);
        if (args[0] === 'play') {
            this.bot.write('game not implemented');
            return true;
        }
        return false;
    }
}

class TestBot implements Bot {
    plugins: Plugin[];
    done = false;
    constructor() {
        this.plugins = [];
        this.plugins.push(new Commands(this));
        this.plugins.push(new TictactoeGame(this));
    }

    write(text: string) {
        console.log(text);
    }

    quit() {
        this.done = true;
    }

    run() {
        while (!this.done) {
            const text = prompt('bot>') || '';
            const e: Event = {
                type: 'message',
                text,
            }
            for (const p of this.plugins) {
                const t = p.send(e);
                if (t) break;
            }
        }
    }
}

if (import.meta.main) {
    const bot = new TestBot();
    bot.run();
}