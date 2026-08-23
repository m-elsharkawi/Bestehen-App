import path from "node:path";
import type { NextConfig } from "next";

const configuration: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    "@bestehen/configuration",
    "@bestehen/contracts",
    "@bestehen/design-system",
    "@bestehen/infrastructure",
  ],
};

export default configuration;
