import { rmSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = resolve(packageRoot, "dist");
if (relative(packageRoot, outputDirectory) !== "dist") {
	throw new Error("Build output must be the package's dist directory");
}
rmSync(outputDirectory, { recursive: true, force: true });
