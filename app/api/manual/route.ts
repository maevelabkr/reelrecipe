import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, title, steps } = await req.json();

    const prompt = title && steps
      ? `음식 이름: ${title}
조리 순서: ${steps}

위 정보로 레시피를 완성해줘. 조리 순서에서 재료와 양을 추론해서 재료 목록을 만들어줘.
반드시 아래 JSON 형식으로만 답해:
{"title": "레시피 이름", "ingredients": ["재료1 양", "재료2 양"], "steps": ["1단계", "2단계"]}`
      : `아래 텍스트에서 레시피를 추출해서 JSON으로 반환해줘.
반드시 아래 형식으로만 답해:
반드시 한국어로 답해. 재료명과 조리순서 모두 한국어로 작성해.
{"title": "레시피 이름", "ingredients": ["재료1", "재료2"], "steps": ["1단계", "2단계"]}
텍스트: ${text}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}