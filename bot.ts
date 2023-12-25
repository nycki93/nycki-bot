export type EventMessage = { type: 'message', user: string, text: string };
export type EventLoadMod = { type: 'load_mod', name: string };
export type EventWrite = { type: 'write', text: string };
export type Event = EventMessage | EventLoadMod | EventWrite;

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
            if (event.type === 'load_mod') {
                console.log('load mod');
                await this.handleLoad(event.name);
                continue;
            }
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

    message(text: string, user: string) {
        this.push({ type: 'message', text, user });
    }

    loadMod(name: string) {
        this.push({ type: 'load_mod', name });
    }

    write(text: string) {
        this.push({ type: 'write', text });
    }

    async handleLoad(name: string) {
        const filename = `./mod-${name}.ts`;
        const className = `${name[0].toUpperCase()}${name.slice(1)}`;
        console.log(`loading ${className} from ${filename}`);
        let mod;
        try {
            const m = await import(filename);
            const M = m[className] as ModConstructor;
            mod = new M(this);
        } catch (e) {
            this.write('error: failed to load mod.');
            console.log(e);
            return;
        }
        this.mods.push(mod);
        await mod.start();
        this.write('mod loaded.');
    }
}
