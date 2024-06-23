const maxMatchingSubstring = (s1, s2) => {
  let i = 0;
  let j = 0;
  let matchLength = 0;

  while (i < s1.length && j < s2.length) {
    if (s1[i] === s2[j]) {
      matchLength += 1;
      i += 1;
    }
    j += 1;
  }

  return s1.slice(0, matchLength);
};

module.exports = {
  maxMatchingSubstring,
};
