# aetherfm.xyz: static site (v0, Mockup A)

This is plain HTML, CSS and JS with no build step, no frameworks and no external CDNs. The font (Inter Tight, variable, subset) is self-hosted.

## Preview locally
```
cd site
python3 -m http.server 8765
# open http://localhost:8765/
```
- `?mount=whales-lo` tests the page against another real mount on the same Icecast server (useful when /matt is offline). Only `[a-z0-9_-]` is accepted.
- `#play` tries to autoplay (most browsers block this without a user gesture).

## Files
```
index.html            all markup + meta/OG tags
css/site.css          layout, face (container-query units), responsive rules
js/site.js            status polling, player, timer, marquee text, dots canvas, tile hook
assets/fonts/         InterTight-var.woff2 (weights 100–900)
assets/favicon.svg    plain yellow dot (+ favicon-32.png, apple-touch-icon.png)
assets/og.png         1200×630 share image
assets/aether-mark-128.png nav mark (shown at 48px, 40px on mobile)
```
About 130 KB in total.

## Live data (honest by design)
- **Stream:** `https://dontpanic.fm/listen/matt` (Icecast 2.4.4 behind Caddy over https, CORS `*`). The Tailscale origin is never used.
- **Status:** `https://dontpanic.fm/listen/status-json.xsl`, polled every 20 s and paused while the tab is hidden. Icecast lists only mounts that have a connected source.
  - **Live:** ON AIR. The marquee shows the Icecast `title` (or `server_name`), and the timer counts from the real `stream_start_iso8601`.
  - **Not listed:** OFF AIR. The marquee reads "/matt is not broadcasting right now" and the timer shows `--:--:--`.
  - **Status fetch fails:** neutral "unknown" state. Nothing is invented.
- **Play button:** plays and pauses an `<audio>` element. If there's an error or no audio arrives within 12 s, it falls back to "silent". The "Listening · hh:mm:ss" counter only counts real playback time.
- There are no listener counts or stats anywhere.

## Hooks / placeholders
- Node tiles carry `data-clip=""`. Put an audio URL there later; `onTileHover()` in `site.js` is the stub. v0 has no clips.
- The beta sign-up is disabled ("opens soon") and has no form backend, so it collects nothing.
- Contact is mic.mate@gmail.com (for now).

## Deploying later (NOT done; needs Matt's approval)
**Cloudflare Pages**
1. Dashboard → Workers & Pages → Create → Pages → *Upload assets* → drag in the `site/` folder. Or run `npx wrangler pages deploy site --project-name aetherfm`.
2. Custom domains → add `aetherfm.xyz`. Porkbun DNS: either move nameservers to Cloudflare or add the CNAME it asks for.

**GitHub Pages**
1. Push `site/` contents to a repo (root or `/docs`) → Settings → Pages → deploy from branch.
2. Add a `CNAME` file containing `aetherfm.xyz`, then set Porkbun DNS: A records to GitHub's Pages IPs plus `www` CNAME `<user>.github.io`. Enable "Enforce HTTPS".

The site is fully static, so any host works. Stream and status are fetched cross-origin from dontpanic.fm, which already sends CORS `*`.

## Cache-busting
GitHub Pages serves files with `cache-control: max-age=600`, so browsers can pair a new `index.html` with an old cached `site.css`. `index.html` loads CSS, JS and images with a `?v=` query (for example `css/site.css?v=20260927-7`). **Bump that value in `index.html` every time CSS, JS or images change.**
