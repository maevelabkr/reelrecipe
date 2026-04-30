'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const S = {
  orange: '#FF5100',
  orangeLight: '#FFF0EB',
  text: '#0F0F0F',
  textMuted: '#888888',
  bg: '#F9F7F5',
  card: 'rgba(255,255,255,0.72)',
  border: 'rgba(0,0,0,0.08)',
};

export default function CollectionPage({ params }: { params: { id: string } }) {
  const [collection, setCollection] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: col } = await supabase.from('collections').select('*').eq('id', params.id).single();
      const { data: recs } = await supabase.from('recipes').select('*').eq('collection_id', params.id);
      setCollection(col);
      setRecipes(recs || []);
      setLoading(false);
    }
    load();
  }, [params.id]);

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
    alert('링크가 복사됐어요!');
  }

  if (loading) return (
    <main style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{fontSize:'2rem'}} className="animate-spin">🍳</div>
    </main>
  );

  if (!collection) return (
    <main style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <p style={{color:S.textMuted}}>컬렉션을 찾을 수 없어요</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:S.bg,maxWidth:'480px',margin:'0 auto',padding:'20px 16px',fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',color:S.text}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
        <h1 style={{fontSize:'22px',fontWeight:700,letterSpacing:'-0.5px'}}>
          Reel<span style={{color:S.orange}}>Recipe</span>
        </h1>
        <button onClick={copyLink} style={{background:'rgba(0,0,0,0.05)',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'13px',fontWeight:500,cursor:'pointer',color:S.text}}>
          🔗 링크 복사
        </button>
      </div>

      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'4px'}}>{collection.name}</h2>
        <p style={{fontSize:'13px',color:S.textMuted}}>레시피 {recipes.length}개</p>
      </div>

      {allSaved ? (
        <div style={{background:S.card,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`0.5px solid ${S.border}`,borderRadius:'20px',padding:'24px',textAlign:'center',marginBottom:'16px'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'8px'}}>🎉</div>
          <p style={{fontWeight:600,fontSize:'16px',marginBottom:'4px'}}>전체 저장됐어요!</p>
          <p style={{fontSize:'13px',color:S.textMuted,marginBottom:'16px'}}>내 레시피에서 확인해봐요</p>
          <a href="https://reelrecipe-xluo.vercel.app" style={{display:'block',background:S.orange,color:'#fff',borderRadius:'14px',padding:'14px',fontSize:'14px',fontWeight:500,textDecoration:'none',textAlign:'center'}}>
            나도 ReelRecipe 시작하기 →
          </a>
        </div>
      ) : (
        <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
          <button onClick={saveAll} disabled={savingAll} style={{flex:1,background:S.orange,color:'#fff',border:'none',borderRadius:'14px',padding:'12px',fontSize:'13px',fontWeight:500,cursor:'pointer',opacity:savingAll?0.5:1}}>
            {savingAll ? '저장 중...' : `전체 저장 (${recipes.length}개)`}
          </button>
          <a href="https://reelrecipe-xluo.vercel.app" style={{flex:1,background:'rgba(0,0,0,0.05)',color:S.text,border:'none',borderRadius:'14px',padding:'12px',fontSize:'13px',fontWeight:500,cursor:'pointer',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
            나도 만들러 가기 →
          </a>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {recipes.map(r => (
          <div key={r.id} style={{background:S.card,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`0.5px solid ${S.border}`,borderRadius:'20px',padding:'16px'}}>
            <div style={{display:'flex',gap:'12px',cursor:'pointer'}} onClick={() => setExpandedId(expandedId===r.id ? null : r.id)}>
              {r.thumbnail_url
                ? <img src={r.thumbnail_url} alt={r.title} style={{width:'64px',height:'64px',borderRadius:'12px',objectFit:'cover',flexShrink:0}} />
                : <div style={{width:'64px',height:'64px',borderRadius:'12px',background:'rgba(255,81,0,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0}}>🍳</div>
              }
              <div style={{flex:1}}>
                <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'6px'}}>{r.title}</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'8px'}}>
                  {r.tags?.map((t: string) => (
                    <span key={t} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'2px 8px',fontSize:'11px'}}>{t}</span>
                  ))}
                </div>
                {!allSaved && (
                  <button
                    onClick={e => { e.stopPropagation(); saveRecipe(r); }}
                    disabled={savedIds.includes(r.id)}
                    style={{background: savedIds.includes(r.id) ? 'rgba(0,0,0,0.05)' : S.orangeLight, color: savedIds.includes(r.id) ? S.textMuted : S.orange, border:'none', borderRadius:'8px', padding:'5px 12px', fontSize:'12px', fontWeight:500, cursor: savedIds.includes(r.id) ? 'default' : 'pointer'}}
                  >
                    {savedIds.includes(r.id) ? '저장됨 ✓' : '저장'}
                  </button>
                )}
              </div>
              <span style={{color:S.textMuted,fontSize:'12px',alignSelf:'center'}}>{expandedId===r.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === r.id && (
              <div style={{marginTop:'16px',borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>재료</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                  {r.ingredients?.map((ing: string, i: number) => (
                    <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                  ))}
                </div>
                <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>조리 순서</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {r.steps?.map((step: string, i: number) => (
                    <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                      <div style={{minWidth:'24px',height:'24px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                      <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}