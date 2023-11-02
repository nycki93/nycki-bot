import { Bot } from './types.ts';

export function* playTicTacToe(): Bot<void> {
    yield { type: 'message', text: 'im not really feeling it sorry' };
}