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

export default function SharePage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('recipes').select('*').eq('id', params.id).single();
      setRecipe(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

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
    alert('링크가 복사됐어요!');
  }

  function shareKakao() {
    const text = `${recipe.title} 레시피를 공유해요!\n${window.location.href}`;
    window.open(`https://www.kakaotalk.com/share?text=${encodeURIComponent(text)}`);
  }

  if (loading) return (
    <main style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{fontSize:'2rem'}} className="animate-spin">🍳</div>
    </main>
  );

  if (!recipe) return (
    <main style={{minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <p style={{color:S.textMuted}}>레시피를 찾을 수 없어요</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:S.bg,maxWidth:'480px',margin:'0 auto',padding:'20px 16px',fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',color:S.text}}>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:700,letterSpacing:'-0.5px'}}>
          Reel<span style={{color:S.orange}}>Recipe</span>
        </h1>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={copyLink} style={{background:'rgba(0,0,0,0.05)',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'13px',fontWeight:500,cursor:'pointer',color:S.text}}>
            🔗 링크 복사
          </button>
          <button onClick={shareKakao} style={{background:'#FEE500',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'13px',fontWeight:500,cursor:'pointer',color:'#3A1D1D'}}>
            카카오톡
          </button>
        </div>
      </div>

      <div style={{background:S.card,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`0.5px solid ${S.border}`,borderRadius:'20px',padding:'20px',marginBottom:'16px'}}>
        {recipe.thumbnail_url && (
          <img src={recipe.thumbnail_url} alt={recipe.title} style={{width:'100%',borderRadius:'14px',marginBottom:'16px',objectFit:'cover'}} />
        )}
        <h2 style={{fontSize:'18px',fontWeight:600,marginBottom:'16px'}}>{recipe.title}</h2>

        <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>재료</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
          {recipe.ingredients?.map((ing: string, i: number) => (
            <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
          ))}
        </div>

        <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>
          조리 순서 <span style={{color:S.textMuted,fontWeight:400,textTransform:'none'}}>(저장할 단계 선택 가능)</span>
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {recipe.steps?.map((step: string, i: number) => (
            <div key={i} onClick={() => toggleStep(i)}
              style={{display:'flex',gap:'12px',alignItems:'flex-start',cursor:'pointer',padding:'8px',borderRadius:'12px',background: selected.includes(i) ? 'rgba(255,81,0,0.06)' : 'transparent',border: selected.includes(i) ? `1px solid rgba(255,81,0,0.2)` : '1px solid transparent',transition:'all 0.15s'}}>
              <div style={{minWidth:'24px',height:'24px',background: selected.includes(i) ? S.orange : 'rgba(0,0,0,0.08)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color: selected.includes(i) ? '#fff' : S.textMuted,fontWeight:600,transition:'all 0.15s'}}>{i+1}</div>
              <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {saved ? (
        <div style={{background:S.card,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`0.5px solid ${S.border}`,borderRadius:'20px',padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'8px'}}>🎉</div>
          <p style={{fontWeight:600,fontSize:'16px',marginBottom:'4px'}}>저장됐어요!</p>
          <p style={{fontSize:'13px',color:S.textMuted,marginBottom:'16px'}}>내 레시피에서 확인해봐요</p>
          <a href="https://reelrecipe-xluo.vercel.app" style={{display:'block',background:S.orange,color:'#fff',borderRadius:'14px',padding:'14px',fontSize:'14px',fontWeight:500,textDecoration:'none',textAlign:'center'}}>
            나도 ReelRecipe 시작하기 →
          </a>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <button onClick={saveAll} disabled={saving}
            style={{background:S.orange,color:'#fff',border:'none',borderRadius:'14px',padding:'14px',fontSize:'14px',fontWeight:500,cursor:'pointer',opacity:saving?0.5:1}}>
            {saving ? '저장 중...' : '전체 저장하기'}
          </button>
          <button onClick={saveSelected} disabled={saving || selected.length === 0}
            style={{background:'rgba(0,0,0,0.05)',color:S.text,border:'none',borderRadius:'14px',padding:'14px',fontSize:'14px',fontWeight:500,cursor:'pointer',opacity:(saving||selected.length===0)?0.4:1}}>
            {selected.length > 0 ? `선택한 ${selected.length}단계만 저장` : '단계 선택 후 저장 가능'}
          </button>
          <a href="https://reelrecipe-xluo.vercel.app" style={{display:'block',background:'rgba(0,0,0,0.04)',color:S.text,borderRadius:'14px',padding:'14px',fontSize:'14px',fontWeight:500,textDecoration:'none',textAlign:'center'}}>
            나도 내 레시피 만들러 가기 →
          </a>
        </div>
      )}
    </main>
  );
}