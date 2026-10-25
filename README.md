# Gant02 · v1.14.2

A compact spreadsheet Gantt planner. Public shared workspace; no sign-in. Anyone with the URL can read and edit its projects and tasks.

Live app: https://gant02-esemmelman.esemmoc.chatgpt.site

GitHub Pages (automatically deployed on pushes to main): https://esemmelman.github.io/gant02/

## Use

- Type in the blank project row and press Enter or Tab. Each project has a blank task row for the same inline creation. Enter keeps the next blank task row focused for fast entry.
- Project rows and task rows both accept independent date colors. Drag a colored square to another date or row to move it (replaces the destination color). Both source and destination save in one database transaction. Click a colored square to recolor it; drag from a blank square to paint a range.
- Select Assigned (blue), In progress (amber), or Complete (green), then click any task/date square. Drag to paint several dates. Each square saves independently; Clear removes a color.
- Date headers show only the month. The color controls sit immediately beside the All date-window dropdown.
- A new task automatically starts with an Assigned square on today, regardless of the selected paint color. The task and square are created in one transaction. Additional dates remain independent.
- Drag colored squares to move them. Use the notes panel for descriptions and comment entries.
- Use the color controls to mark individual dates. Blue = assigned, amber = in progress, green = complete.
- Drag a task by its name to reorder it or move it into another project. Drop above or below a task to choose the position.
- Drag a project by its name to move the whole project and its tasks. Drop on the blank project row to move it to the end.
- Task rows are 22px high; project rows are 24px. No drag handles, project counts, or per-project add-task links.
- Click a task bar/name or project name to edit its name and rich-text notes. Notes and detail fields save automatically after a short pause; closing the panel flushes pending edits.
- Focus date squares and use left/right arrows to navigate; Enter colors the square and Delete clears it.
- Use Today, month navigation, zoom, search, and filters to navigate. Daily shows 120 days, Weekly shows 26 complete weeks, and Monthly shows 12 complete calendar months.
- Grid edits save immediately to Supabase. Other sessions refresh every 15 seconds while idle. Detail edits save automatically.

## Backend isolation

Existing Supabase project: **bnaimitzvah** (`fgomaujsdblpzxhnnqrg`). This app uses only:

- `public.gant02_20261024_projects`
- `public.gant02_20261024_tasks`
- `public.gant02_20261024_cells`
- `public.gant02_20261024_project_cells`
- `public.gant02_20261024_comments`

No other application's data, tables, policies, auth, storage, or settings are changed. The schema is recorded in `database/schema.sql` for reference; do not rerun against the existing database. Public CRUD policies implement the requested open access. The browser contains only a publishable API key, never a privileged key. Task dates are inclusive calendar dates. Deleting a project deletes its tasks.

## Development and publication

Static HTML/CSS/JavaScript in `dist/`, with no runtime dependencies. Serve `dist/` with any static server. `npm ci`, `npm run check`, and `npm test` run validation. Tests cover scheduling gestures, date validation, rich text, project/task creation, and reordering. Browser visual QA was unavailable during initial creation.

GitHub Actions validates and deploys `dist/` to GitHub Pages on every push to `main`. Run `./publish.ps1 -Message 'Describe change'` to check, test, commit, and push automatically. Bump the version in package.json, package-lock.json, the app header, and this README for a release. Supabase data is saved to the database, not committed to GitHub.

The Sites copy is deployed through the Sites source helper with the existing `.openai/hosting.json` project ID. Changes pushed to GitHub automatically update GitHub Pages; updating the Sites URL additionally requires a Sites deployment.

## Date filters and notes (v1.13.0)

All is the default days filter on every page load. 1/3/7/30 Days include today through that many days from today, inclusive. Only projects and tasks with colored squares in that window are included; a matching task keeps its project visible. Project-only dates also qualify. Search/status filters combine with this window. Only matching tasks display under the project. The timeline itself remains navigable.

Hover a date header number to see days out first followed by MM-DD ddd. Project and task names show only a numeric day offset. All grid squares, colored or blank, show M-DD ddd followed by the numeric offset (for example, 10-27 Tue · 3), with no status or extra wording. Names use the next colored date, or the most recent past date when no future date exists. Project names use their own colored dates when present, falling back to task dates only when the project has no colored dates. Undated names show no tooltip. Sunday columns have gray shading; Saturdays use the normal grid background. There is no current-day vertical line. Separate meetings on the same row remain separate squares, including gaps between them. Details autosave after 500ms and flush when the panel closes. Save failures leave the panel open with an error; closing or changing notes retries.

The calendar opens with today as its first visible date. The Today button returns to that same position.

Use the trash icon beside Clear, then click a project or task name to remove it. Confirm the named item before deletion. Project deletion includes its tasks and date colors. Escape or choosing a color exits trash mode. Successful deletion also exits trash mode.

## Android

