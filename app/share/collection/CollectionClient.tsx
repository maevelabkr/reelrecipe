'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

const S = {
  blue: '#0066cc',
  blueLight: '#e8f0fb',
  text: '#1d1d1f',
  textMuted: '#6e6e73',
  textLight: '#aeaeb2',
  bg: '#f5f5f7',
  card: '#ffffff',
  border: '#e0e0e0',
};

function CollectionShareContent() {
  const params = useSearchParams();
  const ids = params.get('ids')?.split(',').filter(Boolean) ?? [];
  const name = params.get('name') ?? '공유된 식단';

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    supabase.from('recipes').select('*').in('id', ids).then(({ data }) => {
      setRecipes(data ?? []);
      setLoading(false);
    });
  }, []);

  async function saveRecipe(r: any) {
    await supabase.from('recipes').insert({
      url: r.url, platform: r.platform, title: r.title,
      ingredients: r.ingredients, steps: r.steps,
      thumbnail_url: r.thumbnail_url, tags: r.tags, bookmarked: false,
    });
    setSavedIds(prev => [...prev, r.id]);
  }

  async function saveAll() {
    setSavingAll(true);
    for (const r of recipes) {
      if (!savedIds.includes(r.id)) await saveRecipe(r);
    }
    setSavingAll(false);
    setAllSaved(true);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: `3px solid ${S.border}`, borderTopColor: S.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '14px', color: S.textMuted }}>불러오는 중...</p>
      </div>
    </main>
  );

  if (recipes.length === 0) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: S.text, marginBottom: '6px' }}>레시피를 찾을 수 없어요</p>
        <p style={{ fontSize: '14px', color: S.textMuted }}>링크가 만료됐거나 잘못된 주소예요</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: S.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: S.text }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.4px' }}>
            Reel<span style={{ color: S.blue }}>Recipe</span>
          </span>
          <button
            onClick={copyLink}
            style={{
              background: copied ? S.blueLight : S.card,
              color: copied ? S.blue : S.text,
              border: `1px solid ${copied ? S.blue : S.border}`,
              borderRadius: '9999px', padding: '7px 14px',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '복사됨 ✓' : '🔗 링크 복사'}
          </button>
        </div>

        {/* 식단 제목 섹션 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: S.text }}>
              {decodeURIComponent(name)}
            </h1>
            <span style={{
              background: S.blueLight, color: S.blue,
              borderRadius: '9999px', padding: '3px 10px',
              fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {recipes.length}개
            </span>
          </div>
          <p style={{ fontSize: '14px', color: S.textMuted }}>
            누군가가 이 식단을 공유했어요 · 내 레시피에 바로 저장할 수 있어요
          </p>
        </div>

        {/* 전체 저장 / 저장 완료 섹션 */}
        {allSaved ? (
          <div style={{
            background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px',
            padding: '24px', textAlign: 'center', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
            <p style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', marginBottom: '4px' }}>전체 저장됐어요!</p>
            <p style={{ fontSize: '14px', color: S.textMuted, marginBottom: '20px' }}>내 ReelRecipe에서 확인해봐요</p>
            <a
              href="https://reelrecipe-xluo.vercel.app"
              style={{
                display: 'block', background: S.blue, color: '#fff',
                borderRadius: '9999px', padding: '13px',
                fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                textAlign: 'center', letterSpacing: '-0.3px',
              }}
            >
              내 ReelRecipe 열기 →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={saveAll}
              disabled={savingAll}
              style={{
                flex: 1, background: S.blue, color: '#fff', border: 'none',
                borderRadius: '9999px', padding: '13px',
                fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                opacity: savingAll ? 0.5 : 1, letterSpacing: '-0.3px',
                transition: 'opacity 0.15s',
              }}
            >
              {savingAll ? '저장 중...' : `전체 저장 (${recipes.length}개)`}
            </button>
            <a
              href="https://reelrecipe-xluo.vercel.app"
              style={{
                flex: 1, background: S.card, color: S.text,
                border: `1px solid ${S.border}`,
                borderRadius: '9999px', padding: '13px',
                fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '-0.3px',
              }}
            >
              나도 만들러 가기
            </a>
          </div>
        )}

        {/* 레시피 카드 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recipes.map((r) => {
            const isExpanded = expandedId === r.id;
            const isSaved = savedIds.includes(r.id);

            return (
              <div
                key={r.id}
                style={{
                  background: S.card, border: `1px solid ${S.border}`,
                  borderRadius: '18px', overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* 카드 헤더 */}
                <div
                  style={{ display: 'flex', gap: '12px', padding: '16px', cursor: 'pointer', alignItems: 'flex-start' }}
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  {r.thumbnail_url ? (
                    <img
                      src={r.thumbnail_url} alt={r.title}
                      style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '12px',
                      background: S.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0,
                    }}>🍳</div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.3px', marginBottom: '6px', lineHeight: 1.3 }}>
                      {r.title}
                    </p>
                    {r.tags && r.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                        {r.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} style={{
                            background: S.blueLight, color: S.blue,
                            borderRadius: '9999px', padding: '2px 9px', fontSize: '11px', fontWeight: 500,
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {!allSaved && (
                      <button
                        onClick={e => { e.stopPropagation(); saveRecipe(r); }}
                        disabled={isSaved}
                        style={{
                          background: isSaved ? S.bg : S.blueLight,
                          color: isSaved ? S.textLight : S.blue,
                          border: `1px solid ${isSaved ? S.border : 'transparent'}`,
                          borderRadius: '9999px', padding: '5px 12px',
                          fontSize: '12px', fontWeight: 500,
                          cursor: isSaved ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isSaved ? '저장됨 ✓' : '저장'}
                      </button>
                    )}
                  </div>

                  <span style={{
                    color: S.textLight, fontSize: '11px', alignSelf: 'center',
                    transition: 'transform 0.2s', display: 'inline-block',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                </div>

                {/* 펼쳐진 상세 내용 */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${S.bg}`, padding: '16px' }}>
                    {/* 재료 */}
                    <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      재료
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {r.ingredients?.map((ing: string, i: number) => (
                        <span key={i} style={{
                          background: S.bg, color: S.text,
                          border: `1px solid ${S.border}`,
                          borderRadius: '9999px', padding: '5px 12px', fontSize: '13px',
                        }}>
                          {ing}
                        </span>
                      ))}
                    </div>

                    {/* 조리 순서 */}
                    <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                      조리 순서
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {r.steps?.map((step: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            minWidth: '22px', height: '22px',
                            background: S.blue, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', color: '#fff', fontWeight: 700, flexShrink: 0,
                          }}>
                            {i + 1}
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, paddingTop: '2px', color: S.text }}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 브랜드 배너 */}
        <div style={{
          marginTop: '32px', background: S.card, border: `1px solid ${S.border}`,
          borderRadius: '18px', padding: '20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: S.textMuted, marginBottom: '4px' }}>
            나만의 레시피북을 만들고 싶다면?
          </p>
          <p style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px', color: S.text }}>
            Reel<span style={{ color: S.blue }}>Recipe</span>로 시작해봐요
          </p>
          <a
            href="https://reelrecipe-xluo.vercel.app"
            style={{
              display: 'block', background: S.blue, color: '#fff',
              borderRadius: '9999px', padding: '13px',
              fontSize: '15px', fontWeight: 500, textDecoration: 'none',
              letterSpacing: '-0.3px',
            }}
          >
            무료로 시작하기 →
          </a>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function CollectionClient() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e0e0e0', borderTopColor: '#0066cc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </main>
    }>
      <CollectionShareContent />
    </Suspense>
  );
}
