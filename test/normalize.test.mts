import { describe, it } from 'mocha';
import { expect } from 'chai';

import { normalize } from '../dist/esm/normalize.js';

describe('normalize', () => {
  describe('normalize()', () => {
    it('converts CRLF (\r\n) to LF (\n)', () => {
      const input = 'line1\r\nline2\r\nline3';
      const output = normalize(input);
      expect(output).to.equal('line1\nline2\nline3');
    });

    it('converts CR (\r) to LF (\n)', () => {
      const input = 'line1\rline2\rline3';
      const output = normalize(input);
      expect(output).to.equal('line1\nline2\nline3');
    });

    it('replaces NUL (\\0) with the Unicode replacement character (\uFFFD)', () => {
      const input = 'a\0b\0c';
      const output = normalize(input);
      expect(output).to.equal('a\uFFFDb\uFFFDc');
    });

    it('handles combined newlines and NUL bytes', () => {
      const input = 'a\r\n\0b\r\nc\r\0';
      const output = normalize(input);
      expect(output).to.equal('a\n\uFFFDb\nc\n\uFFFD');
    });

    it('leaves regular LF newlines unchanged', () => {
      const input = 'x\ny\nz';
      const output = normalize(input);
      expect(output).to.equal('x\ny\nz');
    });
  });
});
