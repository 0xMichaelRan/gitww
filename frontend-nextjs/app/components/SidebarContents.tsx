'use client';

import React, { useEffect, useState } from 'react';
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

export function SidebarContents() {
    const [recentRepos, setRecentRepos] = useState<string[]>([]);

    useEffect(() => {
        const fetchRecentRepos = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recent-repos/`);
                const data = await response.json();
                setRecentRepos(data);
            } catch (error) {
                console.error("Error fetching recent repos:", error);
            }
        };

        fetchRecentRepos();
    }, []); // Empty dependency array means this runs once on mount

    // Add state to track the selected directory
    const [selectedDirectory, setSelectedDirectory] = React.useState<string | null>(
        typeof window !== 'undefined' ? localStorage.getItem('masterDirectory') : null
    );

    const handleDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const directory = files[0].webkitRelativePath.split('/')[0];
            if (directory) {
                localStorage.setItem('masterDirectory', directory);
                setSelectedDirectory(directory); // Update state to trigger re-render
            }
        }
    };

    return (
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Repositories</SidebarGroupLabel>
                <SidebarGroupLabel>{selectedDirectory}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {recentRepos.map(repo => (
                            <SidebarMenuItem key={`${repo}-${Math.random()}`}>
                                <SidebarMenuButton>
                                    <GitBranch className="mr-2 h-4 w-4" />
                                    {repo.split('hub/')[1]?.replace(/\/$/, '')}
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