'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const S = {
  blue: '#0066cc', blueLight: '#e8f0fb',
  text: '#1d1d1f', textMuted: '#6e6e73', textLight: '#aeaeb2',
  bg: '#f5f5f7', card: '#ffffff', border: '#e0e0e0',
};

export default function PreviewClient() {
  const params = useSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = params.get('data');
      if (!raw) return;
      setRecipe(JSON.parse(atob(raw)));
    } catch {}
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!recipe) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: S.text, marginBottom: '6px' }}>레시피를 찾을 수 없어요</p>
        <p style={{ fontSize: '14px', color: S.textMuted }}>링크가 올바르지 않아요</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: S.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: S.text }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px 40px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.4px' }}>
            Reel<span style={{ color: S.blue }}>Recipe</span>
          </span>
          <button onClick={copyLink}
            style={{ background: copied ? S.blueLight : S.card, color: copied ? S.blue : S.text, border: `1px solid ${copied ? S.blue : S.border}`, borderRadius: '9999px', padding: '7px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '복사됨 ✓' : '🔗 링크 복사'}
          </button>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', overflow: 'hidden', marginBottom: '16px' }}>
          {recipe.thumbnail_url && (
            <img src={recipe.thumbnail_url} alt={recipe.title}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ padding: '20px' }}>
            {recipe.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {recipe.tags.map((tag: string) => (
                  <span key={tag} style={{ background: S.blueLight, color: S.blue, borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            )}
            <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: '20px' }}>{recipe.title}</h2>

            <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>재료</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {recipe.ingredients?.map((ing: string, i: number) => (
                <span key={i} style={{ background: S.bg, color: S.text, border: `1px solid ${S.border}`, borderRadius: '9999px', padding: '5px 12px', fontSize: '13px' }}>{ing}</span>
              ))}
            </div>

            <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>조리 순서</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recipe.steps?.map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', borderRadius: '12px', background: S.bg }}>
                  <div style={{ minWidth: '22px', height: '22px', background: S.blue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, paddingTop: '1px' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: S.textMuted, marginBottom: '4px' }}>나만의 레시피북을 만들고 싶다면?</p>
          <p style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px' }}>Reel<span style={{ color: S.blue }}>Recipe</span>로 시작해봐요</p>
          <a href="https://reelrecipe-xluo.vercel.app"
            style={{ display: 'block', background: S.blue, color: '#fff', borderRadius: '9999px', padding: '13px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', letterSpacing: '-0.3px' }}>
            무료로 시작하기 →
          </a>
        </div>
      </div>
    </main>
  );
}
