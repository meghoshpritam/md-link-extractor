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
    const expectedResults = [
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

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should return only one link with []() format', () => {
    const content = `This is just a single line of text with a link ([useful link](http://example.com/))`;

    const result = extractMdLinks(content);

    const expectedResults = [
      {
        text: 'useful link',
        href: 'http://example.com/',
        line: 'This is just a single line of text with a link ([useful link](http://example.com/))',
        raw: '[useful link](http://example.com/)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should return only one link with []() format as other links are part of the main link', () => {
    const content = `| Available Languages | English (US and UK), along with other languages [https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/) |`;

    const result = extractMdLinks(content);

    const expectedResults = [
      {
        format: '[]()',
        href: 'https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/',
        line: '| Available Languages | English (US and UK), along with other languages [https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/) |',
        text: 'https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/',
        raw: '[https://learn.microsoft.com/enus/credentials/certifications/azure, fundamentals/](https://learn.microsoft.com/en, us/credentials/certifications/azure, fundamentals/)',
        type: 'link',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should return only one link with []() format, the full link is inside (), it should extract only the link', () => {
    const content = `Sulla base delle informazioni disponibili online ([Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)), possiamo ricostruire una struttura generale:`;

    const result = extractMdLinks(content);

    const expectedResults = [
      {
        text: 'Bando di Avviso Ufficiale',
        href: 'https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7',
        line: 'Sulla base delle informazioni disponibili online ([Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)), possiamo ricostruire una struttura generale:',
        raw: '[Bando di Avviso Ufficiale](https://portale.inpa.gov.it/api/media/414a80e2-2b36-4da9-a8ec-6c67feaba9b7)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should return extract the full link along with the () in the URL', () => {
    const content = `check out related quizzes or [PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/).`;

    const result = extractMdLinks(content);

    const expectedResults = [
      {
        text: 'PDF National Strength and Conditioning Association (NSCA) CPSS',
        href: '/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/',
        line: 'check out related quizzes or [PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/).',
        raw: '[PDF National Strength and Conditioning Association (NSCA) CPSS](/en/pdf/national-strength-and-conditioning-association-(nsca)-pdf/cpss-pdf/)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should work with attached link syntax', () => {
    const content =
      'Se te preparas para a **Entrevista de Emprego para Comissário de bordo** de uma companhia aérea, irás encontrar vários tópicos importantes que te ajudam a demonstrar o teu potencial. Nesta entrevista, precisas de conhecer bem os procedimentos e as normas que regem o serviço de bordo. A preparação centra-se em áreas cruciais que garantem que desempenhes o teu papel com confiança e segurança. Consulta mais informações e a lista completa dos tópicos no site oficial da und[EASA](https://www.efinasa.edu).';

    const result = extractMdLinks(content);

    const expectedResults = [
      {
        text: 'EASA',
        href: 'https://www.efinasa.edu',
        line: 'Se te preparas para a **Entrevista de Emprego para Comissário de bordo** de uma companhia aérea, irás encontrar vários tópicos importantes que te ajudam a demonstrar o teu potencial. Nesta entrevista, precisas de conhecer bem os procedimentos e as normas que regem o serviço de bordo. A preparação centra-se em áreas cruciais que garantem que desempenhes o teu papel com confiança e segurança. Consulta mais informações e a lista completa dos tópicos no site oficial da und[EASA](https://www.efinasa.edu).',
        raw: '[EASA](https://www.efinasa.edu)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });

  it('should extract a link with parentheses in the text', () => {
    const content = `In this article, you are going to delve into practical strategies and insights designed to boost your [Certification Exam - AWS Certified Solutions Architect - Associate (SAA-C02) (AWS-Solutions-Associate日本語版)](/en/buy.html?super_category=dumps&category=amazon-exam&product=aws-solutions-associate-jp-dumps) readiness with a reliable **AWS Certified Solutions Architect - Associate (SAA-C02) Practice Test** at your disposal. You will learn actionable tips, study techniques, and even enjoy a few humorous analogies that compare exam preparation to assembling a quirky piece of flat-packed furniture.`;
    const result = extractMdLinks(content);

    const expectedResults = [
      {
        text: 'Certification Exam - AWS Certified Solutions Architect - Associate (SAA-C02) (AWS-Solutions-Associate日本語版)',
        href: '/en/buy.html?super_category=dumps&category=amazon-exam&product=aws-solutions-associate-jp-dumps',
        line: content,
        raw: '[Certification Exam - AWS Certified Solutions Architect - Associate (SAA-C02) (AWS-Solutions-Associate日本語版)](/en/buy.html?super_category=dumps&category=amazon-exam&product=aws-solutions-associate-jp-dumps)',
        type: 'link',
        format: '[]()',
      },
    ];

    expect(result.length).to.equal(expectedResults.length);
    expectedResults.forEach((expectedResult, index) => {
      expect(result[index]).to.deep.equal(expectedResult);
    });
  });
});
