import { normalize } from "./normalize";
import { maxMatchingSubstring } from "./stringMatching";

/* eslint-disable no-restricted-syntax */
type LinkType = 'link' | 'email';

type LinkProps = {
  text: string;
  href: string;
  line: string;
  raw: string;
  type: LinkType;
  format: string;
};

type Syntax = {
  start: string;
  end: string;
};

type ConsiderableProps = {
  link: string;
  startSyntax: string;
  endSyntax: string;
  links: LinkProps[];
};

type ConflictingProps = {
  line: string;
  url: string;
  lineLinks: LinkProps[];
};

type AllowedProps = {
  line: string;
  links: LinkProps[];
  link: string;
};

const escapeRegex = (string: string): string => string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const isConsiderableLink = ({ link, startSyntax, endSyntax, links }: ConsiderableProps): boolean => { const startsWithSyntax: boolean = link.startsWith(startSyntax);

  if (startsWithSyntax) {
    if (link.endsWith(endSyntax)) {
      return false;
    }
    if (link.includes(endSyntax)) {
      const href: string = link.replace(/.?http/g, 'http');
      const linkWithoutEndSyntax = href
        .substring(0, link.lastIndexOf(endSyntax))
        .replace(new RegExp(`\\${endSyntax}$`, 'g'), '');
      return !links.some((existingLink) => existingLink.href === linkWithoutEndSyntax);
    }
  }

  return true;
};

const updateEmailLinks = (links: LinkProps[]): LinkProps[] => {
  const emailRegex: RegExp = /mailto:([^\s[;]+)/g;

  return links.map((link) => {
    if (link.href.match(emailRegex) || link.href.includes('@')) {
      return { ...link, href: link.href.startsWith('mailto') ? link.href : `mailto:${link.href}`, type: 'email' };
    }
    return link;
  });
};

const isLinkOrEmail = (href: string): boolean => href.startsWith('http') || href.startsWith('/') || href.includes('@');

const isNonConflictingLink = ({ line, url, lineLinks = [] }: ConflictingProps): boolean => {
  const numHrefMatch: number = line?.match(new RegExp(escapeRegex(url), 'g'))?.length || 0;
  const numExistingLinks: number = lineLinks?.reduce(
    (acc, lineLink) =>
      acc + (lineLink.href.includes(url) ? 1 : 0) + (lineLink.format === '[]()' && lineLink.text.includes(url) ? 1 : 0),
    0,
  );

  return numHrefMatch > 0 && numExistingLinks < numHrefMatch;
};

const isAllowedToAddRawLinkWithExistingSubLinkCheck = ({ line, links, link }: AllowedProps): boolean => {
  let partialMatch: string = '';

  const httpsLink: string = (link?.match(/https:\/\/.*/g)?.[0] || '').replace('https://', '');

  for (const l of links) {
    const linkMatch = maxMatchingSubstring(httpsLink, l.href);
    if (linkMatch.length > partialMatch.length) {
      partialMatch = linkMatch;
    }
  }

  if (partialMatch.length > 0) {
    const numMatch: number = line?.match(new RegExp(escapeRegex(partialMatch), 'g'))?.length || 0;
    const numExistingLinks: number = links?.reduce(
      (acc, l) =>
        acc + (l.href.includes(partialMatch) ? 1 : 0) + (l.format === '[]()' && l.text.includes(partialMatch) ? 1 : 0),
      0,
    );

    return numMatch > 0 && numExistingLinks < numMatch;
  }

  return true;
};

const extractMdLinks = (mdContent: string): LinkProps[] => {
  const lines: string[] = normalize(mdContent).split('\n');

  const linkRegex: RegExp = /.?\[([^\]]*)\]\(([^\][]*)\)/g;

  const ltGtRegex: RegExp = /<[^>]*>/g;
  const parenthesisLinkRegex: RegExp = /.?\(([^)]*)\)/g;
  const rawLinkRegex: RegExp = /.?https?:\/\/[^\s[;]+/g;

  const linkInfo: LinkProps[] = [];

  for (const line of lines) {
    const links: string[] = line.match(linkRegex) || [];
    const ltGtLinks: string[]  = line.match(ltGtRegex) || [];
    const parenthesisLinks: string[]  = line.match(parenthesisLinkRegex) || [];
    const rawLinks: string[]  = line.match(rawLinkRegex) || [];
    const lineLinks: LinkProps[] = [];

    for (const link of links) {
      if (!link.startsWith('!')) {
        let raw: string = link?.replace(/^.?\[/g, '[') || '';
        const nOpeningParenthesis: number = raw?.match(/\(/g)?.length || 0;
        const nClosingParenthesis: number = raw?.match(/\)/g)?.length || 0;
        if (nClosingParenthesis > nOpeningParenthesis) {
          raw = raw?.replace(/\)$/g, '') || '';
        }
        if (raw.includes(') (')) {
          raw = raw.replace(/\) \(.*/g, ')');
        }

        const textRegex: RegExp = /\[([^\]]*)\]/;
        const text: string = raw?.match(textRegex)?.[1]?.trim() || '';
        const href: string =
          raw
            ?.replace(textRegex, '')
            ?.match(/\(([^\][]*)\)$/)?.[1]
            ?.trim() || '';

        const linkDetails: LinkProps = { text, href, line, raw, type: 'link', format: '[]()' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }

    for (const link of ltGtLinks) {
      const text: string = link.match(/<([^>]*)>/)?.[1]?.trim() || '';

      if (isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails: LinkProps = { text, href, line, raw: link, type: 'link', format: '<>' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }

    for (const link of parenthesisLinks) {
      const raw: string = link.replace(/^.?\(/g, '(');
      const text: string = raw.match(/\(([^)]*)\)/)?.[1]?.trim() || '';

      if (!link.startsWith(']') && isLinkOrEmail(text)) {
        const href = text;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails: LinkProps = { text, href, line, raw, type: 'link', format: '()' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }

    for (const link of rawLinks) {
      const syntaxes: Syntax[] = [
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
        const raw: string = link.replace(/^.?http/g, 'http');
        const href = raw;

        if (isNonConflictingLink({ line, url: href, lineLinks })) {
          const linkDetails: LinkProps = { text: raw, href, line, raw, type: 'link', format: 'raw' };
          linkInfo.push(linkDetails);
          lineLinks.push(linkDetails);
        }
      }
    }
  }

  return updateEmailLinks(linkInfo);
};
