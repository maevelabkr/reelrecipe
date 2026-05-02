'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import type { User } from '@supabase/supabase-js';

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
  blue: '#0066cc',
  blueLight: '#e8f0fb',
  text: '#1d1d1f',
  textMuted: '#7a7a7a',
  textLight: '#cccccc',
  bg: '#f5f5f7',
  card: '#ffffff',
  border: '#e0e0e0',
};

const glassCard: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '18px',
  padding: '24px',
};

const btn = {
  primary: {
    background: '#0066cc', color: '#fff', border: 'none',
    borderRadius: '9999px', padding: '11px 22px',
    fontSize: '17px', fontWeight: 400, cursor: 'pointer', width: '100%',
    letterSpacing: '-0.374px',
  } as React.CSSProperties,
  secondary: {
    background: 'transparent', color: '#0066cc',
    border: '1px solid #0066cc',
    borderRadius: '9999px', padding: '11px 22px',
    fontSize: '17px', fontWeight: 400, cursor: 'pointer', width: '100%',
    letterSpacing: '-0.374px',
  } as React.CSSProperties,
  small: {
    background: '#1d1d1f', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '8px 15px',
    fontSize: '14px', fontWeight: 400, cursor: 'pointer',
    letterSpacing: '-0.224px',
  } as React.CSSProperties,
};

const TAG_RULES: { tags: string[]; keywords: string[] }[] = [
  { tags: ['한식'], keywords: ['김치','된장','고추장','불고기','비빔','삼겹','갈비','순두부','잡채','제육','나물','떡볶이','순대','냉면','설렁탕','삼계탕','육개장','해장국','감자탕','부대찌개','순두부','된장찌개','김치찌개','부침개','전','죽'] },
  { tags: ['일식'], keywords: ['스시','라멘','우동','소바','돈카츠','덮밥','규동','오야코','가라아게','타코야키','오코노미야키','미소','다시','간장','와사비','일본'] },
  { tags: ['중식'], keywords: ['짜장','짬뽕','탕수육','마파두부','중화','볶음밥','딤섬','만두','훠궈','마라','팔보채','깐풍'] },
  { tags: ['양식'], keywords: ['파스타','피자','리조또','스테이크','버거','샌드위치','샐러드','오믈렛','크림','토마토소스','페스토','바질','치즈','올리브'] },
  { tags: ['동남아'], keywords: ['팟타이','쌀국수','커리','카레','볶음','코코넛','라임','피시소스','베트남','태국','인도네시아','말레이'] },
  { tags: ['국·탕·찌개'], keywords: ['국','탕','찌개','찜','전골','탕','육수','부대','해장','설렁','곰탕','갈비탕'] },
  { tags: ['볶음'], keywords: ['볶음','볶아','stir','fry','炒'] },
  { tags: ['구이'], keywords: ['구이','구워','그릴','BBQ','바베큐','로스트'] },
  { tags: ['튀김'], keywords: ['튀김','튀겨','프라이','fried','crispy','바삭'] },
  { tags: ['찜·조림'], keywords: ['찜','조림','브레이즈','braised'] },
  { tags: ['샐러드'], keywords: ['샐러드','salad','무침','콜슬로'] },
  { tags: ['다이어트'], keywords: ['닭가슴살','두부','저칼로리','샐러드','현미','오트밀','그릭요거트','아보카도','저지방','diet','건강','칼로리'] },
  { tags: ['고단백'], keywords: ['닭가슴살','달걀','계란','두부','연어','참치','소고기','단백질','protein'] },
  { tags: ['채식'], keywords: ['두부','채소','야채','버섯','비건','베지','vegan','vegetarian','나물'] },
  { tags: ['간단'], keywords: ['간단','5분','10분','15분','전자레인지','에어프라이어','no cook','원팬'] },
  { tags: ['야식'], keywords: ['라면','떡볶이','치킨','피자','야식','야밤','족발','보쌈','순대'] },
  { tags: ['간식'], keywords: ['쿠키','케이크','마카롱','브라우니','머핀','스낵','과자','간식','디저트'] },
];

function getTagSuggestions(title: string, ingredients: string[]): string[] {
  const text = [title, ...ingredients].join(' ').toLowerCase();
  const suggested = new Set<string>();
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(k => text.includes(k.toLowerCase()))) {
      rule.tags.forEach(t => suggested.add(t));
    }
  }
  return Array.from(suggested).slice(0, 8);
}

