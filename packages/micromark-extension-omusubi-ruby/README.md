# @omusubimd/micromark-extension-omusubi-ruby

Omusubi のルビ構文 `[青空]<<あおぞら>>` を micromark に追加する ESM パッケージです。
構文拡張と HTML 出力拡張、TypeScript の型定義を提供します。

## インストール

```sh
npm install micromark @omusubimd/micromark-extension-omusubi-ruby
```

## 使用方法

```js
import { micromark } from "micromark";
import { sapphireHtml, sapphireSyntax } from "@omusubimd/micromark-extension-omusubi-ruby";

micromark("[青|空]<<あお|ぞら>>", {
	extensions: [sapphireSyntax()],
	htmlExtensions: [sapphireHtml()],
});
// <p><ruby>青<rt>あお</rt>空<rt>ぞら</rt></ruby></p>
```

`sapphireSyntax()` は構文拡張、`sapphireHtml()` は HTML 出力拡張を返します。
どちらもオプションはありません。HTML 出力には両方を指定してください。

## 構文と出力

- `[ラベル]<<読み>>` でルビを指定します。`]` と `<<` の間には空白を入れません。
- `|` でラベルと読みを区切り、同じ位置の区間を対応付けます。
- 読みの空区間はルビのスキップを表します。先頭・末尾・連続したスキップも可能です。
- スキップ区間のラベルは `<ruby>` の外に出力します。すべての読みが空ならラベルだけを出力します。
- ラベル内の強調・インラインコード・文字参照などは micromark のインライン処理に従います。読み内の強調記号などは書式として扱いません。
- ラベルの空区間、区間数の不一致、不完全な構文はルビとして認識せず、通常の Markdown として処理します。例外は投げません。
- HTML のエスケープは micromark に従います。

```md
[青天|の|霹靂]<<せいてん||へきれき>>
```

```html
<p>
	<ruby>青天<rt>せいてん</rt></ruby
	>の<ruby>霹靂<rt>へきれき</rt></ruby>
</p>
```

現在、`|` とラベル内の `]` はインライン書式やバックスラッシュにかかわらず区切りとして扱います。
これらの記号をラベルに含める場合は `&#124;`、`&#93;`、読み内の `>` は `&gt;` などの文字参照を使ってください。
リンク・画像・ルビをラベル内に入れる構文や、mdast / remark 用の変換拡張は提供していません。

## 開発

リポジトリのルートで実行します。

```sh
npm install
npm test --workspace @omusubimd/micromark-extension-omusubi-ruby
npm run check
npm run build --workspace @omusubimd/micromark-extension-omusubi-ruby
npm pack --dry-run --workspace @omusubimd/micromark-extension-omusubi-ruby
```

ビルドはこのパッケージの `dist/` を削除してから JavaScript と型定義を生成します。
`npm pack` / `npm publish` でも `prepack` によってビルドします。

## ライセンス

MIT。詳細は [LICENSE](./LICENSE) を参照してください。
