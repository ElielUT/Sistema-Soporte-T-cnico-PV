import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.js"],
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            // public/js scripts are executed inside jsdom via eval, which v8 cannot
            // instrument, so only the server modules are measured here.
            include: ["routes/**/*.js"],
        },
    },
});
