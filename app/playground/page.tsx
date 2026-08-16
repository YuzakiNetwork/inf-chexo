'use client';

import { useMemo, useState } from 'react';
import { Shell } from '@/components/shell';

const starterHtml = `<main class="app">
  <h1>Hello, CHEXO!</h1>
  <p>Edit HTML, CSS, dan JavaScript di tab sebelah kiri.</p>
  <button id="hello">Klik saya</button>
</main>`;

const starterCss = `body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f4f6fb;
}

.app {
  max-width: 640px;
  margin: 40px auto;
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 40px rgba(15, 23, 42, .08);
}

h1 { color: #334a91; }
button { padding: 10px 14px; border: 0; border-radius: 8px; cursor: pointer; }`;

const starterJs = `document.querySelector('#hello')?.addEventListener('click', () => {
  alert('Halo dari JavaScript!');
});`;

type Tab = 'html' | 'css' | 'js';

export default function Playground() {
  const [tab, setTab] = useState<Tab>('html');
  const [html, setHtml] = useState(starterHtml);
  const [css, setCss] = useState(starterCss);
  const [js, setJs] = useState(starterJs);

  const code = tab === 'html' ? html : tab === 'css' ? css : js;
  const setCode = tab === 'html' ? setHtml : tab === 'css' ? setCss : setJs;

  const preview = useMemo(() => `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${html}<script>${js.replace(/<\/script>/gi, '<\\/script>')}<\/script></body>
</html>`, [html, css, js]);

  return <Shell><div className="container">
    <section className="page-head">
      <div className="eyebrow">CHEXO Playground</div>
      <h1>Belajar dengan mencoba.</h1>
      <p>Editor HTML, CSS, dan JavaScript dengan live preview langsung di browser.</p>
    </section>

    <section className="section">
      <div className="playground-toolbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12}}>
        <div className="playground-tabs" role="tablist" aria-label="Bahasa pemrograman">
          {([['html','HTML'],['css','CSS'],['js','JavaScript']] as const).map(([value,label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`playground-tab ${tab === value ? 'active' : ''}`}>{label}</button>)}
        </div>
        <span className="tag">Live Preview</span>
      </div>

      <div className="playground-layout" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:16}}>
        <div className="playground-editor-panel">
          <div className="tag" style={{marginBottom:8}}>Editor · {tab === 'html' ? 'HTML' : tab === 'css' ? 'CSS' : 'JavaScript'}</div>
          <textarea className="editor playground-editor" spellCheck={false} value={code} onChange={e => setCode(e.target.value)} aria-label={`${tab} code editor`} />
        </div>
        <div className="playground-preview-panel">
          <div className="tag" style={{marginBottom:8}}>Preview</div>
          <iframe className="preview playground-preview" title="CHEXO Playground Preview" srcDoc={preview} sandbox="allow-scripts" />
        </div>
      </div>
    </section>

    <style jsx>{`
      .playground-tabs { display:flex; gap:6px; padding:4px; border:1px solid var(--border); border-radius:12px; width:max-content; }
      .playground-tab { border:0; background:transparent; border-radius:8px; padding:8px 14px; cursor:pointer; font:inherit; color:inherit; }
      .playground-tab.active { background:var(--primary); color:white; }
      .playground-editor { width:100%; min-height:520px; resize:vertical; box-sizing:border-box; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:13px; line-height:1.65; tab-size:2; }
      .playground-preview { width:100%; min-height:520px; border:1px solid var(--border); border-radius:12px; background:white; }
      @media (max-width: 900px) { .playground-layout { grid-template-columns:1fr !important; } .playground-editor,.playground-preview { min-height:420px; } }
      @media (max-width: 520px) { .playground-toolbar { align-items:flex-start !important; flex-direction:column; } .playground-tabs { width:100%; } .playground-tab { flex:1; } }
    `}</style>
  </div></Shell>;
}
