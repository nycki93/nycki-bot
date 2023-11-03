export type Event = {
    type: 'message',
    user: string,
    text: string
}

export interface Bot {
    write: (text: string) => void,
    quit: () => void,
}

export interface Plugin {
    send: (event: Event) => boolean,
}
