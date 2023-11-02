#!/usr/bin/env deno

type ActionExit = { type: 'exit' };
type ActionListen = { type: 'listen' };
type ActionMessage = { type: 'message', message: string };
type Action = ActionExit | ActionListen | ActionMessage;

type Command = (args: string[]) => Action[];

enum BOT_MODE { idle, getName }

class Bot {
  mode = BOT_MODE.idle;
  name: string | null = null;
  commands: Record<string, Record<string, Command>> = {
    idle: {
      ping: this.ping,
      hello: this.hello,
      hi: this.hello,
      exit: this.exit,
      quit: this.exit,
      goodbye: this.exit,
    }
  }

  init(): Action[] {
    return [];
  }

  send(message: string): Action[] {
    if (this.mode === BOT_MODE.idle) {
      const args = message.trim().split(/\s+/);
      if (args.length === 0) {
        return [];
      }
      if (args[0] in this.commands.idle) {
        return this.commands.idle[args[0]].call(this, args);
      }
      return [{
        type: 'message',
        message: `[error] unknown command ${args[0]}.`,
      }];
    } else if (this.mode === BOT_MODE.getName) {
      return this.getName(message);
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
    if (this.name !== null) {
      return [{ type: 'message', message: `hello, ${this.name}!` }];
    } else {
      this.mode = BOT_MODE.getName;
      return this.getName('');
    }
  }

  getName(message: string): Action[] {
    const name = message.trim();
    if (name.length === 0) {
      return [{
        type: 'message',
        message: 'what is your name?'
      }];
    } else {
      this.name = name;
      this.mode = BOT_MODE.idle;
      return this.hello();
    }
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
