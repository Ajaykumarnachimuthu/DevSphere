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
