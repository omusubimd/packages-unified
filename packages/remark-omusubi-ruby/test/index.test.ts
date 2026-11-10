import { omusubiRubyHtml, omusubiRubySyntax } from "@omusubimd/micromark-extension-omusubi-ruby";
import remarkOmusubiIndent from "@omusubimd/remark-omusubi-indent";
import { fromHtml } from "hast-util-from-html";
import { micromark } from "micromark";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { expect, it } from "vitest";

import remarkOmusubiRuby, { remarkOmusubiRuby as namedPlugin } from "../src/index.js";

const parser = unified().use(remarkParse).use(remarkOmusubiRuby);
const html = parser().use(remarkRehype).use(rehypeStringify);

function htmlTree(value: string): unknown {
	// Compare HTML structure, allowing serializers to choose equivalent character references.
	return JSON.parse(
		JSON.stringify(fromHtml(value, { fragment: true }), (key, value) => (key === "position" ? undefined : value)),
	);
}

it.for([
	"[青空]<<あおぞら>>",
	"[青|空]<<あお|ぞら>>",
	"[青天|の|霹靂]<<せいてん||へきれき>>",
	"[の|霹靂]<<|へきれき>>",
	"[青天|の]<<せいてん|>>",
	"[青|い|空|だ]<<あお|||だ>>",
	"[青|空]<<|>>",
	"[青空]<<>>",
	"[**青**|*空*]<<あお|ぞら>>",
	"[`青空`]<<**あおぞら**>>",
	"[A&amp;B]<<a&amp;b>>",
	"[&#124;|&#93;]<<&#124;|&gt;>>",
	"[\\*青空\\*]<<あおぞら>>",
	"今日は[青]<<あお>>[空]<<そら>>です。",
	"[青]<<あお>>\n\n[空]<<そら>>",
	"[青空]<< あおぞら >>",
	"[青空]<<あおぞら>",
	"[青|空]<<あおぞら>>",
	"[青空]<<あお|ぞら>>",
	"[]<<>>",
	"[青|]<<あお|>>",
	"[|空]<<|そら>>",
	"[青||空]<<あお||そら>>",
	"# [青空]<<あおぞら>>",
	"> [青空]<<あおぞら>>",
	"- [青空]<<あおぞら>>",
	"**[青空]<<あおぞら>>**",
	"`[青空]<<あおぞら>>`",
	"[青\n空]<<あおぞら>>",
	"[青空]<<あお\nぞら>>",
	"[青|空]<<あおぞら>>[海]<<うみ>>",
	"[青空]<<>>[海]<<うみ>>",
])("micromark の HTML と一致する ┊︎ %s", (input) => {
	const expected = micromark(input, { extensions: [omusubiRubySyntax()], htmlExtensions: [omusubiRubyHtml()] });
	expect(htmlTree(String(html.processSync(input)))).toEqual(htmlTree(expected));
});

it("名前付きと既定のエクスポートが一致する", () => {
	expect(namedPlugin).toBe(remarkOmusubiRuby);
});

it("既存の拡張を上書きしない", () => {
	const syntax = {};
	const mdast = {};
	const processor = unified()
		.data("micromarkExtensions", [syntax])
		.data("fromMarkdownExtensions", [mdast])
		.use(remarkParse)
		.use(remarkOmusubiRuby)
		.freeze();
	expect(processor.data("micromarkExtensions")).toHaveLength(2);
	expect(processor.data("micromarkExtensions")?.[0]).toBe(syntax);
	expect(processor.data("fromMarkdownExtensions")).toHaveLength(2);
	expect(processor.data("fromMarkdownExtensions")?.[0]).toBe(mdast);
});

it("別のプロセッサーに影響しない", () => {
	const input = "[青空]<<あおぞら>>";
	expect(parser.parse(input)).not.toEqual(unified().use(remarkParse).parse(input));
	expect(unified().use(remarkParse).parse(input)).toMatchObject({
		children: [{ children: [{ type: "text", value: input }] }],
	});
});

