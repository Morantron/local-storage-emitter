/* globals chai, LocalStorageEmitter, before, describe, it, mocha */

var expect = chai.expect
  , assert = chai.assert
  , $iframe
  , iframe_loaded
  , emitter;

var $iframe = $('<iframe/>').attr({
  src: 'http://' + window.location.host + '/base/spec/other-tab.html'
, style: 'display: none'
});

$iframe.appendTo('body');

before(function () {
  window.localStorage.clear();
  emitter = new LocalStorageEmitter();
});

afterEach( function () {
  emitter.removeAllListeners('pong');
});

describe('Communication with other tab', function () {
  it('waits for the iframe to load', function (done) {
    // wait a little bit for the iframe to load
    var interval = window.setInterval(function () {
      if (iframe_loaded) {
        window.clearInterval(interval);
        done();
      }
    }, 50);
  });

  it('should emit and receive events to other tabs', function (done) {
    emitter.on('pong', function () {
      assert(true);
      done();
    });

    emitter.emit('ping');
  });
});

describe('once', function () {
  it('should not respond to the same event more than once', function (done) {
    var count = 0;

    emitter.once('pong', function () {
      count++;
    });

    emitter.emit('ping');
    emitter.emit('ping');
    emitter.emit('ping');
    emitter.emit('ping');
    emitter.emit('ping');

    window.setTimeout(function () {
      count.should.equal(1);
      done();
    }, 1);
  });
});

describe('setMaxListeners', function () {
  it('sets the maxListeners var in the configuration object of the emitter', function () {
    emitter.conf.maxListeners.should.equal(0);
    emitter.setMaxListeners(20);
    emitter.conf.maxListeners.should.equal(20);
  });
});

describe('listeners', function () {
  it('returns and array of callback functions', function () {
    var a = function () { console.log('a');}
      , b = function () { console.log('b');}
      , c = function () { console.log('c');};

    expect(emitter.listeners('pong')).to.deep.equal(undefined);

    emitter.on('pong', a);
    emitter.on('pong', b);
    emitter.on('pong', c);

    expect(emitter.listeners('pong')).to.deep.equal([a, b, c]);
  });
});

describe('removeAllListeners', function () {
  it('removes all listeners from an specified event', function () {
    var a = function () { console.log('a');}
      , b = function () { console.log('b');}
      , c = function () { console.log('c');};


    emitter.on('pong', a);
    emitter.on('pong', b);
    emitter.on('pong', c);

    expect(emitter.listeners('pong')).to.deep.equal([a, b, c]);

    emitter.removeAllListeners('pong');

    expect(emitter.listeners('pong')).to.deep.equal(undefined);
  });

  it('returns an emitter', function () {
    var a = function () { console.log('a');}
      , b = function () { console.log('b');}
      , c = function () { console.log('c');};

    emitter.on('pong', a);
    emitter.on('pong', b);
    emitter.on('pong', c);

    expect(emitter.listeners('pong')).to.deep.equal([a, b, c]);

    expect(emitter.off('pong', b)).to.be.instanceof(LocalStorageEmitter);
    expect(emitter.off('pong', b)).to.equal(emitter);
  });
});

describe('off', function () {
  it('removes an specified callback from an event', function () {
    var a = function () { console.log('a');}
      , b = function () { console.log('b');}
      , c = function () { console.log('c');};

    emitter.on('pong', a);
    emitter.on('pong', b);
    emitter.on('pong', c);

    expect(emitter.listeners('pong')).to.deep.equal([a, b, c]);

    emitter.off('pong', b);

    expect(emitter.listeners('pong')).to.deep.equal([a, c]);
  });

  it('returns an emitter', function () {
    var a = function () { console.log('a');}
      , b = function () { console.log('b');}
      , c = function () { console.log('c');};

    emitter.on('pong', a);
    emitter.on('pong', b);
    emitter.on('pong', c);

    expect(emitter.listeners('pong')).to.deep.equal([a, b, c]);

    expect(emitter.off('pong', b)).to.be.instanceof(LocalStorageEmitter);
    expect(emitter.off('pong', b)).to.equal(emitter);
  });

  //TODO specs for on and emit
});
