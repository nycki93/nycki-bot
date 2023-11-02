import { Actor } from './types.ts';

export function* playTicTacToe(): Actor<void> {
    yield { type: 'message', text: 'im not really feeling it sorry' };
}