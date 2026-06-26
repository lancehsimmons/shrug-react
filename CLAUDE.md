# Shrug React — Music Release Card App

## What this project is
A React application (lives under `src/shrug-react/`) for displaying music
release cards — think album/single artwork plus metadata, rendered as
reusable components fed by data rather than hardcoded per release.

## Where things stand
- **Component design**: Went through a couple of design passes. Started
  with a more elaborate vinyl-record aesthetic for the release card, then
  pulled back to a clean, minimal, prop-driven component. Favor the
  simpler version going forward unless there's a specific reason to add
  visual complexity back in.
- **Data integration**: Release data is being pulled in from JSON rather
  than hardcoded into components.
- **Styling**: Using CSS Modules (scoped per-component stylesheets), not
  global CSS or a CSS-in-JS library.
- **Known rough edges hit so far**: `.map()` errors when the JSON shape
  didn't match what the component expected, and module-not-found errors
  from import paths — worth double-checking data shape and import paths
  first if either resurfaces.

## How to work with me on this
- I prefer simple, explicit, incrementally-built solutions. Please don't
  reach for abstraction, config layers, or "flexible" architecture before
  it's actually needed.
- Push back if something feels over-engineered for what the task needs —
  I'd rather hear that than have it built anyway.
- When explaining something, show me complete, concrete code rather than
  describing it abstractly first.

## Note on this file
This was drafted from a summary of past conversations, not a live look at
the current repo — so treat the specifics above (file paths, exact
component names, current JSON shape) as a starting point. Worth a quick
pass to correct/expand once you're actually looking at the code, and keep
it updated as the project evolves.