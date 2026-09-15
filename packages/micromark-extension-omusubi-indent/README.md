# @omusubimd/micromark-extension-omusubi-indent

Omusubi の「全角スペースによる段落開始」を micromark に追加する ESM パッケージです。

## 使用方法

```js
import { micromark } from "micromark";
import { omusubiIndentSyntax } from "@omusubimd/micromark-extension-omusubi-indent";

micromark("　最初の段落。\n　次の段落。", {
	extensions: [omusubiIndentSyntax()],
});
// <p>最初の段落。</p>\n<p>次の段落。</p>
```

`omusubiIndentSyntax()` は micromark の構文拡張を返します。オプションはありません。
標準トークンを生成するため、専用の `htmlExtensions` や mdast 拡張は不要です。

## 現在の動作

- ブロック開始位置の全角スペース（U+3000）1文字を取り除き、新しい段落を開始します。
- 全角スペースのない後続行は、通常の Markdown と同じように続きとして解析します。
- 全角スペースが複数ある場合、2文字目以降は本文に残します。
- 印だけの行は本文を生成せず、前後の内容を区切ります。
- 半角スペースだけではこの構文は始まりません。通常の Markdown のインデント処理後に全角スペースがある場合は対象になります。
- 引用やリストの内部でも、そのコンテナの規則に従って適用します。リストの tight/loose 判定は CommonMark に従います。
- コードブロック、インラインコード、HTML ブロック内部は変更しません。
- 本文の強調・リンク等は通常どおり解析します。見出しなど後続のブロック構文も既存の解析に従います。

構文専用ノードや元の印は AST に残しません。全角スペースによる表記への書き戻しは提供しません。

## 開発

リポジトリのルートで実行します。

```sh
npm install
npm run build
npm test
npm run check
```

実装は TypeScript、テストは Vitest を使用します。型定義と JavaScript は tsc で dist/ に生成します。micromark の同期トークナイザーAPIを直接使用します。
