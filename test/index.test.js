const fs = require('fs');
const mocha = require('mocha');
const chai = require('chai');
const path = require('path');

const { extractMdLinks } = require('../src');

const { expect } = chai;
const { it, describe } = mocha;

describe('extractMdLinks', () => {
  it('returns an array', () => {
    const content = fs.readFileSync(path.join(__dirname, '/test-content.md'), 'utf-8');
    const result = extractMdLinks(content);
    const expectedResult = [
      {
        text: 'ff',
        href: '',
        line: '[ff]() [](ds) []()\r',
        raw: '[ff]()',
        type: 'link',
        format: '[]()',
      },
      {
        text: '',
        href: 'ds',
        line: '[ff]() [](ds) []()\r',
        raw: '[](ds)',
        type: 'link',
        format: '[]()',
      },
      {
        text: '',
        href: '',
        line: '[ff]() [](ds) []()\r',
        raw: '[]()',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'fhd',
        href: 'https://www.google.com',
        line: '- Lorem ipsum dolor sit amet, consectetur adipiscing elit [fhd](https://www.google.com)\r',
        raw: '[fhd](https://www.google.com)',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'fb',
        href: 'https://www.google.com',
        line: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus rem eveniet porro sapiente vel dignissimos nobis blanditiis perferendis! Libero totam in delectus deleniti asperiores minima est dolores nobis, facere nostrum. [fb](https://www.google.com) (https://meta.com)\r',
        raw: '[fb](https://www.google.com)',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'https://meta.com',
        href: 'https://meta.com',
        line: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus rem eveniet porro sapiente vel dignissimos nobis blanditiis perferendis! Libero totam in delectus deleniti asperiores minima est dolores nobis, facere nostrum. [fb](https://www.google.com) (https://meta.com)\r',
        raw: '(https://meta.com)',
        type: 'link',
        format: '()',
      },
      {
        text: '/profile',
        href: '/profile',
        line: 'accessing profile page (/profile)\r',
        raw: '(/profile)',
        type: 'link',
        format: '()',
      },
      {
        text: 'https://mepritam.dev',
        href: 'https://mepritam.dev',
        line: '<https://mepritam.dev>\r',
        raw: '<https://mepritam.dev>',
        type: 'link',
        format: '<>',
      },
      {
        text: 'contact@mepritam.dev',
        href: 'contact@mepritam.dev',
        line: 'send me an email at <contact@mepritam.dev>\r',
        raw: '<contact@mepritam.dev>',
        type: 'email',
        format: '<>',
      },
      {
        text: 'http://example.com',
        href: 'http://example.com',
        line: 'lorem ipsum http://example.com dolor sit amet, consectetur adipiscing elit\r',
        raw: 'http://example.com',
        type: 'link',
        format: 'raw',
      },
      {
        text: 'Hazard Perception Test (HPT)',
        href: 'https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.',
        line: '[Hazard Perception Test (HPT)](https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.) ',
        raw: '[Hazard Perception Test (HPT)](https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result).to.deep.equal(expectedResult);
  });
});
