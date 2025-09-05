/* eslint-disable no-restricted-syntax */
import { normalize } from './normalize';
import { maxMatchingSubstring } from './stringMatching';
import type { Link } from './types';

const escapeRegex = (string: string) => string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const isConsiderableLink = ({
  link,
  startSyntax,
  endSyntax,
  links,
}: {
  link: string;
  startSyntax: string;
  endSyntax: string;
  links: Link[];
}): boolean => {
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

const updateEmailLinks = (links: Link[]): Link[] => {
  const emailRegex = /mailto:([^\s[;]+)/g;

  return links.map((link) => {
    if (link.href.match(emailRegex) || link.href.includes('@')) {
      return {
        ...link,
        href: link.href.startsWith('mailto') ? link.href : `mailto:${link.href}`,
        type: 'email',
      } as Link;
    }
    return link;
  });
};

const isLinkOrEmail = (href: string): boolean => href.startsWith('http') || href.startsWith('/') || href.includes('@');

const isNonConflictingLink = ({
  line,
  url,
  lineLinks = [],
}: {
  line: string;
  url: string;
  lineLinks?: Link[];
}): boolean => {
  const numHrefMatch = line?.match(new RegExp(escapeRegex(url), 'g'))?.length || 0;
  const numExistingLinks = lineLinks?.reduce(
    (acc, lineLink) =>
      acc + (lineLink.href.includes(url) ? 1 : 0) + (lineLink.format === '[]()' && lineLink.text.includes(url) ? 1 : 0),
    0,
  );

  return numHrefMatch > 0 && numExistingLinks < numHrefMatch;
};

const isAllowedToAddRawLinkWithExistingSubLinkCheck = ({
  line,
  links,
  link,
}: {
  line: string;
  links: Link[];
  link: string;
}): boolean => {
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

export const extractMdLinks = (mdContent: string): Link[] => {
  const lines = normalize(mdContent).split('\n');
  const linkRegex = /.?\[([^\]]*)\]\(([^\][]*)\)/g;

  const ltGtRegex = /<[^>]*>/g;
  const parenthesisLinkRegex = /.?\(([^)]*)\)/g;
  const rawLinkRegex = /.?https?:\/\/[^\s[;]+/g;

  const linkInfo: Link[] = [];

  for (const line of lines) {
    const links = line.match(linkRegex) || [];
    const ltGtLinks = line.match(ltGtRegex) || [];
    const parenthesisLinks = line.match(parenthesisLinkRegex) || [];
    const rawLinks = line.match(rawLinkRegex) || [];
    const lineLinks: Link[] = [];

    for (const link of links) {
      if (!link.startsWith('!')) {
        const raw = link?.replace(/^.?\[/g, '[') || '';

        const textStart = raw.indexOf('[');
        const textEnd = raw.indexOf(']', textStart + 1);
        let balancedRaw = raw;

        if (textStart !== -1 && textEnd !== -1 && raw[textEnd + 1] === '(') {
          const hrefStart = textEnd + 1; // at '('
          let depth = 0;
          let hrefEnd = -1;
          for (let i = hrefStart; i < raw.length; i += 1) {
            const ch = raw[i];
            if (ch === '(') depth += 1;
            else if (ch === ')') {
              depth -= 1;
              if (depth === 0) {
                hrefEnd = i;
                break;
              }
            }
          }
          if (hrefEnd !== -1) {
            balancedRaw = raw.slice(0, hrefEnd + 1);
          }
        }

        const textRegex = /\[([^\]]*)\]/;
        const text = (balancedRaw?.match(textRegex)?.[1] || '').trim();
        const href = (balancedRaw?.replace(textRegex, '')?.match(/\(([^\][]*)\)$/)?.[1] || '').trim();

        const linkDetails: Link = { text, href, line, raw: balancedRaw, type: 'link', format: '[]()' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }

    for (const link of ltGtLinks) {
      const text = (link.match(/<([^>]*)>/)?.[1] || '').trim();

      if (isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails: Link = { text, href, line, raw: link, type: 'link', format: '<>' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }

    for (const link of parenthesisLinks) {
      const raw = link.replace(/^.?\(/g, '(');
      const match = raw.match(/\(([^)]*)\)/);
      const text = (match?.[1] || '').trim();

      if (!link.startsWith(']') && isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails: Link = { text, href, line, raw, type: 'link', format: '()' };
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
          const linkDetails: Link = { text: raw, href, line, raw, type: 'link', format: 'raw' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }
  }

  return updateEmailLinks(linkInfo);
};

export type { Link } from './types';
export { normalize } from './normalize';
export { maxMatchingSubstring } from './stringMatching';

export default extractMdLinks;
