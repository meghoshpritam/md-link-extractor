/* eslint-disable no-restricted-syntax */
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

const extractMdLinks = (mdContent) => {
  const lines = mdContent.split('\n');
  const linkRegex = /.?\[([^\]]*)\]\(([^)]*)\)/g;
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
        const raw = link.replace(/^.?\[/g, '[');
        const textRegex = /\[([^\]]*)\]/;
        const text = raw.match(textRegex)[1].trim();
        const href = raw
          .replace(textRegex, '')
          .match(/\(([^)]*)\)/)[1]
          .trim();

        const linkDetails = { text, href, line, raw, type: 'link', format: '[]()' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }

    for (const link of ltGtLinks) {
      const text = link.match(/<([^>]*)>/)[1]?.trim();

      if (isLinkOrEmail(text)) {
        const href = text;

        const linkDetails = { text, href, line, raw: link, type: 'link', format: '<>' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }

    for (const link of parenthesisLinks) {
      const raw = link.replace(/^.?\(/g, '(');
      const text = raw.match(/\(([^)]*)\)/)[1].trim();

      if (!link.startsWith(']') && isLinkOrEmail(text)) {
        const href = text;

        const linkDetails = { text, href, line, raw, type: 'link', format: '()' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
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
        )
      ) {
        const raw = link.replace(/^.?http/g, 'http');

        const linkDetails = { text: raw, href: raw, line, raw, type: 'link', format: 'raw' };
        linkInfo.push(linkDetails);
        lineLinks.push(linkDetails);
      }
    }
  }

  return updateEmailLinks(linkInfo);
};

module.exports = {
  extractMdLinks,
};
