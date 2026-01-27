#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agentic UI Design System Generator
生成完整的组件推荐方案，支持 Master + Overrides 模式持久化

Usage:
    from design_system import generate_design_system
    result = generate_design_system("ai chat assistant", "My AI App")
    
    # With persistence (Master + Overrides pattern)
    result = generate_design_system("ai chat assistant", "My AI App", persist=True)
    result = generate_design_system("ai chat assistant", "My AI App", persist=True, page="chat")
"""

import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

from core import (
    search, search_all, match_reasoning_rule, 
    get_reasoning_rules, DATA_DIR
)


# ============ CONFIGURATION ============
BOX_WIDTH = 90


# ============ DESIGN SYSTEM GENERATOR ============
class DesignSystemGenerator:
    """Generates Agentic UI component recommendations from search results."""

    def __init__(self):
        self.reasoning_data = get_reasoning_rules()

    def _multi_domain_search(self, query: str) -> Dict[str, Any]:
        """Execute searches across multiple domains."""
        return search_all(query, max_results=5)

    def _get_matched_rule(self, query: str) -> Optional[Dict[str, Any]]:
        """Find matching reasoning rule for query."""
        return match_reasoning_rule(query)

    def _extract_top_components(self, search_results: Dict[str, Any], limit: int = 5) -> List[Dict]:
        """Extract top components from search results."""
        components = search_results.get("results", {}).get("component", [])
        return components[:limit]

    def _extract_top_plugins(self, search_results: Dict[str, Any], limit: int = 3) -> List[Dict]:
        """Extract top plugins from search results."""
        plugins = search_results.get("results", {}).get("plugin", [])
        return plugins[:limit]

    def _extract_top_hooks(self, search_results: Dict[str, Any], limit: int = 3) -> List[Dict]:
        """Extract top hooks from search results."""
        hooks = search_results.get("results", {}).get("hook", [])
        return hooks[:limit]

    def _extract_top_tokens(self, search_results: Dict[str, Any], limit: int = 5) -> List[Dict]:
        """Extract top tokens from search results."""
        tokens = search_results.get("results", {}).get("token", [])
        return tokens[:limit]

    def generate(self, query: str, project_name: Optional[str] = None) -> Dict[str, Any]:
        """Generate complete design system recommendation."""
        # Step 1: Get matched reasoning rule
        rule = self._get_matched_rule(query)
        
        # Step 2: Multi-domain search
        search_results = self._multi_domain_search(query)
        
        # Step 3: Extract top results from each domain
        components = self._extract_top_components(search_results)
        plugins = self._extract_top_plugins(search_results)
        hooks = self._extract_top_hooks(search_results)
        tokens = self._extract_top_tokens(search_results)
        
        # Step 4: Build recommendation based on rule or search
        if rule:
            recommended_components = rule.get("recommended_components", [])
            recommended_hooks = rule.get("recommended_hooks", [])
            recommended_plugins = rule.get("recommended_plugins", [])
            style_priority = rule.get("style_priority", [])
            key_tokens = rule.get("key_tokens", [])
            anti_patterns = rule.get("anti_patterns", [])
            rule_id = rule.get("id", "")
        else:
            recommended_components = [c.get("name", "") for c in components]
            recommended_hooks = [h.get("name", "") for h in hooks]
            recommended_plugins = [p.get("name", "") for p in plugins]
            style_priority = ["modern", "clean", "accessible"]
            key_tokens = [t.get("token", "") for t in tokens]
            anti_patterns = []
            rule_id = "auto-detected"

        # Step 5: Get global anti-patterns and checklist
        global_anti_patterns = self.reasoning_data.get("anti_patterns_global", [])
        pre_delivery_checklist = self.reasoning_data.get("pre_delivery_checklist", [])

        return {
            "project_name": project_name or query.upper(),
            "query": query,
            "rule_matched": rule_id,
            "components": {
                "recommended": recommended_components,
                "search_results": components
            },
            "hooks": {
                "recommended": recommended_hooks,
                "search_results": hooks
            },
            "plugins": {
                "recommended": recommended_plugins,
                "search_results": plugins
            },
            "tokens": {
                "key_tokens": key_tokens,
                "search_results": tokens
            },
            "style_priority": style_priority,
            "anti_patterns": anti_patterns,
            "global_anti_patterns": global_anti_patterns,
            "pre_delivery_checklist": pre_delivery_checklist
        }


# ============ OUTPUT FORMATTERS ============
def format_ascii_box(design_system: Dict[str, Any]) -> str:
    """Format design system as ASCII box."""
    project = design_system.get("project_name", "PROJECT")
    query = design_system.get("query", "")
    rule_matched = design_system.get("rule_matched", "")
    components = design_system.get("components", {})
    hooks = design_system.get("hooks", {})
    plugins = design_system.get("plugins", {})
    tokens = design_system.get("tokens", {})
    style_priority = design_system.get("style_priority", [])
    anti_patterns = design_system.get("anti_patterns", [])
    checklist = design_system.get("pre_delivery_checklist", [])

    w = BOX_WIDTH - 1
    lines = []

    lines.append("+" + "-" * w + "+")
    lines.append(f"|  TARGET: {project} - AGENTIC UI RECOMMENDATION".ljust(BOX_WIDTH) + "|")
    lines.append("+" + "-" * w + "+")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Query & Rule
    lines.append(f"|  QUERY: {query}".ljust(BOX_WIDTH) + "|")
    lines.append(f"|  RULE MATCHED: {rule_matched}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Components
    lines.append("|  RECOMMENDED COMPONENTS:".ljust(BOX_WIDTH) + "|")
    comp_str = ", ".join(components.get("recommended", [])) or "N/A"
    lines.append(f"|     {comp_str}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Hooks
    lines.append("|  RECOMMENDED HOOKS:".ljust(BOX_WIDTH) + "|")
    hook_str = ", ".join(hooks.get("recommended", [])) or "N/A"
    lines.append(f"|     {hook_str}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Plugins
    lines.append("|  RECOMMENDED PLUGINS:".ljust(BOX_WIDTH) + "|")
    plugin_str = ", ".join(plugins.get("recommended", [])) or "N/A"
    lines.append(f"|     {plugin_str}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Tokens
    lines.append("|  KEY TOKENS:".ljust(BOX_WIDTH) + "|")
    token_str = ", ".join(tokens.get("key_tokens", [])) or "N/A"
    lines.append(f"|     {token_str}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Style Priority
    lines.append("|  STYLE PRIORITY:".ljust(BOX_WIDTH) + "|")
    style_str = ", ".join(style_priority) or "N/A"
    lines.append(f"|     {style_str}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    # Anti-patterns
    if anti_patterns:
        lines.append("|  ANTI-PATTERNS (AVOID):".ljust(BOX_WIDTH) + "|")
        for ap in anti_patterns[:5]:
            lines.append(f"|     [X] {ap}".ljust(BOX_WIDTH) + "|")
        lines.append("|" + " " * BOX_WIDTH + "|")

    # Pre-delivery checklist
    lines.append("|  PRE-DELIVERY CHECKLIST:".ljust(BOX_WIDTH) + "|")
    for item in checklist[:7]:
        lines.append(f"|     [ ] {item}".ljust(BOX_WIDTH) + "|")
    lines.append("|" + " " * BOX_WIDTH + "|")

    lines.append("+" + "-" * w + "+")

    return "\n".join(lines)


def format_markdown(design_system: Dict[str, Any]) -> str:
    """Format design system as markdown."""
    project = design_system.get("project_name", "PROJECT")
    query = design_system.get("query", "")
    rule_matched = design_system.get("rule_matched", "")
    components = design_system.get("components", {})
    hooks = design_system.get("hooks", {})
    plugins = design_system.get("plugins", {})
    tokens = design_system.get("tokens", {})
    style_priority = design_system.get("style_priority", [])
    anti_patterns = design_system.get("anti_patterns", [])
    checklist = design_system.get("pre_delivery_checklist", [])

    lines = []
    lines.append(f"## Agentic UI Recommendation: {project}")
    lines.append("")
    lines.append(f"**Query:** {query}")
    lines.append(f"**Rule Matched:** {rule_matched}")
    lines.append("")

    # Components
    lines.append("### Recommended Components")
    for comp in components.get("recommended", []):
        lines.append(f"- `{comp}`")
    lines.append("")

    # Search Results
    if components.get("search_results"):
        lines.append("**Search Results:**")
        for comp in components.get("search_results", []):
            lines.append(f"- `{comp.get('name')}` ({comp.get('name_cn')}) - {comp.get('description', '')[:50]}...")
        lines.append("")

    # Hooks
    lines.append("### Recommended Hooks")
    for hook in hooks.get("recommended", []):
        lines.append(f"- `{hook}`")
    lines.append("")

    # Plugins
    lines.append("### Recommended Plugins")
    for plugin in plugins.get("recommended", []):
        lines.append(f"- `{plugin}`")
    lines.append("")

    # Tokens
    lines.append("### Key Design Tokens")
    for token in tokens.get("key_tokens", []):
        lines.append(f"- `token.{token}`")
    lines.append("")

    # Style Priority
    lines.append("### Style Priority")
    lines.append(f"{', '.join(style_priority)}")
    lines.append("")

    # Anti-patterns
    if anti_patterns:
        lines.append("### Anti-Patterns (Avoid)")
        for ap in anti_patterns:
            lines.append(f"- [X] {ap}")
        lines.append("")

    # Pre-delivery checklist
    lines.append("### Pre-Delivery Checklist")
    for item in checklist:
        lines.append(f"- [ ] {item}")
    lines.append("")

    return "\n".join(lines)


# ============ PERSISTENCE FUNCTIONS ============
def persist_design_system(design_system: Dict[str, Any], page: Optional[str] = None, 
                          output_dir: Optional[str] = None) -> Dict[str, Any]:
    """
    Persist design system to design-system/<project>/ folder using Master + Overrides pattern.
    
    Args:
        design_system: The generated design system dictionary
        page: Optional page name for page-specific override file
        output_dir: Optional output directory (defaults to current working directory)
    
    Returns:
        dict with created file paths and status
    """
    base_dir = Path(output_dir) if output_dir else Path.cwd()
    
    # Use project name for project-specific folder
    project_name = design_system.get("project_name", "default")
    project_slug = project_name.lower().replace(' ', '-')
    
    design_system_dir = base_dir / "design-system" / project_slug
    pages_dir = design_system_dir / "pages"
    
    created_files = []
    
    # Create directories
    design_system_dir.mkdir(parents=True, exist_ok=True)
    pages_dir.mkdir(parents=True, exist_ok=True)
    
    master_file = design_system_dir / "MASTER.md"
    
    # Generate and write MASTER.md
    master_content = format_master_md(design_system)
    with open(master_file, 'w', encoding='utf-8') as f:
        f.write(master_content)
    created_files.append(str(master_file))
    
    # If page is specified, create page override file
    if page:
        page_file = pages_dir / f"{page.lower().replace(' ', '-')}.md"
        page_content = format_page_override_md(design_system, page)
        with open(page_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
        created_files.append(str(page_file))
    
    return {
        "status": "success",
        "design_system_dir": str(design_system_dir),
        "created_files": created_files
    }


def format_master_md(design_system: Dict[str, Any]) -> str:
    """Format design system as MASTER.md with hierarchical override logic."""
    project = design_system.get("project_name", "PROJECT")
    query = design_system.get("query", "")
    rule_matched = design_system.get("rule_matched", "")
    components = design_system.get("components", {})
    hooks = design_system.get("hooks", {})
    plugins = design_system.get("plugins", {})
    tokens = design_system.get("tokens", {})
    style_priority = design_system.get("style_priority", [])
    anti_patterns = design_system.get("anti_patterns", [])
    global_anti_patterns = design_system.get("global_anti_patterns", [])
    checklist = design_system.get("pre_delivery_checklist", [])
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    lines = []
    
    # Logic header
    lines.append("# Agentic UI Design System Master File")
    lines.append("")
    lines.append("> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.")
    lines.append("> If that file exists, its rules **override** this Master file.")
    lines.append("> If not, strictly follow the rules below.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"**Project:** {project}")
    lines.append(f"**Query:** {query}")
    lines.append(f"**Rule Matched:** {rule_matched}")
    lines.append(f"**Generated:** {timestamp}")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Component Recommendations
    lines.append("## Component Recommendations")
    lines.append("")
    lines.append("### Primary Components")
    lines.append("")
    for comp in components.get("recommended", []):
        lines.append(f"- `{comp}`")
    lines.append("")
    
    if components.get("search_results"):
        lines.append("### Component Details")
        lines.append("")
        lines.append("| Name | Name (CN) | Category | Source |")
        lines.append("|------|-----------|----------|--------|")
        for comp in components.get("search_results", []):
            lines.append(f"| `{comp.get('name', '')}` | {comp.get('name_cn', '')} | {comp.get('category', '')} | `{comp.get('source_path', '')}` |")
        lines.append("")
    
    # Hooks
    lines.append("## Recommended Hooks")
    lines.append("")
    for hook in hooks.get("recommended", []):
        lines.append(f"- `{hook}`")
    lines.append("")
    
    # Plugins
    lines.append("## Recommended Plugins")
    lines.append("")
    for plugin in plugins.get("recommended", []):
        lines.append(f"- `{plugin}`")
    lines.append("")
    
    # Design Tokens
    lines.append("## Design Tokens")
    lines.append("")
    lines.append("### Key Tokens")
    lines.append("")
    for token in tokens.get("key_tokens", []):
        lines.append(f"- `token.{token}`")
    lines.append("")
    
    if tokens.get("search_results"):
        lines.append("### Token Details")
        lines.append("")
        lines.append("| Token | Category | Description | Example |")
        lines.append("|-------|----------|-------------|---------|")
        for t in tokens.get("search_results", []):
            lines.append(f"| `token.{t.get('token', '')}` | {t.get('category', '')} | {t.get('description', '')} | `{t.get('example_value', '')}` |")
        lines.append("")
    
    # Style Priority
    lines.append("## Style Priority")
    lines.append("")
    lines.append(f"Priority order: **{' > '.join(style_priority)}**")
    lines.append("")
    
    # CSS-in-JS Pattern
    lines.append("## CSS-in-JS Pattern")
    lines.append("")
    lines.append("```tsx")
    lines.append("import { createStyles } from '@ant-design/cssinjs';")
    lines.append("")
    lines.append("const useStyles = createStyles(({ token }) => ({")
    lines.append("  container: {")
    lines.append("    padding: token.padding,           // DO NOT hardcode '16px'")
    lines.append("    color: token.colorText,           // DO NOT hardcode '#000'")
    lines.append("    borderRadius: token.borderRadius, // DO NOT hardcode '6px'")
    lines.append("  },")
    lines.append("}));")
    lines.append("```")
    lines.append("")
    
    # Anti-Patterns
    lines.append("---")
    lines.append("")
    lines.append("## Anti-Patterns (Do NOT Use)")
    lines.append("")
    
    if anti_patterns:
        lines.append("### Rule-Specific Anti-Patterns")
        lines.append("")
        for ap in anti_patterns:
            lines.append(f"- ❌ {ap}")
        lines.append("")
    
    lines.append("### Global Anti-Patterns")
    lines.append("")
    for ap in global_anti_patterns:
        ap_id = ap.get("id", "")
        desc = ap.get("description", "")
        bad = ap.get("bad_example", "")
        good = ap.get("good_example", "")
        lines.append(f"#### [X] {ap_id}: {desc}")
        lines.append(f"- **Bad:** `{bad}`")
        lines.append(f"- **Good:** `{good}`")
        lines.append("")
    
    # Pre-Delivery Checklist
    lines.append("---")
    lines.append("")
    lines.append("## Pre-Delivery Checklist")
    lines.append("")
    lines.append("Before delivering any component code, verify:")
    lines.append("")
    for item in checklist:
        lines.append(f"- [ ] {item}")
    lines.append("")
    
    return "\n".join(lines)


def format_page_override_md(design_system: Dict[str, Any], page_name: str) -> str:
    """Format a page-specific override file."""
    project = design_system.get("project_name", "PROJECT")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    page_title = page_name.replace("-", " ").replace("_", " ").title()
    
    lines = []
    
    lines.append(f"# {page_title} Page Overrides")
    lines.append("")
    lines.append(f"> **PROJECT:** {project}")
    lines.append(f"> **Generated:** {timestamp}")
    lines.append("")
    lines.append("> **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).")
    lines.append("> Only deviations from the Master are documented here. For all other rules, refer to the Master.")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Page-specific sections
    lines.append("## Page-Specific Components")
    lines.append("")
    lines.append("<!-- Add components unique to this page -->")
    lines.append("- [ ] Add page-specific components here")
    lines.append("")
    
    lines.append("## Layout Overrides")
    lines.append("")
    lines.append("<!-- Document any layout deviations -->")
    lines.append("- No overrides — use Master layout")
    lines.append("")
    
    lines.append("## Token Overrides")
    lines.append("")
    lines.append("<!-- Document any token deviations -->")
    lines.append("- No overrides — use Master tokens")
    lines.append("")
    
    lines.append("## Additional Notes")
    lines.append("")
    lines.append("<!-- Add any page-specific implementation notes -->")
    lines.append("")
    
    return "\n".join(lines)


# ============ MAIN ENTRY POINT ============
def generate_design_system(query: str, project_name: Optional[str] = None, 
                           output_format: str = "ascii", 
                           persist: bool = False, page: Optional[str] = None, 
                           output_dir: Optional[str] = None) -> str:
    """
    Main entry point for design system generation.

    Args:
        query: Search query (e.g., "ai chat assistant", "markdown editor")
        project_name: Optional project name for output header
        output_format: "ascii" (default) or "markdown"
        persist: If True, save design system to design-system/ folder
        page: Optional page name for page-specific override file
        output_dir: Optional output directory (defaults to current working directory)

    Returns:
        Formatted design system string
    """
    generator = DesignSystemGenerator()
    design_system = generator.generate(query, project_name)
    
    # Persist to files if requested
    if persist:
        persist_design_system(design_system, page, output_dir)

    if output_format == "markdown":
        return format_markdown(design_system)
    return format_ascii_box(design_system)


# ============ CLI SUPPORT ============
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate Agentic UI Design System")
    parser.add_argument("query", help="Search query (e.g., 'ai chat assistant')")
    parser.add_argument("--project-name", "-p", type=str, default=None, help="Project name")
    parser.add_argument("--format", "-f", choices=["ascii", "markdown"], default="ascii", help="Output format")
    parser.add_argument("--persist", action="store_true", help="Save to design-system/ folder")
    parser.add_argument("--page", type=str, default=None, help="Create page-specific override")
    parser.add_argument("--output-dir", "-o", type=str, default=None, help="Output directory")

    args = parser.parse_args()

    result = generate_design_system(
        args.query, 
        args.project_name, 
        args.format,
        args.persist,
        args.page,
        args.output_dir
    )
    print(result)
    
    if args.persist:
        project_slug = args.project_name.lower().replace(' ', '-') if args.project_name else "default"
        print("\n" + "=" * 60)
        print(f"✅ Design system persisted to design-system/{project_slug}/")
        print(f"   📄 design-system/{project_slug}/MASTER.md (Global Source of Truth)")
        if args.page:
            page_filename = args.page.lower().replace(' ', '-')
            print(f"   📄 design-system/{project_slug}/pages/{page_filename}.md (Page Overrides)")
        print("=" * 60)
