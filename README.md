# Auto Offline

A [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin that changes your Steam friends status by time of day: go invisible late at night, Away over lunch, back Online in the morning, without having to remember.

## Schedule

Each rule is a time and a status. The latest rule at or before the current time wins, before the first rule of the day the previous days last rule still applies. The default schedule:

| Time  | Status    |
|-------|-----------|
| 02:00 | Offline   |
| 08:00 | Online    |
| 13:00 | Away      |
| 14:00 | Online    |
| 23:00 | Invisible |

Edit it from the Quick Access menu (... > Decky > Auto Offline): add rules, change time and status, delete with ✕, or switch the whole thing off. Times are in 15 minute steps.

The plugin only switches when a new rule starts. If you change your status by hand it stays that way until the next rule. Checks run every 30 seconds so a switch can be up to half a minute late.

**Do Not Disturb**: Steam treats DND as a separate setting rather then a status. A DND rule sets you Online with DND on; any other rule turns DND off.

## Install

Not on the Decky Plugin Store. To install from a release:

1. In Decky's settings, under General, enable **Developer mode**.
2. Under **Developer**, choose **Install plugin from URL** and paste the `auto-offline.zip` link from the [latest release](https://github.com/imdizmo/decky-auto-offline/releases/latest).

Settings are kept in `~/homebrew/settings/auto-offline/settings.json`.

## Build

```sh
pnpm install
pnpm test
pnpm build
```

To package a release zip, put `plugin.json`, `package.json`, `main.py`, `LICENSE` and `dist/` in a folder named `auto-offline` and zip that folder.

Tested on SteamOS 3.9.5 with Decky Loader 3.3.1.

## License

BSD-3-Clause. Based on [decky-plugin-template](https://github.com/SteamDeckHomebrew/decky-plugin-template); see [LICENSE](LICENSE).
