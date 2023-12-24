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

export interface Mod {
    handle: (event: Event) => boolean | Promise<boolean>,
    start: () => void | Promise<void>,
}

export interface ModConstructor {
    new (bot: Bot): Mod,
}

export class Bot {
    mods: Mod[];
    events: Event[];
    resolveNextEvent?: (event: Event) => void;
    constructor(...modConstructors: ModConstructor[]) {
        this.events = [];
        this.mods = [];
        for (const Mod of modConstructors) {
            const mod = new Mod(this);
            this.mods.push(mod);
        }
    }

    async start() {
        await Promise.all(this.mods.map(a => a.start()));
        while (true) {
            const event = await this.shift();
            for (const mod of this.mods) {
                const used = await mod.handle(event);
                if (used) break;
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
