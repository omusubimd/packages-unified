import { omusubiRubySyntax } from "@omusubimd/micromark-extension-omusubi-ruby";
import { toHtml } from "hast-util-to-html";
import type { PhrasingContent, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { expect, it } from "vitest";

import { omusubiRubyFromMarkdown } from "../src/index.js";
import type { Ruby, RubyText } from "../src/index.js";

const options = { extensions: [omusubiRubySyntax()], mdastExtensions: [omusubiRubyFromMarkdown()] };
const text = (value: string): PhrasingContent => ({ type: "text", value });
const reading = (value: string): RubyText => ({
	type: "rubyText",
	children: [{ type: "text", value }],
	data: { hName: "rt" },
});
const ruby = (...children: PhrasingContent[]): Ruby => ({
	type: "ruby",
	children,
	data: { hName: "ruby" },
});

function withoutPositions(tree: Root): Root {
	return JSON.parse(JSON.stringify(tree, (key, value) => (key === "position" ? undefined : value))) as Root;
}

it.for<{ input: string; children: PhrasingContent[] }>([
	{ input: "[青空]<<あおぞら>>", children: [ruby(text("青空"), reading("あおぞら"))] },
	{ input: "[青|空]<<あお|ぞら>>", children: [ruby(text("青"), reading("あお"), text("空"), reading("ぞら"))] },
	{
		input: "[青天|の|霹靂]<<せいてん||へきれき>>",
		children: [ruby(text("青天"), reading("せいてん")), text("の"), ruby(text("霹靂"), reading("へきれき"))],
	},
	{ input: "[の|霹靂]<<|へきれき>>", children: [text("の"), ruby(text("霹靂"), reading("へきれき"))] },
	{ input: "[青天|の]<<せいてん|>>", children: [ruby(text("青天"), reading("せいてん")), text("の")] },
	{
		input: "[青|い|空|だ]<<あお|||だ>>",
		children: [ruby(text("青"), reading("あお")), text("い"), text("空"), ruby(text("だ"), reading("だ"))],
	},
	{ input: "[青|空]<<|>>", children: [text("青"), text("空")] },
	{ input: "[青空]<<>>", children: [text("青空")] },
	{
		input: "[**青空**]<<あおぞら>>",
		children: [ruby({ type: "strong", children: [text("青空")] }, reading("あおぞら"))],
	},
	{
		input: "[*青*|`空`]<<あお|そら>>",
		children: [
			ruby(
				{ type: "emphasis", children: [text("青")] },
				reading("あお"),
				{ type: "inlineCode", value: "空" },
				reading("そら"),
			),
		],
	},
	{ input: "[**青空**]<<>>", children: [{ type: "strong", children: [text("青空")] }] },
	{ input: "[青空]<<**あおぞら**>>", children: [ruby(text("青空"), reading("**あおぞら**"))] },
	{ input: "[A&amp;B]<<a&amp;b>>", children: [ruby(text("A&B"), reading("a&b"))] },
	{ input: "[&#124;|&#93;]<<&#124;|&gt;>>", children: [ruby(text("|"), reading("|"), text("]"), reading(">"))] },
	{ input: "[\\*青空\\*]<<\\*あおぞら\\*>>", children: [ruby(text("*青空*"), reading("*あおぞら*"))] },
	{
		input: "今日は[青]<<あお>>[空]<<そら>>です。",
		children: [
			text("今日は"),
			ruby(text("青"), reading("あお")),
			ruby(text("空"), reading("そら")),
			text("です。"),
		],
	},
])("mdast に変換する ┊︎ $input", ({ input, children }) => {
	expect(withoutPositions(fromMarkdown(input, options))).toEqual({
		type: "root",
		children: [{ type: "paragraph", children }],
	});
});

it.for([
	"[]<<>>",
	"[青|]<<あお|>>",
	"[|空]<<|そら>>",
	"[青||空]<<あお||そら>>",
	"[青|空]<<あおぞら>>",
	"[青空]<<あお|ぞら>>",
	"[青空]<<あおぞら>",
	"# 普通の見出し\n\n**本文**",
	"`[青空]<<あおぞら>>`",
	"```md\n[青空]<<あおぞら>>\n```",
])("ルビ以外は標準の解析を維持する ┊︎ %s", (input) => {
	expect(fromMarkdown(input, options)).toEqual(fromMarkdown(input));
});

it("ラベルと読みの位置情報を保持する", () => {
	const tree = fromMarkdown("[青|空]<<あお|そら>>", options);
	const paragraph = tree.children[0];
	if (paragraph?.type !== "paragraph") throw new Error("Expected paragraph");
	const node = paragraph.children[0];
	if (node?.type !== "ruby") throw new Error("Expected ruby");
	expect(node.position).toEqual({
		start: { line: 1, column: 1, offset: 0 },
		end: { line: 1, column: 15, offset: 14 },
	});
	expect(node.children.map((child) => child.position)).toEqual([
		{ start: { line: 1, column: 2, offset: 1 }, end: { line: 1, column: 3, offset: 2 } },
		{ start: { line: 1, column: 8, offset: 7 }, end: { line: 1, column: 10, offset: 9 } },
		{ start: { line: 1, column: 4, offset: 3 }, end: { line: 1, column: 5, offset: 4 } },
		{ start: { line: 1, column: 11, offset: 10 }, end: { line: 1, column: 13, offset: 12 } },
	]);
});

it("標準の hast 変換で余分な要素や空の rt を出さない", () => {
	const tree = fromMarkdown("[**青天**|の|霹靂]<<せいてん||へきれき>>", options);
	expect(toHtml(toHast(tree))).toBe(
		"<p><ruby><strong>青天</strong><rt>せいてん</rt></ruby>の<ruby>霹靂<rt>へきれき</rt></ruby></p>",
	);
});

it("同じ拡張を再利用しても区間の状態を持ち越さない", () => {
	fromMarkdown("[青|空]<<|そら>>", options);
	expect(withoutPositions(fromMarkdown("[青]<<あお>>", options))).toEqual({
		type: "root",
		children: [{ type: "paragraph", children: [ruby(text("青"), reading("あお"))] }],
	});
});
