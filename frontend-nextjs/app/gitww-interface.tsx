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

// Mock data for commits
const commits = [
  { id: 1, hash: 'a1b2c3d', message: 'Initial commit', author: 'Alice', date: '2023-04-01' },
  { id: 2, hash: 'e4f5g6h', message: 'Add new feature', author: 'Bob', date: '2023-04-02' },
  { id: 3, hash: 'i7j8k9l', message: 'Fix bug in login', author: 'Charlie', date: '2023-04-03' },
  { id: 4, hash: 'm1n2o3p', message: 'Update documentation', author: 'David', date: '2023-04-04' },
  { id: 5, hash: 'q4r5s6t', message: 'Refactor code', author: 'Eve', date: '2023-04-05' },
]

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
  const [commits, setCommits] = React.useState([]);
  const [selectedCommits, setSelectedCommits] = React.useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null)
  const [isModifyDialogOpen, setIsModifyDialogOpen] = React.useState(false)
  const [modifyData, setModifyData] = React.useState({
    commit_sha: '',
    new_author_name: '',
    new_author_email: '',
    new_committer_name: '',
    new_committer_email: '',
    new_date: ''
  })

  React.useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch("http://localhost:8000/commits/?repo_path=~/hub/gitww-monorepo/backend-fastapi/fake_repo");
        const data = await response.json();
        const formattedCommits = data.map((commit: any, index: number) => ({
          id: index + 1,
          hash: commit.sha,
          message: commit.message,
          author: commit.author.split(' <')[0], // Extracting name from "Name <email>"
          date: new Date(commit.date).toISOString().split('T')[0] // Formatting date
        }));
        setCommits(formattedCommits);
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
      const selectedCommit = commits[selectedCommits[0]]
      setModifyData({
        commit_sha: selectedCommit.hash,
        new_author_name: '',
        new_author_email: '',
        new_committer_name: '',
        new_committer_email: '',
        new_date: selectedCommit.date
      })
      setIsModifyDialogOpen(true)
    }
  }

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Modified commit data:', modifyData)
    setIsModifyDialogOpen(false)
    // Here you would typically send this data to your backend to actually modify the commit
  }

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
            <Button variant="outline" onClick={handleModifyClick} disabled={selectedCommits.length !== 1}>
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
            {commits.map((commit, index) => (
              <div
                key={commit.id}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  selectedCommits.includes(index) ? 'bg-primary/10' : 'hover:bg-muted'
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
          <div className="grid grid-cols-52 gap-1">
            {contributionsData.map((day, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 ${getContributionColor(day.count)}`}
                      aria-label={`${day.count} contributions on ${day.date}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{day.count} contributions on {day.date}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
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
                  onChange={(e) => setModifyData({ ...modifyData, commit_sha: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_author_name" className="text-right">
                  New Author Name
                </Label>
                <Input
                  id="new_author_name"
                  value={modifyData.new_author_name}
                  onChange={(e) => setModifyData({ ...modifyData, new_author_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_author_email" className="text-right">
                  New Author Email
                </Label>
                <Input
                  id="new_author_email"
                  value={modifyData.new_author_email}
                  onChange={(e) => setModifyData({ ...modifyData, new_author_email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_committer_name" className="text-right">
                  New Committer Name
                </Label>
                <Input
                  id="new_committer_name"
                  value={modifyData.new_committer_name}
                  onChange={(e) => setModifyData({ ...modifyData, new_committer_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_committer_email" className="text-right">
                  New Committer Email
                </Label>
                <Input
                  id="new_committer_email"
                  value={modifyData.new_committer_email}
                  onChange={(e) => setModifyData({ ...modifyData, new_committer_email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_date" className="text-right">
                  New Date
                </Label>
                <Input
                  id="new_date"
                  type="datetime-local"
                  value={modifyData.new_date}
                  onChange={(e) => setModifyData({ ...modifyData, new_date: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}