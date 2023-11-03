type EventMessage = { 
    type: 'message' 
    room: string | null,
    user: string,
    text: string,
};
type Event = EventMessage;

type Actor = {
    sayGroup: (room: string, text: string) => void;
    sayDirect: (user: string, text: string) => void;
};

class PluginBase {
    act: Actor;
    constructor(act: Actor) {
        this.act = act;
    }
    sendMessage(_room: string | null, _user: string, _text: string) {
        return false;
    }
}

class Ping extends PluginBase {
    sendMessage(room: string | null, user: string, text: string) {
        const command = text.trim();
        if (command !== 'ping') return false;

        if (room) {
            this.act.sayGroup(room, `${user}: pong!`);
            return true;
        } else {
            this.act.sayDirect(user, 'pong!');
            return true;
        }
    }
}

class Hello extends PluginBase {
    users: Record<string, unknown> = {};

    sendMessage(room: string | null, user_id: string, text: string) {
        const command = text.trim();

        const user = this.users[user_id] || { };
        this.users[user_id] = user;

        if (!user.nickname) {
            user.gettingName = true;
        }

        return false;
    }
}

class Hello1 {
    act: Actor;
    aliases = ['hi', 'hello'];
    users: Record<string, unknown> = {};
    constructor(act: Actor) {
        this.act = act;
    }

    send(event: Event) {
        if (event.type !== 'message') return false;
        if (!this.aliases.includes(event.text.trim())) return false;

        const user = this.users[event.user] || this.newUser
        if (user.name) {
            this.act.write({
                room: event.room,
                user: event.user,
                text: `Hello, ${user.name}!`
            });
            return true;
        }

        this.user = this.user 
        return true;
    }
}