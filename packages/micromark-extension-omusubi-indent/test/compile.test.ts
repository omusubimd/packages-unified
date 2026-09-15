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
