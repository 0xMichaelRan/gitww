'use client'

import * as React from 'react'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import Link from 'next/link'

import { useRouter, useSearchParams } from 'next/navigation'

export default function BulkEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get commits from router state, searchParams, or window.selectedCommits
  let initialCommits: any[] = [];
  try {
    const commitsParam = searchParams.get('commits');
    if (commitsParam) {
      initialCommits = JSON.parse(decodeURIComponent(commitsParam));
    } else if (typeof window !== 'undefined' && (window as any).selectedCommits) {
      initialCommits = (window as any).selectedCommits;
    }
  } catch (e) {
    // fallback to empty
  }

  const [commits, setCommits] = React.useState(initialCommits);

  // If no commits, show error/empty state
  React.useEffect(() => {
    if (!commits || commits.length === 0) {
      setError('No commits selected. Please select commits from the previous page.');
    }
  }, [commits]);
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const handleDateChange = (id: number, newDate: string) => {
    setCommits(commits.map(commit =>
      commit.id === id ? { ...commit, date: newDate } : commit
    ));
  };

  const generateRandomDates = () => {
    if (!startDate || !endDate) return;
    const newCommits = commits.map(commit => {
      const randomTimestamp = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );
      // Format the date in the format expected by git: "YYYY-MM-DD HH:mm:ss +0000"
      const formattedDate = randomTimestamp.toISOString()
        .replace('T', ' ')
        .replace('Z', ' +0000')
        .slice(0, 19);
      return { ...commit, date: formattedDate };
    });
    setCommits(newCommits);
  };

  const handleCommitter = async () => {
    setLoading(true); setError(null);
    try {
      if (!commits || commits.length === 0) {
        throw new Error('No commits selected');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bulk-edit/change-committer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_path: process.env.NEXT_PUBLIC_REPO_PATH || '',
          command: 'git filter-branch -f --env-filter "export GIT_COMMITTER_NAME=\'$(git config user.name)\'; export GIT_COMMITTER_EMAIL=\'$(git config user.email)\'; export GIT_COMMITTER_DATE=\'$(git show -s --format=%cD $GIT_COMMIT)\'" -- --all'
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setError(e.message || 'Error running committer command');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthor = async () => {
    setLoading(true); setError(null);
    try {
      if (!commits || commits.length === 0) {
        throw new Error('No commits selected');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bulk-edit/change-author`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_path: process.env.NEXT_PUBLIC_REPO_PATH || '',
          command: 'git filter-branch -f --env-filter "export GIT_AUTHOR_NAME=\'$(git config user.name)\'; export GIT_AUTHOR_EMAIL=\'$(git config user.email)\'; export GIT_AUTHOR_DATE=\'$(git show -s --format=%aD $GIT_COMMIT)\'" -- --all'
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setError(e.message || 'Error running author command');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Bulk Edit</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={generateRandomDates} disabled={!startDate || !endDate}>
            Randomize
          </Button>
          <Button onClick={handleCommitter} disabled={loading}>
            {loading ? 'Running...' : 'Committer'}
          </Button>
          <Button onClick={handleAuthor} disabled={loading}>
            {loading ? 'Running...' : 'Author'}
          </Button>
          {error && <span className="text-red-500 ml-4">{error}</span>}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selected Commits</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)] w-full rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {commits.map((commit, index) => (
                  <tr key={commit.hash || index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-pink-50'}>
                    <td className="p-2 w-1/3">
                      <div className="font-mono text-xs">{commit.hash}</div>
                      <div className="text-xs truncate">{commit.message}</div>
                    </td>
                    <td className="p-2 w-1/3">
                      <div className="text-xs">Author: {commit.author_name || commit.author || ''}</div>
<div className="text-xs">Committer: {commit.committer_name || commit.author || ''}</div>
                    </td>
                    <td className="p-2 w-1/3">
                      <div className="text-xs">Old: {commit.date ? new Date(commit.date).toLocaleString() : ''}</div>
                      <div>
                        <Input
                          type="datetime-local"
                          value={commit.date.length > 16 ? commit.date.slice(0, 16) : commit.date}
                          onChange={(e) => handleDateChange(commit.id, e.target.value)}
                          className="w-full text-xs p-1 h-7"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button onClick={() => console.log('Save changes', commits)}>
          Confirm Changes
        </Button>
      </div>
    </main>
  )
}