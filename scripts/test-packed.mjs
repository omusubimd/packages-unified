import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "omusubi-packed-"));
const env = { ...process.env, npm_config_cache: join(temporary, "npm-cache") };
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const manifest = (name) => JSON.parse(readFileSync(join(root, "packages", name, "package.json"), "utf8"));
const ruby = manifest("remark-omusubi-ruby");
const mdast = manifest("mdast-util-omusubi-ruby");
const rootManifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function run(command, args, cwd, output = "inherit") {
	return execFileSync(command, args, {
		cwd,
		env,
		encoding: "utf8",
		stdio: output === "capture" ? ["ignore", "pipe", "inherit"] : "inherit",
	});
}

try {
	// Run each package's real prepack hook and consume the archives, not dist
	// through workspace symlinks. This command never publishes anything.
	const archives = JSON.parse(
		run(npm, ["pack", "--workspaces", "--json", "--pack-destination", temporary], root, "capture"),
	);
	assert.equal(archives.length, 5, "Update the consumer fixture when the workspace package set changes");
	const dependencies = {
		"@types/node": rootManifest.devDependencies["@types/node"],
		micromark: ruby.devDependencies.micromark,
		unified: ruby.dependencies.unified,
		"remark-parse": ruby.dependencies["remark-parse"],
		"remark-rehype": ruby.devDependencies["remark-rehype"],
		"rehype-stringify": ruby.devDependencies["rehype-stringify"],
		"mdast-util-from-markdown": mdast.dependencies["mdast-util-from-markdown"],
		"mdast-util-to-hast": mdast.devDependencies["mdast-util-to-hast"],
		"hast-util-to-html": mdast.devDependencies["hast-util-to-html"],
	};
	for (const archive of archives) dependencies[archive.name] = `file:${join(temporary, archive.filename)}`;
	const consumer = join(temporary, "consumer");
	cpSync(join(root, "test", "packed"), consumer, { recursive: true });
	writeFileSync(
		join(consumer, "package.json"),
		JSON.stringify({ private: true, type: "module", dependencies }, null, 2),
	);
	writeFileSync(
		join(consumer, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "NodeNext",
					moduleResolution: "NodeNext",
					strict: true,
					noEmit: true,
					skipLibCheck: false,
				},
				include: ["consumer.ts"],
			},
			null,
			2,
		),
	);
	run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], consumer);
	run(process.execPath, ["consumer.mjs"], consumer);
	// Use the repository's compiler, but resolve declarations only from the
	// consumer project. No paths aliases or workspace links are supplied.
	run(
		process.execPath,
		[join(root, "node_modules", "typescript", "bin", "tsc"), "--project", join(consumer, "tsconfig.json")],
		consumer,
	);
	// Ensure these checks really reject missing published exports instead of
	// accidentally finding the source workspace or silently skipping declarations.
	const typeArguments = [
		join(root, "node_modules", "typescript", "bin", "tsc"),
		"--project",
		join(consumer, "tsconfig.json"),
	];
	for (const [relative, args, expectedError] of [
		["micromark-extension-omusubi-ruby/dist/index.js", ["consumer.mjs"], /ERR_MODULE_NOT_FOUND/],
		["mdast-util-omusubi-ruby/dist/index.d.ts", typeArguments, /TS7016|TS2307/],
	]) {
		const target = join(consumer, "node_modules", "@omusubimd", relative);
		const backup = `${target}.packed-test-backup`;
		renameSync(target, backup);
		try {
			const failure = spawnSync(process.execPath, args, { cwd: consumer, env, encoding: "utf8" });
			assert.equal(failure.error, undefined);
			assert.notEqual(failure.status, 0, `Missing export was not rejected: ${relative}`);
			assert.match(`${failure.stdout}${failure.stderr}`, expectedError);
		} finally {
			renameSync(backup, target);
		}
	}
	console.log(
		`Packed consumer passed for ${archives.length} packages (ESM, HTML, mdast, types and missing-export controls).`,
	);
} finally {
	rmSync(temporary, { recursive: true, force: true });
}
