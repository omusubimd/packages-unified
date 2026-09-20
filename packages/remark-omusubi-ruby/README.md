# @omusubimd/remark-omusubi-ruby

Omusubi のルビ構文 `[青空]<<あおぞら>>` を remark に追加する ESM プラグインです。

## インストール

```sh
npm install unified remark-parse @omusubimd/remark-omusubi-ruby
```

## mdast の解析

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkOmusubiRuby from "@omusubimd/remark-omusubi-ruby";

const tree = unified().use(remarkParse).use(remarkOmusubiRuby).parse("[青空]<<あおぞら>>");
```

既定エクスポートと名前付きエクスポート `remarkOmusubiRuby` を提供します。オプションはありません。
micromark 拡張と mdast 拡張をプロセッサーに追加し、既存の拡張は保持します。

## HTML 出力

```sh
npm install remark-rehype rehype-stringify
```

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkOmusubiRuby from "@omusubimd/remark-omusubi-ruby";

const result = unified()
	.use(remarkParse)
	.use(remarkOmusubiRuby)
	.use(remarkRehype)
	.use(rehypeStringify)
	.processSync("[青天|の|霹靂]<<せいてん||へきれき>>");

console.log(String(result));
// <p><ruby>青天<rt>せいてん</rt></ruby>の<ruby>霹靂<rt>へきれき</rt></ruby></p>
```

ラベル内の強調やインラインコードを保持し、読みが空の区間は `<ruby>` の外に出力します。
ラベルと読みの区間数が一致しない場合や空ラベルは、通常の Markdown として処理します。
構文は `@omusubimd/micromark-extension-omusubi-ruby` に従います。
生 HTML の扱いと文字参照の出力形式は、後段の rehype の設定に従います。

ノード構造は [mdast-util-omusubi-ruby](../mdast-util-omusubi-ruby/README.md) を参照してください。
Markdown への書き戻し（`remark-stringify`）は提供していません。
`@omusubimd/remark-omusubi-indent` と併用できます。

## 開発

リポジトリのルートで実行します。

```sh
npm install
npm run build
npm test --workspace @omusubimd/remark-omusubi-ruby
npm run check
```

## ライセンス

MIT。詳細は [LICENSE](./LICENSE) を参照してください。
