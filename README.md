# 🪎 Schatzsuche – a treasure hunt for your notes

A search view for the [NotePlan](https://noteplan.co) sidebar. Type, press Enter, see every matching line, and open the note with one click. *Schatzsuche* is German for "treasure hunt".

[Deutsch](README.de.md)

![NotePlan Plugin](https://img.shields.io/badge/NotePlan-Plugin-orange) ![License: MIT](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Instant results in the sidebar**: every matching line with its heading, grouped by note.
- **Open with one click**: ⌥-click opens the note in the split view (and reuses it), ⌘-click opens a new window. Or use ↑↓ and Enter.
- **Quick-search buttons**: whole word, notes only, journal of the last 30 days, no tasks, under a heading, open tasks, done in 30 days, newest first, your treasure tag.
- **Filters** by date, heading, folder and line type (see the syntax below).
- **Schatzkiste (treasure box)**: tick results across several searches, then save them as Markdown to a new note, to today's note or to the clipboard.
- **Raindrop.io (optional)**: search your bookmarks next to your notes, with favourites.
- **Follows your NotePlan theme**, light and dark.
- **English and German**: the language follows your system, or set it in the plugin settings.

## Installation

1. Open NotePlan.
2. Go to **Settings › Plugins**.
3. Search for **"Schatzsuche"**.
4. Click **Install**.
5. Open **Schatzsuche** from the left sidebar.

The sidebar is the usual way in. The command **/🪎 Schatzsuche** (type `/schatz` or use ⌘J) opens the same view in the main window. This helps when the sidebar is hidden, and on iPhone and iPad.

If the sidebar shows an old icon after an update, switch **Sidebar** off and on again in the plugin's details under **Settings › Plugins**.

Requires NotePlan 3.21 or later. Tested on macOS. iPhone and iPad should work, but are not tested yet.

## Search syntax

| Type | Finds |
|---|---|
| `client offer` | lines with all words |
| `"word"` | the exact whole word or phrase |
| `pos*e` `poli?e` | wildcards: `*` any characters, `?` one character |
| `-draft` `-#tag` | exclude |
| `#tag` `@person` | tag, mention |
| `in:notes` `in:calendar` `in:archive` | where to search |
| `folder:Clients` | folder (part of the name) |
| `is:open` `is:done` `is:task` `is:not-task` | line type |
| `heading:Ideas` | lines below a matching heading |
| `since:14d` `since:week` `since:month` `since:year` `since:2026-09-01` | date of the calendar note or last change |

German keywords work as well: `in:notizen`, `in:kalender`, `ordner:`, `ist:offen`, `überschrift:`, `seit:woche`.

## Settings

NotePlan › **Settings › Plugins › Schatzsuche** (gear):

- **Language**: auto, English or Deutsch.
- **Treasure tag**: the tag you use to mark treasures, e.g. `#treasure`. Two quick-search buttons use it.
- **Raindrop token**: optional, see below.

## Optional: Raindrop.io

1. In Raindrop.io go to **Settings › Integrations**, create an app and copy its **test token**.
2. Paste it into the plugin setting **Raindrop token**.
3. The Raindrop buttons appear. Use `in:raindrop`, plus Raindrop operators such as `link:example.com`, `type:article`, `important:true`.

The token is only read, never shown or logged. Full-text search needs Raindrop Pro.

### Getting your bookmarks into shape

A search only finds what has words. I let Raindrop's AI assistant **Stella** curate my bookmarks with a prompt of my own. What worked:

- **New, telling titles** with the author in brackets – and the original title kept in the description, so you still find it by the words you remember.
- **One line `K like Keyword`** (letter plus key term, up to two more terms). It makes an ABC that works across all sources.
- **Two or three short points** on why the bookmark is worth keeping – not a summary.
- **Honesty rule**: if only a teaser could be read, say so and invent nothing.
- **Tags only for states, not topics**: `#clutter` (no lasting value: hide, don't delete), `#teaser` (read later). Topics are found by full-text search.
- **Dates**: for LinkedIn posts the publication time is inside the link: `urn:li:activity:<number>`, number >> 22 = milliseconds since 1970.
- **Filter is a view, folder is a place**: use `link:` filters for sources that tell you what something is (a magazine), and folders for what it is about.

## How I extended it (not part of the plugin)

My own copy also searches Simplenote, Gmail messages with a star (via a small Google Apps Script and my own server), files and folders with Finder tags (one Markdown note per file) and my LinkedIn data export. These parts depend on my own setup, so they are not in this plugin. If you are interested, open an issue.

## Support

Provided as is. Issues are welcome, but there is no promised response time.

## License

MIT – see [LICENSE](LICENSE).
