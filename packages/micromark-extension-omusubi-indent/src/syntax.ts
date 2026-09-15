import { content } from "micromark-core-commonmark";
import { markdownLineEnding } from "micromark-util-character";
import type { Extension, State, Tokenizer } from "micromark-util-types";

export function omusubiIndentSyntax(): Extension {
	return {
		flow: {
			// 0x3000 は全角スペース（IDEOGRAPHIC SPACE）を表す Unicode コードポイント。
			0x3000: { ...content, name: "omusubiIndent", tokenize: tokenizeIndent },
		},
	};
}

const tokenizeIndent: Tokenizer = function (effects, ok, nok) {
	const afterMarker: State = (code) => {
		if (this.interrupt || code === null || markdownLineEnding(code)) {
			return ok(code);
		}

		return content.tokenize.call(this, effects, ok, nok)(code);
	};

	const start: State = (code) => {
		if (code !== 0x3000) return nok(code);

		effects.enter("linePrefix");
		effects.consume(code);
		effects.exit("linePrefix");
		return afterMarker;
	};

	return start;
};
