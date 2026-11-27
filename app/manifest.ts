import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aloiz",
    short_name: "Aloiz",
    description: "Školní život dětí na jednom místě",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F5F1",
    theme_color: "#F6F5F1",
    lang: "cs",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
