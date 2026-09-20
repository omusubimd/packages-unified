import type { Parent, PhrasingContent } from "mdast";
import type { CompileContext, Extension, Token } from "mdast-util-from-markdown";

import type { Ruby, RubyText } from "./types.js";

interface RubyState {
	node: Ruby;
	labels: PhrasingContent[][];
	readings: (RubyText | undefined)[];
	readingIndex: number;
	inReadings: boolean;
}

declare module "mdast-util-from-markdown" {
	interface CompileData {
		omusubiRubyStack?: RubyState[];
	}
}

/** Convert Omusubi ruby tokens to mdast; empty readings leave their labels outside ruby. */
export function omusubiRubyFromMarkdown(): Extension {
	return {
		canContainEols: ["ruby", "rubyText"],
		enter: {
			ruby: enterRuby,
			rubyLabelSegment: enterSegment,
			rubyText: enterReadings,
			rubyTextSegment: enterSegment,
		},
		exit: {
			rubyLabelSegment: exitLabel,
			rubyTextSegment: exitReading,
			rubyDivider: exitDivider,
			ruby: exitRuby,
		},
	};
}

function current(this: CompileContext): RubyState {
	const state = this.data.omusubiRubyStack?.at(-1);
	if (!state) throw new Error("Missing Omusubi ruby state");
	return state;
}

function enterRuby(this: CompileContext, token: Token): undefined {
	const node: Ruby = { type: "ruby", children: [], data: { hName: "ruby" } };
	(this.data.omusubiRubyStack ??= []).push({
		node,
		labels: [],
		readings: [],
		readingIndex: 0,
		inReadings: false,
	});
	this.enter(node, token);
}

function enterSegment(this: CompileContext): undefined {
	this.buffer();
}

function exitLabel(this: CompileContext): undefined {
	const fragment = this.stack.at(-1);
	if (fragment?.type !== "fragment") throw new Error("Missing ruby label fragment");
	current.call(this).labels.push(fragment.children);
	this.resume();
}

function enterReadings(this: CompileContext): undefined {
	current.call(this).inReadings = true;
}

function exitDivider(this: CompileContext): undefined {
	const state = current.call(this);
	// No segment token exists for an empty reading: dividers determine its index.
	if (state.inReadings) state.readingIndex++;
}

function exitReading(this: CompileContext, token: Token): undefined {
	const value = this.resume();
	const state = current.call(this);
	const position = {
		start: { line: token.start.line, column: token.start.column, offset: token.start.offset },
		end: { line: token.end.line, column: token.end.column, offset: token.end.offset },
	};
	state.readings[state.readingIndex] = {
		type: "rubyText",
		children: [{ type: "text", value, position }],
		data: { hName: "rt" },
		position,
	};
}

function exitRuby(this: CompileContext, token: Token): undefined {
	const state = current.call(this);
	this.exit(token);
	this.data.omusubiRubyStack?.pop();
	const result: PhrasingContent[] = [];
	let group: Ruby | undefined;
	for (const [index, label] of state.labels.entries()) {
		const reading = state.readings[index];
		if (!reading || !reading.children[0]?.value) {
			group = undefined;
			result.push(...label);
			continue;
		}
		if (!group) {
			// Split groups share the original ruby syntax's source range.
			group = { ...state.node, children: [] };
			result.push(group);
		}
		group.children.push(...label, reading);
	}
	const parent = this.stack.at(-1);
	if (!parent || !("children" in parent)) throw new Error("Missing ruby parent");
	const siblings: Parent["children"] = parent.children;
	const index = siblings.indexOf(state.node);
	if (index < 0) throw new Error("Missing ruby node in parent");
	siblings.splice(index, 1, ...result);
}
