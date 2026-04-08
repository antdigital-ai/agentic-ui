#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown 语法速查 - 根据关键词返回对应语法片段
用法: python lookup.py <关键词>
关键词: table, video, chart, card, alert, attachment
支持子类型: table.basic, table.advanced, chart.bar, chart.pie, video.html 等
"""

import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
SNIPPETS_FILE = DATA_DIR / "syntax-snippets.json"


def load_snippets():
    with open(SNIPPETS_FILE, encoding="utf-8") as f:
        return json.load(f)


def get_snippet(snippets, key_path):
    """按 key.path 格式获取嵌套值"""
    keys = key_path.split(".")
    obj = snippets
    for k in keys:
        if isinstance(obj, dict) and k in obj:
            obj = obj[k]
        else:
            return None
    return obj if isinstance(obj, str) else None


def list_keys(snippets, prefix=""):
    """列出所有可用 key"""
    for k, v in snippets.items():
        full = f"{prefix}{k}" if prefix else k
        if isinstance(v, dict):
            yield from list_keys(v, f"{full}.")
        else:
            yield full


def main():
    if len(sys.argv) < 2:
        print("用法: python lookup.py <关键词>")
        print("示例: python lookup.py table")
        print("      python lookup.py chart.bar")
        print("\n可用关键词:", ", ".join(sorted(set(list_keys(load_snippets())))))
        sys.exit(1)

    key = sys.argv[1].lower()
    snippets = load_snippets()

    if key == "list" or key == "-l":
        for k in sorted(set(list_keys(snippets))):
            print(k)
        return

    result = get_snippet(snippets, key)
    if result:
        print(result)
    else:
        print(f"未找到关键词: {key}", file=sys.stderr)
        print("可用关键词:", ", ".join(sorted(set(list_keys(snippets)))), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
