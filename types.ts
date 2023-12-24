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

export interface Bot {
    push: (event: Event) => void,
}

export interface Plugin {
    handle: (event: Event) => void,
    start: () => void,
}

export interface PluginConstructor {
    new (bot: Bot): Plugin,
}
