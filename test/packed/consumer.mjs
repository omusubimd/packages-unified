import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { omusubiRubyFromMarkdown } from "@omusubimd/mdast-util-omusubi-ruby";
import { omusubiIndentSyntax } from "@omusubimd/micromark-extension-omusubi-indent";
import { omusubiRubySyntax, omusubiRubyHtml } from "@omusubimd/micromark-extension-omusubi-ruby";
import remarkIndent, { remarkOmusubiIndent } from "@omusubimd/remark-omusubi-indent";
import remarkRuby, { remarkOmusubiRuby } from "@omusubimd/remark-omusubi-ruby";
import { toHtml } from "hast-util-to-html";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { micromark } from "micromark";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const directory = dirname(fileURLToPath(import.meta.url));
for (const name of [
	"micromark-extension-omusubi-ruby",
	"micromark-extension-omusubi-indent",
	"mdast-util-omusubi-ruby",
	"remark-omusubi-ruby",
	"remark-omusubi-indent",
]) {
	const resolved = realpathSync(fileURLToPath(import.meta.resolve(`@omusubimd/${name}`)));
	assert.ok(
		resolved.startsWith(`${directory}${sep}node_modules${sep}`),
		`Expected an extracted package, not a workspace link: ${resolved}`,
	);
}
assert.equal(remarkRuby, remarkOmusubiRuby);
assert.equal(remarkIndent, remarkOmusubiIndent);
const input = "　[青天|の|霹靂]<<せいてん||へきれき>>\n　[海]<<うみ>>";
const expected =
	"<p><ruby>青天<rt>せいてん</rt></ruby>の<ruby>霹靂<rt>へきれき</rt></ruby></p>\n<p><ruby>海<rt>うみ</rt></ruby></p>";
const extensions = [omusubiRubySyntax(), omusubiIndentSyntax()];
assert.equal(micromark(input, { extensions, htmlExtensions: [omusubiRubyHtml()] }), expected);
const tree = fromMarkdown(input, { extensions, mdastExtensions: [omusubiRubyFromMarkdown()] });
assert.deepEqual(
	tree.children[0].children.map((node) => node.type),
	["ruby", "text", "ruby"],
);
assert.equal(toHtml(toHast(tree)), expected);
for (const reverse of [false, true]) {
	const p = unified().use(remarkParse);
	if (reverse) p.use(remarkRuby).use(remarkIndent);
	else p.use(remarkIndent).use(remarkRuby);
	assert.equal(String(p.use(remarkRehype).use(rehypeStringify).processSync(input)), expected);
}
