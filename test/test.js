var emitter = new LocalStorageEmitter();

emitter.on('ping', function (foo, bar) {
  console.log('pong!', foo, bar);
});

function ping() {
  window.setInterval(function () {
    console.log('ping');
    emitter.emit('ping', Math.random(), {foo: 'bar'});
  }, 1000);
}
