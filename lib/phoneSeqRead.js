'use strict';


var XLSX = require('xlsx');
var fs = require('fs');
// var cck = require('cck');


//定义列数组
var col = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ'];


//读取行数
var getRowSum = function(ws) {
  var ref = ws['!ref'];
  var refArr = ref.split(':');
  var number = refArr[1].replace(/[A-Z]+/, '');
  return parseInt(number);
};


var readXls = function(xlsPath) {
  // var xlsPath = '../res/1.xls';
  console.log('xls:%s', xlsPath);
  var workbook = XLSX.readFile(xlsPath);
  var sheetName = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[sheetName];
  var rowSum = getRowSum(worksheet);
  console.log('SheetNames:%j,rowSum:%d', sheetName, rowSum);
  var csv = readLines(rowSum, worksheet);
  console.log('xls done:%s', xlsPath);
  return csv;
};



function writeToFile(txt, toFile) {
  //写入文件
  fs.appendFileSync(toFile, txt);
}



var zeroFix = function(num, len) {
  var s = num + '';
  if (s.length >= len) {
    return s;
  }
  var fixLen = len - s.length;
  for (var i = 0; i < fixLen; i++) {
    s = '0' + s;
  }
  return s;
};

var readOne = function(value) {
  if (!value || value.trim().length === 0) {
    return null;
  }
  var out = [];
  var arr = value.split('、');
  for (var k = 0; k < arr.length; k++) {
    var arrIn = arr[k].split('-');
    if (!arrIn[0].match(/\d/g)) {
      console.error('error value:%s', arrIn[0]);
      continue;
    }
    if (arrIn.length > 1) {
      for (var m = parseInt(arrIn[0]); m <= parseInt(arrIn[1]); m++) {
        out.push(zeroFix(m, 3));
      }
    } else {
      out.push(zeroFix(arr[k]));
    }
  }
  return out;
};

var readLines = function(rowSum, worksheet) {
  // var city = [];
  var out = '';
  for (var i = 2; i <= rowSum; i++) {
    var pn = col[0] + i;
    if (!worksheet[pn]) {
      //空行
      continue;
    }
    var provinceName = worksheet[pn].v;
    var ctn = col[1] + i;
    var cityName = worksheet[ctn].v;
    var ac = col[2] + i;
    var areaCode = worksheet[ac].v;

    for (var j = 3; j <= col.length; j++) {

      var firstRowTag = col[j] + 1;
      if (!worksheet[firstRowTag]) {
        //列结束了
        break;
      }

      var numberPre = worksheet[firstRowTag].v;


      var tag = col[j] + i;
      var oneObj = worksheet[tag];
      if (oneObj === null || oneObj === undefined) {
        // 空单元格
        continue;
      }
      var value = oneObj.v;
      var numberTailArr = readOne(value);
      if (!numberTailArr) {
        continue;
      }

      for (var k = 0; k < numberTailArr.length; k++) {
        out += provinceName + ',' + cityName + ',' + areaCode + ',' + numberPre + numberTailArr[k] + '\n';
      }

    }
  }
  return out;
};


for (var i = 1; i < 15; i++) {
  var xf = '../res/' + i + '.xls';
  var to = 'all.csv';
  var csv = readXls(xf, to);
  // console.log('csv:\n%s',csv);
  writeToFile(csv, to);
}
