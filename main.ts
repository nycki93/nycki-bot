#!/usr/bin/env deno

type ActionExit = { type: 'exit' };
type ActionMessage = { type: 'message', message: string };
type Action = ActionExit | ActionMessage;

type Command = (args: string[]) => Action[];
type CommandContext = Record<string, Command>;

class Bot {
  mode = 'idle';
  name = 'user';
  commands: CommandContext = {
    ping: this.ping,
    hello: this.hello,
    hi: this.hello,
    exit: this.exit,
    quit: this.exit,
    goodbye: this.exit,
  };

  init(): Action[] {
    return [];
  }

  send(message: string): Action[] {
    if (this.mode === 'idle') {
      const args = message.trim().split(/\s+/);
      if (args.length === 0) {
        return [];
      }
      if (args[0] in this.commands) {
        return this.commands[args[0]](args);
      }
      return [{
        type: 'message',
        message: `[error] unknown command ${args[0]}.`,
      }];
    }
    return [{
      type: 'message',
      message: `[error] unknown mode ${this.mode}.`,
    }];
  }

  exit(): Action[] {
    return [
      { type: 'message', message: 'goodbye!' },
      { type:'exit' },
    ];
  } 

  ping(): Action[] {
    return [{ type: 'message', message: 'pong!' }];
  }

  hello(): Action[] {
    return [{ type: 'message', message: `hello, ${this.name}!` }];
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
