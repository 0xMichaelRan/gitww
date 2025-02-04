import json
from pathlib import Path

# Create a data directory in your project root
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

RECENT_REPOS_FILE = DATA_DIR / "recent_repos.json"

def load_recent_repos():
    try:
        with open(RECENT_REPOS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_recent_repo(repo_path: str, max_entries: int = 10):
    repos = load_recent_repos()
    if repo_path in repos:
        repos.remove(repo_path)
    repos.insert(0, repo_path)
    repos = repos[:max_entries]
    
    with open(RECENT_REPOS_FILE, 'w') as f:
        json.dump(repos, f, indent=2) 