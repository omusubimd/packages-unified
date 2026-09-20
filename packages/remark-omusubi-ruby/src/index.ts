import { omusubiRubyFromMarkdown } from "@omusubimd/mdast-util-omusubi-ruby";
import { omusubiRubySyntax } from "@omusubimd/micromark-extension-omusubi-ruby";
import type { Root } from "mdast";
import type {} from "remark-parse";
import type { Plugin, Processor } from "unified";

export type { Ruby, RubyText } from "@omusubimd/mdast-util-omusubi-ruby";

export const remarkOmusubiRuby: Plugin<[], Root, Root> = function (this: Processor) {
	const data = this.data();
	(data.micromarkExtensions ??= []).push(omusubiRubySyntax());
	(data.fromMarkdownExtensions ??= []).push(omusubiRubyFromMarkdown());
};

export default remarkOmusubiRuby;
