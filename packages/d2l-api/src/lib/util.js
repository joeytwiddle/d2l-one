function deepInspect(data) {
  return require('util').inspect(data, { showHidden: false, depth: null, colors: true });
}

function inspectOneLine(data) {
  return require('util').inspect(data, { showHidden: false, depth: 4, colors: true, breakLength: Infinity });
}

function isoDate() {
  return new Date().toISOString();
}

function shortDateString(date) {
  date = date || new Date();
  return date.getFullYear() + '/' + padLeft(date.getMonth() + 1, 2, '0') + '/' + padLeft(date.getDate(), 2, '0');
}

function padLeft(str, len, padChar) {
  padChar = padChar || ' ';
  str = '' + str;
  while (str.length < len) {
    str = padChar + str;
  }
  return str;
}

module.exports = {
  deepInspect,
  inspectOneLine,
  isoDate,
  shortDateString,
  padLeft,
};
