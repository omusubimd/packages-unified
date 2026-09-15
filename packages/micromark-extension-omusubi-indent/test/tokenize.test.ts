import { parse, postprocess, preprocess } from "micromark";
import { expect, it } from "vitest";

import { omusubiIndentSyntax } from "../src/syntax.js";

it.for([
	{
		input: "こんにちは\n　おむすび",
	},
	{
		input: "こんにちは\n　しゃけ\n　おむすび",
	},
	{
		input: "こんにちは\n　いくら\n\nおむすび",
	},
	{
		input: "こんにちは　昆布おむすび",
	},
])("トークン化 ┊︎ $input", ({ input }) => {
	const events = postprocess(
		parse({ extensions: [omusubiIndentSyntax()] })
			.document()
			.write(preprocess()(input, undefined, true)),
	);

	expect(events).toMatchSnapshot();
});
