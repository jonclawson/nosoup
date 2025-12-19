'use client'
import dynamic from 'next/dynamic';
// export const dynamic = 'force-dynamic'
const NewArticle = dynamic(() => import('./NewArticle'), { ssr: false });

export default function NewArticlePage() {
  return <NewArticle />;
}
