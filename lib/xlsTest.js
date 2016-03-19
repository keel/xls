'use strict';

var vlog = require('vlog').instance(__filename);
var XLSX = require('xlsx');
var cck = require('cck');

var xlsPath = '../res/201602.xls';

var workbook = XLSX.readFile(xlsPath);
var sheetName = workbook.SheetNames[0];
vlog.log('SheetNames:%j', sheetName);

var worksheet = workbook.Sheets[sheetName];
vlog.log('cell value:%j', worksheet['!ref']);

var getRowSum = function(ws) {
  var ref = ws['!ref'];
  var refArr = ref.split(':');
  var number = refArr[1].replace(/[A-Z]+/, '');
  return parseInt(number);
};

var rowSum = getRowSum(worksheet);

vlog.log('rowSum:%j', rowSum);


var columnTag = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ'];

var getProvinceNames = function(ws) {
  var province = [];
  for (var i = 0; i < 35; i++) {
    var tag = columnTag[i + 7] + '1';
    var provinceName = ws[tag].v;
    // vlog.log('tag:%s,v:%j',tag,provinceName);
    province.push(provinceName);
  }
  return province;
};

var provinceNames = getProvinceNames(worksheet);
vlog.log('provinceNames:%j', provinceNames);

//按天统计每省的点播数和总计值
var readRow = function(rowId, ws) {

  if (!ws['F' + rowId]) {
    return null;
  }
  var out = {};
  out.date = ws['A' + rowId].v + '';
  out.type = ws['F' + rowId].v + '';
  if (ws['F' + rowId].v !== '点播') {
    return out;
  }

  out.sum = parseInt(ws[columnTag[6] + rowId].v);
  out.provinceVal = [];
  // var count = 0;
  for (var i = 0; i < 35; i++) {
    var tag = columnTag[i + 7] + rowId;
    var val = parseInt(ws[tag].v);
    out.provinceVal.push(val);
    // count += val;
  }
  // out.cc = count;
  return out;
};

vlog.log('test row1:%j', readRow(5, worksheet));


var readOneDay = function(rowId, ws, maxRow) {
  var first = readRow(rowId, ws);
  if (!first) {
    return null;
  }
  var day = first.date;
  var out = first;
  for (var i = rowId + 1; i <= maxRow; i++) {
    var next = readRow(i, ws);
    if (!next || next.date !== day) {
      break;
    }
    if (next.type !== '点播') {
      continue;
    }
    out.sum += next.sum;
    for (var j = 0; j < out.provinceVal.length; j++) {
      out.provinceVal[j] += next.provinceVal[j];
    }
  }
  return out;
};

vlog.log('one day:%j',readOneDay(5,worksheet,rowSum));

vlog.log('t1:%s,t2:%s',cck.msToTime(1438842476384),cck.msToTime(1457485024912));
