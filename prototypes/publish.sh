# Copies the shared prototypes into the Vercel build output so they're served
# at /prototypes/. Runs from the repo root at the end of `npm run build`.
# Temporary: remove this script and its call in package.json when done.
set -e
out=.vercel/output/static/prototypes
mkdir -p "$out"
cp prototypes/index.html prototypes/antibody.html prototypes/dendrite.html prototypes/cytokine.html "$out"/
cp -R prototypes/src prototypes/videos prototypes/screenshots "$out"/
# Only the web font files the pages load, not the desktop otf/ttf set.
mkdir -p "$out/fonts/Neue Montreal Mono/web"
cp "prototypes/fonts/Neue Montreal Mono/web/"*.woff* "$out/fonts/Neue Montreal Mono/web/"
