'use strict';


var XLSX = require('xlsx');


var xlsPath = '../res/1.xls';


var workbook = XLSX.readFile(xlsPath);
var sheetName = workbook.SheetNames[0];
console.log('SheetNames:%j', sheetName);


var worksheet = workbook.Sheets[sheetName];
console.log('cell value:%j', worksheet);


var getRowSum = function(ws) {
  var ref = ws['!ref'];
  var refArr = ref.split(':');
  var number = refArr[1].replace(/[A-Z]+/, '');
  return parseInt(number);
};


var rowSum = getRowSum(worksheet);

console.log('行数:%j', rowSum);

