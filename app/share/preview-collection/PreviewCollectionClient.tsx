'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const S = {
  blue: '#0066cc', blueLight: '#e8f0fb',
  text: '#1d1d1f', textMuted: '#6e6e73', textLight: '#aeaeb2',
  bg: '#f5f5f7', card: '#ffffff', border: '#e0e0e0',
};

export default function PreviewCollectionClient() {
  const params = useSearchParams();
  const [name, setName] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = params.get('data');
      if (!raw) return;
      const parsed = JSON.parse(decodeURIComponent(raw));
      setName(parsed.name ?? '공유된 식단');
      setRecipes(parsed.recipes ?? []);
    } catch {}
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (recipes.length === 0) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: S.text }}>레시피를 찾을 수 없어요</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: S.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: S.text }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px 40px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.4px' }}>Reel<span style={{ color: S.blue }}>Recipe</span></span>
          <button onClick={copyLink}
            style={{ background: copied ? S.blueLight : S.card, color: copied ? S.blue : S.text, border: `1px solid ${copied ? S.blue : S.border}`, borderRadius: '9999px', padding: '7px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '복사됨 ✓' : '🔗 링크 복사'}
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>{name}</h1>
            <span style={{ background: S.blueLight, color: S.blue, borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>{recipes.length}개</span>
          </div>
          <p style={{ fontSize: '14px', color: S.textMuted }}>누군가가 이 식단을 공유했어요</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {recipes.map((r, idx) => {
            const isExpanded = expandedId === (r.id ?? String(idx));
            return (
              <div key={r.id ?? idx} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '12px', padding: '16px', cursor: 'pointer', alignItems: 'flex-start' }}
                  onClick={() => setExpandedId(isExpanded ? null : (r.id ?? String(idx)))}>
                  {r.thumbnail_url
                    ? <img src={r.thumbnail_url} alt={r.title} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>🍳</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.3px', marginBottom: '6px' }}>{r.title}</p>
                    {r.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {r.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} style={{ background: S.blueLight, color: S.blue, borderRadius: '9999px', padding: '2px 9px', fontSize: '11px', fontWeight: 500 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ color: S.textLight, fontSize: '11px', alignSelf: 'center', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${S.bg}`, padding: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>재료</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {r.ingredients?.map((ing: string, i: number) => (
                        <span key={i} style={{ background: S.bg, color: S.text, border: `1px solid ${S.border}`, borderRadius: '9999px', padding: '5px 12px', fontSize: '13px' }}>{ing}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>조리 순서</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {r.steps?.map((step: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ minWidth: '22px', height: '22px', background: S.blue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                          <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, paddingTop: '2px' }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
