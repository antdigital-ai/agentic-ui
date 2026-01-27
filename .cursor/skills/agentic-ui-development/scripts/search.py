#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agentic UI Search - BM25 search engine for Agentic UI components

Usage:
    python search.py "chat bubble"                         # 搜索组件
    python search.py "chart" --domain plugin               # 搜索插件
    python search.py "scroll" --domain hook                # 搜索 Hooks
    python search.py "color" --domain token                # 搜索设计令牌
    python search.py "ai assistant" --recommend            # 获取推荐方案
    python search.py "ai chat" --design-system             # 生成完整设计系统
    python search.py "ai chat" --design-system --project-name "My AI App"  # 指定项目名
    python search.py "ai chat" --design-system --persist --project-name "My AI App"  # 持久化保存

Arguments:
    --project-name, -p   项目名称，用于设计系统输出的标题
    --persist            保存设计系统到 design-system/ 目录
    --page               创建页面特定的覆盖规则文件
"""

import json
import argparse
from typing import Dict, Any, List

from core import search, search_all, match_reasoning_rule, get_reasoning_rules, CSV_CONFIG, MAX_RESULTS
from design_system import generate_design_system


def format_search_output(result: Dict[str, Any]) -> str:
    """Format search results for terminal display (token-optimized)"""
    if "error" in result:
        return f"Error: {result['error']}"

    output = []
    output.append(f"## Agentic UI Search Results")
    output.append(f"**Domain:** {result['domain']} | **Query:** {result['query']}")
    output.append(f"**Source:** {result['file']} | **Found:** {result['count']} results\n")

    for i, row in enumerate(result['results'], 1):
        output.append(f"### Result {i}")
        for key, value in row.items():
            if key.startswith("_"):
                continue
            value_str = str(value)
            if len(value_str) > 200:
                value_str = value_str[:200] + "..."
            output.append(f"- **{key}:** {value_str}")
        output.append("")

    return "\n".join(output)


def format_component_result(component: Dict[str, str]) -> str:
    """格式化组件结果 (ASCII box)"""
    return f"""
┌─────────────────────────────────────────────────────────────────┐
│  {component.get('name', 'N/A')} ({component.get('name_cn', 'N/A')})
├─────────────────────────────────────────────────────────────────┤
│  Category: {component.get('category', 'N/A')}
│  Source:   {component.get('source_path', 'N/A')}
│  Props:    {component.get('props_summary', 'N/A')}
├─────────────────────────────────────────────────────────────────┤
│  {component.get('description', 'N/A')}
└─────────────────────────────────────────────────────────────────┘"""


def format_recommendation_result(rec: Dict[str, Any]) -> str:
    """格式化推荐结果 (ASCII box)"""
    if not rec:
        return "\n[Warning] No matching rule found. Try more specific keywords.\n"
    
    rules_data = get_reasoning_rules()
    checklist = rules_data.get("pre_delivery_checklist", [])
    
    components = ", ".join(rec.get("recommended_components", [])) or "N/A"
    hooks = ", ".join(rec.get("recommended_hooks", [])) or "N/A"
    plugins = ", ".join(rec.get("recommended_plugins", [])) or "N/A"
    styles = ", ".join(rec.get("style_priority", [])) or "N/A"
    tokens = ", ".join(rec.get("key_tokens", [])) or "N/A"
    anti_patterns = rec.get("anti_patterns", [])
    
    anti_patterns_str = "\n|     ".join([f"[X] {p}" for p in anti_patterns]) if anti_patterns else "N/A"
    checklist_str = "\n|     ".join([f"[ ] {c}" for c in checklist[:5]]) if checklist else "N/A"
    
    return f"""
