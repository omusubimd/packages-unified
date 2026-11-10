import type { Ruby, RubyText } from "@omusubimd/mdast-util-omusubi-ruby";
import { omusubiRubyFromMarkdown } from "@omusubimd/mdast-util-omusubi-ruby";
import { omusubiIndentSyntax } from "@omusubimd/micromark-extension-omusubi-indent";
import { omusubiRubySyntax, omusubiRubyHtml } from "@omusubimd/micromark-extension-omusubi-ruby";
import remarkIndent from "@omusubimd/remark-omusubi-indent";
import remarkRuby, {
	remarkOmusubiRuby,
	type Ruby as RemarkRuby,
	type RubyText as RemarkRubyText,
} from "@omusubimd/remark-omusubi-ruby";
import type { PhrasingContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { micromark } from "micromark";
import remarkParse from "remark-parse";
import { unified } from "unified";

const reading: RubyText = { type: "rubyText", children: [{ type: "text", value: "あお" }] };
const ruby: Ruby = { type: "ruby", children: [{ type: "text", value: "青" }, reading] };
const exported: RemarkRuby = ruby;
const exportedReading: RemarkRubyText = reading;
const phrasing: PhrasingContent = exported;
void [exportedReading, phrasing];
micromark("[青]<<あお>>", {
	extensions: [omusubiRubySyntax(), omusubiIndentSyntax()],
	htmlExtensions: [omusubiRubyHtml()],
});
fromMarkdown("[青]<<あお>>", { extensions: [omusubiRubySyntax()], mdastExtensions: [omusubiRubyFromMarkdown()] });
unified().use(remarkParse).use(remarkRuby).use(remarkIndent);
unified().use(remarkParse).use(remarkOmusubiRuby);
