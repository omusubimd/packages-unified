import remarkParse from "remark-parse";
import { unified } from "unified";
import { expect, it } from "vitest";

import remarkOmusubiIndent from "../src/index.js";

const parser = unified().use(remarkParse).use(remarkOmusubiIndent);

it("全角スペースで隣接する段落を分割する", () => {
	const tree = parser.parse("こんにちは\n　おむすび\n　大作戦");
	expect(tree.children).toHaveLength(3);
	expect(tree.children).toMatchObject([
		{ type: "paragraph", children: [{ type: "text", value: "こんにちは" }] },
		{ type: "paragraph", children: [{ type: "text", value: "おむすび" }] },
		{ type: "paragraph", children: [{ type: "text", value: "大作戦" }] },
	]);
});

it("段落内の強調と後続行を通常の Markdown として解析する", () => {
	const tree = parser.parse("　**おむすび**\n大作戦");
	expect(tree.children).toHaveLength(1);
	expect(tree.children[0]).toMatchObject({
		type: "paragraph",
		children: [
			{ type: "strong", children: [{ type: "text", value: "おむすび" }] },
			{ type: "text", value: "\n大作戦" },
		],
	});
});

it("全角スペースのない文書の解析結果を変えない", () => {
	const input = "# 見出し\n\nこんにちは\nおむすび\n\n- しゃけ\n- いくら";
	expect(parser.parse(input)).toEqual(unified().use(remarkParse).parse(input));
});

it("コードブロック内の全角スペースを保持する", () => {
	const input = "```text\n　おむすび\n　大作戦\n```";
	expect(parser.parse(input)).toEqual(unified().use(remarkParse).parse(input));
});

it("既存の構文拡張を上書きしない", () => {
	const existing = {};
	const processor = unified()
		.data("micromarkExtensions", [existing])
		.use(remarkParse)
		.use(remarkOmusubiIndent)
		.freeze();
	expect(processor.data("micromarkExtensions")).toHaveLength(2);
	expect(processor.data("micromarkExtensions")?.[0]).toBe(existing);
	expect(processor.parse("一段落目\n　二段落目").children).toHaveLength(2);
});

it("別のプロセッサーには影響しない", () => {
	const input = "こんにちは\n　おむすび";
	expect(parser.parse(input).children).toHaveLength(2);
	expect(unified().use(remarkParse).parse(input).children).toHaveLength(1);
});
