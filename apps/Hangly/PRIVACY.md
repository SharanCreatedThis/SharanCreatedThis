# Privacy

Hangly is an ornament that hangs on your desktop. It needs almost nothing about you
to do that, and it collects almost nothing.

Two things leave your Mac, both optional and both described below.

## Weather

Off unless you turn it on. When it is on, Hangly asks [Open-Meteo](https://open-meteo.com)
what the weather is in one city, every thirty minutes, so the charm can take on the
sky.

- The city is a **name you can see and change** in Customize → Appearance. It is
  guessed from your Mac's time zone, not from your location.
- Hangly does not use Core Location and asks for no location permission.
- Open-Meteo requires no account and no API key, so there is nothing to identify the
  request with beyond an IP address, as with any web request.

## Anonymous analytics

On by default, and switchable off in **Customize → Appearance → Privacy**. Turning it
off stops collection immediately and discards the installation identifier.

Events are sent to [PostHog](https://posthog.com) (US region). They are batched and
sent in the background; if the network is unavailable they are queued, and if the
queue fills, the oldest are dropped. Nothing about analytics can delay, block or
change what the app does.

### What is sent

| | |
|---|---|
| Installation identifier | A random UUID made on this Mac the first time anything is sent. It is not derived from your hardware, account, network or anything else, and it is used for nothing but counting installs. |
| Build and system | App version, build number, macOS version. |
| Lifecycle | `app_first_launch`, `app_launch`, `app_quit`. |
| Charms | `charm_added`, `charm_removed`, `charm_reordered`, `charm_imported`, `charm_saved`, `charm_selected`. Built-in charms are named; a charm you made is reported as `custom`. |
| Rope | `rope_count_changed`, `rope_style_changed`. |
| Settings | `appearance_changed` — the **name** of the setting that moved, never its value. `weather_effect_toggled`. |
| Follow card | `follow_popup_shown`, `follow_instagram_clicked`. |
| With every event | `charm_count`, `active_charm_ids`, `rope_style`, `analytics_enabled`. |

### What is never sent

- Your name, email address, or any account. Hangly has no accounts.
- Images you import, or anything about them — not the file, its name, or its size.
- Charms you make. They are reported as the word `custom`.
- Your location. The weather city is never sent here.
- Where your charm sits, how large it is, or anything else describing your desktop.
- Keystrokes, screen contents, other applications, or what you are doing.

### Turning it off

**Customize → Appearance → Privacy → Anonymous Analytics.**

Switching it off stops capture at the source rather than filtering it later, and
throws away the installation identifier. If you switch it back on, a new identifier
is made, so the two cannot be joined.

## Permissions

Hangly asks for none, and this is a design constraint rather than a happy accident.

The optional full-screen auto-hide reads two things the system publishes to any
process: the bounds of on-screen windows, and which applications are holding a
display-sleep power assertion — the same information `pmset -g assertions` prints.
Neither needs Accessibility, Screen Recording, or any entitlement. Window *names*
and contents would need Screen Recording, and Hangly reads neither.

## No other network use

Hangly makes no other network requests. It does not check for updates, load remote
content, or contact any other service.

## Checking what your copy is doing

**Customize → About → Analytics** shows, for this machine:

- whether sharing is on
- whether a destination is configured, and which
- the installation identifier, masked
- the last event sent, and when

It is in the app rather than behind a developer flag because the argument for
collecting anything at all is that it can be inspected.
