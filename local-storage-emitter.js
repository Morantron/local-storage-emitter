(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return (root.LocalStorageEmitter = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals
    root.LocalStorageEmitter = factory();
  }
}(this, function () {

  function LocalStorageEmitter() {
    this.events = {};
    window.addEventListener('storage', this._onStorage.bind(this));
  }

  LocalStorageEmitter.prototype.namespace = '__local_storage_emitter__';

  LocalStorageEmitter.prototype._onStorage = function (event) {
    var callbacks = this.events[event.key];

    if (callbacks.length > 0) {
      callbacks.forEach(function (callback) {
        callback.apply(this, this._parsePacket(event.key).args);
      }, this);
    }
  };

  LocalStorageEmitter.prototype._parsePacket = function (key) {
    return JSON.parse(window.localStorage.getItem(key));
  };

  LocalStorageEmitter.prototype._getEventName = function (eventName) {
    return this.namespace + eventName;
  };

  LocalStorageEmitter.prototype.on = function (eventName, callback) {
    var eventKey = this._getEventName(eventName);

    if (!this.events[eventKey]) {
      this.events[eventKey] = [];
    }

    this.events[eventKey].push(callback);
  };

  LocalStorageEmitter.prototype._getUniqueString = function () {
    return [] + (new Date()).getTime() + Math.random();
  };

  LocalStorageEmitter.prototype._buildPacket = function (args) {
    args = Array.prototype.slice.call(args);
    args.shift();

    //TODO if no args => undefined

    return JSON.stringify({
      uid: this._getUniqueString()
    , args: args
    });
  };

  LocalStorageEmitter.prototype.off = function (eventName, callback) {
    //TODO passed callback
    delete this.events[this._getEventName(eventName)];
  };

  LocalStorageEmitter.prototype.emit = function (eventName) {
    window.localStorage.setItem(this._getEventName(eventName), this._buildPacket(arguments));
  };

  return LocalStorageEmitter;
}));
