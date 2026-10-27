const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

async function build() {
    console.log("⚡ [FastViz] Starting build...");

    const rootDir = path.resolve(__dirname, "..");
    const distDir = path.join(rootDir, "dist");
    const srcDir = path.join(rootDir, "src");

    // Clean dist
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    // 1. Bundle TypeScript/React into Single JS
    console.log("📦 [FastViz] Bundling widget runtime with esbuild...");
    await esbuild.build({
        entryPoints: [path.join(srcDir, "FastViz.tsx")],
        bundle: true,
        minify: true,
        sourcemap: false,
        platform: "browser",
        target: ["es2020"],
        format: "cjs",
        outfile: path.join(distDir, "FastViz.js"),
        external: ["react", "react-dom"],
        define: {
            "process.env.NODE_ENV": '"production"'
        }
    });

    // 2. Copy XML manifests and CSS
    console.log("📄 [FastViz] Copying Studio Pro manifests & stylesheets...");
    fs.copyFileSync(path.join(srcDir, "FastViz.xml"), path.join(distDir, "FastViz.xml"));
    fs.copyFileSync(path.join(srcDir, "package.xml"), path.join(distDir, "package.xml"));
    fs.copyFileSync(path.join(srcDir, "ui", "FastViz.css"), path.join(distDir, "FastViz.css"));

    // 3. Package into .mpk (Mendix Package Zip)
    console.log("🗜️  [FastViz] Creating Mendix package (.mpk)...");
    const mpkPath = path.join(distDir, "FastViz.mpk");
    const output = fs.createWriteStream(mpkPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
        output.on("close", () => {
            const sizeInKb = (archive.pointer() / 1024).toFixed(2);
            console.log(`✅ [FastViz] Success! Built ${mpkPath} (${sizeInKb} KB)`);
            resolve();
        });

        archive.on("error", (err) => reject(err));
        archive.pipe(output);

        archive.file(path.join(distDir, "package.xml"), { name: "package.xml" });
        archive.file(path.join(distDir, "FastViz.xml"), { name: "FastViz.xml" });
        archive.file(path.join(distDir, "FastViz.js"), { name: "FastViz.js" });
        archive.file(path.join(distDir, "FastViz.css"), { name: "FastViz.css" });

        archive.finalize();
    });
}

build().catch((err) => {
    console.error("❌ [FastViz] Build failed:", err);
    process.exit(1);
});
