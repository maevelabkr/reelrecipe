'use client';
import { useState, useEffect, use } from 'react';
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

export default function ShareClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from('recipes').select('*').eq('id', id).single().then(({ data }) => {
      setRecipe(data);
      setLoading(false);
    });
  }, [id]);

  async function saveSelected() {
    if (!recipe) return;
    setSaving(true);
    const steps = selected.length > 0 ? selected.map(i => recipe.steps[i]) : recipe.steps;
    await supabase.from('recipes').insert({
      url: recipe.url, platform: recipe.platform,
      title: recipe.title, ingredients: recipe.ingredients,
      steps, thumbnail_url: recipe.thumbnail_url,
      tags: recipe.tags, bookmarked: false,
    });
    setSaving(false);
    setSaved(true);
  }

  async function saveAll() {
    if (!recipe) return;
    setSaving(true);
    await supabase.from('recipes').insert({
      url: recipe.url, platform: recipe.platform,
      title: recipe.title, ingredients: recipe.ingredients,
      steps: recipe.steps, thumbnail_url: recipe.thumbnail_url,
      tags: recipe.tags, bookmarked: false,
    });
    setSaving(false);
    setSaved(true);
  }

  function toggleStep(i: number) {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (!recipe) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
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

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', overflow: 'hidden', marginBottom: '16px' }}>
          {recipe.thumbnail_url && (
            <img src={recipe.thumbnail_url} alt={recipe.title}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ padding: '20px' }}>
            {recipe.tags && recipe.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {recipe.tags.map((tag: string) => (
                  <span key={tag} style={{ background: S.blueLight, color: S.blue, borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: '20px' }}>
              {recipe.title}
            </h2>

            <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>재료</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {recipe.ingredients?.map((ing: string, i: number) => (
                <span key={i} style={{ background: S.bg, color: S.text, border: `1px solid ${S.border}`, borderRadius: '9999px', padding: '5px 12px', fontSize: '13px' }}>
                  {ing}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>조리 순서</p>
              <p style={{ fontSize: '12px', color: S.textLight }}>저장할 단계를 선택할 수 있어요</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recipe.steps?.map((step: string, i: number) => {
                const isSelected = selected.includes(i);
                return (
                  <div key={i} onClick={() => toggleStep(i)}
                    style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', padding: '10px 12px', borderRadius: '12px', background: isSelected ? S.blueLight : S.bg, border: `1px solid ${isSelected ? S.blue : 'transparent'}`, transition: 'all 0.15s' }}>
                    <div style={{ minWidth: '22px', height: '22px', background: isSelected ? S.blue : S.border, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: isSelected ? '#fff' : S.textMuted, fontWeight: 700, flexShrink: 0, transition: 'all 0.15s' }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, paddingTop: '1px', color: S.text }}>{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {saved ? (
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
            <p style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', marginBottom: '4px' }}>저장됐어요!</p>
            <p style={{ fontSize: '14px', color: S.textMuted, marginBottom: '20px' }}>내 ReelRecipe에서 확인해봐요</p>
            <a href="https://reelrecipe-xluo.vercel.app"
              style={{ display: 'block', background: S.blue, color: '#fff', borderRadius: '9999px', padding: '13px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', textAlign: 'center', letterSpacing: '-0.3px' }}>
              내 ReelRecipe 열기 →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={saveAll} disabled={saving}
              style={{ background: S.blue, color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1, letterSpacing: '-0.3px', transition: 'opacity 0.15s' }}>
              {saving ? '저장 중...' : '전체 저장하기'}
            </button>
            <button onClick={saveSelected} disabled={saving || selected.length === 0}
              style={{ background: S.card, color: selected.length > 0 ? S.blue : S.textLight, border: `1px solid ${selected.length > 0 ? S.blue : S.border}`, borderRadius: '9999px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: selected.length > 0 ? 'pointer' : 'default', opacity: (saving || selected.length === 0) ? 0.5 : 1, letterSpacing: '-0.3px', transition: 'all 0.15s' }}>
              {selected.length > 0 ? `선택한 ${selected.length}단계만 저장` : '단계 선택 후 저장 가능'}
            </button>
            <a href="https://reelrecipe-xluo.vercel.app"
              style={{ display: 'block', background: 'transparent', color: S.textMuted, borderRadius: '9999px', padding: '13px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', textAlign: 'center', letterSpacing: '-0.3px' }}>
              나도 내 레시피북 만들러 가기 →
            </a>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
