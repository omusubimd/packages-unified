import type { Parent, PhrasingContent, Text } from "mdast";

export interface Ruby extends Parent {
	type: "ruby";
	children: PhrasingContent[];
}

export interface RubyText extends Parent {
	type: "rubyText";
	children: Text[];
}

declare module "mdast" {
	interface PhrasingContentMap {
		ruby: Ruby;
		rubyText: RubyText;
	}
	interface RootContentMap {
		ruby: Ruby;
		rubyText: RubyText;
	}
}
