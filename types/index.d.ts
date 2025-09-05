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

export declare function extractMdLinks(mdContent: string): Link[];
export declare function normalize(input: string): string;
export declare function maxMatchingSubstring(s1: string, s2: string): string;

export default extractMdLinks;
