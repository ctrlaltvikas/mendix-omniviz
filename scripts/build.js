const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

async function build() {
    console.log("⚡ [OmniViz] Starting build...");

    const rootDir = path.resolve(__dirname, "..");
    const distDir = path.join(rootDir, "dist");
    const srcDir = path.join(rootDir, "src");

    // Clean dist
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    // 1. Bundle TypeScript/React into Single JS
    console.log("📦 [OmniViz] Bundling widget runtime with esbuild...");
    await esbuild.build({
        entryPoints: [path.join(srcDir, "OmniViz.tsx")],
        bundle: true,
        minify: true,
        sourcemap: false,
        platform: "browser",
        target: ["es2020"],
        format: "cjs",
        outfile: path.join(distDir, "OmniViz.js"),
        external: ["react", "react-dom"],
        define: {
            "process.env.NODE_ENV": '"production"'
        }
    });

    // 2. Copy XML manifests and CSS
    console.log("📄 [OmniViz] Copying Studio Pro manifests & stylesheets...");
    fs.copyFileSync(path.join(srcDir, "OmniViz.xml"), path.join(distDir, "OmniViz.xml"));
    fs.copyFileSync(path.join(srcDir, "package.xml"), path.join(distDir, "package.xml"));
    fs.copyFileSync(path.join(srcDir, "ui", "OmniViz.css"), path.join(distDir, "OmniViz.css"));

    // 3. Package into .mpk (Mendix Package Zip)
    console.log("🗜️  [OmniViz] Creating Mendix package (.mpk)...");
    const mpkPath = path.join(distDir, "OmniViz.mpk");
    const output = fs.createWriteStream(mpkPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
        output.on("close", () => {
            const sizeInKb = (archive.pointer() / 1024).toFixed(2);
            console.log(`✅ [OmniViz] Success! Built ${mpkPath} (${sizeInKb} KB)`);
            resolve();
        });

        archive.on("error", (err) => reject(err));
        archive.pipe(output);

        archive.file(path.join(distDir, "package.xml"), { name: "package.xml" });
        archive.file(path.join(distDir, "OmniViz.xml"), { name: "OmniViz.xml" });
        archive.file(path.join(distDir, "OmniViz.js"), { name: "OmniViz.js" });
        archive.file(path.join(distDir, "OmniViz.css"), { name: "OmniViz.css" });

        archive.finalize();
    });
}

build().catch((err) => {
    console.error("❌ [OmniViz] Build failed:", err);
    process.exit(1);
});