Android browsers automatically show a simplified list instead of the Gantt chart. Only project/task names, numeric days out, and inline New task/New project fields appear. Names are larger and wrap. Long press a name for 550ms to open its note; scrolling or moving your finger cancels the press. Tapping a name does not open a panel. Notes remain editable and autosave. No date painting, dragging, deletion, filters, or metadata controls appear on Android. Other devices keep the desktop experience.

The name count is the next colored occurrence (including today), or the most recent past occurrence if there are no future dates. A project's own date takes precedence over its children's dates, so a project dated three days away shows 3 even if a child task is assigned today. No colored dates means a blank number, not an invented zero.

The Collapse all/Expand all button beside Complete toggles every project. Dayflow immediately beside it opens https://esemmelman.github.io/DayFlow/ in a new tab. Clicking a project/task name copies the displayed name (no day count) to the clipboard while retaining desktop note opening. Android taps copy the name; long presses open notes. Clipboard failures show a brief message without blocking notes.

## Comment entries

The note panel keeps the existing rich-text note and adds a Comments section. New comment creates a separate timestamped entry. Each entry autosaves after 500ms, and closing the panel flushes pending comment changes. Multiple entries can be edited independently on desktop and Android. Delete an entry with its × button. Comments are scoped to their project or task and cascade when that parent is deleted. Empty new entries are not persisted. Failed saves retain the text and keep the panel open for retry.

While dragging a colored square, a floating label follows the pointer and shows the destination M-DD ddd plus numeric days out.

Comment boxes start at 180px on desktop and 220px on Android. The Description box starts at 280px on desktop and 240px on Android and scrolls for longer content. Both can be resized vertically.

The notes panel contains name, description, and comments. Project, status, assignee, and date controls have been removed from this panel. Description autosave changes only the name and rich-text description, preserving any existing task metadata.

Android task names and day counts use blue, amber, or green when that task has an Assigned, In progress, or Complete square on today. Without a colored square today, text stays neutral. Project names are unchanged.

## Android quick capture

A sticky text box at the top adds tasks to General. Tap the box or microphone once to start browser speech recognition, or type normally. Tap the microphone again to stop. Review the transcript and press Add or Enter. General is created if missing; a single transaction creates the task with today's start/finish and blue Assigned square. Repeated retries reuse a request ID to avoid duplicate tasks. Failed saves retain the text. Browser microphone permission and supported SpeechRecognition/webkitSpeechRecognition are required for dictation; typing and keyboard dictation remain available when browser voice input is unsupported or denied. No audio recording is stored in Supabase.

Desktop has a New task entry immediately above each New project entry. These create independent projects and use separate drafts. Android retains its existing entry layout.

## Timeline views

The Daily/Weekly/Monthly dropdown appears before the ‹ and Today buttons on desktop. Daily retains 120 individual date cells. Weekly shows 26 columns, one complete Monday–Sunday week per cell, with the ISO week number above its Monday start date (for example, Oct. 19). Monthly shows 12 columns, one full calendar month per cell, with month names only. Every project, task, and subtask summary cell is colored when any of its dates in that period is colored. Multiple statuses appear together as color segments; periods without colored dates stay blank. Explicitly cleared dates do not contribute. Standard/Compact/Detailed adjusts column widths. Clicking a summary cell (or pressing Enter) opens its period in Daily view for precise painting and dragging. Summary navigation never changes stored dates. Arrow navigation advances by four weeks in Daily, one week in Weekly, and one calendar month in Monthly. Today shows today or its containing week/month. Android keeps its simplified list.

## Subtasks and period labels (v1.13.0)

Right-click a task name and choose **Add subtask**, then type a name and press Enter or Tab. Subtasks appear indented beneath their parent. They have independently colored date squares; click a subtask name to open its details with an editable name, rich description, and separate comment entries. New subtasks start with blank dates. Use the existing color tools and square dragging. Moving a parent task between projects carries its subtasks; deleting it also deletes its subtasks. The trash tool can delete a subtask individually. Subtask details autosave independently of their parent. Android long press opens subtask details.

Daily retains individual date squares. Weekly and Monthly aggregate those saved dates into one cell per period, including subtask rows.

## v1.14.0 validation

67 automated regression tests cover week/month aggregation for all row types, mixed status colors, period boundaries, leap years, date editing, creation row order, and existing desktop/Android behavior. Interactive browser visual verification was unavailable in this session. No Supabase schema or data changes were needed for these views.

## v1.14.1

Clicking a desktop subtask now opens SUBTASK DETAILS rather than an inline name field. Names still copy to the clipboard. Names, descriptions, and multiple comments save automatically on the subtask using existing task/comment records. Android long press opens the same details panel. No backend schema changes.

## v1.14.2

Weekly columns are narrower: Standard 40px, Compact 34px, Detailed 52px. Each header stacks its week number above the Monday start date formatted Mmm. d. Task row heights and period color aggregation are unchanged.
