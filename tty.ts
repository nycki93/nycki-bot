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
    let line = '';
    while (true) {
        const c = await reader.pop();
        
        // handle single byte of input
        if (c === null) {
            // EOF
            break;
        } else if (c === 3) {
            // ctrl-c
            break;
        } else if (32 <= c && c <= 126) {
            // printable char
            line += String.fromCodePoint(c);
        } else if (c === 10 || c === 13) {
            // newline
            writer.write(encoder.encode(`\r\n`));
            line = '';
        }

        // update display
        writer.write(encoder.encode(`\x1b[1000D${line}`));
    }
}

if (import.meta.main) {
    main();
}
