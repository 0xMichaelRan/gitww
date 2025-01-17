'use client'

import * as React from 'react'
import { GitCommit, RefreshCw, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from 'next/link';

// Generate mock data for the contributions graph
const generateContributionsData = () => {
  const data = []
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      data.push({
        date: new Date(2023, 0, week * 7 + day + 1).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5)
      })
    }
  }
  return data
}

const contributionsData = generateContributionsData()

export default function GitWW() {
  const [commits, setCommits] = React.useState([])
  const [selectedCommits, setSelectedCommits] = React.useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null)
  const [isModifyDialogOpen, setIsModifyDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [selectedCommit, setSelectedCommit] = React.useState(null)
  const [modifyData, setModifyData] = React.useState({
    repo_path: process.env.NEXT_PUBLIC_REPO_PATH || '',
    commit_sha: '',
    new_author_name: '',
    new_author_email: '',
    new_committer_name: '',
    new_committer_email: '',
    new_date: '',
    new_message: ''
  })

  React.useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch(`http://localhost:8000/commits/?repo_path=${encodeURIComponent(process.env.NEXT_PUBLIC_REPO_PATH || '')}`);
        const data = await response.json();
        setCommits(data);
      } catch (error) {
        console.error("Error fetching commits:", error);
      }
    };

    fetchCommits();
  }, []);

  const handleCommitClick = (index: number, event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey) {
      setSelectedCommits(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      )
      setLastSelectedIndex(index)
    } else if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      setSelectedCommits(Array.from({ length: end - start + 1 }, (_, i) => start + i))
    } else {
      setSelectedCommits([index])
      setLastSelectedIndex(index)
    }
  }

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-muted'
    if (count < 2) return 'bg-emerald-200'
    if (count < 4) return 'bg-emerald-400'
    return 'bg-emerald-600'
  }

  const handleModifyClick = () => {
    if (selectedCommits.length === 1) {
      const selectedCommit = commits[selectedCommits[0]];
      setModifyData({
        repo_path: process.env.NEXT_PUBLIC_REPO_PATH || '',
        commit_sha: selectedCommit.sha,
        new_author_name: selectedCommit.author_name,
        new_author_email: selectedCommit.author_email,
        new_committer_name: selectedCommit.committer_name,
        new_committer_email: selectedCommit.committer_email,
        new_date: selectedCommit.date,
        new_message: selectedCommit.message
      });
      setIsModifyDialogOpen(true);
    }
  };

  const handleModifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/modify-commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const updatedCommits = await response.json();
      setCommits(updatedCommits);
      setIsModifyDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommitsFromLastYear = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return commits.filter(commit => {
      const commitDate = new Date(commit.date);
      return commitDate >= oneYearAgo;
    });
  };

  const handleContributionClick = (commit) => {
    setSelectedCommit(commit);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Commit History</h1>
        <div className="flex space-x-2">
          {selectedCommits.length > 1 ? (
            <Link href="/bulk-edit" passHref>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modify
              </Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={handleModifyClick} disabled={selectedCommits.length !== 1 || loading}>
              <Edit className="mr-2 h-4 w-4" />
              Modify
            </Button>
          )}
          <Button variant="outline" onClick={() => console.log('Refresh clicked')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex space-x-4">
        <ScrollArea className="h-[calc(100vh-180px)] w-3/5 rounded-md border">
          <div className="p-4">
            {commits.map((commit: { hash: string, date: string, message: string, author: string }, index) => (
              <div
                key={commit.hash}
                className={`flex items-center p-2 rounded-md cursor-pointer ${selectedCommits.includes(index) ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                onClick={(e) => handleCommitClick(index, e)}
              >
                <GitCommit className="mr-2 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-mono text-sm truncate">{commit.hash}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{commit.date}</span>
                  </div>
                  <p className="text-sm truncate">{commit.message}</p>
                  <p className="text-xs text-muted-foreground">Author: {commit.author}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="w-2/5">
          <h2 className="text-lg font-semibold mb-4">Contributions in the Last Year</h2>
          <div className="grid grid-cols-7 gap-1">
            {getCommitsFromLastYear().map((commit, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 ${getContributionColor(1)}`}
                      aria-label={`1 contribution on ${commit.date}`}
                      onClick={() => handleContributionClick(commit)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>1 contribution on {commit.date}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {selectedCommit && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="text-md font-semibold">Selected Commit Details</h3>
              <p><strong>Date:</strong> {selectedCommit.date}</p>
              <p><strong>Message:</strong> {selectedCommit.message}</p>
              <p><strong>Author:</strong> {selectedCommit.author_name}</p>
              <p><strong>Email:</strong> {selectedCommit.author_email}</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Commit</DialogTitle>
            <DialogDescription>
              Edit the commit details below. This will rewrite the Git history.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleModifySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commit_sha" className="text-right">
                  Commit SHA
                </Label>
                <Input
                  id="commit_sha"
                  value={modifyData.commit_sha}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_author_name" className="text-right">
                  Author
                </Label>
                <Input
                  id="new_author_name"
                  value={modifyData.new_author_name}
                  onChange={(e) => setModifyData({ ...modifyData, new_author_name: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_author_email" className="text-right">
                  Author Email
                </Label>
                <Input
                  id="new_author_email"
                  value={modifyData.new_author_email}
                  onChange={(e) => setModifyData({ ...modifyData, new_author_email: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_committer_name" className="text-right">
                  Committer
                </Label>
                <Input
                  id="new_committer_name"
                  value={modifyData.new_committer_name}
                  onChange={(e) => setModifyData({ ...modifyData, new_committer_name: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_committer_email" className="text-right">
                  Committer Email
                </Label>
                <Input
                  id="new_committer_email"
                  value={modifyData.new_committer_email}
                  onChange={(e) => setModifyData({ ...modifyData, new_committer_email: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_date" className="text-right">
                  Commit Date
                </Label>
                <Input
                  id="new_date"
                  type="datetime-local"
                  value={modifyData.new_date}
                  onChange={(e) => setModifyData({ ...modifyData, new_date: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_message" className="text-right">
                  Commit Message
                </Label>
                <Input
                  id="new_message"
                  value={modifyData.new_message}
                  onChange={(e) => setModifyData({ ...modifyData, new_message: e.target.value })}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}