+----------------------------------------------------------------------------------------+
|  QUERY: {rec.get('id', 'N/A')} - RECOMMENDED SOLUTION
+----------------------------------------------------------------------------------------+
|
|  RULE MATCHED: {rec.get('id', 'N/A')}
|
|  COMPONENTS:
|     {components}
|
|  HOOKS:
|     {hooks}
|
|  PLUGINS:
|     {plugins}
|
|  STYLE PRIORITY:
|     {styles}
|
|  KEY TOKENS:
|     {tokens}
|
|  ANTI-PATTERNS (AVOID):
|     {anti_patterns_str}
|
|  PRE-DELIVERY CHECKLIST:
|     {checklist_str}
|
+----------------------------------------------------------------------------------------+
"""


def format_all_results(results: Dict[str, Any], query: str, output_format: str, limit: int) -> str:
    """Format all domain results"""
    all_results = results.get("results", {})
    
    if output_format == "json":
        return json.dumps(results, ensure_ascii=False, indent=2)
    
    elif output_format == "markdown":
        lines = [f"# Search Results: {query}\n"]
        
        if all_results.get("component"):
            lines.append("## Components\n")
            for c in all_results["component"][:limit]:
                lines.append(f"### {c.get('name', 'N/A')} ({c.get('name_cn', 'N/A')})")
                lines.append(f"- **Source:** `{c.get('source_path', 'N/A')}`")
                lines.append(f"- **Props:** {c.get('props_summary', 'N/A')}")
                lines.append(f"- {c.get('description', 'N/A')}\n")
        
        if all_results.get("plugin"):
            lines.append("## Plugins\n")
            for p in all_results["plugin"][:limit]:
                lines.append(f"### {p.get('name', 'N/A')} ({p.get('name_cn', 'N/A')})")
                lines.append(f"- **Source:** `{p.get('source_path', 'N/A')}`")
                lines.append(f"- {p.get('description', 'N/A')}\n")
        
        if all_results.get("hook"):
            lines.append("## Hooks\n")
            for h in all_results["hook"][:limit]:
                lines.append(f"### {h.get('name', 'N/A')}")
                lines.append(f"- **Source:** `{h.get('source_path', 'N/A')}`")
                lines.append(f"- **Returns:** {h.get('returns', 'N/A')}")
                lines.append(f"- {h.get('description', 'N/A')}\n")
        
        if all_results.get("token"):
            lines.append("## Design Tokens\n")
            for t in all_results["token"][:limit]:
                lines.append(f"- `token.{t.get('token', 'N/A')}` ({t.get('category', 'N/A')}): {t.get('description', 'N/A')}")
        
        return "\n".join(lines)
    
    else:
        # ASCII format
        total = results.get("total_count", 0)
        lines = [f"\n[Search] Results for: '{query}' ({total} found)\n"]
        
        if all_results.get("component"):
            lines.append("=" * 70)
            lines.append("  COMPONENTS")
            lines.append("=" * 70)
            for c in all_results["component"][:limit]:
                lines.append(format_component_result(c))
        
        if all_results.get("plugin"):
            lines.append("\n" + "=" * 70)
            lines.append("  PLUGINS")
            lines.append("=" * 70)
            for p in all_results["plugin"][:limit]:
                lines.append(f"  [Plugin] {p.get('name', 'N/A')} ({p.get('name_cn', 'N/A')})")
                lines.append(f"     Source: {p.get('source_path', 'N/A')}")
                lines.append(f"     {p.get('description', 'N/A')}")
                lines.append("")
        
        if all_results.get("hook"):
            lines.append("\n" + "=" * 70)
            lines.append("  HOOKS")
            lines.append("=" * 70)
            for h in all_results["hook"][:limit]:
                lines.append(f"  [Hook] {h.get('name', 'N/A')}")
                lines.append(f"     Source: {h.get('source_path', 'N/A')}")
                lines.append(f"     Returns: {h.get('returns', 'N/A')}")
                lines.append(f"     {h.get('description', 'N/A')}")
                lines.append("")
        
        if all_results.get("token"):
            lines.append("\n" + "=" * 70)
            lines.append("  DESIGN TOKENS")
            lines.append("=" * 70)
            for t in all_results["token"][:limit]:
                lines.append(f"  [Token] token.{t.get('token', 'N/A')} ({t.get('category', 'N/A')})")
                lines.append(f"     {t.get('description', 'N/A')} | Example: {t.get('example_value', 'N/A')}")
                lines.append("")
        
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Agentic UI Search Tool"
    )
    parser.add_argument(
        "query",
        type=str,
        help="Search query"
    )
    parser.add_argument(
        "--domain",
        "-d",
        type=str,
        choices=list(CSV_CONFIG.keys()) + ["all"],
        default="all",
        help="Search domain (default: all)"
    )
    parser.add_argument(
        "--recommend",
        "-r",
        action="store_true",
        help="Get component recommendations based on query"
    )
    parser.add_argument(
        "--format",
        "-f",
        type=str,
        choices=["ascii", "json", "markdown"],
        default="ascii",
        help="Output format (default: ascii)"
    )
    parser.add_argument(
        "--limit",
        "-n",
        type=int,
        default=MAX_RESULTS,
        help=f"Maximum number of results (default: {MAX_RESULTS})"
    )
    # Design system generation
    parser.add_argument(
        "--design-system",
        "-ds",
        action="store_true",
        help="Generate complete design system recommendation"
    )
    parser.add_argument(
        "--project-name",
        "-p",
        type=str,
        default=None,
        help="Project name for design system output"
    )
    # Persistence (Master + Overrides pattern)
    parser.add_argument(
        "--persist",
        action="store_true",
        help="Save design system to design-system/MASTER.md (creates hierarchical structure)"
    )
    parser.add_argument(
        "--page",
        type=str,
        default=None,
        help="Create page-specific override file in design-system/pages/"
    )
    parser.add_argument(
        "--output-dir",
        "-o",
        type=str,
        default=None,
        help="Output directory for persisted files (default: current directory)"
    )
    
    args = parser.parse_args()
    
    # Design system takes priority
    if args.design_system:
        ds_format = "markdown" if args.format == "markdown" else "ascii"
        result = generate_design_system(
            args.query,
            args.project_name,
            ds_format,
            persist=args.persist,
            page=args.page,
            output_dir=args.output_dir
        )
        print(result)
        
        # Print persistence confirmation
        if args.persist:
            project_slug = args.project_name.lower().replace(' ', '-') if args.project_name else "default"
            print("\n" + "=" * 60)
            print(f"✅ Design system persisted to design-system/{project_slug}/")
            print(f"   📄 design-system/{project_slug}/MASTER.md (Global Source of Truth)")
            if args.page:
                page_filename = args.page.lower().replace(' ', '-')
                print(f"   📄 design-system/{project_slug}/pages/{page_filename}.md (Page Overrides)")
            print("")
            print(f"📖 Usage: When building a page, check design-system/{project_slug}/pages/[page].md first.")
            print(f"   If exists, its rules override MASTER.md. Otherwise, use MASTER.md.")
            print("=" * 60)
        return
    
    # Get recommendation
    if args.recommend:
        rule = match_reasoning_rule(args.query)
        if args.format == "json":
            print(json.dumps(rule or {}, ensure_ascii=False, indent=2))
        elif args.format == "markdown":
            if rule:
                print(f"## Recommendations for: {args.query}\n")
                print(f"**Rule:** {rule.get('id')}\n")
                print("### Components")
                for c in rule.get("recommended_components", []):
                    print(f"- `{c}`")
                print("\n### Hooks")
                for h in rule.get("recommended_hooks", []):
                    print(f"- `{h}`")
                print("\n### Plugins")
                for p in rule.get("recommended_plugins", []):
                    print(f"- `{p}`")
            else:
                print("No matching rule found.")
        else:
            print(format_recommendation_result(rule))
        return
    
    # Domain-specific or all-domain search
    if args.domain == "all":
        results = search_all(args.query, args.limit)
        print(format_all_results(results, args.query, args.format, args.limit))
    else:
        result = search(args.query, args.domain, args.limit)
        if args.format == "json":
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(format_search_output(result))


if __name__ == "__main__":
    main()
