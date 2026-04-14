import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    // https://colormagic.app/api/palette/search?q=green
    const res = await fetch(`https://colormagic.app/api/palette/search?q=${encodeURIComponent(q || '')}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // Kuch APIs browser agent mangti hain
      },
    });

    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });

    const data = await res.json();
    // console.log('Fetched palette data:', data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}