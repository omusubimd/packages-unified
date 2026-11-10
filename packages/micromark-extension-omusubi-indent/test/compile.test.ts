import { micromark } from "micromark";
import { expect, it } from "vitest";

import { omusubiIndentSyntax } from "../src/index.js";

it.for([
	{
		input: "こんにちは\n　おむすび",
		output: "<p>こんにちは</p>\n<p>おむすび</p>",
	},
	{
		input: "こんにちは\n　しゃけ\n　おむすび",
		output: "<p>こんにちは</p>\n<p>しゃけ</p>\n<p>おむすび</p>",
	},
	{
		input: "こんにちは\n　いくら\n\nおむすび",
		output: "<p>こんにちは</p>\n<p>いくら</p>\n<p>おむすび</p>",
	},
	{
		input: "こんにちは　昆布おむすび",
		output: "<p>こんにちは　昆布おむすび</p>",
	},
])("コンパイル ┊︎ $input", ({ input, output }) => {
	const html = micromark(input, { extensions: [omusubiIndentSyntax()] });

	expect(html).toMatch(output);
});

it.for([
	{ input: "one\n　\n---", plain: "one\n\n---" },
	{ input: "one\n　\n===", plain: "one\n\n===" },
	{ input: "one\n　 \t\n---", plain: "one\n \t\n---" },
	{ input: "> one\n> 　\n> ---", plain: "> one\n>\n> ---" },
	{ input: "> one\n> 　\n> ===", plain: "> one\n>\n> ===" },
	{ input: "one\r\n　\r\n---", plain: "one\r\n\r\n---" },
	{ input: "one\r　\r---", plain: "one\r\r---" },
	{ input: "one\n　\n　\n---", plain: "one\n\n\n---" },
	{ input: "one\n　\nnext", plain: "one\n\nnext" },
	{ input: "one\n　", plain: "one\n" },
	{ input: "　\n---", plain: "\n---" },
	{ input: "　", plain: "" },
	{ input: "- one\n  　\n  two", plain: "- one\n  \n  two" },
	{ input: "- 　\n- two", plain: "- \n- two" },
	{ input: "- previous\n- 　\n- next", plain: "- previous\n- \n- next" },
	{ input: "- 　\n  two", plain: "- \n  two" },
	{ input: "- one\n  　", plain: "- one\n  " },
])("印だけの行を空行として扱う ┊︎ $input", ({ input, plain }) => {
	expect(micromark(input, { extensions: [omusubiIndentSyntax()] })).toBe(micromark(plain));
});

it.for(["one\n---", "one\n===", "```md\none\n　\n---\n```", "<div>\none\n　\n---\n</div>"])(
	"通常の構文と文字としての全角スペースを変更しない ┊︎ %s",
	(input) => {
		expect(micromark(input, { extensions: [omusubiIndentSyntax()] })).toBe(micromark(input));
	},
);

it("2個目の全角スペースは本文として残す", () => {
	expect(micromark("one\n　　\n---", { extensions: [omusubiIndentSyntax()] })).toBe("<p>one</p>\n<h2>　</h2>");
});
