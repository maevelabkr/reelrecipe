import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { YoutubeTranscript } from 'youtube-transcript';
import { detectPlatform, extractVideoId } from '@/utils/detectPlatform';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getYouTubeData(videoId: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  const snippet = data.items?.[0]?.snippet;
  if (!snippet) throw new Error('YouTube video not found');

  let transcript = '';
  try {
    const lines = await YoutubeTranscript.fetchTranscript(videoId);
    transcript = lines.map((l: any) => l.text).join(' ');
  } catch {}

  return {
    title: snippet.title,
    description: snippet.description,
    thumbnail: snippet.thumbnails?.high?.url,
    transcript,
  };
}

async function getTikTokData(url: string) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!data.data) throw new Error('TikTok 영상을 가져올 수 없어요');
  return {
    title: data.data.title,
    description: data.data.title,
    thumbnail: data.data.cover,
    transcript: data.data.title,
  };
}

async function extractRecipe(rawText: string, title: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a recipe extraction assistant.
Given the following video transcript/description, extract:
- A clean recipe title
- A list of ingredients with quantities
- Numbered step-by-step cooking instructions

반드시 한국어로 답해. 재료명과 조리순서 모두 한국어로 작성해.
Return ONLY valid JSON with no extra text:
{"title": "string", "ingredients": ["string"], "steps": ["string"]}

Video title: ${title}
Text: ${rawText.slice(0, 3000)}`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  const jsonStr = clean.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    let videoData: any;
    if (platform === 'youtube') {
      const videoId = extractVideoId(url, platform);
      if (!videoId) throw new Error('Could not extract video ID');
      videoData = await getYouTubeData(videoId);
    } else if (platform === 'tiktok') {
      videoData = await getTikTokData(url);
    } else {
      return NextResponse.json({ error: 'Instagram은 아직 지원하지 않아요' }, { status: 400 });
    }

    const recipe = await extractRecipe(
      videoData.transcript || videoData.description,
      videoData.title
    );

    return NextResponse.json({
      ...recipe,
      thumbnail: videoData.thumbnail,
      url,
      platform,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}