const NEWLINES_RE: RegExp = /\r\n?|\n/g;
const NULL_RE: RegExp= /\0/g;

export function normalize(string: string): string {
  let str: string;

  str = string.replace(NEWLINES_RE, '\n');

  str = str.replace(NULL_RE, '\uFFFD');

  return str;
}
