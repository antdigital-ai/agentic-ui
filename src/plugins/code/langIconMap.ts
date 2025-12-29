import React from 'react';

// 只导入现有的图标组件
import AbapIcon from './langIcons/AbapIcon';
import ActionscriptIcon from './langIcons/ActionscriptIcon';
import AdaIcon from './langIcons/AdaIcon';
import ApacheIcon from './langIcons/ApacheIcon';
import AstroIcon from './langIcons/AstroIcon';
import ClojureIcon from './langIcons/ClojureIcon';
import CobolIcon from './langIcons/CobolIcon';
import CppIcon from './langIcons/CppIcon';
import { default as CsharpIcon } from './langIcons/CsharpIcon';
import { default as CssIcon } from './langIcons/CssIcon';
import DartIcon from './langIcons/DartIcon';
import DatabaseIcon from './langIcons/DatabaseIcon';
import DiffIcon from './langIcons/DiffIcon';
import ElixirIcon from './langIcons/ElixirIcon';
import GlslIcon from './langIcons/GlslIcon';
import GoIcon from './langIcons/GoIcon';
import GraphqlIcon from './langIcons/GraphqlIcon';
import HjsonIcon from './langIcons/HjsonIcon';
import { default as HtmlIcon } from './langIcons/HtmlIcon';
import IniIcon from './langIcons/IniIcon';
import JavaIcon from './langIcons/JavaIcon';
import { default as JavascriptIcon } from './langIcons/JavascriptIcon';
import Json5Icon from './langIcons/Json5Icon';
import { default as JsonIcon } from './langIcons/JsonIcon';
import JuliaIcon from './langIcons/JuliaIcon';
import KotlinIcon from './langIcons/KotlinIcon';
import LessIcon from './langIcons/LessIcon';
import LiquidIcon from './langIcons/LiquidIcon';
import LispIcon from './langIcons/LispIcon';
import LuaIcon from './langIcons/LuaIcon';
import MakefileIcon from './langIcons/MakefileIcon';
import MarkdownIcon from './langIcons/MarkdownIcon';
import MatlabIcon from './langIcons/MatlabIcon';
import MermaidIcon from './langIcons/MermaidIcon';
import NginxIcon from './langIcons/NginxIcon';
import NimIcon from './langIcons/NimIcon';
import NixIcon from './langIcons/NixIcon';
import ObjectiveCIcon from './langIcons/ObjectiveCIcon';
import OcamlIcon from './langIcons/OcamlIcon';
import PascalIcon from './langIcons/PascalIcon';
import Perl6Icon from './langIcons/Perl6Icon';
import PerlIcon from './langIcons/PerlIcon';
import PhpIcon from './langIcons/PhpIcon';
import {
  default as PowershellIcon,
  default as ShellIcon,
} from './langIcons/PowershellIcon';
import PrismaIcon from './langIcons/PrismaIcon';
import PrologIcon from './langIcons/PrologIcon';
import ProtoIcon from './langIcons/ProtoIcon';
import PugIcon from './langIcons/PugIcon';
import PuppetIcon from './langIcons/PuppetIcon';
import PythonIcon from './langIcons/PythonIcon';
import RIcon from './langIcons/RIcon';
import RazorIcon from './langIcons/RazorIcon';
import ReactIcon from './langIcons/ReactIcon';
import ReactTsIcon from './langIcons/ReactTsIcon';
import RubyIcon from './langIcons/RubyIcon';
import RustIcon from './langIcons/RustIcon';
import SassIcon from './langIcons/SassIcon';
import ScalaIcon from './langIcons/ScalaIcon';
import SchemeIcon from './langIcons/SchemeIcon';
import SparqlIcon from './langIcons/SparqlIcon';
import StylusIcon from './langIcons/StylusIcon';
import SwiftIcon from './langIcons/SwiftIcon';
import TclIcon from './langIcons/TclIcon';
import TexIcon from './langIcons/TexIcon';
import TomlIcon from './langIcons/TomlIcon';
import TwigIcon from './langIcons/TwigIcon';
import TypescriptIcon from './langIcons/TypescriptIcon';
import VerilogIcon from './langIcons/VerilogIcon';
import VhdlIcon from './langIcons/VhdlIcon';
import VueIcon from './langIcons/VueIcon';
import XmlIcon from './langIcons/XmlIcon';
import YamlIcon from './langIcons/YamlIcon';
import ZigIcon from './langIcons/ZigIcon';

