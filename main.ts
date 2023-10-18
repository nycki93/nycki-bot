function rep(message: string) {
  if (message === 'ping') {
    return 'pong!';
  } else {
    return message;
  }
}

if (import.meta.main) {
  while (true) {
    const message = prompt('bot>') || '';
    const reply = rep(message);
    console.log(reply);
  }
}
