#!/usr/bin/env deno

type ActionExit = { type: 'exit' };
type ActionMessage = { type: 'message', message: string };

type Action = ActionExit | ActionMessage;

class Bot {
  state = 'idle';
  name: string | null = null;

  init(): Action[] {
    return [];
  }

  send(message: string): Action[] {
    if (this.state === 'idle') {
      return this.idle(message);
    } else if (this.state === 'hi') {
      return this.hi(message);
    }
    return [];
  }

  idle(message: string): Action[] {
    const args = message.trim().split(/\s+/);
    const argc = args.length;
    if (argc === 0) {
      return [];
    } else if (argc === 1 && args[0] === 'ping') {
      return [{
        type: 'message',
        message: 'pong',
      }]
    } else if (argc === 1 && args[0] === 'hi' && this.name === null) {
      this.state = 'hi';
      return [{
        type: 'message',
        message: 'hi! what is your name?'
      }]
    } else if (argc === 1 && args[0] === 'hi') {
      return [{
        type: 'message',
        message: `hi, ${this.name}!`,
      }]
    } else if (argc === 1 && args[0] === 'exit') {
      return [{ type: 'exit' }];
    } else {
      return [];
    }
  }

  hi(message: string): Action[] {
    name = message.trim();
    if (name.length === 0) {
      return [{
        type: 'message',
        message: 'what is your name?'
      }];
    }
    this.name = name;
    this.state = 'idle';
    return [{
      type: 'message',
      message: `hi, ${name}!`,
    }];
  }
}

if (import.meta.main) {
  const bot = new Bot();
  const actions = bot.init();
  while (true) {
    const a = actions.shift();
    if (!a) {
      // no pending actions; get user input
      const message = prompt('bot>') || '';
      actions.push(...bot.send(message));
      continue;
    } else if (a.type === 'message') {
      console.log(a.message);
    } else if (a.type === 'exit') {
      break;
    } else {
      console.log('[error] unknown action', a);
    }
  }
}
