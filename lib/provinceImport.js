'use strict';


var lineReader = require('line-reader');
var db = require('./db');
var vlog = require('vlog').instance(__filename);
// var cck = require('cck');


var read = function(filePath) {
  db.init(function(err) {
    if (err) {
      vlog.eo(err, 'db:init');
      return;
    }
    var i = 0;
    var upserted = 0;
    lineReader.eachLine(filePath, function(line, last) {
      // console.log(i+': '+line);
      if (i % 5000 === 0) {
        vlog.log('doing:%d,upserted:%d', i, upserted);
      }
      i++;
      var lineArr = line.split(',');
      var seq = lineArr[3];
      var provinceName = lineArr[0];
      db.findFromDb('provinceSeq', 'provinceName', provinceName, function(err, re) {
        if (err) {
          vlog.eo(err, 'read');
          return;
        }
        if (!re) {
          vlog.error('province not found:%s', provinceName);
          return;
        }
        var updateObj = {
          'monthLimit': re.monthLimit,
          'dayLimit': re.dayLimit,
          'state': re.state,
          'teleType': re.teleType,
          'cityName': lineArr[1],
          'areaCode': lineArr[2]
        };

        db.updateFromDb('provinceSeq', {
          'seq': seq
        }, {
          '$set': updateObj
        }, {
          'upsert': true
        }, function(err, re) {
          if (err) {
            vlog.eo(err, 'updateFromDb');
            return;
          }
          if (re) {
            if (re.upserted) {
              upserted++;
            }
            // vlog.log('re:%j,csv:%j', re, lineArr);
          }
        });


      });

      if (last) {
        return false;
      }
    });
  });
};

read(__dirname + '/all.csv');
