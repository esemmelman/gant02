# Gant02 · v1.2.0

A compact spreadsheet Gantt planner. Public shared workspace; no sign-in. Anyone with the URL can read and edit its projects and tasks.

Live app: https://gant02-esemmelman.esemmoc.chatgpt.site

GitHub Pages (automatically deployed on pushes to main): https://esemmelman.github.io/gant02/

## Use

- Type in the blank project row and press Enter or Tab. Each project has a blank task row for the same inline creation. Enter keeps the next blank task row focused for fast entry.
- Select Assigned (blue), In progress (amber), or Complete (green), then click any task/date square. Drag to paint several dates. Each square saves independently; Clear removes a color.
- Select Schedule bars to use the original date-range drawing, moving and resizing. Existing scheduled dates appear in their task color in paint mode; painting overrides only the selected dates.
- Drag a bar to move its schedule. Drag either edge to resize. Use the details panel for exact dates.
- Change status, assignee, or exact dates in the task details panel. Blue = assigned, amber = in progress, green = complete.
- Drag the six-dot task handle onto another task to insert before it, or onto a project to move to that project.
- Click a task bar/name or project name to edit its name and rich-text notes. Save changes in the panel.
- Focus a bar and use left/right arrows to move a day; Shift + arrow adjusts its finish.
- Use Today, month navigation, zoom, search, and filters to navigate. The calendar shows 120 days from the selected start.
- Grid edits save immediately to Supabase. Other sessions refresh every 15 seconds while idle. Detail edits save explicitly.

## Backend isolation

Existing Supabase project: **bnaimitzvah** (`fgomaujsdblpzxhnnqrg`). This app uses only:

- `public.gant02_20261024_projects`
- `public.gant02_20261024_tasks`
- `public.gant02_20261024_cells`

No other application's data, tables, policies, auth, storage, or settings are changed. The schema is recorded in `database/schema.sql` for reference; do not rerun against the existing database. Public CRUD policies implement the requested open access. The browser contains only a publishable API key, never a privileged key. Task dates are inclusive calendar dates. Deleting a project deletes its tasks.

## Development and publication

Static HTML/CSS/JavaScript in `dist/`, with no runtime dependencies. Serve `dist/` with any static server. `npm ci`, `npm run check`, and `npm test` run validation. Tests cover scheduling gestures, date validation, rich text, project/task creation, and reordering. Browser visual QA was unavailable during initial creation.

GitHub Actions validates and deploys `dist/` to GitHub Pages on every push to `main`. Run `./publish.ps1 -Message 'Describe change'` to check, test, commit, and push automatically. Bump the version in package.json, package-lock.json, the app header, and this README for a release. Supabase data is saved to the database, not committed to GitHub.

The Sites copy is deployed through the Sites source helper with the existing `.openai/hosting.json` project ID. Changes pushed to GitHub automatically update GitHub Pages; updating the Sites URL additionally requires a Sites deployment.
