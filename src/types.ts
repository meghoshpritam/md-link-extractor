export type LinkFormat = '[]()' | '<>' | '()' | 'raw';

export type LinkType = 'link' | 'email';

export interface Link {
  text: string;
  href: string;
  line: string;
  raw: string;
  type: LinkType;
  format: LinkFormat;
}
