type EventNone = { type: 'none' };
type EventExit = { type: 'exit' };
type EventMessage = { type: 'message', message: string };

type Event = EventNone | EventExit | EventMessage;

class Bot {
  state = 'idle';
  name: string | null = null;
  send(message: string): Event {
    if (this.state === 'idle') {
      return this.idle(message);
    } else if (this.state === 'hi') {
      return this.hi(message);
    }
    return { type: 'none' };
  }

  idle(message: string): Event {
    const tokens = message.trim().split(/\s+/);
    if (tokens.length === 0) {
      return { type: 'none' };
    } else if (tokens.length === 1 && tokens[0] === 'ping') {
      return {
        type: 'message',
        message: 'pong',
      }
    } else if (
      tokens.length === 1 
      && tokens[0] === 'hi' 
      && this.name === null
    ) {
      this.state = 'hi';
      return {
        type: 'message',
        message: 'hi! what is your name?'
      }
    } else if (tokens.length === 1 && tokens[0] === 'hi') {
      return {
        type: 'message',
        message: `hi, ${this.name}!`,
      }
    } else if (tokens.length === 1 && tokens[0] === 'exit') {
      return { type: 'exit' }
    } else {
      return { type: 'none' };
    }
  }

  hi(message: string): Event {
    name = message.trim();
    if (name.length === 0) {
      return {
        type: 'message',
        message: 'what is your name?'
      }
    }
    this.name = name;
    this.state = 'idle';
    return {
      type: 'message',
      message: `hi, ${name}!`,
    }
  }
}

if (import.meta.main) {
  const bot = new Bot();
  while (true) {
    const message = prompt('bot>') || '';
    const event = bot.send(message);
    if (event.type === 'message') {
      console.log(event.message);
    } else if (event.type === 'none') {
      continue;
    } else if (event.type === 'exit') {
      break;
    } else {
      console.log('[error] unknown event type', event);
    }
  }
}
