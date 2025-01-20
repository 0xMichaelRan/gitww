'use client'

import * as React from 'react'
import { Book, GitBranch, FolderOpen, Settings, Edit, Save, Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

// Mock data for editable text and code snippets
const initialSnippets = [
  { id: 1, title: 'Git Configuration', content: '# Set your username\ngit config --global user.name "Your Name"\n\n# Set your email\ngit config --global user.email "your.email@example.com"' },
  { id: 2, title: 'Common Git Commands', content: '# Initialize a new repository\ngit init\n\n# Add files to staging\ngit add .\n\n# Commit changes\ngit commit -m "Your commit message"' },
  { id: 3, title: 'Branching', content: '# Create a new branch\ngit branch new-feature\n\n# Switch to the new branch\ngit checkout new-feature\n\n# Create and switch in one command\ngit checkout -b another-feature' },
]

export default function ConfigPage() {
  const [masterDirectory, setMasterDirectory] = React.useState('/path/to/repos')
  const [defaultUsername, setDefaultUsername] = React.useState('John Doe')
  const [defaultEmail, setDefaultEmail] = React.useState('john.doe@example.com')
  const [snippets, setSnippets] = React.useState(initialSnippets)
  const [editingSnippet, setEditingSnippet] = React.useState<number | null>(null)
  const [nextSnippetId, setNextSnippetId] = React.useState(4)

  const handleSnippetEdit = (id: number) => {
    setEditingSnippet(id)
  }

  const handleSnippetSave = (id: number, newContent: string) => {
    setSnippets(snippets.map(snippet =>
      snippet.id === id ? { ...snippet, content: newContent } : snippet
    ))
    setEditingSnippet(null)
  }

  const addSnippet = () => {
    const newSnippet = { id: nextSnippetId, title: 'New Snippet', content: '# Add your code here' }
    setSnippets([...snippets, newSnippet])
    setNextSnippetId(nextSnippetId + 1)
  }

  const removeSnippet = (id: number) => {
    setSnippets(snippets.filter(snippet => snippet.id !== id))
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Configuration</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Repository Settings</CardTitle>
            <CardDescription>Configure your global repository settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="master-directory">Master Directory</Label>
              <Input
                id="master-directory"
                value={masterDirectory}
                onChange={(e) => setMasterDirectory(e.target.value)}
                placeholder="Enter the path to your repositories"
              />
            </div>
            <Button onClick={() => console.log('Save repository settings')}>Save Repository Settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Configure your global user settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-username">Default Username</Label>
              <Input
                id="default-username"
                value={defaultUsername}
                onChange={(e) => setDefaultUsername(e.target.value)}
                placeholder="Enter your default Git username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-email">Default Email</Label>
              <Input
                id="default-email"
                value={defaultEmail}
                onChange={(e) => setDefaultEmail(e.target.value)}
                placeholder="Enter your default Git email"
              />
            </div>
            <Button onClick={() => console.log('Save user settings')}>Save User Settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Snippets and Documentation</CardTitle>
            <CardDescription>Edit helpful snippets and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {snippets.map(snippet => (
                <div key={snippet.id} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      value={snippet.title}
                      onChange={(e) => {
                        const newSnippets = snippets.map(s =>
                          s.id === snippet.id ? { ...s, title: e.target.value } : s
                        )
                        setSnippets(newSnippets)
                      }}
                      className="text-lg font-semibold"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeSnippet(snippet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingSnippet === snippet.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={snippet.content}
                        onChange={(e) => {
                          const newSnippets = snippets.map(s =>
                            s.id === snippet.id ? { ...s, content: e.target.value } : s
                          )
                          setSnippets(newSnippets)
                        }}
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <Button onClick={() => setEditingSnippet(null)}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        <code>{snippet.content}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditingSnippet(snippet.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <Button onClick={addSnippet} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add New Snippet
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}