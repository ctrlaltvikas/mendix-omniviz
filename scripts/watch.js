const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

async function watch() {
    const rootDir = path.resolve(__dirname, "..");
    const distDir = path.join(rootDir, "dist");
    const srcDir = path.join(rootDir, "src");

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    console.log("👀 [OmniViz] Watching for changes...");

    const ctx = await esbuild.context({
        entryPoints: [path.join(srcDir, "OmniViz.tsx")],
        bundle: true,
        minify: false,
        sourcemap: true,
        platform: "browser",
        target: ["es2020"],
        format: "cjs",
        outfile: path.join(distDir, "OmniViz.js"),
        external: ["react", "react-dom"]
    });

    await ctx.watch();
    console.log("🚀 [OmniViz] Initial watch build ready.");
}

watch().catch(err => {
    console.error("Watch failed:", err);
    process.exit(1);
});
