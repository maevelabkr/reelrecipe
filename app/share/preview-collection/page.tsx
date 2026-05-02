'use client';
import dynamic from 'next/dynamic';

const PreviewCollectionClient = dynamic(() => import('./PreviewCollectionClient'), { ssr: false });

export default function PreviewCollectionPage() {
  return <PreviewCollectionClient />;
}
