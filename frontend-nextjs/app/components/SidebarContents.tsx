'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, FolderOpen, Settings } from 'lucide-react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Mock data for recently opened repos
const recentRepos = [
  { id: 1, name: 'project-alpha' },
  { id: 2, name: 'awesome-app' },
  { id: 3, name: 'secret-experiment' },
];

export function SidebarContents() {
  const handleDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const directory = event.target.files?.[0].path;
    if (directory) {
      localStorage.setItem('masterDirectory', directory);
    }
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Recent Repositories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {recentRepos.map(repo => (
              <SidebarMenuItem key={repo.id}>
                <SidebarMenuButton>
                  <GitBranch className="mr-2 h-4 w-4" />
                  {repo.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <input 
                type="file" 
                webkitdirectory="true" 
                className="hidden" 
                id="directory-picker" 
                onChange={handleDirectoryChange} 
              />
              <SidebarMenuButton onClick={() => document.getElementById('directory-picker')?.click()}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Open Repository
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/config" passHref>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  Config
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
} 