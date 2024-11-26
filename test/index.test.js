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
        line: '[ff]() [](ds) []()',
        raw: '[ff]()',
        type: 'link',
        format: '[]()',
      },
      {
        text: '',
        href: 'ds',
        line: '[ff]() [](ds) []()',
        raw: '[](ds)',
        type: 'link',
        format: '[]()',
      },
      {
        text: '',
        href: '',
        line: '[ff]() [](ds) []()',
        raw: '[]()',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'fhd',
        href: 'https://www.google.com',
        line: '- Lorem ipsum dolor sit amet, consectetur adipiscing elit [fhd](https://www.google.com)',
        raw: '[fhd](https://www.google.com)',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'fb',
        href: 'https://www.google.com',
        line: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus rem eveniet porro sapiente vel dignissimos nobis blanditiis perferendis! Libero totam in delectus deleniti asperiores minima est dolores nobis, facere nostrum. [fb](https://www.google.com) (https://meta.com)',
        raw: '[fb](https://www.google.com)',
        type: 'link',
        format: '[]()',
      },
      {
        text: 'https://meta.com',
        href: 'https://meta.com',
        line: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus rem eveniet porro sapiente vel dignissimos nobis blanditiis perferendis! Libero totam in delectus deleniti asperiores minima est dolores nobis, facere nostrum. [fb](https://www.google.com) (https://meta.com)',
        raw: '(https://meta.com)',
        type: 'link',
        format: '()',
      },
      {
        text: '/profile',
        href: '/profile',
        line: 'accessing profile page (/profile)',
        raw: '(/profile)',
        type: 'link',
        format: '()',
      },
      {
        text: 'https://mepritam.dev',
        href: 'https://mepritam.dev',
        line: '<https://mepritam.dev>',
        raw: '<https://mepritam.dev>',
        type: 'link',
        format: '<>',
      },
      {
        text: 'contact@mepritam.dev',
        href: 'mailto:contact@mepritam.dev',
        line: 'send me an email at <contact@mepritam.dev>',
        raw: '<contact@mepritam.dev>',
        type: 'email',
        format: '<>',
      },
      {
        text: 'http://example.com',
        href: 'http://example.com',
        line: 'lorem ipsum http://example.com dolor sit amet, consectetur adipiscing elit',
        raw: 'http://example.com',
        type: 'link',
        format: 'raw',
      },
      {
        text: 'Hazard Perception Test (HPT)',
        href: 'https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.',
        line: '[Hazard Perception Test (HPT)](https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.)',
        raw: '[Hazard Perception Test (HPT)](https://justice.act.gov.au/hazard-perception-test-hpt#:~:text=The%20Hazard%20Perception%20Test%20(HPT,dangerous%20situations%20on%20the%20road.)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResult.length);
    for (let index = 0; index < result.length; index += 1) {
      expect(result[index]).to.deep.equal(expectedResult[index]);
    }
  });

  it('should return only one link with []() format', () => {
    const content = `This is just a single line of text with a link ([useful link](http://example.com/))`;

    const result = extractMdLinks(content);

    const expectedResult = [
      {
        text: 'useful link',
        href: 'http://example.com/',
        line: 'This is just a single line of text with a link ([useful link](http://example.com/))',
        raw: '[useful link](http://example.com/)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResult.length);
    expect(result[0]).to.deep.equal(expectedResult[0]);
  });

  it('should return only one link with []() format as other links are part of the main link', () => {
    const content = `| Available Languages | English (US and UK), along with other languages [https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/) |`;

    const result = extractMdLinks(content);

    const expectedResult = [
      {
        format: '[]()',
        href: 'https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/',
        line: '| Available Languages | English (US and UK), along with other languages [https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/) |',
        text: 'https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/',
        raw: '[https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/)',
        type: 'link',
      },
    ];

    expect(result.length).to.equal(expectedResult.length);
    expect(result[0]).to.deep.equal(expectedResult[0]);
  });

  it('should return only one link with []() format, the full link is inside (), it should extract only the link', () => {
    const content = `Sulla base delle informazioni disponibili online ([Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)), possiamo ricostruire una struttura generale:`;

    const result = extractMdLinks(content);

    const expectedResult = [
      {
        text: 'Bando di Avviso Ufficiale',
        href: 'https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7',
        line: 'Sulla base delle informazioni disponibili online ([Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)), possiamo ricostruire una struttura generale:',
        raw: '[Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResult.length);
    expect(result[0]).to.deep.equal(expectedResult[0]);
  });

  it('should return extract the full link along with the () in the URL', () => {
    const content = `check out related quizzes or [PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/).`;

    const result = extractMdLinks(content);

    const expectedResult = [
      {
        text: 'PDF National Strength and Conditioning Association (NSCA) CPSS',
        href: '/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/',
        line: 'check out related quizzes or [PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/).',
        raw: '[PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResult.length);
    expect(result[0]).to.deep.equal(expectedResult[0]);
  });
});
