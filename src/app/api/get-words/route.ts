import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { category, count = 20 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
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

    const systemPrompt = `You are a creative word generator for a Taboo guessing game. Generate a list of words that fit the given category.

Requirements:
1. Generate exactly ${count} words
2. Words should be well-known and guessable
3. Mix of easy, medium, and challenging words
4. Vary between single words and common phrases (2-3 words max)
5. Ensure variety - no duplicate concepts
6. Words should be appropriate for all ages
7. For the category, think broadly and creatively

Return your response in this EXACT JSON format:
{
  "words": ["word1", "word2", "word3", ...]
}

Example for "Movies & TV":
{
  "words": ["Inception", "Breaking Bad", "Avatar", "The Office", ...]
}`;

    const userPrompt = `Generate ${count} diverse and interesting words for the "${category}" category. Make them fun and varied in difficulty!`;

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
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    // Parse JSON response
    try {
      const parsed = JSON.parse(aiResponse);
      
      if (!parsed.words || !Array.isArray(parsed.words)) {
        throw new Error('Invalid response format');
      }

      // Shuffle the words for randomness
      const shuffled = parsed.words.sort(() => Math.random() - 0.5);

      return NextResponse.json({
        words: shuffled,
        category,
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('AI Response:', aiResponse);
      
      // Fallback: try to extract words from response
      const fallbackWords = aiResponse
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, count);

      console.log(`Fallback words: ${fallbackWords}`);

      return NextResponse.json({
        words: fallbackWords.length > 0 ? fallbackWords : ['Mystery', 'Challenge', 'Adventure'],
        category,
      });
    }
  } catch (error) {
    console.error('Error in get-words API:', error);
    return NextResponse.json(
      { error: 'Failed to generate words' },
      { status: 500 }
    );
  }
}