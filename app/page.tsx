'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';

const T = {
  ko: {
    extract: '추출', extracting: '분석 중...', add: '직접 추가', library: '내 레시피',
    placeholder: 'YouTube / TikTok URL 붙여넣기...', ingredients: '재료', steps: '조리 순서',
    newTag: '새 태그 입력...', save: '레시피 저장하기', saved: '레시피가 저장됐어요!',
    savedSub: '내 레시피에서 확인해봐요', goLibrary: '내 레시피 보러가기 →',
    addNew: '새로운 레시피 담으러 가기', aiExtract: 'AI로 레시피 정리하기',
    aiExtracting: 'AI가 정리 중...', foodName: '음식 이름', foodNamePlaceholder: '예: 김치찌개',
    stepsLabel: '조리 순서 (대충 써도 돼요)', stepsPlaceholder: '예) 돼지고기 볶다가 김치 넣고...',
    voice: '🎤 음성으로 말하기', voiceStop: '🔴 녹음 중지', listening: '듣고 있어요...',
    noRecipe: '아직 레시피가 없어요', noRecipeSub: '유튜브 링크를 붙여넣거나\n직접 레시피를 추가해봐요!',
    startYoutube: '유튜브 링크로 추출하기', startManual: '직접 레시피 추가하기',
    share: '공유', delete: '삭제', rename: '✏️ 이름 수정', shareMenu: '🔗 공유하기',
    deleteMenu: '🗑️ 삭제', analyzing: 'AI가 추출하고 있어요', tagAdd: '추가', addTag: '태그 추가',
    recipes: '레시피', noTag: '태그 없음', addRecipeSub: '음식명이랑 조리순서만 넣으면 재료는 AI가 알아서 뽑아줘요',
    linkCopied: '링크 복사됐어요!', noRecipes: '레시피가 없어요!',
  },
  en: {
    extract: 'Extract', extracting: 'Analyzing...', add: 'Add', library: 'My Recipes',
    placeholder: 'Paste YouTube / TikTok URL...', ingredients: 'Ingredients', steps: 'Steps',
    newTag: 'New tag...', save: 'Save Recipe', saved: 'Recipe saved!',
    savedSub: 'Check it in My Recipes', goLibrary: 'Go to My Recipes →',
    addNew: 'Add another recipe', aiExtract: 'Extract with AI',
    aiExtracting: 'AI is working...', foodName: 'Food name', foodNamePlaceholder: 'e.g. Kimchi Stew',
    stepsLabel: 'Steps (rough is fine)', stepsPlaceholder: 'e.g. Fry pork, add kimchi...',
    voice: '🎤 Voice input', voiceStop: '🔴 Stop recording', listening: 'Listening...',
    noRecipe: 'No recipes yet', noRecipeSub: 'Paste a YouTube link or\nadd a recipe manually!',
    startYoutube: 'Extract from YouTube', startManual: 'Add recipe manually',
    share: 'Share', delete: 'Delete', rename: '✏️ Rename', shareMenu: '🔗 Share',
    deleteMenu: '🗑️ Delete', analyzing: 'AI is extracting...', tagAdd: 'Add', addTag: 'Add Tag',
    recipes: 'recipes', noTag: 'No tag', addRecipeSub: 'Enter food name and steps — AI handles the rest',
    linkCopied: 'Link copied!', noRecipes: 'No recipes!',
  }
};

const S = {
  orange: '#FF5100', orangeLight: '#FFF0EB', text: '#0F0F0F',
  textMuted: '#888888', textLight: '#BBBBBB', bg: '#F9F7F5',
  card: 'rgba(255,255,255,0.72)', border: 'rgba(0,0,0,0.08)',
};

const glassCard: React.CSSProperties = {
  background: S.card, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: `0.5px solid ${S.border}`, borderRadius: '20px', padding: '20px',
};