it("indent 拡張と組み合わせられる", () => {
	const processor = unified()
		.use(remarkParse)
		.use(remarkOmusubiIndent)
		.use(remarkOmusubiRuby)
		.use(remarkRehype)
		.use(rehypeStringify);
	expect(String(processor.processSync("　[青]<<あお>>\n　[空]<<そら>>"))).toBe(
		"<p><ruby>青<rt>あお</rt></ruby></p>\n<p><ruby>空<rt>そら</rt></ruby></p>",
	);
});

it("読みの文字参照を HTML として実行しない", () => {
	const output = String(html.processSync("[青空]<<&lt;script&gt;alert(1)&lt;/script&gt;>>"));
	expect(output).not.toContain("<script>");
	expect(output).toContain("alert(1)");
});

const boundaryCases = [
	{
		name: "paragraph",
		input: "前文\n　[青天|の|霹靂]<<せいてん||へきれき>>",
		expected: "<p>前文</p>\n<p><ruby>青天<rt>せいてん</rt></ruby>の<ruby>霹靂<rt>へきれき</rt></ruby></p>",
	},
	{
		name: "blank-setext",
		input: "　[青空]<<あおぞら>>\n　\n---",
		expected: "<p><ruby>青空<rt>あおぞら</rt></ruby></p>\n<hr />",
	},
	{
		name: "quote",
		input: "> 　[青空]<<あおぞら>>\n> 　\n> ---",
		expected: "<blockquote>\n<p><ruby>青空<rt>あおぞら</rt></ruby></p>\n<hr />\n</blockquote>",
	},
	{
		name: "loose-list",
		input: "- [青空]<<あおぞら>>\n  　\n  次",
		expected: "<ul>\n<li>\n<p><ruby>青空<rt>あおぞら</rt></ruby></p>\n<p>次</p>\n</li>\n</ul>",
	},
	{
		name: "empty-readings",
		input: "　[青|空]<<|>>\n　[海]<<うみ>>",
		expected: "<p>青空</p>\n<p><ruby>海<rt>うみ</rt></ruby></p>",
	},
	{
		name: "inline-code",
		input: "　`[青]<<あお>>`\n　[海]<<うみ>>",
		expected: "<p><code>[青]&lt;&lt;あお&gt;&gt;</code></p>\n<p><ruby>海<rt>うみ</rt></ruby></p>",
	},
	{
		name: "fenced-code",
		input: "```md\n　[青]<<あお>>\n```",
		expected: '<pre><code class="language-md">　[青]&lt;&lt;あお&gt;&gt;\n</code></pre>',
	},
	{
		name: "malformed-recovery",
		input: "　[青|空]<<あおぞら>>\n　[海]<<うみ>>",
		expected: "<p>[青|空]&lt;&lt;あおぞら&gt;&gt;</p>\n<p><ruby>海<rt>うみ</rt></ruby></p>",
	},
	{
		name: "escaped-reading",
		input: "　[A&amp;B]<<&lt;script&gt;>>",
		expected: "<p><ruby>A&amp;B<rt>&lt;script&gt;</rt></ruby></p>",
	},
];

for (const reverse of [false, true]) {
	it.for(boundaryCases)(`indent/ruby 境界 (reverse=${reverse}): $name`, ({ input, expected }) => {
		const processor = unified().use(remarkParse);
		if (reverse) processor.use(remarkOmusubiRuby).use(remarkOmusubiIndent);
		else processor.use(remarkOmusubiIndent).use(remarkOmusubiRuby);
		processor.use(remarkRehype).use(rehypeStringify).freeze();
		const actual = String(processor.processSync(input));
		expect(htmlTree(actual)).toEqual(htmlTree(expected));
		// Exercise micromark's HTML compiler and the mdast/rehype path with the
		// same registered syntax extensions, so neither consumer can silently drift.
		const direct = micromark(input, {
			extensions: processor.data("micromarkExtensions"),
			htmlExtensions: [omusubiRubyHtml()],
		});
		expect(htmlTree(actual)).toEqual(htmlTree(direct));
	});
}
