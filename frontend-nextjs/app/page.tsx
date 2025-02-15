"use client";
import GitwwInterface from './gitww-interface'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  // This function will be called by GitwwInterface when user selects commits and clicks "Bulk Edit"
  const handleBulkEdit = (selectedCommits: any[]) => {
    // Store in window for cross-page access (as fallback)
    if (typeof window !== 'undefined') {
      (window as any).selectedCommits = selectedCommits;
    }
    // Also pass via query param for SSR/refresh safety
    const commitsParam = encodeURIComponent(JSON.stringify(selectedCommits));
    router.push(`/bulk-edit?commits=${commitsParam}`);
  };

  return <GitwwInterface onBulkEdit={handleBulkEdit} />;
}