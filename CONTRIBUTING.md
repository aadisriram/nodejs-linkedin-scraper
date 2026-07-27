# Contributing

## Development

```bash
npm install
npm test
npm run build
```

## Refreshing LinkedIn HTML fixtures

Public profile markup drifts. To refresh fixtures:

```bash
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
curl -sL -A "$UA" -H 'Accept-Language: en-US,en;q=0.9' \
  'https://www.linkedin.com/in/williamhgates' -o /tmp/profile.html
# Strip scripts/styles, then copy into test/fixtures/<name>.html
# Re-run parsers and update the matching *.expected.json golden file
```

Do not commit auth cookies or personal session HTML.

## Live tests

```bash
npm run test:live
```

Requires network access to LinkedIn. These are skipped in CI.
