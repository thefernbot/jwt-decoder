# JWT Decoder

A developer tool for decoding and inspecting JSON Web Tokens in your browser.

**Live:** https://jwt-decoder-mauve.vercel.app

## Features

- Decode JWT header, payload, and signature
- Display token expiration status (expired/valid/no expiration)
- Human-readable claim descriptions for common claims
- Timestamp conversion for exp, iat, and nbf claims
- Copy decoded sections to clipboard
- Example tokens for testing
- Raw JSON view with syntax formatting
- Entirely client-side (no tokens sent to any server)

## Supported Claims

The decoder recognizes and provides descriptions for common JWT claims:

- `iss` (Issuer)
- `sub` (Subject)
- `aud` (Audience)
- `exp` (Expiration Time)
- `nbf` (Not Before)
- `iat` (Issued At)
- `jti` (JWT ID)
- And more...

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Security

All JWT decoding happens entirely in your browser. No tokens are transmitted to any server. The signature is displayed but not verified (verification requires the secret or public key).
