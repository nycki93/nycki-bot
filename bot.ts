#!/usr/bin/env deno

type EventMessage = { type: 'message', text: string };
type Event = EventMessage;

type ActionListen = { type: 'listen' };
type ActionMessage = { type: 'message', text: string };
type ActionQuit = { type: 'quit' };
type Action = ActionListen | ActionMessage | ActionQuit;

type State = {
    name: string | null;
}
type Bot = Generator<Action, State, Event>;

function* botMain(): Bot {
    let state: State = { name: null };
    while (true) {
        const event: Event = yield { type: 'listen' };
        switch (event.type) {
            case 'message': {
                state = yield* handleMessage(state, event);
                break;
            }
            default: {    
                yield { 
                    type: 'message', 
                    text: `[error] unhandled event ${event}`
                };
            }
        }
    }
}

function* handleMessage(state: State, event: EventMessage): Bot {
    const args = event.text.trim().split(/\s+/);
    switch (args[0]) {
        case 'quit':
        case 'exit':
        case 'goodbye': {
            yield { type: 'message', text: 'goodbye!' };
            yield { type: 'quit' };
            return state;
        }
        case 'hi':
        case 'hello': {
            if (!state.name) {
                state = yield* getName(state);
            }
            yield { 
                type: 'message', 
                text: `hello, ${state.name}!` 
            };
            return state;
        }
        case 'ping': {
            yield { type: 'message', text: 'pong!' };
            return state;
        }
        default: {
            // do nothing for unrecognized messages
            return state;
        }
    }
}

function* getName(state: object): Bot {
    while (true) {
        yield { type: 'message', text: 'what is your name?' };
        const e: Event = yield { type: 'listen' };
        if (e.type !== 'message') continue;
        const name = e.text.trim();
        if (name.length === 0) continue;
        return { ...state, name };
    }
}

if (import.meta.main) {
    const bot = botMain();
    let t = bot.next();
    while (true) {
        if (t.done) {
            console.log('[error] bot exited unexpectedly.');
            break;
        }
        const act = t.value;
        switch (act.type) {
            case 'listen': {
                const text = prompt('bot>') || '';
                const event: Event = { type: 'message', text };
                t = bot.next(event);
                break;
            }
            case 'message': {
                console.log(act.text);
                t = bot.next();
                break;
            }
            case 'quit': {
                Deno.exit();
            }
        }
    }
}