# Cloudflare Worker — Image Search Proxy

This worker acts as a proxy for DuckDuckGo image search, allowing your Vercel app to fetch images without being blocked by DuckDuckGo's IP restrictions.

## Setup Instructions

1. Go to your Cloudflare dashboard → **Workers & Pages**
2. Click on your worker → **Edit Code**
3. Open `index.js` from this folder
4. Copy the entire contents
5. Paste it into the Cloudflare Worker editor (replace the default code)
6. Click **Save and Deploy**
7. Copy your Worker URL (looks like `https://your-worker-name.workers.dev`)

## Testing

### With Postman

1. Open Postman
2. Create a new **GET** request
3. Enter the URL: `https://your-worker-name.workers.dev/?q=cyberpunk+2077`
4. Click **Send**
5. You should see a JSON response like:

```json
{
  "items": [
    {
      "url": "https://cdn-l-cyberpunk.cdprojektred.com/...",
      "thumbnail": "https://tse2.mm.bing.net/...",
      "alt": "Cyberpunk 2077"
    },
    ...
  ]
}
```

### With cURL (Terminal)

```bash
curl "https://your-worker-name.workers.dev/?q=cyberpunk+2077"
```

### With JavaScript (Fetch)

```javascript
const response = await fetch("https://your-worker-name.workers.dev/?q=cyberpunk+2077");
const data = await response.json();
console.log(data.items); // Array of { url, thumbnail, alt }
```

## API Reference

### GET /

Search for images by query.

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query (URL-encoded) |

**Response:**
```json
{
  "items": [
    {
      "url": "Full image URL",
      "thumbnail": "Thumbnail URL",
      "alt": "Image description"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Query required"
}
```

## Examples

| Query | URL |
|-------|-----|
| Cyberpunk 2077 | `?q=cyberpunk+2077` |
| Witcher 3 game | `?q=witcher+3+game` |
| Bohemian Rhapsody Queen | `?q=bohemian+rhapsody+queen` |
| Dune Frank Herbert book | `?q=dune+frank+herbert+book` |
| Inception movie | `?q=inception+movie` |

## Notes

- No API key required
- Free tier: 100,000 requests/day
- Results are cached by DuckDuckGo, so repeated searches are fast
