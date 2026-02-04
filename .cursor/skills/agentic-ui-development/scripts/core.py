#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agentic UI Core - BM25 search engine for Agentic UI components
"""

import csv
import re
import json
from pathlib import Path
from math import log
from collections import defaultdict
from typing import List, Dict, Any, Optional

# ============ CONFIGURATION ============
DATA_DIR = Path(__file__).parent.parent / "data"
MAX_RESULTS = 5

CSV_CONFIG = {
    "component": {
        "file": "components.csv",
        "search_cols": ["name", "name_cn", "category", "keywords", "description"],
        "output_cols": ["id", "name", "name_cn", "category", "keywords", "source_path", "description", "props_summary"]
    },
    "plugin": {
        "file": "plugins.csv",
        "search_cols": ["name", "name_cn", "keywords", "description"],
        "output_cols": ["id", "name", "name_cn", "keywords", "source_path", "description", "dependencies"]
    },
    "hook": {
        "file": "hooks.csv",
        "search_cols": ["name", "keywords", "description"],
        "output_cols": ["id", "name", "keywords", "source_path", "description", "returns"]
    },
    "token": {
        "file": "tokens.csv",
        "search_cols": ["token", "category", "description"],
        "output_cols": ["token", "category", "type", "description", "example_value"]
    }
}

# ============ BM25 IMPLEMENTATION ============
class BM25:
    """BM25 ranking algorithm for text search"""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[List[str]] = []
        self.doc_lengths: List[int] = []
        self.avgdl: float = 0
        self.idf: Dict[str, float] = {}
        self.doc_freqs: Dict[str, int] = defaultdict(int)
        self.N: int = 0

    def tokenize(self, text: str) -> List[str]:
        """Lowercase, split, remove punctuation, filter short words"""
        text = re.sub(r'[^\w\s\u4e00-\u9fff]', ' ', str(text).lower())
        tokens = []
        for w in text.split():
            # Keep Chinese characters regardless of length
            if len(w) > 1 or '\u4e00' <= w <= '\u9fff':
                tokens.append(w)
        return tokens

    def fit(self, documents: List[str]) -> None:
        """Build BM25 index from documents"""
        self.corpus = [self.tokenize(doc) for doc in documents]
        self.N = len(self.corpus)
        if self.N == 0:
            return
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avgdl = sum(self.doc_lengths) / self.N

        for doc in self.corpus:
            seen = set()
            for word in doc:
                if word not in seen:
                    self.doc_freqs[word] += 1
                    seen.add(word)

        for word, freq in self.doc_freqs.items():
            self.idf[word] = log((self.N - freq + 0.5) / (freq + 0.5) + 1)

    def score(self, query: str) -> List[tuple]:
        """Score all documents against query"""
        query_tokens = self.tokenize(query)
        scores = []

        for idx, doc in enumerate(self.corpus):
            score = 0.0
            doc_len = self.doc_lengths[idx]
            term_freqs: Dict[str, int] = defaultdict(int)
            for word in doc:
                term_freqs[word] += 1

            for token in query_tokens:
                if token in self.idf:
                    tf = term_freqs[token]
                    idf = self.idf[token]
                    numerator = tf * (self.k1 + 1)
                    denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                    score += idf * numerator / denominator

            scores.append((idx, score))

        return sorted(scores, key=lambda x: x[1], reverse=True)


# ============ SEARCH FUNCTIONS ============
def _load_csv(filepath: Path) -> List[Dict[str, str]]:
    """Load CSV and return list of dicts"""
    if not filepath.exists():
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def _load_json(filepath: Path) -> Dict[str, Any]:
    """Load JSON file"""
    if not filepath.exists():
        return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def _search_csv(filepath: Path, search_cols: List[str], output_cols: List[str], 
                query: str, max_results: int) -> List[Dict[str, str]]:
    """Core search function using BM25"""
    if not filepath.exists():
        return []

    data = _load_csv(filepath)
    if not data:
        return []

    # Build documents from search columns
    documents = [" ".join(str(row.get(col, "")) for col in search_cols) for row in data]

    # BM25 search
    bm25 = BM25()
    bm25.fit(documents)
    ranked = bm25.score(query)

    # Get top results with score > 0
    results = []
    for idx, score in ranked[:max_results]:
        if score > 0:
            row = data[idx]
            result = {col: row.get(col, "") for col in output_cols if col in row}
            result["_score"] = score
            results.append(result)

    return results


def detect_domain(query: str) -> str:
    """Auto-detect the most relevant domain from query"""
    query_lower = query.lower()

    domain_keywords = {
        "component": [
            "bubble", "chat", "message", "layout", "editor", "markdown", 
            "thought", "thinking", "task", "list", "workspace", "history",
            "loading", "robot", "welcome", "suggestion", "alert", "tool",
            "气泡", "对话", "布局", "编辑器", "思维", "任务", "工作区", "历史"
        ],
        "plugin": [
            "plugin", "chart", "code", "katex", "mermaid", "syntax",
            "highlight", "formula", "diagram", "图表", "代码", "公式", "插件"
        ],
        "hook": [
            "hook", "use", "scroll", "size", "speech", "click", "language",
            "钩子", "滚动", "尺寸", "语音"
        ],
        "token": [
            "token", "color", "padding", "margin", "font", "border", 
            "shadow", "motion", "颜色", "间距", "字体", "边框", "阴影"
        ]
    }

    scores = {domain: sum(1 for kw in keywords if kw in query_lower) 
              for domain, keywords in domain_keywords.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "component"


def search(query: str, domain: Optional[str] = None, max_results: int = MAX_RESULTS) -> Dict[str, Any]:
    """Main search function with auto-domain detection"""
    if domain is None:
        domain = detect_domain(query)

    config = CSV_CONFIG.get(domain, CSV_CONFIG["component"])
    filepath = DATA_DIR / config["file"]

    if not filepath.exists():
        return {"error": f"File not found: {filepath}", "domain": domain}

    results = _search_csv(filepath, config["search_cols"], config["output_cols"], query, max_results)

    return {
        "domain": domain,
        "query": query,
        "file": config["file"],
        "count": len(results),
        "results": results
    }


def search_all(query: str, max_results: int = MAX_RESULTS) -> Dict[str, Any]:
    """Search across all domains"""
    all_results = {}
    
    for domain in CSV_CONFIG.keys():
        result = search(query, domain, max_results)
        all_results[domain] = result.get("results", [])
    
    total = sum(len(v) for v in all_results.values())
    
    return {
        "query": query,
        "total_count": total,
        "results": all_results
    }


def get_reasoning_rules() -> Dict[str, Any]:
    """Load reasoning rules from JSON"""
    filepath = DATA_DIR / "reasoning-rules.json"
    return _load_json(filepath)


def match_reasoning_rule(query: str) -> Optional[Dict[str, Any]]:
    """Match query to best reasoning rule"""
    rules_data = get_reasoning_rules()
    if not rules_data:
        return None
    
    query_lower = query.lower()
    query_terms = query_lower.split()
    
    matched_rules = []
    for rule in rules_data.get("rules", []):
        trigger_keywords = rule.get("trigger_keywords", [])
        score = 0
        for term in query_terms:
            for keyword in trigger_keywords:
                if term in keyword.lower() or keyword.lower() in term:
                    score += 1
        
        if score > 0:
            matched_rules.append({**rule, "_score": score})
    
    matched_rules.sort(key=lambda x: x["_score"], reverse=True)
    
    return matched_rules[0] if matched_rules else None


def get_component_by_name(name: str) -> Optional[Dict[str, str]]:
    """Get a specific component by name"""
    filepath = DATA_DIR / "components.csv"
    data = _load_csv(filepath)
    
    name_lower = name.lower()
    for row in data:
        if row.get("name", "").lower() == name_lower or row.get("name_cn", "") == name:
            return row
    return None


def get_plugin_by_name(name: str) -> Optional[Dict[str, str]]:
    """Get a specific plugin by name"""
    filepath = DATA_DIR / "plugins.csv"
    data = _load_csv(filepath)
    
    name_lower = name.lower()
    for row in data:
        if row.get("name", "").lower() == name_lower:
            return row
    return None


def get_hook_by_name(name: str) -> Optional[Dict[str, str]]:
    """Get a specific hook by name"""
    filepath = DATA_DIR / "hooks.csv"
    data = _load_csv(filepath)
    
    name_lower = name.lower()
    for row in data:
        if row.get("name", "").lower() == name_lower:
            return row
    return None


def get_token_by_name(name: str) -> Optional[Dict[str, str]]:
    """Get a specific token by name"""
    filepath = DATA_DIR / "tokens.csv"
    data = _load_csv(filepath)
    
    name_lower = name.lower().replace("token.", "")
    for row in data:
        if row.get("token", "").lower() == name_lower:
            return row
    return None
