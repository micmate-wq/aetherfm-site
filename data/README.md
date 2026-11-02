# data/stove.json: "On the stove" (light news)

One list, newest first. The page shows up to 5 items.

```json
{ "date": "2026-11-05", "text": "Live at Newspeak House, London.", "onair": true, "until": "2026-11-06" }
```

- `date`: `YYYY-MM-DD`, or `""` for no date (shown as —).
- `text`: one short line. Plain text; no HTML.
- `until` (optional): the item hides itself from this date on.
- `onair` (optional): marks a show. While /matt is off air, the hero says "Next on air · <date>" for the soonest upcoming one.

To edit, use GitHub's web editor (pencil icon), then commit to a branch and open a PR. Matt merges. A comma in the wrong place breaks the list, so the section simply hides; nothing else on the page is affected.
