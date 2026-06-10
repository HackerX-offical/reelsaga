# Content — Shows, Trailers, Reels

Show files are named **`{id}-{slug-from-title}.json`** for easy search:

```
3202-warrior-reborn.json
3565-chamatkari-boyfriend.json
4027-super-teacher.json
```

| Path | Description |
|------|-------------|
| [shows/index.json](shows/index.json) | All shows — use `file` column to open detail JSON |
| [shows/](shows/) | Full show + every episode + `.m3u8` stream URL |
| [home/feed.json](home/feed.json) | Home screen sections |
| [trailers/all-trailers.json](trailers/all-trailers.json) | Trailer feed |
| [reels/all-clips.json](reels/all-clips.json) | Clips / reels feed |
| [lists/](lists/) | Trending, popular, new, all |
| [search/queries.json](search/queries.json) | Live search results |

Find by name: `ls shows/ | rg -i 'warrior'`
