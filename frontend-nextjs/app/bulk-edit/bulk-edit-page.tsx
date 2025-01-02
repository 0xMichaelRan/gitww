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

// Mock data for selected commits
const selectedCommits = [
  { id: 1, hash: 'a1b2c3d', message: 'Initial commit', author: 'Alice', date: '2023-04-01T12:00:00' },
  { id: 2, hash: 'e4f5g6h', message: 'Add new feature', author: 'Bob', date: '2023-04-02T14:30:00' },
  { id: 3, hash: 'i7j8k9l', message: 'Fix bug in login', author: 'Charlie', date: '2023-04-03T09:15:00' },
]

export default function BulkEditPage() {
  const [commits, setCommits] = React.useState(selectedCommits)
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()

  const handleDateChange = (id: number, newDate: string) => {
    setCommits(commits.map(commit =>
      commit.id === id ? { ...commit, date: newDate } : commit
    ))
  }

  const generateRandomDates = () => {
    if (!startDate || !endDate) return

    const newCommits = commits.map(commit => {
      const randomTimestamp = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      ).toISOString()
      return { ...commit, date: randomTimestamp }
    })

    setCommits(newCommits)
  }

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
          <Button onClick={() => console.log('Modify Committer')}>
            Committer
          </Button>
          <Button onClick={() => console.log('Modify Author')}>
            Author
          </Button>
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
                  <tr key={commit.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-pink-50'}>
                    <td className="p-2 w-1/3">
                      <div className="font-mono text-xs">{commit.hash}</div>
                      <div className="text-xs truncate">{commit.message}</div>
                    </td>
                    <td className="p-2 w-1/3">
                      <div className="text-xs">Author: {commit.author}</div>
                      <div className="text-xs">Committer: {commit.author}</div>
                    </td>
                    <td className="p-2 w-1/3">
                      <div className="text-xs">Old: {new Date(commit.date).toLocaleString()}</div>
                      <div>
                        <Input
                          type="datetime-local"
                          value={commit.date.slice(0, 16)}
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