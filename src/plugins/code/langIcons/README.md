# Language Icons TSX Components

这个目录包含了从SVG文件自动转换而来的128个编程语言图标TSX组件。

## 功能特性

- ✅ **TypeScript支持**: 所有组件都有完整的TypeScript类型定义
- ✅ **灵活的尺寸**: 支持通过`size`属性自定义图标大小
- ✅ **样式定制**: 支持`className`和`style`属性
- ✅ **事件处理**: 支持所有标准的React SVG事件
- ✅ **统一导出**: 通过index.ts文件统一导出所有组件

## 组件接口

每个图标组件都支持以下属性：

```typescript
interface IconProps {
  size?: number | string; // 图标大小，默认为24
  className?: string; // CSS类名
  style?: React.CSSProperties; // 内联样式
  // ...以及所有标准的SVG属性
}
```

## 使用方法

### 1. 导入单个组件

```tsx
import { JavascriptIcon } from './langIcons-tsx/JavascriptIcon';

function MyComponent() {
  return (
    <div>
      <JavascriptIcon size={32} className="my-icon" />
    </div>
  );
}
```

### 2. 从index文件导入

```tsx
import { JavascriptIcon, TypescriptIcon, ReactIcon } from './langIcons-tsx';

function LanguageList() {
  return (
    <div>
      <JavascriptIcon size={24} />
      <TypescriptIcon size={24} />
      <ReactIcon size={24} />
    </div>
  );
}
```

### 3. 动态使用

```tsx
import * as LangIcons from './langIcons-tsx';

function DynamicIcon({ language }: { language: string }) {
  const IconComponent = LangIcons[`${language}Icon` as keyof typeof LangIcons];

  if (!IconComponent) {
    return <div>Unknown language</div>;
  }

  return <IconComponent size={20} />;
}
```

## 可用的图标组件

以下是所有可用的图标组件列表：

- `AbapIcon` - ABAP
- `ActionscriptIcon` - ActionScript
- `AdaIcon` - Ada
- `ApacheIcon` - Apache
- `ApexIcon` - Apex
- `AplIcon` - APL
- `ApplescriptIcon` - AppleScript
- `AstroIcon` - Astro
- `AwkIcon` - AWK
- `BallerinaIcon` - Ballerina
- `BatIcon` - Batch
- `BicepIcon` - Bicep
- `BladeIcon` - Blade
- `CIcon` - C
- `CadenceIcon` - Cadence
- `ClojureIcon` - Clojure
- `CmakeIcon` - CMake
- `CobolIcon` - COBOL
- `CodeqlIcon` - CodeQL
- `CoffeeIcon` - CoffeeScript
- `ConsoleIcon` - Console
- `CppIcon` - C++
- `CrystalIcon` - Crystal
- `CsharpIcon` - C#
- `CssIcon` - CSS
- `DIcon` - D
- `DartIcon` - Dart
- `DatabaseIcon` - Database
- `DiffIcon` - Diff
- `DockerIcon` - Docker
- `DotenvIcon` - .env
- `ElixirIcon` - Elixir
- `ElmIcon` - Elm
- `ErbIcon` - ERB
- `ErlangIcon` - Erlang
- `FsharpIcon` - F#
- `GdscriptIcon` - GDScript
- `GlslIcon` - GLSL
- `GnuplotIcon` - Gnuplot
- `GoIcon` - Go
- `GraphqlIcon` - GraphQL
- `GroovyIcon` - Groovy
- `HackIcon` - Hack
- `HamlIcon` - Haml
- `HandlebarsIcon` - Handlebars
- `HaskellIcon` - Haskell
- `HclIcon` - HCL
- `HclLightIcon` - HCL Light
- `HjsonIcon` - Hjson
- `HlslIcon` - HLSL
- `HtmlIcon` - HTML
- `HttpIcon` - HTTP
- `ImbaIcon` - Imba
- `IniIcon` - INI
- `JavaIcon` - Java
- `JavascriptIcon` - JavaScript
- `JinjaIcon` - Jinja
- `JsonIcon` - JSON
- `Json5Icon` - JSON5
- `JsonnetIcon` - Jsonnet
- `JuliaIcon` - Julia
- `KotlinIcon` - Kotlin
- `KustoIcon` - Kusto
- `LessIcon` - Less
- `LiquidIcon` - Liquid
- `LispIcon` - Lisp
- `LuaIcon` - Lua
- `MakefileIcon` - Makefile
- `MarkdownIcon` - Markdown
- `MarkojsIcon` - MarkoJS
- `MatlabIcon` - MATLAB
- `MdxIcon` - MDX
- `MermaidIcon` - Mermaid
- `MojoIcon` - Mojo
- `NginxIcon` - Nginx
- `NimIcon` - Nim
- `NixIcon` - Nix
- `ObjectiveCIcon` - Objective-C
- `ObjectiveCppIcon` - Objective-C++
- `OcamlIcon` - OCaml
- `PascalIcon` - Pascal
- `PerlIcon` - Perl
- `Perl6Icon` - Perl 6
- `PhpIcon` - PHP
- `PostcssIcon` - PostCSS
- `PowershellIcon` - PowerShell
- `PrismaIcon` - Prisma
- `PrologIcon` - Prolog
- `ProtoIcon` - Protocol Buffers
- `PugIcon` - Pug
- `PuppetIcon` - Puppet
- `PurescriptIcon` - PureScript
- `PythonIcon` - Python
- `RIcon` - R
- `RazorIcon` - Razor
- `ReactIcon` - React
- `ReactTsIcon` - React TypeScript
- `RubyIcon` - Ruby
- `RustIcon` - Rust
- `SasIcon` - SAS
- `SassIcon` - Sass
- `ScalaIcon` - Scala
- `SchemeIcon` - Scheme
- `ShaderlabIcon` - ShaderLab
- `SolidityIcon` - Solidity
- `SparqlIcon` - SPARQL
- `StataIcon` - Stata
- `StylusIcon` - Stylus
- `SvelteIcon` - Svelte
- `SwiftIcon` - Swift
- `SystemverilogIcon` - SystemVerilog
- `TclIcon` - Tcl
- `TexIcon` - TeX
- `TomlIcon` - TOML
- `TwigIcon` - Twig
- `TypescriptIcon` - TypeScript
- `VerilogIcon` - Verilog
- `VhdlIcon` - VHDL
- `VimIcon` - Vim
- `VueIcon` - Vue
- `WebassemblyIcon` - WebAssembly
- `WenyanIcon` - 文言
- `WgslIcon` - WGSL
- `WolframlanguageIcon` - Wolfram Language
- `XmlIcon` - XML
- `XslIcon` - XSL
- `YamlIcon` - YAML
- `ZigIcon` - Zig

## 组件特点

- **响应式**: 支持不同尺寸的图标显示
- **可定制**: 可以通过className添加自定义样式
- **高性能**: 原生SVG渲染，无额外依赖
- **一致性**: 所有组件都有相同的API接口

## 更新原有引用

如果你想将现有的SVG引用替换为TSX组件，可以按以下方式进行：

### 之前 (SVG文件引用)

```tsx
<img src={jsIcon} alt="JavaScript" />
```

### 之后 (TSX组件)

```tsx
<JavascriptIcon size={24} />
```

这样可以获得更好的类型安全性和开发体验。