const btn = {
  primary: { background: S.orange, color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', width: '100%' } as React.CSSProperties,
  secondary: { background: 'rgba(0,0,0,0.05)', color: S.text, border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', width: '100%' } as React.CSSProperties,
  small: { background: 'rgba(0,0,0,0.05)', color: S.text, border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
};

function TagInput({ tags, setTags, tagInput, setTagInput, existingTags, placeholder, addLabel }: {
  tags: string[], setTags: (v: string[]) => void, tagInput: string, setTagInput: (v: string) => void,
  existingTags: string[], placeholder: string, addLabel: string
}) {
  function add() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }
  return (
    <div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px'}}>
        {existingTags.filter(t => !tags.includes(t)).map(t => (
          <button key={t} onClick={() => { if (!tags.includes(t)) setTags([...tags, t]); }}
            style={{background:'rgba(0,0,0,0.05)',color:S.textMuted,border:'none',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',cursor:'pointer'}}>+ {t}</button>
        ))}
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <input style={{flex:1,background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'10px 14px',fontSize:'13px',color:S.text,outline:'none'}}
          placeholder={placeholder} value={tagInput} onChange={e => setTagInput(e.target.value)} />
        <button onClick={add} style={btn.small}>{addLabel}</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
        {tags.map(t => (
          <span key={t} style={{background:S.orange,color:'#fff',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
            {t}<button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',padding:'0',fontSize:'14px',lineHeight:1}}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const t = T[lang];
  const [url, setUrl] = useState('');
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [view, setView] = useState<'home' | 'library' | 'add'>('home');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<any>(null);
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [manualTagInput, setManualTagInput] = useState('');
  const [manualSaved, setManualSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: recipes } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    if (recipes) setSavedRecipes(recipes);
    const allTags = Array.from(new Set((recipes || []).flatMap((r: any) => r.tags || []))) as string[];
    setCollections(allTags.map(tag => ({ id: tag, name: tag })));
  }

  const existingTags = Array.from(new Set(savedRecipes.flatMap(r => r.tags || []))) as string[];

  async function handleExtract() {
    if (!url) return;
    setLoading(true); setError(''); setRecipe(null); setSaved(false); setTags([]); setProgress(0);
    intervalRef.current = setInterval(() => { setProgress(p => Math.min(p + Math.random() * 12, 90)); }, 400);
    try {
      const res = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, lang }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecipe(data);
    } catch (err: any) { setError(err.message); }
    finally { clearInterval(intervalRef.current); setProgress(100); setTimeout(() => setLoading(false), 300); }
  }

  async function handleManualExtract() {
    if (!manualText.trim() && !manualTitle.trim()) return;
    setManualLoading(true); setManualRecipe(null); setManualSaved(false);
    try {
      const res = await fetch('/api/manual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: manualText, title: manualTitle, steps: manualText }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setManualRecipe(data);
    } catch (err: any) { setError(err.message); }
    finally { setManualLoading(false); }
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Chrome!'); return; }
    const r = new SR();
    r.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
    r.continuous = true; r.interimResults = true;
    r.onresult = (e: any) => setManualText(Array.from(e.results).map((r: any) => r[0].transcript).join(''));
    r.onend = () => setListening(false);
    r.start(); recognitionRef.current = r; setListening(true);
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  async function handleSave() {
    const { error } = await supabase.from('recipes').insert({ url: recipe.url, platform: recipe.platform, title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps, thumbnail_url: recipe.thumbnail, tags, bookmarked: false });
    if (error) { setError(error.message); return; }
    setSaved(true); loadData();
  }

  async function handleManualSave() {
    const { error } = await supabase.from('recipes').insert({ url: '', platform: 'manual', title: manualRecipe.title, ingredients: manualRecipe.ingredients, steps: manualRecipe.steps, thumbnail_url: null, tags: manualTags, bookmarked: false });
    if (error) { setError(error.message); return; }
    setManualSaved(true); loadData();
  }

  async function toggleBookmark(id: string, current: boolean) {
    await supabase.from('recipes').update({ bookmarked: !current }).eq('id', id); loadData();
  }

  async function deleteRecipe(id: string) {
    await supabase.from('recipes').delete().eq('id', id); loadData();
  }

  async function renameCollection(oldTag: string, newName: string) {
    for (const r of savedRecipes.filter(r => r.tags?.includes(oldTag))) {
      await supabase.from('recipes').update({ tags: r.tags.map((tag: string) => tag === oldTag ? newName : tag) }).eq('id', r.id);
    }
    setEditingId(null); loadData();
  }

  async function deleteCollection(tag: string) {
    if (!confirm(`"${tag}"?`)) return;
    for (const r of savedRecipes.filter(r => r.tags?.includes(tag))) {
      await supabase.from('recipes').update({ tags: r.tags.filter((tag2: string) => tag2 !== tag) }).eq('id', r.id);
    }
    loadData();
  }

  function shareCollection(tag: string) {
    const recipes = savedRecipes.filter(r => r.tags?.includes(tag));
    if (recipes.length === 0) { alert(t.noRecipes); return; }
    const ids = recipes.map(r => r.id).join(',');
    navigator.clipboard.writeText(`${window.location.origin}/share/collection?ids=${ids}&name=${encodeURIComponent(tag)}`);
    alert(t.linkCopied);
  }

  function resetSaved() {
    setSaved(false); setManualSaved(false); setRecipe(null); setManualRecipe(null);
    setUrl(''); setTags([]); setManualTags([]); setManualTitle(''); setManualText('');
  }

  function toggleMenu(e: React.MouseEvent, colId: string) {
    e.stopPropagation();
    if (menuOpenId === colId) {
      setMenuOpenId(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: Math.min(rect.right - 160, window.innerWidth - 170), y: rect.bottom + 8 });
    setMenuOpenId(colId);
  }

  const RecipeCard = ({ r }: { r: any }) => (
    <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'12px'}}>
      <div style={{display:'flex',gap:'10px',cursor:'pointer'}} onClick={() => setExpandedId(expandedId===r.id ? null : r.id)}>
        {r.thumbnail_url
          ? <img src={r.thumbnail_url} alt={r.title} style={{width:'56px',height:'56px',borderRadius:'10px',objectFit:'cover',flexShrink:0}} />
          : <div style={{width:'56px',height:'56px',borderRadius:'10px',background:'rgba(255,81,0,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🍳</div>
        }
        <div style={{flex:1}}>
          <p style={{fontSize:'13px',fontWeight:600,color:S.text,margin:'0 0 6px'}}>{r.title}</p>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <button onClick={e => { e.stopPropagation(); toggleBookmark(r.id, r.bookmarked); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px',color: r.bookmarked ? '#ef4444' : '#ccc',padding:0}}>
              {r.bookmarked ? '♥' : '♡'}
            </button>
            <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/share/${r.id}`).then(() => alert(t.linkCopied)); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:S.textMuted,padding:0}}>{t.share}</button>
            <button onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'#ef4444',padding:0}}>{t.delete}</button>
          </div>
        </div>
        <span style={{color:S.textLight,fontSize:'12px',alignSelf:'center'}}>{expandedId===r.id ? '▲' : '▼'}</span>
      </div>
      {expandedId === r.id && (
        <div style={{marginTop:'12px',paddingTop:'12px',borderTop:`0.5px solid ${S.border}`}}>
          <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px'}}>
            {r.ingredients?.map((ing: string, i: number) => (
              <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'4px 10px',fontSize:'12px'}}>{ing}</span>
            ))}
          </div>
          <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {r.steps?.map((step: string, i: number) => (
              <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <div style={{minWidth:'22px',height:'22px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#fff',fontWeight:600}}>{i+1}</div>
                <p style={{fontSize:'13px',color:S.text,lineHeight:1.6,margin:0,paddingTop:'2px'}}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main style={{minHeight:'100vh',background:S.bg,maxWidth:'480px',margin:'0 auto',padding:'20px 16px',color:S.text,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}
      onClick={() => setMenuOpenId(null)}>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {view !== 'home' && (
            <button onClick={() => setView('home')} style={{background:'rgba(0,0,0,0.06)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',color:S.text}}>←</button>
          )}
          <h1 style={{fontSize:'22px',fontWeight:700,color:S.text,letterSpacing:'-0.5px'}}>Reel<span style={{color:S.orange}}>Recipe</span></h1>
        </div>
        <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
          <button onClick={() => setLang('ko')} style={{background: lang==='ko' ? S.orange : 'rgba(0,0,0,0.05)', border:'none', borderRadius:'8px', padding:'4px 8px', fontSize:'13px', cursor:'pointer', color: lang==='ko' ? '#fff' : S.text}}>🇰🇷</button>
          <button onClick={() => setLang('en')} style={{background: lang==='en' ? S.orange : 'rgba(0,0,0,0.05)', border:'none', borderRadius:'8px', padding:'4px 8px', fontSize:'13px', cursor:'pointer', color: lang==='en' ? '#fff' : S.text}}>🇬🇧</button>
          <button onClick={() => setView('add')} style={{...btn.small, background: view==='add' ? S.orange : 'rgba(0,0,0,0.05)', color: view==='add' ? '#fff' : S.text}}>{t.add}</button>
          <button onClick={() => setView('library')} style={{...btn.small, background: view==='library' ? S.orange : 'rgba(0,0,0,0.05)', color: view==='library' ? '#fff' : S.text}}>
            {t.library} {savedRecipes.length > 0 && `(${savedRecipes.length})`}
          </button>
        </div>
      </div>

      {error && <p style={{color:'#ef4444',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}

      {view === 'home' && (
        <div>
          {!saved && (
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <input style={{flex:1,background:'rgba(255,255,255,0.8)',border:`0.5px solid ${S.border}`,borderRadius:'14px',padding:'14px 16px',fontSize:'14px',color:S.text,outline:'none'}}
                placeholder={t.placeholder} value={url} onChange={e => setUrl(e.target.value)} />
              <button onClick={handleExtract} disabled={loading} style={{...btn.primary, width:'auto', padding:'14px 20px', opacity: loading ? 0.5 : 1}}>
                {loading ? '...' : t.extract}
              </button>
            </div>
          )}
          {loading && (
            <div style={{...glassCard, display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', padding:'40px 24px'}}>
              <div style={{fontSize:'2.5rem'}} className="animate-spin">🍳</div>
              <p style={{fontSize:'14px',fontWeight:500}}>{t.extracting}</p>
              <div style={{width:'100%',background:'rgba(0,0,0,0.08)',borderRadius:'99px',height:'4px',overflow:'hidden'}}>
                <div style={{background:S.orange,height:'4px',borderRadius:'99px',transition:'width 0.3s',width:`${Math.round(progress)}%`}}></div>
              </div>
              <p style={{fontSize:'12px',color:S.textMuted}}>{Math.round(progress)}% — {t.analyzing}</p>
            </div>
          )}
          {saved && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 0'}}>
              <div style={{fontSize:'3rem',marginBottom:'12px'}} className="animate-bounce">🎉</div>
              <p style={{color:'#16a34a',fontWeight:500,fontSize:'18px'}}>{t.saved}</p>
              <p style={{color:S.textMuted,fontSize:'13px',marginTop:'4px'}}>{t.savedSub}</p>
              <div style={{width:'100%',marginTop:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={() => setView('library')} style={btn.primary}>{t.goLibrary}</button>
                <button onClick={resetSaved} style={btn.secondary}>{t.addNew}</button>
              </div>
            </div>
          )}
          {!saved && !loading && recipe && (
            <div style={glassCard}>
              {recipe.thumbnail && <img src={recipe.thumbnail} alt={recipe.title} style={{width:'100%',borderRadius:'14px',marginBottom:'16px',objectFit:'cover'}} />}
              <h2 style={{fontSize:'18px',fontWeight:600,marginBottom:'16px'}}>{recipe.title}</h2>
              <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                {recipe.ingredients?.map((ing: string, i: number) => (
                  <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                ))}
              </div>
              <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                {recipe.steps?.map((step: string, i: number) => (
                  <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{minWidth:'24px',height:'24px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                    <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                  </div>
                ))}
              </div>
              <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                <p style={{fontSize:'12px',fontWeight:600,marginBottom:'10px'}}>{t.addTag}</p>
                <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} existingTags={existingTags} placeholder={t.newTag} addLabel={t.tagAdd} />
                <button onClick={handleSave} style={{...btn.primary, marginTop:'16px'}}>{t.save}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'add' && (
        <div>
          {manualSaved && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 0'}}>
              <div style={{fontSize:'3rem',marginBottom:'12px'}} className="animate-bounce">🎉</div>
              <p style={{color:'#16a34a',fontWeight:500,fontSize:'18px'}}>{t.saved}</p>
              <p style={{color:S.textMuted,fontSize:'13px',marginTop:'4px'}}>{t.savedSub}</p>
              <div style={{width:'100%',marginTop:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={() => setView('library')} style={btn.primary}>{t.goLibrary}</button>
                <button onClick={resetSaved} style={btn.secondary}>{t.addNew}</button>
              </div>
            </div>
          )}
          {!manualSaved && (
            <div>
              <div style={glassCard}>
                <h2 style={{fontSize:'17px',fontWeight:600,marginBottom:'4px'}}>{t.add}</h2>
                <p style={{fontSize:'13px',color:S.textMuted,marginBottom:'16px'}}>{t.addRecipeSub}</p>
                <button onClick={listening ? stopListening : startListening}
                  style={{...btn.small, background: listening ? '#ef4444' : 'rgba(0,0,0,0.05)', color: listening ? '#fff' : S.text, marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px'}}>
                  {listening ? t.voiceStop : t.voice}
                </button>
                {listening && <p style={{fontSize:'12px',color:'#ef4444',marginBottom:'12px'}}>{t.listening}</p>}
                <label style={{fontSize:'12px',fontWeight:600,display:'block',marginBottom:'6px'}}>{t.foodName}</label>
                <input style={{width:'100%',background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'12px 14px',fontSize:'13px',color:S.text,outline:'none',marginBottom:'12px',boxSizing:'border-box'}}
                  placeholder={t.foodNamePlaceholder} value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
                <label style={{fontSize:'12px',fontWeight:600,display:'block',marginBottom:'6px'}}>{t.stepsLabel}</label>
                <textarea style={{width:'100%',background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'12px 14px',fontSize:'13px',color:S.text,outline:'none',marginBottom:'16px',minHeight:'120px',resize:'none',boxSizing:'border-box'}}
                  placeholder={t.stepsPlaceholder} value={manualText} onChange={e => setManualText(e.target.value)} />
                <button onClick={handleManualExtract} disabled={manualLoading || (!manualText.trim() && !manualTitle.trim())}
                  style={{...btn.primary, opacity: (manualLoading || (!manualText.trim() && !manualTitle.trim())) ? 0.5 : 1}}>
                  {manualLoading ? t.aiExtracting : t.aiExtract}
                </button>
              </div>
              {manualRecipe && (
                <div style={{...glassCard, marginTop:'16px'}}>
                  <h2 style={{fontSize:'18px',fontWeight:600,marginBottom:'16px'}}>{manualRecipe.title}</h2>
                  <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                    {manualRecipe.ingredients?.map((ing: string, i: number) => (
                      <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                    ))}
                  </div>
                  <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                    {manualRecipe.steps?.map((step: string, i: number) => (
                      <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                        <div style={{minWidth:'24px',height:'24px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                        <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                    <p style={{fontSize:'12px',fontWeight:600,marginBottom:'10px'}}>{t.addTag}</p>
                    <TagInput tags={manualTags} setTags={setManualTags} tagInput={manualTagInput} setTagInput={setManualTagInput} existingTags={existingTags} placeholder={t.newTag} addLabel={t.tagAdd} />
                    <button onClick={handleManualSave} style={{...btn.primary, marginTop:'16px'}}>{t.save}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'library' && (
        <div>
          {collections.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 1rem'}}>
              <div style={{fontSize:'3.5rem',marginBottom:'16px'}}>🍳</div>
              <h2 style={{fontSize:'17px',fontWeight:600,marginBottom:'8px'}}>{t.noRecipe}</h2>
              <p style={{fontSize:'13px',color:S.textMuted,textAlign:'center',lineHeight:1.6,marginBottom:'24px',whiteSpace:'pre-line'}}>{t.noRecipeSub}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%'}}>
                <button onClick={() => setView('home')} style={btn.primary}>{t.startYoutube}</button>
                <button onClick={() => setView('add')} style={btn.secondary}>{t.startManual}</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {collections.map(col => {
                const colRecipes = savedRecipes.filter(r => r.tags?.includes(col.name));
                const isExpanded = expandedCollection === col.id;
                const isEditing = editingId === col.id;
                return (
                  <div key={col.id} style={glassCard} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between', marginBottom: isExpanded ? '16px' : '0'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',flex:1}} onClick={() => setExpandedCollection(isExpanded ? null : col.id)}>
                        <div style={{width:'36px',height:'36px',background:'rgba(255,81,0,0.08)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>🍳</div>
                        <div>
                          {isEditing ? (
                            <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') renameCollection(col.name, editingName); }}
                              onClick={e => e.stopPropagation()}
                              style={{fontSize:'15px',fontWeight:600,border:`1px solid ${S.orange}`,borderRadius:'8px',padding:'2px 8px',outline:'none',color:S.text}} />
                          ) : (
                            <p style={{fontSize:'15px',fontWeight:600,margin:0}}>{col.name}</p>
                          )}
                          <p style={{fontSize:'12px',color:S.textMuted,margin:0}}>{t.recipes} {colRecipes.length}{lang==='ko'?'개':''}</p>
                        </div>
                      </div>
                      <button onClick={e => toggleMenu(e, col.id)}
                        style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:S.textMuted,padding:'4px 8px',borderRadius:'8px'}}>⋯</button>
                    </div>
                    {isExpanded && (
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        {colRecipes.map(r => <RecipeCard key={r.id} r={r} />)}
                      </div>
                    )}
                  </div>
                );
              })}
              {savedRecipes.filter(r => !r.tags || r.tags.length === 0).length > 0 && (
                <div style={glassCard} onClick={e => e.stopPropagation()}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={() => setExpandedCollection('__notag__')}>
                    <div style={{width:'36px',height:'36px',background:'rgba(0,0,0,0.05)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>📌</div>
                    <div>
                      <p style={{fontSize:'15px',fontWeight:600,margin:0}}>{t.noTag}</p>
                      <p style={{fontSize:'12px',color:S.textMuted,margin:0}}>{t.recipes} {savedRecipes.filter(r => !r.tags || r.tags.length === 0).length}{lang==='ko'?'개':''}</p>
                    </div>
                  </div>
                  {expandedCollection === '__notag__' && (
                    <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'4px'}}>
                      {savedRecipes.filter(r => !r.tags || r.tags.length === 0).map(r => <RecipeCard key={r.id} r={r} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {menuOpenId && (
        <div
          onClick={e => e.stopPropagation()}
          style={{position:'fixed',left: menuPos.x, top: menuPos.y, background:'#fff',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'6px',zIndex:9999,minWidth:'160px',boxShadow:'0 4px 20px rgba(0,0,0,0.12)'}}>
          <button onClick={() => { setEditingId(menuOpenId); setEditingName(collections.find(c => c.id === menuOpenId)?.name || ''); setMenuOpenId(null); }}
            style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',padding:'8px 12px',fontSize:'13px',cursor:'pointer',color:S.text,borderRadius:'8px'}}>{t.rename}</button>
          <button onClick={() => { shareCollection(menuOpenId); setMenuOpenId(null); }}
            style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',padding:'8px 12px',fontSize:'13px',cursor:'pointer',color:S.text,borderRadius:'8px'}}>{t.shareMenu}</button>
          <button onClick={() => { deleteCollection(menuOpenId); setMenuOpenId(null); }}
            style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',padding:'8px 12px',fontSize:'13px',cursor:'pointer',color:'#ef4444',borderRadius:'8px'}}>{t.deleteMenu}</button>
        </div>
      )}
    </main>
  );
}