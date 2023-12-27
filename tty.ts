// http://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.htm

const CURSOR_HIDE = '\x1b[?25l';
const CURSOR_SHOW = '\x1b[?25h';
const CURSOR_SET_COLUMN = (n: number) => `\x1b[${n}G`
const CLEAR_SCREEN = '\x1b[2J';
const CLEAR_LINE_RIGHT = '\x1b[0K';

const EOF = null;
const CTRL_C = 3;
const IS_PRINTABLE = (n: number) => (32 <= n && n < 127);
const CR = 10;
const LF = 13;
const ARROW_RIGHT = [27, 91, 67];
const ARROW_LEFT = [27, 91, 68];
const BACKSPACE = 127;

class CharReader {
    stream: ReadableStream<Uint8Array>;
    chunk: Uint8Array;
    reader: ReadableStreamDefaultReader;
    constructor(stream: ReadableStream<Uint8Array>) {
        this.stream = stream;
        this.chunk = new Uint8Array(0);
        this.reader = stream.getReader();
    }

    async pop() {
        const c = await this.peek();
        this.chunk = this.chunk.slice(1);
        return c;
    }

    async peek() {
        while (this.chunk.length === 0) {
            const readResult = await this.reader.read();
            if (readResult.done) {
                return null;
            }
            this.chunk = readResult.value;
        }
        return this.chunk.at(0) as number;
    }

    push(c: number) {
        return new Uint8Array([c, ...this.chunk]);
    }
}

async function main() {
    Deno.stdin.setRaw(true);
    const reader = new CharReader(Deno.stdin.readable);
    const writer = Deno.stdout.writable.getWriter();
    const encoder = new TextEncoder();
    const write = (text: string) => writer.write(encoder.encode(text));
    
    write(CLEAR_SCREEN);
    let input_text = '';
    let input_pos = 0;
    while (true) {
        const c = await reader.pop();
        
        // handle single input
        if (c === EOF) {
            break;
        } else if (c === CTRL_C) {
            break;
        } else if (IS_PRINTABLE(c)) {
            const left = input_text.slice(0, input_pos);
            const right = input_text.slice(input_pos);
            const char = String.fromCodePoint(c);
            input_text = left + char + right;
            input_pos += 1;
        } else if (c === CR || c === LF) {
            writer.write(encoder.encode(`\n`));
            input_text = '';
            input_pos = 0;
        } else if (c === ARROW_LEFT[0]) {
            const c1 = await reader.pop();
            const c2 = await reader.pop();
            const [_l0, l1, l2] = ARROW_LEFT;
            if (c1 === l1 && c2 === l2 && input_pos > 0) {
                input_pos -= 1;
            }
            const [_r0, r1, r2] = ARROW_RIGHT;
            if (c1 === r1 && c2 === r2 && input_pos < input_text.length) {
                input_pos += 1;
            }
        } else if (c === BACKSPACE) {
            const left = input_text.slice(0, input_pos-1);
            const right = input_text.slice(input_pos);
            input_text = left + right;
            input_pos -= 1;
        }

        // update display
        write(''
            + CURSOR_HIDE
            + '\r' + input_text + CLEAR_LINE_RIGHT
            + CURSOR_SET_COLUMN(input_pos + 1)
            + CURSOR_SHOW
        );
    }
}

if (import.meta.main) {
    main();
}
