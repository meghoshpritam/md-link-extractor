const NEWLINES_RE = /\r\n?|\n/g;
const NULL_RE = /\0/g;

function normalize(string) {
  let str;

  str = string.replace(NEWLINES_RE, '\n');

  str = str.replace(NULL_RE, '\uFFFD');

  return str;
}

module.exports = { normalize };
