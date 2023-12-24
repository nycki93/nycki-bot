export type EventMessage = {
    type: 'message',
    user: string,
    text: string,
}

export type EventWrite = {
    type: 'write',
    text: string,
}

export type Event = EventMessage | EventWrite;

export interface Plugin {
    handle: (event: Event) => boolean | Promise<boolean>,
    start: () => void | Promise<void>,
}

export interface PluginConstructor {
    new (bot: Bot): Plugin,
}

export class Bot {
    plugins: Plugin[];
    events: Event[];
    resolveNextEvent?: (event: Event) => void;
    constructor(...pluginConstructors: PluginConstructor[]) {
        this.events = [];
        this.plugins = [];
        for (const P of pluginConstructors) {
            const p = new P(this);
            this.plugins.push(p);
        }
    }

    async start() {
        await Promise.all(this.plugins.map(p => p.start()));
        while (true) {
            const e = await this.shift();
            for (const p of this.plugins) {
                const used = await p.handle(e);
                if (used) continue;
            }
        }
    }
    
    push(event: Event) {
        if (this.resolveNextEvent) {
            this.resolveNextEvent(event);
            this.resolveNextEvent = undefined;
        } else {
            this.events.push(event);
        }
    }

    shift() {
        if (this.events.length) {
            return Promise.resolve(this.events.shift() as Event);
        } else {
            return new Promise<Event>(r => this.resolveNextEvent = r);
        }
    }

    write(text: string) {
        this.push({ type: 'write', text });
    }
}
