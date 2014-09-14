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

    console.log('emitting ping');
    emitter.emit('ping');
  });
});
