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

    console.log("👀 [FastViz] Watching for changes...");

    const ctx = await esbuild.context({
        entryPoints: [path.join(srcDir, "FastViz.tsx")],
        bundle: true,
        minify: false,
        sourcemap: true,
        platform: "browser",
        target: ["es2020"],
        format: "cjs",
        outfile: path.join(distDir, "FastViz.js"),
        external: ["react", "react-dom"]
    });

    await ctx.watch();
    console.log("🚀 [FastViz] Initial watch build ready.");
}

watch().catch(err => {
    console.error("Watch failed:", err);
    process.exit(1);
});
