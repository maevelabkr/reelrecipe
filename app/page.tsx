'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';

const S = {
  orange: '#FF5100',
  orangeLight: '#FFF0EB',
  text: '#0F0F0F',
  textMuted: '#888888',
  textLight: '#BBBBBB',
  bg: '#F9F7F5',
  card: 'rgba(255,255,255,0.72)',
  border: 'rgba(0,0,0,0.08)',
};

const glassCard: React.CSSProperties = {
  background: S.card,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `0.5px solid ${S.border}`,
  borderRadius: '20px',
  padding: '20px',
};

const btn = {
  primary: {
    background: S.orange,
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  } as React.CSSProperties,
  secondary: {
    background: 'rgba(0,0,0,0.05)',
    color: S.text,
    border: 'none',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  } as React.CSSProperties,
  small: {
    background: 'rgba(0,0,0,0.05)',
    color: S.text,
    border: 'none',
    borderRadius: '10px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  smallOrange: {
    background: S.orangeLight,
    color: S.orange,
    border: 'none',
    borderRadius: '10px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
};

const SavedScreen = ({ onGoToLibrary, onAddNew }: { onGoToLibrary: () => void, onAddNew: () => void }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 0'}}>
    <div style={{fontSize:'3rem',marginBottom:'12px'}} className="animate-bounce">🎉</div>
    <p style={{color:'#16a34a',fontWeight:500,fontSize:'18px',color:S.text}}>레시피가 저장됐어요!</p>
    <p style={{color:S.textMuted,fontSize:'13px',marginTop:'4px'}}>내 레시피에서 확인해봐요</p>
    <div style={{width:'100%',marginTop:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
      <button onClick={onGoToLibrary} style={btn.primary}>내 레시피 보러가기 →</button>
      <button onClick={onAddNew} style={btn.secondary}>새로운 레시피 담으러 가기</button>
    </div>
  </div>
);

function TagInput({ tags, setTags, tagInput, setTagInput, existingTags }: {
  tags: string[], setTags: (v: string[]) => void,
  tagInput: string, setTagInput: (v: string) => void,
  existingTags: string[]
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
            style={{background:'rgba(0,0,0,0.05)',color:S.textMuted,border:'none',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',cursor:'pointer'}}>
            + {t}
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <input
          style={{flex:1,background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'10px 14px',fontSize:'13px',color:S.text,outline:'none'}}
          placeholder="새 태그 입력..."
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
        />
        <button onClick={add} style={btn.small}>추가</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
        {tags.map(t => (
          <span key={t} style={{background:S.orange,color:'#fff',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
            {t}
            <button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',padding:'0',fontSize:'14px',lineHeight:1}}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [view, setView] = useState<'home' | 'library' | 'add'>('home');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<any>(null);
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [manualTagInput, setManualTagInput] = useState('');
  const [manualSaved, setManualSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('전체');
  const [progress, setProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => { loadRecipes(); }, []);

  async function loadRecipes() {
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    if (data) setSavedRecipes(data);
  }

  const bookmarkedRecipes = savedRecipes.filter(r => r.bookmarked);
  const allTags = ['전체', `♥ 찜 (${bookmarkedRecipes.length})`, ...Array.from(new Set(savedRecipes.flatMap(r => r.tags || [])))];
  const filteredRecipes = activeTag === '전체' ? savedRecipes : activeTag.startsWith('♥') ? bookmarkedRecipes : savedRecipes.filter(r => r.tags?.includes(activeTag));
  const existingTags = Array.from(new Set(savedRecipes.flatMap(r => r.tags || []))) as string[];

  async function handleExtract() {
    if (!url) return;
    setLoading(true); setError(''); setRecipe(null); setSaved(false); setTags([]); setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 90));
    }, 400);
    try {
      const res = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
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
    if (!SR) { alert('Chrome을 사용해주세요!'); return; }
    const r = new SR();
    r.lang = 'ko-KR'; r.continuous = true; r.interimResults = true;
    r.onresult = (e: any) => setManualText(Array.from(e.results).map((r: any) => r[0].transcript).join(''));
    r.onend = () => setListening(false);
    r.start(); recognitionRef.current = r; setListening(true);
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  async function handleSave() {
    const { error } = await supabase.from('recipes').insert({ url: recipe.url, platform: recipe.platform, title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps, thumbnail_url: recipe.thumbnail, tags, bookmarked: false });
    if (error) { setError(error.message); return; }
    setSaved(true); loadRecipes();
  }

  async function handleManualSave() {
    const { error } = await supabase.from('recipes').insert({ url: '', platform: 'manual', title: manualRecipe.title, ingredients: manualRecipe.ingredients, steps: manualRecipe.steps, thumbnail_url: null, tags: manualTags, bookmarked: false });
    if (error) { setError(error.message); return; }
    setManualSaved(true); loadRecipes();
  }

  async function toggleBookmark(id: string, current: boolean) {
    await supabase.from('recipes').update({ bookmarked: !current }).eq('id', id); loadRecipes();
  }

  async function deleteRecipe(id: string) {
    await supabase.from('recipes').delete().eq('id', id); loadRecipes();
  }

  return (
    <main style={{minHeight:'100vh',background:S.bg,maxWidth:'480px',margin:'0 auto',padding:'20px 16px',color:S.text,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {view !== 'home' && (
            <button onClick={() => setView('home')} style={{background:'rgba(0,0,0,0.06)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',color:S.text}}>←</button>
          )}
          <h1 style={{fontSize:'22px',fontWeight:700,color:S.text,letterSpacing:'-0.5px'}}>
            Reel<span style={{color:S.orange}}>Recipe</span>
          </h1>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={() => setView('add')} style={{...btn.small, background: view==='add' ? S.orange : 'rgba(0,0,0,0.05)', color: view==='add' ? '#fff' : S.text}}>직접 추가</button>
          <button onClick={() => setView('library')} style={{...btn.small, background: view==='library' ? S.orange : 'rgba(0,0,0,0.05)', color: view==='library' ? '#fff' : S.text}}>
            내 레시피 {savedRecipes.length > 0 && `(${savedRecipes.length})`}
          </button>
        </div>
      </div>

      {error && <p style={{color:'#ef4444',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}

      {view === 'home' && (
        <div>
          {!saved && (
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <input
                style={{flex:1,background:'rgba(255,255,255,0.8)',border:`0.5px solid ${S.border}`,borderRadius:'14px',padding:'14px 16px',fontSize:'14px',color:S.text,outline:'none',backdropFilter:'blur(8px)'}}
                placeholder="YouTube Shorts URL 붙여넣기..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <button onClick={handleExtract} disabled={loading} style={{...btn.primary, width:'auto', padding:'14px 20px', opacity: loading ? 0.5 : 1}}>
                {loading ? '...' : '추출'}
              </button>
            </div>
          )}

          {loading && (
            <div style={{...glassCard, display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', padding:'40px 24px'}}>
              <div style={{fontSize:'2.5rem'}} className="animate-spin">🍳</div>
              <p style={{fontSize:'14px',fontWeight:500,color:S.text}}>레시피 분석 중...</p>
              <div style={{width:'100%',background:'rgba(0,0,0,0.08)',borderRadius:'99px',height:'4px',overflow:'hidden'}}>
                <div style={{background:S.orange,height:'4px',borderRadius:'99px',transition:'width 0.3s',width:`${Math.round(progress)}%`}}></div>
              </div>
              <p style={{fontSize:'12px',color:S.textMuted}}>{Math.round(progress)}% — AI가 추출하고 있어요</p>
            </div>
          )}

          {saved && <SavedScreen onGoToLibrary={() => setView('library')} onAddNew={() => { setSaved(false); setRecipe(null); setUrl(''); setTags([]); }} />}

          {!saved && !loading && recipe && (
            <div style={glassCard}>
              {recipe.thumbnail && <img src={recipe.thumbnail} alt={recipe.title} style={{width:'100%',borderRadius:'14px',marginBottom:'16px',objectFit:'cover'}} />}
              <h2 style={{fontSize:'18px',fontWeight:600,color:S.text,marginBottom:'16px'}}>{recipe.title}</h2>

              <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>재료</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                {recipe.ingredients?.map((ing: string, i: number) => (
                  <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                ))}
              </div>

              <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>조리 순서</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                {recipe.steps?.map((step: string, i: number) => (
                  <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{minWidth:'24px',height:'24px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                    <p style={{fontSize:'13px',color:S.text,lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                  </div>
                ))}
              </div>

              <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                <p style={{fontSize:'12px',fontWeight:600,color:S.text,marginBottom:'10px'}}>태그 추가</p>
                <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} existingTags={existingTags} />
                <button onClick={handleSave} style={{...btn.primary, marginTop:'16px'}}>레시피 저장하기</button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'add' && (
        <div>
          {manualSaved && <SavedScreen onGoToLibrary={() => setView('library')} onAddNew={() => { setManualSaved(false); setManualRecipe(null); setManualTitle(''); setManualText(''); setManualTags([]); }} />}
          {!manualSaved && (
            <div>
              <div style={glassCard}>
                <h2 style={{fontSize:'17px',fontWeight:600,color:S.text,marginBottom:'4px'}}>직접 레시피 추가</h2>
                <p style={{fontSize:'13px',color:S.textMuted,marginBottom:'16px'}}>음식명이랑 조리순서만 넣으면 재료는 AI가 알아서 뽑아줘요</p>

                <button onClick={listening ? stopListening : startListening}
                  style={{...btn.small, background: listening ? '#ef4444' : 'rgba(0,0,0,0.05)', color: listening ? '#fff' : S.text, marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px'}}>
                  {listening ? '🔴 녹음 중지' : '🎤 음성으로 말하기'}
                </button>

                <label style={{fontSize:'12px',fontWeight:600,color:S.text,display:'block',marginBottom:'6px'}}>음식 이름</label>
                <input style={{width:'100%',background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'12px 14px',fontSize:'13px',color:S.text,outline:'none',marginBottom:'12px',boxSizing:'border-box'}}
                  placeholder="예: 김치찌개" value={manualTitle} onChange={e => setManualTitle(e.target.value)} />

                <label style={{fontSize:'12px',fontWeight:600,color:S.text,display:'block',marginBottom:'6px'}}>조리 순서 (대충 써도 돼요)</label>
                <textarea style={{width:'100%',background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'12px 14px',fontSize:'13px',color:S.text,outline:'none',marginBottom:'16px',minHeight:'120px',resize:'none',boxSizing:'border-box'}}
                  placeholder="예) 돼지고기 볶다가 김치 넣고 물 붓고 두부 넣어서 끓이면 됨"
                  value={manualText} onChange={e => setManualText(e.target.value)} />

                <button onClick={handleManualExtract} disabled={manualLoading || (!manualText.trim() && !manualTitle.trim())}
                  style={{...btn.primary, opacity: (manualLoading || (!manualText.trim() && !manualTitle.trim())) ? 0.5 : 1}}>
                  {manualLoading ? 'AI가 정리 중...' : 'AI로 레시피 정리하기'}
                </button>
              </div>

              {manualRecipe && (
                <div style={{...glassCard, marginTop:'16px'}}>
                  <h2 style={{fontSize:'18px',fontWeight:600,color:S.text,marginBottom:'16px'}}>{manualRecipe.title}</h2>

                  <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>재료</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                    {manualRecipe.ingredients?.map((ing: string, i: number) => (
                      <span key={i} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                    ))}
                  </div>

                  <p style={{fontSize:'12px',fontWeight:600,color:S.orange,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>조리 순서</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                    {manualRecipe.steps?.map((step: string, i: number) => (
                      <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                        <div style={{minWidth:'24px',height:'24px',background:S.orange,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                        <p style={{fontSize:'13px',color:S.text,lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                    <p style={{fontSize:'12px',fontWeight:600,color:S.text,marginBottom:'10px'}}>태그 추가</p>
                    <TagInput tags={manualTags} setTags={setManualTags} tagInput={manualTagInput} setTagInput={setManualTagInput} existingTags={existingTags} />
                    <button onClick={handleManualSave} style={{...btn.primary, marginTop:'16px'}}>레시피 저장하기</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'library' && (
        <div>
          <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'8px',marginBottom:'16px'}}>
            {allTags.map(t => (
              <button key={t} onClick={() => setActiveTag(t)} style={{
                padding:'8px 16px', borderRadius:'99px', fontSize:'13px', fontWeight:500,
                whiteSpace:'nowrap', cursor:'pointer', border:'none',
                background: activeTag===t ? S.orange : t.startsWith('♥') ? 'rgba(255,81,0,0.08)' : 'rgba(0,0,0,0.05)',
                color: activeTag===t ? '#fff' : t.startsWith('♥') ? S.orange : S.text,
              }}>{t}</button>
            ))}
          </div>

          {filteredRecipes.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 1rem'}}>
              <div style={{fontSize:'3.5rem',marginBottom:'16px'}}>🍳</div>
              <h2 style={{fontSize:'17px',fontWeight:600,color:S.text,marginBottom:'8px'}}>아직 레시피가 없어요</h2>
              <p style={{fontSize:'13px',color:S.textMuted,textAlign:'center',lineHeight:1.6,marginBottom:'24px'}}>유튜브 링크를 붙여넣거나<br/>직접 레시피를 추가해봐요!</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%'}}>
                <button onClick={() => setView('home')} style={btn.primary}>유튜브 링크로 추출하기</button>
                <button onClick={() => setView('add')} style={btn.secondary}>직접 레시피 추가하기</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {filteredRecipes.map(r => (
                <div key={r.id} style={glassCard}>
                  <div style={{display:'flex',gap:'12px',cursor:'pointer'}} onClick={() => setExpandedId(expandedId===r.id ? null : r.id)}>
                    {r.thumbnail_url
                      ? <img src={r.thumbnail_url} alt={r.title} style={{width:'72px',height:'72px',borderRadius:'12px',objectFit:'cover',flexShrink:0}} />
                      : <div style={{width:'72px',height:'72px',borderRadius:'12px',background:'rgba(255,81,0,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0}}>🍳</div>
                    }
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontSize:'14px',fontWeight:600,color:S.text,marginBottom:'6px',lineHeight:1.3}}>{r.title}</h3>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'8px'}}>
                        {r.tags?.map((t: string) => (
                          <span key={t} style={{background:'rgba(255,81,0,0.08)',color:S.orange,borderRadius:'20px',padding:'2px 8px',fontSize:'11px'}}>{t}</span>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                        <button onClick={e => { e.stopPropagation(); toggleBookmark(r.id, r.bookmarked); }}
                          style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color: r.bookmarked ? '#ef4444' : '#ccc',padding:0}}>
                          {r.bookmarked ? '♥' : '♡'}
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }}
                          style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'#ef4444',padding:0}}>삭제</button>
                      </div>
                    </div>
                    <span style={{color:S.textLight,fontSize:'12px',alignSelf:'center'}}>{expandedId===r.id ? '▲' : '▼'}</span>
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
                            <p style={{fontSize:'13px',color:S.text,lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}