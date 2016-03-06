'use strict';

var vlog = require('vlog').instance(__filename);
var XLSX = require('xlsx');

var xlsPath = '../res/201602.xls';

var workbook = XLSX.readFile(xlsPath);
var sheetName = workbook.SheetNames;
vlog.log('SheetNames:%j',sheetName);

var worksheet = workbook.Sheets[sheetName];
vlog.log('cell value:%j',worksheet['A1'].v);



