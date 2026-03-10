#!/usr/bin/env python3
"""Rewrite git author/committer metadata and dates in one pass."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Bulk rewrite git author/committer name, email, and dates with a "
            "single git filter-branch run."
        )
    )
    parser.add_argument("--repo", required=True, help="Path to the git repository")
    parser.add_argument("--author-name", required=True, help="New author name")
    parser.add_argument("--author-email", required=True, help="New author email")
    parser.add_argument(
        "--committer-name",
        help="New committer name. Defaults to --author-name if omitted.",
    )
    parser.add_argument(
        "--committer-email",
        help="New committer email. Defaults to --author-email if omitted.",
    )
    parser.add_argument(
        "--date",
        required=True,
        help=(
            "New author/committer date for rewritten commits. "
            "Example: '2024-01-15T10:30:00+00:00' or 'Mon, 15 Jan 2024 10:30:00 +0000'."
        ),
    )
    parser.add_argument(
        "--commit",
        action="append",
        dest="commits",
        default=[],
        help=(
            "Commit SHA to rewrite. Repeat this flag to target multiple commits. "
            "If omitted, all commits reachable from the selected refs are rewritten."
        ),
    )
    parser.add_argument(
        "--refs",
        nargs="+",
        default=["--all"],
        help=(
            "Refs or revision range to rewrite. Default: --all. "
            "Examples: main, HEAD~10..HEAD, main feature-branch"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generated filter and git command without executing.",
    )
    return parser.parse_args()


def run_git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    )


def validate_repo(repo: Path) -> None:
    if not repo.exists():
        raise SystemExit(f"Repository path does not exist: {repo}")
    if not repo.is_dir():
        raise SystemExit(f"Repository path is not a directory: {repo}")
    try:
        run_git(repo, "rev-parse", "--is-inside-work-tree")
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"Not a git repository: {repo}\n{exc.stderr.strip()}") from exc


def validate_commits(repo: Path, commits: list[str]) -> None:
    for commit in commits:
        try:
            run_git(repo, "rev-parse", "--verify", f"{commit}^{{commit}}")
        except subprocess.CalledProcessError as exc:
            raise SystemExit(f"Invalid commit SHA '{commit}': {exc.stderr.strip()}") from exc


def build_filter_script(
    author_name: str,
    author_email: str,
    committer_name: str,
    committer_email: str,
    new_date: str,
    commits: list[str],
) -> str:
    escaped_commits = " ".join(f'"{sha}"' for sha in commits)
    commit_guard = ""
    if commits:
        commit_guard = f"""
rewrite_commit=0
for target_commit in {escaped_commits}; do
    if [ "$GIT_COMMIT" = "$target_commit" ]; then
        rewrite_commit=1
        break
    fi
done

if [ "$rewrite_commit" -ne 1 ]; then
    return 0
fi
"""

    return f"""\
{commit_guard}export GIT_AUTHOR_NAME={author_name!r}
export GIT_AUTHOR_EMAIL={author_email!r}
export GIT_COMMITTER_NAME={committer_name!r}
export GIT_COMMITTER_EMAIL={committer_email!r}
export GIT_AUTHOR_DATE={new_date!r}
export GIT_COMMITTER_DATE={new_date!r}
"""


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).expanduser().resolve()
    committer_name = args.committer_name or args.author_name
    committer_email = args.committer_email or args.author_email

    validate_repo(repo)
    validate_commits(repo, args.commits)

    filter_script = build_filter_script(
        author_name=args.author_name,
        author_email=args.author_email,
        committer_name=committer_name,
        committer_email=committer_email,
        new_date=args.date,
        commits=args.commits,
    )

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".sh") as handle:
        handle.write(filter_script)
        filter_path = Path(handle.name)

    os.chmod(filter_path, 0o700)
    git_command = [
        "git",
        "filter-branch",
        "-f",
        "--env-filter",
        f'. "{filter_path}"',
        "--",
        *args.refs,
    ]

    try:
        if args.dry_run:
            print("Generated env-filter script:")
            print(filter_script)
            print("Git command:")
            print(" ".join(git_command))
            return 0

        subprocess.run(git_command, cwd=repo, check=True)
    except subprocess.CalledProcessError as exc:
        print(f"git filter-branch failed with exit code {exc.returncode}", file=sys.stderr)
        return exc.returncode
    finally:
        filter_path.unlink(missing_ok=True)

    print("Rewrite completed.")
    print("Rewritten refs:", " ".join(args.refs))
    if args.commits:
        print("Targeted commits:", ", ".join(args.commits))
    else:
        print("Targeted commits: all commits reachable from the selected refs")
    print("Author:", f"{args.author_name} <{args.author_email}>")
    print("Committer:", f"{committer_name} <{committer_email}>")
    print("Date:", args.date)
    print("If this repository is shared, you will need to force-push rewritten refs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
