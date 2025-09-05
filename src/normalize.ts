const NEWLINES_RE = /\r\n?|\n/g;
const NULL_RE = /\0/g;

export function normalize(string: string): string {
  let str: string = string;

  str = str.replace(NEWLINES_RE, '\n');

  str = str.replace(NULL_RE, '\uFFFD');

  return str;
}

export default normalize;
