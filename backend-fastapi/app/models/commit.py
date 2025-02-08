from pydantic import BaseModel

class CommitModification(BaseModel):
    repo_path: str
    commit_sha: str
    new_author_name: str
    new_author_email: str
    new_committer_name: str
    new_committer_email: str
    new_date: str
    new_message: str 