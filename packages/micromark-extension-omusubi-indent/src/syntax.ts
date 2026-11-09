import { blankLine, content } from "micromark-core-commonmark";
import type { Extension, Resolver, State, Token, Tokenizer } from "micromark-util-types";

export function omusubiIndentSyntax(): Extension {
	return {
		flow: {
			// 0x3000 は全角スペース（IDEOGRAPHIC SPACE）を表す Unicode コードポイント。
			0x3000: { ...content, name: "omusubiIndent", tokenize: tokenizeIndent, resolveAll: resolveBlankMarkers },
		},
	};
}

type BlankMarkerToken = Token & { _omusubiIndentBlank?: true };

const tokenizeIndent: Tokenizer = function (effects, ok, nok) {
	let marker: BlankMarkerToken;
	const afterMarker: State = (code) => {
		if (this.interrupt) return ok(code);
		return effects.attempt(blankLine, afterBlank, contentStart)(code);
	};

	const afterBlank: State = (code) => {
		// Setext ignores linePrefix tokens while looking back for a paragraph.
		// A blank marker must stop that search before the earlier paragraph.
		marker.type = "lineSuffix";
		marker._omusubiIndentBlank = true;
		return ok(code);
	};

	const contentStart: State = (code) => content.tokenize.call(this, effects, ok, nok)(code);

	const start: State = (code) => {
		if (code !== 0x3000) return nok(code);

		marker = effects.enter("linePrefix");
		effects.consume(code);
		effects.exit("linePrefix");
		return afterMarker;
	};

	return start;
};

// Flow normally emits lineEnding after a successful construct. Reclassify the
// real newline after a blank marker so standard HTML/mdast list handling also
// sees a blank line. The marker stays a whitespace token, never content.
const resolveBlankMarkers: Resolver = (events) => {
	for (const [index, event] of events.entries()) {
		if (event[0] !== "exit" || !(event[1] as BlankMarkerToken)._omusubiIndentBlank) continue;
		let next = index + 1;
		while (events[next]?.[1].type === "linePrefix") next++;
		const ending = events[next]?.[1];
		if (ending?.type === "lineEnding") {
			ending.type = "lineEndingBlank";
		}
	}
	return events;
};
