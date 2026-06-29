// Footer shown on every page. The app version is the deployed git commit,
// baked in at build time (see next.config.js).
export function SiteFooter() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
  return (
    <footer className="border-t py-4 text-center text-xs text-muted-foreground">
      CKYC · Central Know Your Customer &middot; version{' '}
      <code className="font-mono">{version}</code>
    </footer>
  );
}
