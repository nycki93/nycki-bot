const encoder = new TextEncoder();
const decoder = new TextDecoder();

function writeAt(text: string, line = 0) {
    return Deno.stdout.writeSync(encoder.encode(''
        + '\x1b7'           // save cursor position
        + `\x1b[${line};0H` // go to new position
        + text              // write text
        + '\x1b8'           // go back to saved position
    ));
}

let tick = 1;
async function timer() {
    while (true) {
        await new Promise(r => setTimeout(r, 1000));
        tick += 1;
    }
}
timer();

const buffer = new Uint8Array(1024);
async function getLine() {
    const n = await Deno.stdin.read(buffer);
    if (!n) return '';
    const text = decoder.decode(buffer.subarray(0, n)).trim();
    return text;
}

// clear screen
Deno.stdout.write(encoder.encode('\x1b[1J'));

while (true) {
    const event = await Promise.race([
        new Promise(r => setTimeout(r, 1000)),
        getLine(),
    ]);
    writeAt(`tick ${tick}`, 1);
    if (tick % 15 === 0) {
        writeAt('\x1b[2Kfizzbuzz', 2);
    } else if (tick % 5 === 0) {
        writeAt('\x1b[2Kbuzz', 2);
    } else if (tick % 3 === 0) {
        writeAt('\x1b[2Kfizz', 2);
    } else {
        writeAt('\x1b[2K', 2);
    }
    if (typeof event === 'string') {
        writeAt(event, 3);
    }
}
