# md-link-extractor

This is a simple npm package to extract all the links from a markdown file.
This package have zero dependencies.

## Installation

```bash
npm install md-link-extractor
```

## Usage

```javascript
const { extractMdLinks } = require('md-link-extractor');

const links = extractMdLinks('# my md file\n [link](https://www.google.com)');
console.log(links);
```

## Output

```javascript
[
  {
    text: 'link',
    href: 'https://www.google.com',
    line: ' [link](https://www.google.com)',
    raw: '[link](https://www.google.com)',
    type: 'link',
    format: '[]()',
  },
];
```

## API

### extractMdLinks(markdown: string): Link[]

- `markdown` - The markdown string from which links will be extracted.
- Returns an array of `Link` objects.
- `Link` object has the following properties:
  - `text` - The text of the link.
  - `href` - The href of the link.
  - `line` - The line from which the link was extracted.
  - `raw` - The raw link string.
  - `type` - The type of the link. It can be `link`, `email`.
  - `format` - The format of the link. It can be `[]()`, `<>`, `()`, `raw`.

## Test

```bash
npm test
```

## License

See the [LICENSE](LICENSE) file for license rights and limitations.

## Author

- [meghoshpritam](https://mepritam.dev)

### GitHub Repository

- [md-link-extractor](https://github.com/meghoshpritam/md-link-extractor) drop a star if you like it.
