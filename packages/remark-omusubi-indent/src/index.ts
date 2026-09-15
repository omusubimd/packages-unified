import { omusubiIndentSyntax } from "@omusubimd/micromark-extension-omusubi-indent";
import type { Root } from "mdast";
import type {} from "remark-parse";
import type { Plugin, Processor } from "unified";

export const remarkOmusubiIndent: Plugin<[], Root, Root> = function (this: Processor) {
	const data = this.data();
	const extensions = (data.micromarkExtensions ??= []);

	extensions.push(omusubiIndentSyntax());
};

export default remarkOmusubiIndent;
