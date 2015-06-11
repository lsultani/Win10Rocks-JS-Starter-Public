var main = require('../main.node'),
    ioc = require('../helper/ioc.node'),
    async = require('async'),
    base = require('./base.node'),
    classHelper = require('../helper/class.node'),
    loki = require('lokijs'),
    util = require('util');

var _constructor = function (options) {
    this._lokiDBKey = "bdf6a7de-f243-4d42-8e91-e5c974b53051";
};

var members = {
    load: function (done) {
        var that = this;
        base.prototype.load.call(this, function () {
            that._lokiAdapter = new lokiStorageAdapter();
            that._db = new loki(that._lokiDBKey, { adapter: that._lokiAdapter });
            that._db.loadDatabase(require('../model/mapping.node'), function (resp) {
                if (resp === 'Database not found')
                    that._db.saveDatabase();
                return done();
            });
        });
    },

    unload: function (done) {
        var that = this;
        if (that._db)
            that._db.saveDatabase();
        return done();
    }
};

module.exports = classHelper.derive(require('./base.node'), _constructor, members);

/// Loki Storage Adapter
var lokiStorageAdapter = classHelper.define(function () { }, {
    _storageProvider: null,
    _lokiStorageKey: "-lokiStorage.json",
    loadDatabase: function (dbname, callback) {
        if (!this._storageProvider)
            this._storageProvider = ioc.get("storageProvider");
        var dbStorageKey = dbname + this._lokiStorageKey;
        this._storageProvider.fetch(dbStorageKey,
            function (err, resp) {
                if (err)
                {
                    if(err === 'does-not-exist')
                        return callback();
                    return callback(err);
                }
                return callback(resp);
            });
    },
    saveDatabase: function (dbname, dbstring, callback) {
        var dbStorageKey = dbname + this._lokiStorageKey;
        this._storageProvider.save(dbStorageKey,
            dbstring,
            function (err) {
                if (err)
                    return callback(err);
                return callback();
            });
    }
});