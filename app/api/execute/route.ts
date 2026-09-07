import { NextResponse } from 'next/server';

const COMPILER_BY_LANG: Record<string, string> = {
  c: 'gcc-head-c',
  cpp: 'gcc-head',
};

export async function POST(req: Request) {
  let body: { language?: string; code?: string; codes?: Array<{ file: string; code: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body tidak valid.' }, { status: 400 });
  }

  const compiler = COMPILER_BY_LANG[body.language || ''];
  if (!compiler) {
    return NextResponse.json({ error: 'Bahasa tidak didukung.' }, { status: 400 });
  }
  if (!body.code || !body.code.trim()) {
    return NextResponse.json({ error: 'Kode kosong.' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: body.code,
        codes: Array.isArray(body.codes) ? body.codes : undefined,
        options: 'warning',
        save: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: `Compiler service error (${res.status}).` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      output: [data.compiler_message, data.program_message].filter(Boolean).join('\n'),
      status: data.status,
      signal: data.signal || null,
    });
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'Timeout — compiler service terlalu lama merespons.' : (err?.message || 'Gagal menghubungi compiler service.');
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
