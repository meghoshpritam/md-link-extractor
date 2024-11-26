/* eslint-disable no-restricted-syntax */

const { normalize } = require('./normalize');
const { maxMatchingSubstring } = require('./stringMatching');

const escapeRegex = (string) => string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const isConsiderableLink = ({ link, startSyntax, endSyntax, links }) => {
  const startsWithSyntax = link.startsWith(startSyntax);

  if (startsWithSyntax) {
    if (link.endsWith(endSyntax)) {
      return false;
    }
    if (link.includes(endSyntax)) {
      const href = link.replace(/.?http/g, 'http');
      const linkWithoutEndSyntax = href
        .substring(0, link.lastIndexOf(endSyntax))
        .replace(new RegExp(`\\${endSyntax}$`, 'g'), '');
      return !links.some((existingLink) => existingLink.href === linkWithoutEndSyntax);
    }
  }

  return true;
};

const updateEmailLinks = (links) => {
  const emailRegex = /mailto:([^\s[;]+)/g;

  return links.map((link) => {
    if (link.href.match(emailRegex) || link.href.includes('@')) {
      return { ...link, href: link.href.startsWith('mailto') ? link.href : `mailto:${link.href}`, type: 'email' };
    }
    return link;
  });
};

const isLinkOrEmail = (href) => href.startsWith('http') || href.startsWith('/') || href.includes('@');

const isNonConflictingLink = ({ line, url, lineLinks = [] }) => {
  const numHrefMatch = line?.match(new RegExp(escapeRegex(url), 'g'))?.length || 0;
  const numExistingLinks = lineLinks?.reduce(
    (acc, lineLink) =>
      acc + (lineLink.href.includes(url) ? 1 : 0) + (lineLink.format === '[]()' && lineLink.text.includes(url) ? 1 : 0),
    0,
  );

  return numHrefMatch > 0 && numExistingLinks < numHrefMatch;
};

const isAllowedToAddRawLinkWithExistingSubLinkCheck = ({ line, links, link }) => {
  let partialMatch = '';

  const httpsLink = (link?.match(/https:\/\/.*/g)?.[0] || '').replace('https://', '');

  for (const l of links) {
    const linkMatch = maxMatchingSubstring(httpsLink, l.href);
    if (linkMatch.length > partialMatch.length) {
      partialMatch = linkMatch;
    }
  }

  if (partialMatch.length > 0) {
    const numMatch = line?.match(new RegExp(escapeRegex(partialMatch), 'g'))?.length || 0;
    const numExistingLinks = links?.reduce(
      (acc, l) =>
        acc + (l.href.includes(partialMatch) ? 1 : 0) + (l.format === '[]()' && l.text.includes(partialMatch) ? 1 : 0),
      0,
    );

    return numMatch > 0 && numExistingLinks < numMatch;
  }

  return true;
};

const extractMdLinks = (mdContent) => {
  const lines = normalize(mdContent).split('\n');
  const linkRegex = /.?\[([^\]]*)\]\(([^\][]*)\)/g;

  const ltGtRegex = /<[^>]*>/g;
  const parenthesisLinkRegex = /.?\(([^)]*)\)/g;
  const rawLinkRegex = /.?https?:\/\/[^\s[;]+/g;

  const linkInfo = [];

  for (const line of lines) {
    const links = line.match(linkRegex) || [];
    const ltGtLinks = line.match(ltGtRegex) || [];
    const parenthesisLinks = line.match(parenthesisLinkRegex) || [];
    const rawLinks = line.match(rawLinkRegex) || [];
    const lineLinks = [];

    for (const link of links) {
      if (!link.startsWith('!')) {
        let raw = link?.replace(/^.?\[/g, '[') || '';
        const nOpeningParenthesis = raw?.match(/\(/g)?.length || 0;
        const nClosingParenthesis = raw?.match(/\)/g)?.length || 0;
        if (nClosingParenthesis > nOpeningParenthesis) {
          raw = raw?.replace(/\)$/g, '') || '';
        }
        if (raw.includes(') (')) {
          raw = raw.replace(/\) \(.*/g, ')');
        }

        const textRegex = /\[([^\]]*)\]/;
        const text = raw?.match(textRegex)?.[1]?.trim() || '';
        const href =
          raw
            ?.replace(textRegex, '')
            ?.match(/\(([^\][]*)\)$/)?.[1]
            ?.trim() || '';

        const linkDetails = { text, href, line, raw, type: 'link', format: '[]()' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }

    for (const link of ltGtLinks) {
      const text = link.match(/<([^>]*)>/)[1]?.trim();

      if (isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails = { text, href, line, raw: link, type: 'link', format: '<>' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }

    for (const link of parenthesisLinks) {
      const raw = link.replace(/^.?\(/g, '(');
      const text = raw.match(/\(([^)]*)\)/)[1].trim();

      if (!link.startsWith(']') && isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails = { text, href, line, raw, type: 'link', format: '()' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }

    for (const link of rawLinks) {
      const syntaxes = [
        {
          start: '[',
          end: ']',
        },
        {
          start: '<',
          end: '>',
        },
        {
          start: '(',
          end: ')',
        },
      ];

      if (
        syntaxes.every((syntax) =>
          isConsiderableLink({
            link,
            startSyntax: syntax.start,
            endSyntax: syntax.end,
            links: lineLinks,
          }),
        ) &&
        isAllowedToAddRawLinkWithExistingSubLinkCheck({ line, links: lineLinks, link })
      ) {
        const raw = link.replace(/^.?http/g, 'http');
        const href = raw;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails = { text: raw, href, line, raw, type: 'link', format: 'raw' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }
  }

  return updateEmailLinks(linkInfo);
};

module.exports = {
  extractMdLinks,
};
