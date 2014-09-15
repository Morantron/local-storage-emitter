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

  /**
   * LocalStorageEmitter constructor
   */
  function LocalStorageEmitter() {
    this._events = {};
    this.conf = {
      maxListeners: 0
    };
    window.addEventListener('storage', this._onStorage.bind(this));
  }

  LocalStorageEmitter.prototype.namespace = '__local_storage_emitter__';

  /**
   * On storage event callback. Looks up the event in the internal _events
   * hash, parses the arguments received in the packet and calls all set up
   * callbacks.
   *
   * @param {Event}
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
   * Parses a packet from from localStorage
   *
   * @param {String} key
   */
  LocalStorageEmitter.prototype._parsePacket = function (key) {
    return JSON.parse(window.localStorage.getItem(key));
  };

  /**
   * Gets the event name prepended by a emitter namespace.
   */
  LocalStorageEmitter.prototype._getEventName = function (eventName) {
    return this.namespace + eventName;
  };

  /**
   * Returns a unique string. Used to force change events in localStorage
   *
   * @return {String}
   */
  LocalStorageEmitter.prototype._getUniqueString = function () {
    return [] + (new Date()).getTime() + Math.random();
  };

  /**
   * Builds a packet to be sent through LocalStorage
   *
   * @param {Array} args
   * @return {String} packet
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
   * Sets the maximum amount of listeners for event name
   *
   * @param {Number} max
   */
  LocalStorageEmitter.prototype.setMaxListeners = function (max) {
    this.conf.maxListeners = max;
  };

  /**
   * Adds a listener
   *
   * @param {String} eventName
   * @param {Function} callback
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
   * Adds a listener that will be invoked only once
   *
   * @param {String} eventName
   * @param {Function} callback
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
   * @return {Array<Function>} callbacks
   */
  LocalStorageEmitter.prototype.listeners = function (eventName) {
    return this._events[this._getEventName(eventName)];
  };

  /**
   * Prototype.removes all listeners
   *
   * @param {String} eventName
   * @return {LocalStorageEmitter} emitter
   */
  LocalStorageEmitter.prototype.removeAllListeners = function (eventName) {
    delete this._events[this._getEventName(eventName)];

    return this;
  };

  /**
   * Removes listener from emitter
   *
   * @param {String} eventName
   * @param {Function} callback
   */
  LocalStorageEmitter.prototype.off = function (eventName, callback) {
    var i = this._events[this._getEventName(eventName)].indexOf(callback);

    if (i > -1) {
      this._events[this._getEventName(eventName)].splice(i, 1);
    }

    return this;
  };

  LocalStorageEmitter.prototype.removeListener = LocalStorageEmitter.prototype.off;

  /**
   * Emits event through localStorage
   *
   * @param {String} eventName
   */
  LocalStorageEmitter.prototype.emit = function (eventName) {
    window.localStorage.setItem(this._getEventName(eventName), this._buildPacket(arguments));
  };

  return LocalStorageEmitter;
}));
