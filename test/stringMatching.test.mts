import { describe, it } from 'mocha';
import { expect } from 'chai';

import { maxMatchingSubstring } from '../dist/esm/stringMatching.js';

describe('stringMatching', () => {
  describe('maxMatchingSubstring()', () => {
    it('should return an empty string when both input strings are empty', () => {
      const s1 = '';
      const s2 = '';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('');
    });

    it('should return an empty string when one of the input strings is empty', () => {
      const s1 = 'hello';
      const s2 = '';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('');
    });

    it('should return the entire string when both input strings are the same', () => {
      const s1 = 'hello';
      const s2 = 'hello';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('hello');
    });

    it('should return the empty substring when there is not a match form the begging', () => {
      const s1 = 'abcdefg';
      const s2 = 'cdef';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('');
    });

    it('should return the longest substring, when there is a match from the begging', () => {
      const s1 = 'your time is ';
      const s2 = 'I want to take your time to say that your time is precious';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('your time is ');
    });

    it('should return the substring, when there is a match from the begging', () => {
      const s1 = 'your';
      const s2 = 'I want to take your time';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('your');
    });

    it('should return an empty string when there is no common substring', () => {
      const s1 = 'abcdefg';
      const s2 = 'xyz';
      const result = maxMatchingSubstring(s1, s2);
      expect(result).to.equal('');
    });
  });
});
