# Charlie Card Hunt

Public community map for collectible MBTA CharlieCards. Built with React, Vinext, Leaflet, and Cloudflare D1 through Sites.

## Features
- Shared sightings with station, official entrance/exit, machine description, card design/color, observation time, and availability.
- Official MBTA subway shapes; 125 rapid-transit stations and 309 entrances/exits from MBTA V3 API (snapshot October 25, 2026).
- Exit unknown falls back to the station location. Exit coordinates identify entrances, not exact indoor machine positions.
- Confidence uses recency, corroboration and conflicting observations; unavailable reports remain in history but are hidden from the map.
- Latest observation wins per station + exit + design + normalized machine label.
- Public submissions have server validation, same-origin checks, a honeypot, and basic hourly submission limits. No account required.
- Reddit sync attempts on page open and every ten minutes while a page is open, globally throttled via D1. Imports only explicit, unambiguous single-station and single-design comments. No claim of complete comment coverage. No unattended polling while the site has no visitors.

## External access
OpenStreetMap tiles need no API key. Attribution is retained. Subway lines are published geometry, not live service status. Reddit currently blocks requests from this development environment; live sync exposes that failure and community reporting remains operational. Reliable automated Reddit ingestion will require approved Reddit API access if the deployed server is also blocked. Do not bypass Reddit access controls.

## Develop
`npm run install:ci`, `npm run db:generate` after schema changes, then build and apply pending local migrations according to the Sites starter workflow. `npm run dev` serves the app.

Tests: `./node_modules/.bin/esbuild tests/core.ts --bundle --platform=node --format=esm --outfile=/tmp/charlie-core-tests.mjs && node /tmp/charlie-core-tests.mjs` and `node node_modules/typescript/bin/tsc --noEmit`.

Local test data is not deployed. The hosting manifest retains the registered project identity. Deployed D1 is independent of the local preview database.

## Data sources
- https://api-v3.mbta.com/stops
- https://api-v3.mbta.com/shapes
- https://www.reddit.com/r/mbta/comments/1xaqcns/limited_edition_special_design_charlie_cards/
- https://www.mbta.com/news/2026-10-20/mbta-releases-new-round-collectable-charliecards-celebrating-boston

Independent community project; not affiliated with MBTA. No sample sightings are represented as real reports.

Approved Reddit API access can be configured through server-side Sites runtime secrets: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT (descriptive app/version and account contact), and optionally REDDIT_REFRESH_TOKEN for an approved read-only user grant. Without a refresh token, app-only client credentials are used. Credentials are never stored in source or exposed to visitors. Live authenticated sync cannot be verified until approved credentials are supplied.

## GitHub Pages

Public frontend: https://flbjcy.github.io/charlie-card-map/

Build with `npx vite build --config vite.pages.config.ts`. GitHub Actions publishes `dist-pages` on pushes to main. Shared API routes and D1 remain on the existing Sites deployment; its CORS allowlist permits https://flbjcy.github.io. Hourly browser reviews search relevant Reddit threads and publish supported updates while Codex is running.

Local GitHub checkout: sibling directory `charlie-card-github`. Copy authored source changes there, preserve its Git history, and push to main to publish frontend updates. Never copy local secrets, runtime databases, dependency folders or build output.
