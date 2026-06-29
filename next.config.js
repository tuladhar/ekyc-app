/** @type {import('next').NextConfig} */

// Resolve a short version string at build time so the footer can show which
// commit is deployed. OpenShift's S2I build injects OPENSHIFT_BUILD_COMMIT;
// locally we fall back to `git rev-parse`, then to "dev".
function resolveAppVersion() {
  const fromOpenShift = process.env.OPENSHIFT_BUILD_COMMIT;
  if (fromOpenShift) return fromOpenShift.slice(0, 7);
  try {
    return require('node:child_process')
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveAppVersion(),
  },
};

module.exports = nextConfig;