// 定义图标组件类型
type IconComponent = React.ComponentType<any>;

export const langIconMap: Map<string, IconComponent> = new Map([
  ['zig', ZigIcon],
  ['yml', YamlIcon],
  ['yaml', YamlIcon],
  ['apache', ApacheIcon],
  ['xml', XmlIcon],
  ['vue', VueIcon],
  ['vhdl', VhdlIcon],
  ['verilog', VerilogIcon],
  ['ts', TypescriptIcon],
  ['typescript', TypescriptIcon],
  ['twig', TwigIcon],
  ['tsx', ReactTsIcon],
  ['toml', TomlIcon],
  ['tcl', TclIcon],
  ['swift', SwiftIcon],
  ['styl', StylusIcon],
  ['java', JavaIcon],
  ['stylus', StylusIcon],
  ['sparql', SparqlIcon],
  ['shell', ShellIcon],
  ['shellscript', ShellIcon],
  ['bash', ShellIcon],
  ['sh', ShellIcon],
  ['zsh', ShellIcon],
  ['scheme', SchemeIcon],
  ['scala', ScalaIcon],
  ['scss', SassIcon],
  ['sass', SassIcon],
  ['rust', RustIcon],
  ['ruby', RubyIcon],
  ['razor', RazorIcon],
  ['raku', Perl6Icon],
  ['r', RIcon],
  ['py', PythonIcon],
  ['python', PythonIcon],
  ['puppet', PuppetIcon],
  ['jade', PugIcon],
  ['proto', ProtoIcon],
  ['prolog', PrologIcon],
  ['prisma', PrismaIcon],
  ['powershell', PowershellIcon],
  ['ps', PowershellIcon],
  ['sql', DatabaseIcon],
  ['php', PhpIcon],
  ['perl', PerlIcon],
  ['pascal', PascalIcon],
  ['ocaml', OcamlIcon],
  ['objective-c', ObjectiveCIcon],
  ['objc', ObjectiveCIcon],
  ['nix', NixIcon],
  ['nim', NimIcon],
  ['nginx', NginxIcon],
  ['mermaid', MermaidIcon],
  ['matlab', MatlabIcon],
  ['markdown', MarkdownIcon],
  ['md', MarkdownIcon],
  ['makefile', MakefileIcon],
  ['make', MakefileIcon],
  ['lua', LuaIcon],
  ['lisp', LispIcon],
  ['liquid', LiquidIcon],
  ['less', LessIcon],
  ['latex', TexIcon],
  ['tex', TexIcon],
  ['js', JavascriptIcon],
  ['javascript', JavascriptIcon],
  ['jsx', ReactIcon],
  ['abap', AbapIcon],
  ['actionscript', ActionscriptIcon],
  ['ada', AdaIcon],
  ['astro', AstroIcon],
  ['c', TypescriptIcon],
  ['clojure', ClojureIcon],
  ['cjl', ClojureIcon],
  ['cobol', CobolIcon],
  ['cpp', CppIcon],
  ['c++', CppIcon],
  ['csharp', CsharpIcon],
  ['c#', CsharpIcon],
  ['cs', CsharpIcon],
  ['dart', DartIcon],
  ['diff', DiffIcon],
  ['css', CssIcon],
  ['elixir', ElixirIcon],
  ['glsl', GlslIcon],
  ['go', GoIcon],
  ['golang', GoIcon],
  ['graphql', GraphqlIcon],
  ['hjson', HjsonIcon],
  ['html', HtmlIcon],
  ['ini', IniIcon],
  ['properties', IniIcon],
  ['java', JavaIcon],
  ['json', JsonIcon],
  ['json5', Json5Icon],
  ['julia', JuliaIcon],
  ['kotlin', KotlinIcon],
  ['kt', KotlinIcon],
  ['kts', KotlinIcon],
]);
