# @omusubimd/mdast-util-omusubi-ruby

Omusubi のルビ構文を mdast に変換する ESM パッケージです。
`@omusubimd/micromark-extension-omusubi-ruby` の構文拡張と組み合わせて使用します。

## インストールと使用方法

```sh
npm install mdast-util-from-markdown @omusubimd/micromark-extension-omusubi-ruby @omusubimd/mdast-util-omusubi-ruby
```

```js
import { fromMarkdown } from "mdast-util-from-markdown";
import { omusubiRubySyntax } from "@omusubimd/micromark-extension-omusubi-ruby";
import { omusubiRubyFromMarkdown } from "@omusubimd/mdast-util-omusubi-ruby";

const tree = fromMarkdown("[**青空**]<<あおぞら>>", {
	extensions: [omusubiRubySyntax()],
	mdastExtensions: [omusubiRubyFromMarkdown()],
});
```

`omusubiRubyFromMarkdown()` は `mdast-util-from-markdown` 用の拡張を返します。オプションはありません。
remark では `@omusubimd/remark-omusubi-ruby` を使用してください。

## 構文木

`[青|空]<<あお|ぞら>>` は、段落の中に次のノードを生成します。位置情報は省略しています。

```js
{
	type: "ruby",
	data: { hName: "ruby" },
	children: [
		{ type: "text", value: "青" },
		{ type: "rubyText", data: { hName: "rt" }, children: [{ type: "text", value: "あお" }] },
		{ type: "text", value: "空" },
		{ type: "rubyText", data: { hName: "rt" }, children: [{ type: "text", value: "ぞら" }] },
	],
}
```

- `Ruby` と `RubyText` の型をエクスポートし、mdast の型マップに登録します。
- ラベルの通常のインラインノードを保持します。読みは文字参照とエスケープを解決したテキストです。
- 区切り `|` ごとに読みの位置を進めるため、先頭・途中・末尾の空区間でも対応がずれません。
- 読みのないラベルは `ruby` の外に出します。全区間が空ならラベルのノードだけが残ります。
- ラベルが空、区間数が不一致などの構文は micromark 拡張が不成立として扱い、通常の Markdown として解析します。
- ラベルと読みには元のソースの位置を保持します。スキップで分割された複数の `ruby` は、元のルビ構文全体の位置を共有します。ラベルと読みを交互に配置するため、子ノードの位置はソース順とは限りません。

`data.hName` を使うので、`mdast-util-to-hast` / `remark-rehype` に専用ハンドラーを渡す必要はありません。
余分なラベル用の `<span>` や空の `<rt>` は生成しません。文字参照の表記は HTML シリアライザーに従います。
ラベル内の生 HTML の扱いも後段の `remark-rehype` 等の設定に従います。

## 移植元との違い

[sapphire-markdown](https://github.com/zemelua/sapphire-markdown) の from-markdown 拡張を参考にしています。
現行の micromark 拡張を優先し、読みのスキップ、区間数の検証、位置情報に対応しています。
移植元の `rubyLabel` ノードによるラッパーは設けず、ラベルの子ノードを直接保持します。
Markdown への書き戻し（`toMarkdown` / `remark-stringify`）は提供していません。

## 開発

リポジトリのルートで実行します。

```sh
npm install
npm run build
npm test --workspace @omusubimd/mdast-util-omusubi-ruby
npm run check
```

## ライセンス

MIT。詳細は [LICENSE](./LICENSE) を参照してください。
