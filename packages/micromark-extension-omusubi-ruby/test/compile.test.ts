import { micromark } from "micromark";
import { expect, it } from "vitest";

import { omusubiRubyHtml, omusubiRubySyntax } from "../src/index.js";

const options = { extensions: [omusubiRubySyntax()], htmlExtensions: [omusubiRubyHtml()] };

it.for([
	{ input: "[]<<>>", output: "<p>[]&lt;&lt;&gt;&gt;</p>" },
	{ input: "[]<<あお>>", output: "<p>[]&lt;&lt;あお&gt;&gt;</p>" },
	{ input: "[青|]<<あお|>>", output: "<p>[青|]&lt;&lt;あお|&gt;&gt;</p>" },
	{ input: "[|空]<<|そら>>", output: "<p>[|空]&lt;&lt;|そら&gt;&gt;</p>" },
	{ input: "[青||空]<<あお||そら>>", output: "<p>[青||空]&lt;&lt;あお||そら&gt;&gt;</p>" },
	{ input: "[|]<<|>>", output: "<p>[|]&lt;&lt;|&gt;&gt;</p>" },
	{
		input: "[青空]<<あおぞら>>",
		output: "<p><ruby>青空<rt>あおぞら</rt></ruby></p>",
	},
	{
		input: "[青|空]<<あお|ぞら>>",
		output: "<p><ruby>青<rt>あお</rt>空<rt>ぞら</rt></ruby></p>",
	},
	{
		input: "[青天|の|霹靂]<<せいてん||へきれき>>",
		output: "<p><ruby>青天<rt>せいてん</rt></ruby>の<ruby>霹靂<rt>へきれき</rt></ruby></p>",
	},
	{
		input: "[の|霹靂]<<|へきれき>>",
		output: "<p>の<ruby>霹靂<rt>へきれき</rt></ruby></p>",
	},
	{
		input: "[青天|の]<<せいてん|>>",
		output: "<p><ruby>青天<rt>せいてん</rt></ruby>の</p>",
	},
	{
		input: "[青|い|空|だ]<<あお|||>>",
		output: "<p><ruby>青<rt>あお</rt></ruby>い空だ</p>",
	},
	{
		input: "[青天|の|霹靂]<<||>>",
		output: "<p>青天の霹靂</p>",
	},
	{
		input: "[青空]<<>>",
		output: "<p>青空</p>",
	},
	{
		input: "[**青**|*空*]<<あお|ぞら>>",
		output: "<p><ruby><strong>青</strong><rt>あお</rt><em>空</em><rt>ぞら</rt></ruby></p>",
	},
	{
		input: "[`青空`]<<**あおぞら**>>",
		output: "<p><ruby><code>青空</code><rt>**あおぞら**</rt></ruby></p>",
	},
	{
		input: "[\\*青空\\*]<<あおぞら>>",
		output: "<p><ruby>*青空*<rt>あおぞら</rt></ruby></p>",
	},
	{
		input: "[A&amp;B]<<a&amp;b>>",
		output: "<p><ruby>A&amp;B<rt>a&amp;b</rt></ruby></p>",
	},
	{
		input: "[<img src=x onerror=alert(1)>]<<&lt;script&gt;>>",
		output: "<p><ruby>&lt;img src=x onerror=alert(1)&gt;<rt>&lt;script&gt;</rt></ruby></p>",
	},
	{
		input: "今日は[青]<<あお>>[空]<<そら>>です。",
		output: "<p>今日は<ruby>青<rt>あお</rt></ruby><ruby>空<rt>そら</rt></ruby>です。</p>",
	},
	{
		input: "[青]<<あお>>\n\n[空]<<そら>>",
		output: "<p><ruby>青<rt>あお</rt></ruby></p>\n<p><ruby>空<rt>そら</rt></ruby></p>",
	},
	{
		input: "[青空]<< あおぞら >>",
		output: "<p><ruby>青空<rt> あおぞら </rt></ruby></p>",
	},
	{
		input: "[青空]<<あおぞら>",
		output: "<p>[青空]&lt;&lt;あおぞら&gt;</p>",
	},
	{
		input: "[青|空]<<あおぞら>>",
		output: "<p>[青|空]&lt;&lt;あおぞら&gt;&gt;</p>",
	},
	{
		input: "[青空]<<あお|ぞら>>",
		output: "<p>[青空]&lt;&lt;あお|ぞら&gt;&gt;</p>",
	},
	{
		input: "[**青**|空]<<あおぞら>>[空]<<そら>>",
		output: "<p>[<strong>青</strong>|空]&lt;&lt;あおぞら&gt;&gt;<ruby>空<rt>そら</rt></ruby></p>",
	},
])("コンパイル ┊︎ $input", ({ input, output }) => {
	expect(micromark(input, options)).toBe(output);
});
