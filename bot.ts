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
    handle: (event: Event) => void,
    start: () => void,
}

export interface PluginConstructor {
    new (bot: Bot): Plugin,
}

export class Bot {
    plugins: Plugin[];
    events: Event[];
    resolveNextEvent?: (event: Event) => void;
    constructor(...plugins: PluginConstructor[]) {
        this.events = [];
        this.plugins = [];
        for (const P of plugins) {
            const p = new P(this);
            this.plugins.push(p);
        }
    }

    async start() {
        for (const p of this.plugins) {
            p.start();
        }
        while (true) {
            const e = await this.shift();
            for (const p of this.plugins) {
                p.handle(e);
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
