export { omusubiRubyHtml } from "./html.js";
export { omusubiRubySyntax } from "./syntax.js";

/* ルビ用トークンの型定義。 */
declare module "micromark-util-types" {
	interface TokenTypeMap {
		ruby: "ruby";
		rubyLabel: "rubyLabel";
		rubyLabelMarker: "rubyLabelMarker";
		rubyLabelContent: "rubyLabelContent";
		rubyLabelSegment: "rubyLabelSegment";
		rubyLabelSegmentText: "rubyLabelSegmentText";
		rubyText: "rubyText";
		rubyTextMarker: "rubyTextMarker";
		rubyTextContent: "rubyTextContent";
		rubyTextSegment: "rubyTextSegment";
		rubyTextSegmentString: "rubyTextSegmentString";
		rubyDivider: "rubyDivider";
	}
}
