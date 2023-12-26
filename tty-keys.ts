Deno.stdin.setRaw(true);
let chunk = new Uint8Array(0);
const reader = Deno.stdin.readable.getReader();
while (true) {
    if (chunk.length === 0) {
        const readResult = await reader.read();
        if (readResult.done) break;
        chunk = readResult.value;
        continue;
    }
    const key = chunk[0];
    chunk = chunk.slice(1);
    console.log(key);
    if (key === 3) break; // ctrl-c
}
