from fastapi import APIRouter
import json
from pathlib import Path
from ..config.paths import DATA_DIR

router = APIRouter(prefix="/recent-repos", tags=["recent_repos"])

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

@router.get("/")
async def get_recent_repos():
    return load_recent_repos() 