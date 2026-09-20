import { codes } from "micromark-util-symbol";
import type { Code, Effects, Extension, State } from "micromark-util-types";

/**
 * micromark の拡張機能として、ルビ構文を解析するためのシンタックスを提供します。
 *
 * たとえば、`[青|空]<<あお|ぞら>>` という入力に対して、以下のようなトークン列を生成します。
 *
 * ```
 * ruby
 * ├── rubyLabel
 * │   ├── rubyLabelMarker                `[`
 * │   ├── rubyLabelContent
 * │   │   ├── rubyLabelSegment
 * │   │   │   └── rubyLabelSegmentText   `青`
 * │   │   ├── rubyDivider                `|`
 * │   │   └── rubyLabelSegment
 * │   │       └── rubyLabelSegmentText   `空`
 * │   └── rubyLabelMarker                `]`
 * └── rubyText
 *     ├── rubyTextMarker                 `<<`
 *     ├── rubyTextContent
 *     │   ├── rubyTextSegment
 *     │   │   └── rubyTextSegmentString  `あお`
 *     │   ├── rubyDivider                `|`
 *     │   └── rubyTextSegment
 *     │       └── rubyTextSegmentString  `ぞら`
 *     └── rubyTextMarker                 `>>`
 * ```
 */
export function sapphireSyntax(): Extension {
	return {
		text: {
			// '['
			[codes.leftSquareBracket]: {
				tokenize: tokenize,
			},
		},
	};
}

function tokenize(effects: Effects, ok: State, nok: State): State {
	// 空の読みも1区間として数え、区切りごとに次の区間へ進めます。
	let labelCount = 1;
	let textCount = 1;
	return start;

	function start(code: Code): State | undefined {
		if (code !== codes.leftSquareBracket) return nok(code);

		effects.enter("ruby");
		effects.enter("rubyLabel");
		effects.enter("rubyLabelMarker");
		effects.consume(code);
		effects.exit("rubyLabelMarker");
		effects.enter("rubyLabelContent");
		effects.enter("rubyLabelSegment");

		return labelSegmentStart;
	}

	function labelSegmentStart(code: Code): State | undefined {
		// ラベルは各区間に文字が必要です。空のトークンを作る前に不成立にします。
		if (code === codes.verticalBar || code === codes.rightSquareBracket || code === codes.eof) {
			return nok(code);
		}

		effects.enter("rubyLabelSegmentText", { contentType: "text" });
		effects.consume(code);
		return inside;
	}

	function inside(code: Code): State | undefined {
		if (code === codes.verticalBar) {
			labelCount++;
			effects.exit("rubyLabelSegmentText");
			effects.exit("rubyLabelSegment");
			effects.enter("rubyDivider");
			effects.consume(code);
			effects.exit("rubyDivider");
			effects.enter("rubyLabelSegment");

			return labelSegmentStart;
		}

		if (code === codes.rightSquareBracket) {
			effects.exit("rubyLabelSegmentText");
			effects.exit("rubyLabelSegment");
			effects.exit("rubyLabelContent");
			effects.enter("rubyLabelMarker");
			effects.consume(code);
			effects.exit("rubyLabelMarker");
			effects.exit("rubyLabel");

			return textStart;
		}

		if (code === codes.eof) {
			return nok(code);
		}

		effects.consume(code);
		return inside;
	}

	function textStart(code: Code): State | undefined {
		if (code === codes.lessThan) {
			effects.enter("rubyText");
			effects.enter("rubyTextMarker");
			effects.consume(code);

			return textStartSecond;
		}

		return nok(code);
	}

	function textStartSecond(code: Code): State | undefined {
		if (code === codes.lessThan) {
			effects.consume(code);
			effects.exit("rubyTextMarker");

			return textContentStart;
		}

		return nok(code);
	}

	function textContentStart(code: Code): State | undefined {
		if (code === codes.eof) return nok(code);

		if (code === codes.greaterThan) {
			effects.enter("rubyTextMarker");
			effects.consume(code);
			return textEnd;
		}

		effects.enter("rubyTextContent");
		return textSegmentStart(code);
	}

	function textSegmentStart(code: Code): State | undefined {
		if (code === codes.verticalBar) {
			textCount++;
			effects.enter("rubyDivider");
			effects.consume(code);
			effects.exit("rubyDivider");

			return textSegmentStart;
		}

		if (code === codes.greaterThan) {
			effects.exit("rubyTextContent");
			effects.enter("rubyTextMarker");
			effects.consume(code);

			return textEnd;
		}

		if (code === codes.eof) {
			return nok(code);
		}

		effects.enter("rubyTextSegment");
		effects.enter("rubyTextSegmentString", { contentType: "string" });
		effects.consume(code);
		return textInside;
	}

	function textInside(code: Code): State | undefined {
		if (code === codes.verticalBar) {
			textCount++;
			effects.exit("rubyTextSegmentString");
			effects.exit("rubyTextSegment");
			effects.enter("rubyDivider");
			effects.consume(code);
			effects.exit("rubyDivider");

			return textSegmentStart;
		}

		if (code === codes.greaterThan) {
			effects.exit("rubyTextSegmentString");
			effects.exit("rubyTextSegment");
			effects.exit("rubyTextContent");
			effects.enter("rubyTextMarker");
			effects.consume(code);

			return textEnd;
		}

		if (code === codes.eof) {
			return nok(code);
		}

		effects.consume(code);
		return textInside;
	}

	function textEnd(code: Code): State | undefined {
		if (code === codes.greaterThan && labelCount === textCount) {
			effects.consume(code);
			effects.exit("rubyTextMarker");
			effects.exit("rubyText");
			effects.exit("ruby");

			return ok(code);
		}

		return nok(code);
	}
}
