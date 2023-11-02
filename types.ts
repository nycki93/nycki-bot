export type EventMessage = { type: 'message', text: string };
export type Event = EventMessage;

export type ActionListen = { type: 'listen' };
export type ActionMessage = { type: 'message', text: string };
export type ActionQuit = { type: 'quit' };
export type Action = ActionListen | ActionMessage | ActionQuit;

export type Actor<T> = Generator<Action, T, Event>;