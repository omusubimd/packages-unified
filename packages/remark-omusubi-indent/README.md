# @omusubimd/remark-omusubi-indent

Omusubi の「全角スペースによる段落開始」を remark / unified で使うための ESM パッケージです。

## インストール

```sh
npm install @omusubimd/remark-omusubi-indent unified remark-parse
```

## 使用方法

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkOmusubiIndent from "@omusubimd/remark-omusubi-indent";

const processor = unified().use(remarkParse).use(remarkOmusubiIndent);
const tree = processor.parse("こんにちは\n　おむすび");

console.log(tree.children.length); // 2: 通常の paragraph ノードが2つ
```

## API

### `unified().use(remarkOmusubiIndent)`

全角スペース（U+3000）による段落開始をパーサーに登録します。オプションはありません。
remark-parse 11 / unified 11 に対応します。

- 行頭の全角スペース1文字を取り除き、新しい段落を開始します。
- 後続の通常行は同じ段落に続きます。強調・リンクなどは通常どおり解析します。
- コードブロックの内容は変更しません。
- 既存の micromark 構文拡張と併用できます。

構文の詳細は [micromark 拡張](https://github.com/omusubimd/packages-unified/tree/main/packages/micromark-extension-omusubi-indent#readme) を参照してください。
通常の mdast ノードを生成するため、専用の mdast 拡張は不要です。
HTML に変換する場合は、通常どおり remark-rehype などを後段に接続します。

このプラグインは読み取り用です。元の全角スペースは AST に残さず、全角スペースを付けた Markdown への書き戻しは提供しません。

## 開発

リポジトリのルートで実行します。依存するワークスペースの型定義と JavaScript を先にビルドします。

```sh
npm install
npm run build
npm test
npm run check
```

## ライセンス

MIT © Zemelua