function TagInput({ tags, setTags, tagInput, setTagInput, existingTags, suggestedTags, placeholder, addLabel }: {
  tags: string[], setTags: (v: string[]) => void, tagInput: string, setTagInput: (v: string) => void,
  existingTags: string[], suggestedTags?: string[], placeholder: string, addLabel: string
}) {
  function add() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  const allSuggested = suggestedTags ?? [];
  const allExisting = existingTags.filter(t => !allSuggested.includes(t));

  return (
    <div>
      {allSuggested.length > 0 && (
        <div style={{marginBottom:'10px'}}>
          <p style={{fontSize:'11px',color:S.textLight,letterSpacing:'0.04em',marginBottom:'6px'}}>추천</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {allSuggested.filter(t => !tags.includes(t)).map(t => (
              <button key={t} onClick={() => setTags([...tags, t])}
                style={{background:S.blueLight,color:S.blue,border:'none',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',cursor:'pointer',letterSpacing:'-0.12px'}}>+ {t}</button>
            ))}
          </div>
        </div>
      )}
      {allExisting.length > 0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px'}}>
          {allExisting.filter(t => !tags.includes(t)).map(t => (
            <button key={t} onClick={() => { if (!tags.includes(t)) setTags([...tags, t]); }}
              style={{background:'rgba(0,0,0,0.05)',color:S.textMuted,border:'none',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',cursor:'pointer',letterSpacing:'-0.12px'}}>+ {t}</button>
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <input style={{flex:1,background:'rgba(0,0,0,0.04)',border:`0.5px solid ${S.border}`,borderRadius:'12px',padding:'10px 14px',fontSize:'13px',color:S.text,outline:'none'}}
          placeholder={placeholder} value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button onClick={add} style={btn.small}>{addLabel}</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
        {tags.map(t => (
          <span key={t} style={{background:S.blue,color:'#fff',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
            {t}<button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',padding:'0',fontSize:'14px',lineHeight:1}}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({ lang, onGuest }: { lang: 'ko' | 'en', onGuest: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  async function sendMagicLink() {
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'SF Pro Display, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', color: S.text, marginBottom: '8px' }}>
            Reel<span style={{ color: S.blue }}>Recipe</span>
          </h1>
          <p style={{ fontSize: '15px', color: S.textMuted, letterSpacing: '-0.2px' }}>
            {lang === 'ko' ? '나만의 레시피북을 만들어봐요' : 'Build your personal recipe book'}
          </p>
        </div>

        <div style={{ width: '100%', background: S.card, border: `1px solid ${S.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={signInWithGoogle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '13px', background: S.text, color: '#fff', border: 'none', borderRadius: '9999px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.3px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Google로 로그인
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: S.border }} />
            <span style={{ fontSize: '12px', color: S.textLight }}>또는</span>
            <div style={{ flex: 1, height: '1px', background: S.border }} />
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>📬</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: S.text, marginBottom: '4px' }}>이메일을 확인해봐요!</p>
              <p style={{ fontSize: '13px', color: S.textMuted }}>{email}으로 로그인 링크를 보냈어요</p>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                style={{ width: '100%', padding: '13px 16px', background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', fontSize: '15px', color: S.text, outline: 'none', boxSizing: 'border-box', letterSpacing: '-0.2px' }}
              />
              <button
                onClick={sendMagicLink}
                disabled={loading || !email.trim()}
                style={{ width: '100%', padding: '13px', background: loading || !email.trim() ? S.border : S.blue, color: '#fff', border: 'none', borderRadius: '9999px', fontSize: '15px', fontWeight: 500, cursor: email.trim() ? 'pointer' : 'default', letterSpacing: '-0.3px', transition: 'background 0.15s' }}
              >
                {loading ? '전송 중...' : '이메일로 로그인 링크 받기'}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onGuest}
          style={{ background: 'none', border: 'none', color: S.textMuted, fontSize: '14px', cursor: 'pointer', letterSpacing: '-0.2px', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          비회원으로 시작하기
        </button>

        <p style={{ fontSize: '12px', color: S.textLight, textAlign: 'center', lineHeight: 1.6 }}>
          로그인하면 레시피가 내 계정에 저장돼요.<br />어디서든 불러올 수 있어요.
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const t = T[lang];
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guestSaveCount, setGuestSaveCount] = useState(0);
  const GUEST_LIMIT = 3;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) loadData(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadData(session.user.id);
      else { setSavedRecipes([]); setCollections([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadData(userId?: string) {
    const uid = userId ?? user?.id;
    if (!uid) return;
    const { data: recipes } = await supabase.from('recipes').select('*').eq('user_id', uid).order('created_at', { ascending: false });
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
    if (!user) {
      if (guestSaveCount >= GUEST_LIMIT) { setShowLoginModal(true); return; }
      const newRecipe = { id: crypto.randomUUID(), url: recipe.url, platform: recipe.platform, title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps, thumbnail_url: recipe.thumbnail, tags, bookmarked: false, created_at: new Date().toISOString() };
      setSavedRecipes(prev => [newRecipe, ...prev]);
      const allTags = Array.from(new Set([newRecipe, ...savedRecipes].flatMap((r: any) => r.tags || []))) as string[];
      setCollections(allTags.map(tag => ({ id: tag, name: tag })));
      setGuestSaveCount(c => c + 1);
      setSaved(true);
      return;
    }
    const { error } = await supabase.from('recipes').insert({ user_id: user.id, url: recipe.url, platform: recipe.platform, title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps, thumbnail_url: recipe.thumbnail, tags, bookmarked: false });
    if (error) { setError(error.message); return; }
    setSaved(true); loadData();
  }

  async function handleManualSave() {
    if (!user) {
      if (guestSaveCount >= GUEST_LIMIT) { setShowLoginModal(true); return; }
      const newRecipe = { id: crypto.randomUUID(), url: '', platform: 'manual', title: manualRecipe.title, ingredients: manualRecipe.ingredients, steps: manualRecipe.steps, thumbnail_url: null, tags: manualTags, bookmarked: false, created_at: new Date().toISOString() };
      setSavedRecipes(prev => [newRecipe, ...prev]);
      const allTags = Array.from(new Set([newRecipe, ...savedRecipes].flatMap((r: any) => r.tags || []))) as string[];
      setCollections(allTags.map(tag => ({ id: tag, name: tag })));
      setGuestSaveCount(c => c + 1);
      setManualSaved(true);
      return;
    }
    const { error } = await supabase.from('recipes').insert({ user_id: user.id, url: '', platform: 'manual', title: manualRecipe.title, ingredients: manualRecipe.ingredients, steps: manualRecipe.steps, thumbnail_url: null, tags: manualTags, bookmarked: false });
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

  async function shareCollection(tag: string) {
    const recipes = savedRecipes.filter(r => r.tags?.includes(tag));
    if (recipes.length === 0) { alert(t.noRecipes); return; }

    let ids: string[];
    if (!user) {
      // 비회원: DB에 임시 저장 후 공유
      const inserts = await Promise.all(recipes.map(r =>
        supabase.from('recipes').insert({ url: r.url, platform: r.platform, title: r.title, ingredients: r.ingredients, steps: r.steps, thumbnail_url: r.thumbnail_url, tags: r.tags, bookmarked: false }).select('id').single()
      ));
      ids = inserts.map(({ data }) => data?.id).filter(Boolean);
    } else {
      ids = recipes.map(r => r.id);
    }

    navigator.clipboard.writeText(`${window.location.origin}/share/collection?ids=${ids.join(',')}&name=${encodeURIComponent(tag)}`);
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
          : <div style={{width:'56px',height:'56px',borderRadius:'10px',background:'rgba(0,102,204,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🍳</div>
        }
        <div style={{flex:1}}>
          <p style={{fontSize:'13px',fontWeight:600,color:S.text,margin:'0 0 6px'}}>{r.title}</p>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <button onClick={e => { e.stopPropagation(); toggleBookmark(r.id, r.bookmarked); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px',color: r.bookmarked ? '#ef4444' : '#ccc',padding:0}}>
              {r.bookmarked ? '♥' : '♡'}
            </button>
            <button onClick={async e => { e.stopPropagation(); let shareId = r.id; if (!user) { const { data } = await supabase.from('recipes').insert({ url: r.url, platform: r.platform, title: r.title, ingredients: r.ingredients, steps: r.steps, thumbnail_url: r.thumbnail_url, tags: r.tags, bookmarked: false }).select('id').single(); if (data) shareId = data.id; } navigator.clipboard.writeText(`${window.location.origin}/share/${shareId}`); alert(t.linkCopied); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:S.textMuted,padding:0}}>{t.share}</button>
            <button onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'#ef4444',padding:0}}>{t.delete}</button>
          </div>
        </div>
        <span style={{color:S.textLight,fontSize:'12px',alignSelf:'center'}}>{expandedId===r.id ? '▲' : '▼'}</span>
      </div>
      {expandedId === r.id && (
        <div style={{marginTop:'12px',paddingTop:'12px',borderTop:`0.5px solid ${S.border}`}}>
          <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px'}}>
            {r.ingredients?.map((ing: string, i: number) => (
              <span key={i} style={{background:'rgba(0,102,204,0.08)',color:S.blue,borderRadius:'20px',padding:'4px 10px',fontSize:'12px'}}>{ing}</span>
            ))}
          </div>
          <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {r.steps?.map((step: string, i: number) => (
              <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <div style={{minWidth:'22px',height:'22px',background:S.blue,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#fff',fontWeight:600}}>{i+1}</div>
                <p style={{fontSize:'13px',color:S.text,lineHeight:1.6,margin:0,paddingTop:'2px'}}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (authLoading) return (
    <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'SF Pro Display, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ width: '32px', height: '32px', border: `3px solid ${S.border}`, borderTopColor: S.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (!user && !isGuest) return <LoginScreen lang={lang} onGuest={() => setIsGuest(true)} />;

  return (
    <main style={{minHeight:'100vh',background:S.bg,maxWidth:'480px',margin:'0 auto',padding:'20px 16px',color:S.text,fontFamily:'SF Pro Display, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'}}
      onClick={() => setMenuOpenId(null)}>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {view !== 'home' && (
            <button onClick={() => setView('home')} style={{background:'rgba(0,0,0,0.06)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',color:S.text}}>←</button>
          )}
          <h1 style={{fontSize:'28px',fontWeight:600,color:S.text,letterSpacing:'-0.374px'}}>Reel<span style={{color:S.blue}}>Recipe</span></h1>
        </div>
        <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
          <button onClick={() => setLang('ko')} style={{background: lang==='ko' ? S.blue : 'rgba(0,0,0,0.05)', border:'none', borderRadius:'8px', padding:'4px 8px', fontSize:'13px', cursor:'pointer', color: lang==='ko' ? '#fff' : S.text}}>🇰🇷</button>
          <button onClick={() => setLang('en')} style={{background: lang==='en' ? S.blue : 'rgba(0,0,0,0.05)', border:'none', borderRadius:'8px', padding:'4px 8px', fontSize:'13px', cursor:'pointer', color: lang==='en' ? '#fff' : S.text}}>🇬🇧</button>
          <button onClick={() => setView('add')} style={{...btn.small, background: view==='add' ? S.blue : '#1d1d1f', color: '#fff', whiteSpace:'nowrap'}}>{t.add}</button>
          <button onClick={() => setView('library')} style={{...btn.small, background: view==='library' ? S.blue : '#1d1d1f', color: '#fff', whiteSpace:'nowrap'}}>
            {t.library} {savedRecipes.length > 0 && `(${savedRecipes.length})`}
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{background:'rgba(0,0,0,0.05)',border:'none',borderRadius:'8px',padding:'4px 8px',fontSize:'13px',cursor:'pointer',color:S.textMuted,whiteSpace:'nowrap'}} title={user?.email ?? '로그아웃'}>⏻</button>
        </div>
      </div>

      {isGuest && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:S.blueLight,border:`1px solid ${S.blue}`,borderRadius:'12px',padding:'10px 14px',marginBottom:'16px',gap:'10px'}}>
          <p style={{fontSize:'13px',color:S.blue,margin:0}}>로그인하면 레시피가 저장돼요</p>
          <button onClick={() => setIsGuest(false)} style={{background:S.blue,color:'#fff',border:'none',borderRadius:'9999px',padding:'5px 12px',fontSize:'12px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'}}>로그인</button>
        </div>
      )}
      {error && <p style={{color:'#ef4444',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}

      {view === 'home' && (
        <div>
          {!saved && (
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <input style={{flex:1,background:'rgba(255,255,255,0.8)',border:`0.5px solid ${S.border}`,borderRadius:'14px',padding:'14px 16px',fontSize:'14px',color:S.text,outline:'none'}}
                placeholder={t.placeholder} value={url} onChange={e => setUrl(e.target.value)} />
              <button onClick={handleExtract} disabled={loading}
                onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                style={{...btn.primary, width:'auto', padding:'11px 22px', opacity: loading ? 0.5 : 1}}>
                {loading ? '...' : t.extract}
              </button>
            </div>
          )}
          {loading && (
            <div style={{...glassCard, display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', padding:'40px 24px'}}>
              <div style={{fontSize:'2.5rem'}} className="animate-spin">🍳</div>
              <p style={{fontSize:'14px',fontWeight:500}}>{t.extracting}</p>
              <div style={{width:'100%',background:'rgba(0,0,0,0.08)',borderRadius:'99px',height:'4px',overflow:'hidden'}}>
                <div style={{background:S.blue,height:'4px',borderRadius:'99px',transition:'width 0.3s',width:`${Math.round(progress)}%`}}></div>
              </div>
              <p style={{fontSize:'12px',color:S.textMuted}}>{Math.round(progress)}% — {t.analyzing}</p>
            </div>
          )}
          {saved && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 0'}}>
              <div style={{fontSize:'3rem',marginBottom:'12px'}} className="animate-bounce">🎉</div>
              <p style={{color:'#16a34a',fontWeight:500,fontSize:'18px'}}>{t.saved}</p>
              <p style={{color:S.textMuted,fontSize:'13px',marginTop:'4px'}}>{t.savedSub}</p>
              {isGuest && (
                <div style={{marginTop:'12px',background:'#fff8e1',border:'1px solid #f59e0b',borderRadius:'10px',padding:'10px 14px',width:'100%',boxSizing:'border-box'}}>
                  <p style={{fontSize:'12px',color:'#92400e',textAlign:'center',lineHeight:1.6}}>
                    ⚠️ 로그인하지 않으면 레시피가 사라질 수 있어요!<br/>
                    <button onClick={() => setShowLoginModal(true)} style={{background:'none',border:'none',color:'#b45309',fontWeight:600,cursor:'pointer',fontSize:'12px',textDecoration:'underline',padding:0}}>
                      지금 로그인하고 영구 저장하기 →
                    </button>
                  </p>
                  <p style={{fontSize:'11px',color:'#b45309',textAlign:'center',marginTop:'4px'}}>({GUEST_LIMIT - guestSaveCount}개 더 저장 가능)</p>
                </div>
              )}
              <div style={{width:'100%',marginTop:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={() => setView('library')}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.primary}>{t.goLibrary}</button>
                <button onClick={resetSaved}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.secondary}>{t.addNew}</button>
              </div>
            </div>
          )}
          {!saved && !loading && recipe && (
            <div style={glassCard}>
              {recipe.thumbnail && <img src={recipe.thumbnail} alt={recipe.title} style={{width:'100%',borderRadius:'14px',marginBottom:'16px',objectFit:'cover'}} />}
              <h2 style={{fontSize:'18px',fontWeight:600,marginBottom:'16px'}}>{recipe.title}</h2>
              <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                {recipe.ingredients?.map((ing: string, i: number) => (
                  <span key={i} style={{background:'rgba(0,102,204,0.08)',color:S.blue,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                ))}
              </div>
              <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                {recipe.steps?.map((step: string, i: number) => (
                  <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{minWidth:'24px',height:'24px',background:S.blue,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                    <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                  </div>
                ))}
              </div>
              <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                <p style={{fontSize:'12px',fontWeight:600,marginBottom:'10px'}}>{t.addTag}</p>
                <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} existingTags={existingTags} suggestedTags={getTagSuggestions(recipe.title, recipe.ingredients ?? [])} placeholder={t.newTag} addLabel={t.tagAdd} />
                <button onClick={handleSave}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={{...btn.primary, marginTop:'16px'}}>{t.save}</button>
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
              {isGuest && (
                <div style={{marginTop:'12px',background:'#fff8e1',border:'1px solid #f59e0b',borderRadius:'10px',padding:'10px 14px',width:'100%',boxSizing:'border-box'}}>
                  <p style={{fontSize:'12px',color:'#92400e',textAlign:'center',lineHeight:1.6}}>
                    ⚠️ 로그인하지 않으면 레시피가 사라질 수 있어요!<br/>
                    <button onClick={() => setShowLoginModal(true)} style={{background:'none',border:'none',color:'#b45309',fontWeight:600,cursor:'pointer',fontSize:'12px',textDecoration:'underline',padding:0}}>
                      지금 로그인하고 영구 저장하기 →
                    </button>
                  </p>
                  <p style={{fontSize:'11px',color:'#b45309',textAlign:'center',marginTop:'4px'}}>({GUEST_LIMIT - guestSaveCount}개 더 저장 가능)</p>
                </div>
              )}
              <div style={{width:'100%',marginTop:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={() => setView('library')}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.primary}>{t.goLibrary}</button>
                <button onClick={resetSaved}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.secondary}>{t.addNew}</button>
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
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={{...btn.primary, opacity: (manualLoading || (!manualText.trim() && !manualTitle.trim())) ? 0.5 : 1}}>
                  {manualLoading ? t.aiExtracting : t.aiExtract}
                </button>
              </div>
              {manualRecipe && (
                <div style={{...glassCard, marginTop:'16px'}}>
                  <h2 style={{fontSize:'18px',fontWeight:600,marginBottom:'16px'}}>{manualRecipe.title}</h2>
                  <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.ingredients}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                    {manualRecipe.ingredients?.map((ing: string, i: number) => (
                      <span key={i} style={{background:'rgba(0,102,204,0.08)',color:S.blue,borderRadius:'20px',padding:'5px 12px',fontSize:'12px'}}>{ing}</span>
                    ))}
                  </div>
                  <p style={{fontSize:'12px',fontWeight:600,color:S.blue,marginBottom:'10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{t.steps}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                    {manualRecipe.steps?.map((step: string, i: number) => (
                      <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                        <div style={{minWidth:'24px',height:'24px',background:S.blue,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff',fontWeight:600}}>{i+1}</div>
                        <p style={{fontSize:'13px',lineHeight:1.6,margin:0,paddingTop:'3px'}}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:`0.5px solid ${S.border}`,paddingTop:'16px'}}>
                    <p style={{fontSize:'12px',fontWeight:600,marginBottom:'10px'}}>{t.addTag}</p>
                    <TagInput tags={manualTags} setTags={setManualTags} tagInput={manualTagInput} setTagInput={setManualTagInput} existingTags={existingTags} suggestedTags={getTagSuggestions(manualRecipe.title, manualRecipe.ingredients ?? [])} placeholder={t.newTag} addLabel={t.tagAdd} />
                    <button onClick={handleManualSave}
                      onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      style={{...btn.primary, marginTop:'16px'}}>{t.save}</button>
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
                <button onClick={() => setView('home')}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.primary}>{t.startYoutube}</button>
                <button onClick={() => setView('add')}
                  onMouseDown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  style={btn.secondary}>{t.startManual}</button>
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
                        <div style={{width:'36px',height:'36px',background:'rgba(0,102,204,0.08)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>🍳</div>
                        <div>
                          {isEditing ? (
                            <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') renameCollection(col.name, editingName); }}
                              onClick={e => e.stopPropagation()}
                              style={{fontSize:'15px',fontWeight:600,border:`1px solid ${S.blue}`,borderRadius:'8px',padding:'2px 8px',outline:'none',color:S.text}} />
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

      {showLoginModal && (
        <div onClick={() => setShowLoginModal(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:10000,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div onClick={e => e.stopPropagation()}
            style={{background:'#fff',borderRadius:'24px 24px 0 0',padding:'32px 24px 40px',width:'100%',maxWidth:'480px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{width:'36px',height:'4px',background:S.border,borderRadius:'9999px',margin:'0 auto 8px'}} />
            <h2 style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',marginBottom:'4px'}}>저장하려면 로그인이 필요해요</h2>
            <p style={{fontSize:'14px',color:S.textMuted,marginBottom:'8px'}}>로그인하면 레시피가 내 계정에 저장돼요</p>
            <button
              onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); }}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',width:'100%',padding:'14px',background:S.text,color:'#fff',border:'none',borderRadius:'9999px',fontSize:'15px',fontWeight:500,cursor:'pointer'}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google로 로그인
            </button>
            <button onClick={() => setShowLoginModal(false)}
              style={{width:'100%',padding:'14px',background:'transparent',border:`1px solid ${S.border}`,borderRadius:'9999px',fontSize:'15px',color:S.textMuted,cursor:'pointer'}}>
              계속 둘러보기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}