import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-entry-redirect",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/" || req.url === "/index.html") {
            req.url = "/frontend/index.html";
          }
          next();
        });
      },
    },
    {
      name: "vercel-dist-flattener",
      closeBundle() {
        const distFrontend = resolve(__dirname, "dist/frontend");
        const distRoot = resolve(__dirname, "dist");
        if (fs.existsSync(distFrontend)) {
          const files = fs.readdirSync(distFrontend);
          for (const file of files) {
            if (file.endsWith(".html")) {
              fs.copyFileSync(
                resolve(distFrontend, file),
                resolve(distRoot, file)
              );
            }
          }
        }
        // Also copy images to dist/images and dist/frontend/images for absolute reliability
        const srcImages = resolve(__dirname, "frontend/images");
        if (fs.existsSync(srcImages)) {
          const distImages = resolve(__dirname, "dist/images");
          const distFrontendImages = resolve(__dirname, "dist/frontend/images");
          fs.cpSync(srcImages, distImages, { recursive: true });
          fs.cpSync(srcImages, distFrontendImages, { recursive: true });
        }
      },
    },
  ],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "frontend/index.html"),
        login: resolve(__dirname, "frontend/login.html"),
        signup: resolve(__dirname, "frontend/signup.html"),
        blogs: resolve(__dirname, "frontend/BlogPage.html"),
        writeBlog: resolve(__dirname, "frontend/writeBlog.html"),
        developers: resolve(__dirname, "frontend/Developers.html"),
        developerProfile: resolve(__dirname, "frontend/DeveloperProfile.html"),
        projects: resolve(__dirname, "frontend/Projects.html"),
        about: resolve(__dirname, "frontend/About.html"),
      },
    },
  },
});
