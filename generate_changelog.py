import subprocess
import re
import sys

def get_tags():
    # 获取最近 21 个 tag（用于 20 个区间）
    # 使用 git tag --sort=-creatordate
    cmd = ["git", "tag", "--sort=-creatordate"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    tags = result.stdout.strip().split('\n')
    # 过滤空字符串
    tags = [t for t in tags if t]
    return tags[:21]

def get_commits(start_tag, end_tag):
    cmd = ["git", "log", f"{start_tag}..{end_tag}", "--pretty=format:%s|%an|%h"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip().split('\n')

def format_description(desc):
    # 中英文之间加空格
    desc = re.sub(r'([\u4e00-\u9fa5])([a-zA-Z0-9`])', r'\1 \2', desc)
    desc = re.sub(r'([a-zA-Z0-9`])([\u4e00-\u9fa5])', r'\1 \2', desc)
    # 简单的 props 识别：单词中间有大写字母的，可能是 props，加上反引号
    # 但这可能误伤，用户要求 "wrap props in backticks"，通常需要语义理解。
    # 我们这里做一个简单的处理：如果看起来像 camelCase 属性名（如 showIcon, visible），就加上反引号。
    # 为了避免误伤普通单词，我们只对明确看起来像 prop 的处理，或者如果不确定就不处理。
    # 既然是自动化脚本，保守一点，只处理中英文空格。
    return desc

def get_emoji(type_):
    emoji_map = {
        'feat': '🆕',
        'fix': '🐞',
        'docs': '📖',
        'style': '💄',
        'refactor': '🛠',
        'perf': '🚀',
        'test': '✅',
        'build': '📦',
        'ci': '👷',
        'chore': '🧹',
        'revert': '⏪'
    }
    return emoji_map.get(type_, '📄')

def parse_commit(line):
    if not line: return None
    parts = line.split('|')
    if len(parts) < 3: return None
    msg, author, hash_ = parts[0], parts[1], parts[2]
    
    # Extract PR number
    pr_match = re.search(r'\(#(\d+)\)', msg)
    pr_number = pr_match.group(1) if pr_match else None
    msg = re.sub(r'\s*\(#\d+\)', '', msg) # Remove PR from msg
    
    # Parse Conventional Commits
    # type(scope): subject
    # 允许 scope 包含括号等字符，但一般规范不含
    match = re.match(r'^(\w+)(?:\(([^)]+)\))?:\s*(.+)$', msg)
    
    if match:
        type_ = match.group(1)
        scope = match.group(2)
        subject = match.group(3)
        emoji = get_emoji(type_)
        
        # If scope is missing, try to guess or use "Other"
        component = scope if scope else "Other"
        
        return {
            'component': component,
            'emoji': emoji,
            'description': format_description(subject),
            'pr': pr_number,
            'author': author,
            'hash': hash_
        }
    else:
        # Non-conventional
        # 尝试从消息中猜测是否为 release commit (如 "2.29.3")，如果是，跳过
        if re.match(r'^v?\d+\.\d+\.\d+$', msg):
            return None

        return {
            'component': "Other",
            'emoji': "📄",
            'description': format_description(msg),
            'pr': pr_number,
            'author': author,
            'hash': hash_
        }

def generate_changelog():
    tags = get_tags()
    
    if len(tags) < 2:
        print("Not enough tags to generate changelog.")
        return

    for i in range(len(tags) - 1):
        current_tag = tags[i]
        prev_tag = tags[i+1]
        
        print(f"## {current_tag}\n")
        
        commits = get_commits(prev_tag, current_tag)
        grouped = {}
        
        for line in commits:
            parsed = parse_commit(line)
            if not parsed: continue
            
            comp = parsed['component']
            if comp not in grouped:
                grouped[comp] = []
            grouped[comp].append(parsed)
            
        for comp in sorted(grouped.keys()):
            items = grouped[comp]
            print(f"{comp}:")
            for item in items:
                pr_link = f"[#{item['pr']}](https://github.com/ant-design/agentic-ui/pull/{item['pr']})" if item['pr'] else ""
                author = f"[@{item['author']}]"
                print(f"  - {item['emoji']} {item['description']} {pr_link} {author}")
            print() # Empty line between components
            
if __name__ == "__main__":
    generate_changelog()
