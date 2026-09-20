import type { CompileContext, HtmlExtension } from "micromark-util-types";

interface RubyState {
	labels: string[];
	readings: string[];
	part: "labels" | "readings";
}

declare module "micromark-util-types" {
	interface CompileData {
		omusubiRubyStack?: RubyState[];
	}
}

/**
 * ルビの各区間を HTML に変換します。読みが空の区間は ruby 要素の外に出力します。
 */
export function omusubiRubyHtml(): HtmlExtension {
	return {
		enter: {
			ruby: enterRuby,
			rubyLabel: enterLabel,
			rubyText: enterText,
		},
		exit: {
			rubyDivider: exitDivider,
			rubyLabel: exitPart,
			rubyText: exitPart,
			ruby: exitRuby,
		},
	};
}

function enterRuby(this: CompileContext): undefined {
	const stack = this.getData("omusubiRubyStack") ?? [];
	stack.push({ labels: [], readings: [], part: "labels" });
	this.setData("omusubiRubyStack", stack);
}

function current(this: CompileContext): RubyState {
	const state = this.getData("omusubiRubyStack")?.at(-1);
	if (!state) throw new Error("Missing ruby compile state");
	return state;
}

function enterLabel(this: CompileContext): undefined {
	current.call(this).part = "labels";
	this.buffer();
}

function enterText(this: CompileContext): undefined {
	current.call(this).part = "readings";
	this.buffer();
}

function exitDivider(this: CompileContext): undefined {
	exitPart.call(this);
	this.buffer();
}

function exitPart(this: CompileContext): undefined {
	const state = current.call(this);
	state[state.part].push(this.resume());
}

function exitRuby(this: CompileContext): undefined {
	const state = current.call(this);
	this.getData("omusubiRubyStack")?.pop();

	let inRuby = false;
	for (const [index, label] of state.labels.entries()) {
		const reading = state.readings[index] ?? "";
		if (!reading) {
			if (inRuby) this.tag("</ruby>");
			inRuby = false;
			this.raw(label);
			continue;
		}
		if (!inRuby) this.tag("<ruby>");
		inRuby = true;
		// buffer/resume で取得した内容には標準ハンドラーによる HTML 変換が済んでいます。
		this.raw(label);
		this.tag("<rt>");
		this.raw(reading);
		this.tag("</rt>");
	}
	if (inRuby) this.tag("</ruby>");
}
