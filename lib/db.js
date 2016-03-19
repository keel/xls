/*

数据库操作
 */

'use strict';
var mongodb = require('mongodb');
var mongo = mongodb.MongoClient;
var db;
var colls = {};
var dbName = 'lysms';
var mongoUrl = 'mongodb://keel:jsLy_0107@127.0.0.1:27017/lysms';

var vlog = require('vlog').instance(__filename);

var initDB = function(callback) {

  if (db) {
    if (!mongo) {
      vlog.error('mongo is null! will rebuild it.');
      mongo = require('mongodb').MongoClient;
      db = null;
      init(callback);
      return;
    }
    mongo.close(function(err, re) {
      if (err) {
        vlog.error(err, err.stack);
        callback('mongo close error');
        return;
      }
      db = null;
      // coll = null;
      vlog.log('mongo closed');
      init(callback);
      return;
    });
    return;
  }
  mongo.connect(mongoUrl, function(err, database) {
    // assert.equal(null, err);
    if (err) {
      vlog.error(err, err.stack);
      callback('mongo connect error:[%s] db:[%s]', mongoUrl, dbName);
      return;
    }
    db = database;
    if (db) {
      db.stats(function(err, stats) {
        if (err) {
          vlog.error(err, err.stack);
          callback('mongo connected but db stats error.' + stats);
          return;
        }
        vlog.log('mongo stats:%j', stats);
        if (!stats || stats.ok !== 1) {
          vlog.error('mongo stats error %j', stats);
          callback('mongo stats error:' + stats);
          return;
        }
        vlog.log('mongo inited OK.');
        callback(null, 'ok');
      });
    }
  });

};


var init = function(callback) {
  // var configArr = ['dbName', 'mongoUrl'];
  // cache.readConfig(configArr, function(err, re) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   dbName = re.dbName;
  //   mongoUrl = re.mongoUrl;
  //   initDB(callback);
  // });

  initDB(callback);
};



var checkColl = function(name, callback) {
  var cl = colls[name];
  if (!cl) {
    if (!db) {
      init(function(err) {
        if (err) {
          return callback(err);
        }
        db.collection(name, function(err, coll) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, coll);
          colls[name] = coll;
        });
      });
    } else {
      db.collection(name, function(err, coll) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, coll);
        colls[name] = coll;
      });
    }
  } else {
    callback(null, cl);
  }
};

var findFromDb = function(tableName, key, value, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    var query = {};
    query[key] = value;
    // vlog.log('query:%j',query);
    coll.findOne(query, function(err, dbObj) {
      if (err) {
        return callback(err);
      }
      return callback(null, dbObj);
    });
  });
};

var countFromDb = function(tableName, query, options, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    // vlog.log('query:%j',query);
    coll.count(query, options, function(err, dbCount) {
      if (err) {
        return callback(err);
      }
      return callback(null, dbCount);
    });
  });
};

var queryOneFromDb = function(tableName, query, options, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    // vlog.log('query:%j',query);
    if (!options) {
      options = {};
    }
    coll.findOne(query, options, function(err, dbObj) {
      if (err) {
        return callback(err);
      }
      return callback(null, dbObj);
    });
  });
};


var queryFromDb = function(tableName, query, options, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    // vlog.log('query:%j,options:%j',query,options);
    if (!options) {
      options = {
        limit: 20
      };
    } else if (!options.limit) {
      options.limit = 20;
    }
    coll.find(query, options).toArray(function(err, docs) {
      if (err) {
        return callback(err);
      }
      return callback(null, docs);
    });
  });
};


var updateFromDb = function(tableName, query, update, options, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    var opt = options || {
      upsert: false
    };
    var q = query || {};
    // vlog.log('tableName:%j, update:%j , opt:%j ,q:%j',tableName,update,opt,q);
    coll.updateMany(q, update, opt, function(err, re) {
      if (err) {
        return callback(err);
      }
      // vlog.log('re:%j',re);
      return callback(null, re);
    });
  });
};


var delFromDb = function(tableName, query, options, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    var opt = options || {};
    coll.deleteMany(query, opt, function(err, re) {
      if (err) {
        return callback(err);
      }
      return callback(null, re);
    });
  });
};

var addToDb = function(tableName, dbObj, callback) {
  checkColl(tableName, function(err, coll) {
    if (err) {
      return callback(err);
    }
    coll.insertOne(dbObj, function(err, re) {
      if (err) {
        return callback(err);
      }
      return callback(null, re);
    });
  });
};


var ObjectID = mongodb.ObjectID;

var idObj = function(idHex) {
  if (isNaN(idHex)) {
    return ObjectID.createFromHexString(idHex);
  } else {
    return parseInt(idHex);
  }
};

exports.idObj = idObj;
exports.findFromDb = findFromDb;
exports.queryOneFromDb = queryOneFromDb;
exports.queryFromDb = queryFromDb;
exports.updateFromDb = updateFromDb;
exports.countFromDb = countFromDb;
exports.delFromDb = delFromDb;
exports.addToDb = addToDb;
exports.init = init;
