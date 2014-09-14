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
    this._events = {};
    this.conf = {
      maxListeners: 0
    };
    window.addEventListener('storage', this._onStorage.bind(this));
  }

  LocalStorageEmitter.prototype.namespace = '__local_storage_emitter__';

  /**
   * prototype._onStorage
   */
  LocalStorageEmitter.prototype._onStorage = function (event) {
    var callbacks = this._events[event.key];

    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(function (callback) {
        callback.apply(this, this._parsePacket(event.key).args);
      }, this);
    }
  };

  /**
   * prototype._parsePacket
   */
  LocalStorageEmitter.prototype._parsePacket = function (key) {
    return JSON.parse(window.localStorage.getItem(key));
  };

  /**
   * prototype._getEventName
   */
  LocalStorageEmitter.prototype._getEventName = function (eventName) {
    return this.namespace + eventName;
  };

  /**
   * prototype._getUniqueString
   */
  LocalStorageEmitter.prototype._getUniqueString = function () {
    return [] + (new Date()).getTime() + Math.random();
  };

  /**
   * prototype._buildPacket
   */
  LocalStorageEmitter.prototype._buildPacket = function (args) {
    args = Array.prototype.slice.call(args);
    args.shift();

    return JSON.stringify({
      uid: this._getUniqueString()
    , args: args
    });
  };

  /**
   * Prototype.sets max listeners
   *
   * @param {Number} max
   */
  LocalStorageEmitter.prototype.setMaxListeners = function (max) {
    this.conf.maxListeners = max;
  };

  /**
   * prototype.on
   */
  LocalStorageEmitter.prototype.on = function (eventName, callback) {
    var eventKey = this._getEventName(eventName)
      , max = this.conf.maxListeners;

    if (!this._events[eventKey]) {
      this._events[eventKey] = [];
    }

    this._events[eventKey].push(callback);

    if (max > 0 && this._events[eventKey].length > max && !this._events[eventKey].warned) {
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[eventKey].length);

      this._events[eventKey].warned = true;
    }
  };

  /**
   * prototype.on
   */
  LocalStorageEmitter.prototype.once = function (eventName, callback) {
    var self = this
      , wrapCallback;

    wrapCallback = function () {
      callback.apply(self, arguments);
      self.off(eventName, wrapCallback);
    };

    self.on(eventName, wrapCallback);
  };

  /**
   * Prototype.listeners
   *
   * @param {String} eventName
   */
  LocalStorageEmitter.prototype.listeners = function (eventName) {
    return this._events[eventName];
  };

  /**
   * Prototype.removes all listeners
   *
   * @param {String} eventName
   */
  LocalStorageEmitter.prototype.removeAllListeners = function (eventName) {
    delete this._events[this._getEventName(eventName)];

    return this;
  };

  /**
   * prototype.off
   */
  LocalStorageEmitter.prototype.off = function (eventName, callback) {
    var i = this._events[this._getEventName(eventName)].indexOf(callback);

    if (i > -1) {
      this._events[this._getEventName(eventName)].splice(i, 1);
    }

    return this;
  };

  /**
   * prototype.emit
   */
  LocalStorageEmitter.prototype.emit = function (eventName) {
    window.localStorage.setItem(this._getEventName(eventName), this._buildPacket(arguments));
  };

  return LocalStorageEmitter;
}));
