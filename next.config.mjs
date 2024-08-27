/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tree-shake large barrel packages so only the icons/helpers actually used
  // are bundled, cutting JS payload and speeding up cold builds.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "date-fns",
      "react-use",
      "recharts",
    ],
    // PGlite (embedded demo Postgres) must stay unbundled so it can load its
    // WASM engine from node_modules at runtime.
    serverComponentsExternalPackages: ["@electric-sql/pglite"],
  },
};

export default nextConfig;
