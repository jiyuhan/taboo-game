import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { word, previousClues } = await request.json();

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (!previousClues || previousClues.length === 0) {
      // Generate first clue for the word
      systemPrompt = `You are a creative and witty AI host for a Taboo word-guessing game. The player needs to guess the word "${word}".

Your job is to:
1. Give a clever, funny, or mind-blowing clue about the word WITHOUT saying the word itself or any part of it
2. Make the clue engaging and entertaining
3. The clue should be challenging but not impossible
4. Be creative and use wordplay, metaphors, or pop culture references

Return ONLY the clue text, nothing else.`;

      userPrompt = `Give me your first creative clue for the word "${word}". Make it fun and witty!`;
    } else {
      // Generate another clue for the same word
      systemPrompt = `You are a creative and witty AI host for a Taboo word-guessing game. The player is trying to guess the word "${word}" but hasn't gotten it yet. 

Previous clues you've given:
${previousClues.map((clue: string, idx: number) => `${idx + 1}. ${clue}`).join('\n')}

Give a NEW clue that:
1. Is different from your previous clues
2. Approaches the word from a new angle
3. Is progressively more helpful (but still fun and creative)
4. Does NOT say the word "${word}" or any part of it
5. Can be more direct if this is the 3rd+ clue

Return ONLY the new clue text, nothing else.`;

      userPrompt = `Give me another creative clue for "${word}". Make it more helpful than before but still entertaining!`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const clue = data.choices[0].message.content.trim();

    return NextResponse.json({ clue });
  } catch (error) {
    console.error('Error in get-clue API:', error);
    return NextResponse.json(
      { error: 'Failed to generate clue' },
      { status: 500 }
    );
  }
}