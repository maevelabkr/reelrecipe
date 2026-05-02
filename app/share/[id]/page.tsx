'use client';
import dynamic from 'next/dynamic';

const ShareClient = dynamic(() => import('./ShareClient'), { ssr: false });

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  return <ShareClient params={params} />;
}
