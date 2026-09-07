'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shell } from '@/components/shell';
import { translateJawa } from '@/lib/jawascript';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

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

const starterPy = `# Coba edit dan klik Run
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("10 angka pertama deret Fibonacci:")
print(list(fibonacci(10)))`;

const starterJawa = `// JawaScript: JavaScript nganggo basa Jawa
// https://github.com/arwildo/jawascript
ono x = 10;
ono y = 20;

tampilno(x + y);

yen (x < y) {
    tampilno("x luwih cilik");
} yen ora {
    tampilno("x luwih gedhe");
}`;

const starterC = `#include <stdio.h>

int main() {
    printf("Halo dari C!\\n");
    return 0;
}`;

const starterCpp = `#include <iostream>

int main() {
    std::cout << "Halo dari C++!" << std::endl;
    return 0;
}`;

type Workspace = 'web' | 'python' | 'jawascript' | 'c' | 'cpp';
type WebTab = 'html' | 'css' | 'js';

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat runtime Python.'));
    document.body.appendChild(s);
  });
}

const WORKSPACES: Array<{ id: Workspace; label: string }> = [
  { id: 'web', label: '🌐 Web' },
  { id: 'python', label: '🐍 Python' },
  { id: 'jawascript', label: '🦉 JawaScript' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
];

export default function Playground() {
  const [workspace, setWorkspace] = useState<Workspace>('web');
  const [webTab, setWebTab] = useState<WebTab>('html');
  const [html, setHtml] = useState(starterHtml);
  const [css, setCss] = useState(starterCss);
  const [js, setJs] = useState(starterJs);
  const [py, setPy] = useState(starterPy);
  const [jawa, setJawa] = useState(starterJawa);
  const [cCode, setCCode] = useState(starterC);
  const [cppCode, setCppCode] = useState(starterCpp);

  const [pyOutput, setPyOutput] = useState('Klik "Run" untuk menjalankan kode Python.');
  const [jawaOutput, setJawaOutput] = useState('Klik "Run" untuk menjalankan kode JawaScript.');
  const [cOutput, setCOutput] = useState('Klik "Run" untuk compile & jalankan.');
  const [cppOutput, setCppOutput] = useState('Klik "Run" untuk compile & jalankan.');
  const [jawaDoc, setJawaDoc] = useState('');
  const [running, setRunning] = useState(false);
  const pyodideRef = useRef<any>(null);

  const webFiles: Record<WebTab, { label: string; value: string; set: (v: string) => void; lang: string }> = {
    html: { label: 'index.html', value: html, set: setHtml, lang: 'html' },
    css: { label: 'style.css', value: css, set: setCss, lang: 'css' },
    js: { label: 'script.js', value: js, set: setJs, lang: 'javascript' },
  };

  const preview = useMemo(() => `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${html}<script>${js.replace(/<\/script>/gi, '<\\/script>')}<\/script></body>
</html>`, [html, css, js]);

  // JawaScript dijalankan di iframe tersandbox terpisah; console.log
  // dikirim balik lewat postMessage supaya kode di dalamnya tidak
  // punya akses ke halaman utama.
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.source !== 'chexo-jawascript') return;
      if (e.data.type === 'log') setJawaOutput((prev) => (prev === '__running__' ? e.data.text : `${prev}\n${e.data.text}`));
      if (e.data.type === 'error') setJawaOutput((prev) => `${prev === '__running__' ? '' : prev + '\n'}Error: ${e.data.text}`);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const runPython = async () => {
    setRunning(true);
    setPyOutput('Menjalankan...');
    try {
      if (!pyodideRef.current) {
        setPyOutput('Menyiapkan runtime Python (pertama kali agak lama, ~10-20 detik)...');
        await loadScriptOnce(PYODIDE_URL);
        pyodideRef.current = await (window as any).loadPyodide();
      }
      const pyodide = pyodideRef.current;
      const lines: string[] = [];
      pyodide.setStdout({ batched: (s: string) => lines.push(s) });
      pyodide.setStderr({ batched: (s: string) => lines.push(s) });
      await pyodide.runPythonAsync(py);
      setPyOutput(lines.length ? lines.join('\n') : '(tidak ada output — coba tambahkan print())');
    } catch (err: any) {
      setPyOutput(`Error:\n${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  const runJawaScript = () => {
    setJawaOutput('__running__');
    const translated = translateJawa(jawa);
    const doc = `<!doctype html><html><body><script>
(function(){
  function send(type, text){ parent.postMessage({source:'chexo-jawascript', type, text}, '*'); }
  const console = { log: (...a) => send('log', a.map(String).join(' ')) };
  try { ${translated} } catch (err) { send('error', err.message); }
})();
<\/script></body></html>`;
    setJawaDoc(`${doc}\x3c!-- ${Date.now()} --\x3e`);
  };

  const runCompiled = async (language: 'c' | 'cpp') => {
    const code = language === 'c' ? cCode : cppCode;
    const setOutput = language === 'c' ? setCOutput : setCppOutput;
    setRunning(true);
    setOutput('Meng-compile & menjalankan (layanan compiler publik, mohon tunggu)...');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menjalankan kode.');
      setOutput(data.output?.trim() || '(tidak ada output)');
    } catch (err: any) {
      setOutput(`Error:\n${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  const runCurrent = () => {
    if (workspace === 'python') void runPython();
    else if (workspace === 'jawascript') runJawaScript();
    else if (workspace === 'c' || workspace === 'cpp') void runCompiled(workspace);
  };

  const editorProps = (() => {
    switch (workspace) {
      case 'python': return { language: 'python', value: py, onChange: setPy, fileLabel: 'main.py' };
      case 'jawascript': return { language: 'javascript', value: jawa, onChange: setJawa, fileLabel: 'main.jawa' };
      case 'c': return { language: 'c', value: cCode, onChange: setCCode, fileLabel: 'main.c' };
      case 'cpp': return { language: 'cpp', value: cppCode, onChange: setCppCode, fileLabel: 'main.cpp' };
      default: return null;
    }
  })();

  return (
    <Shell>
      <div className="container">
        <section className="page-head">
          <div className="eyebrow">CHEXO Playground</div>
          <h1>Belajar dengan mencoba.</h1>
          <p>Editor sekelas VS Code, langsung di browser. Web, Python, JawaScript, C, dan C++.</p>
        </section>

        <section className="section">
          <div className="vsc">
            <div className="vsc-topbar">
              <div className="vsc-dots"><span /><span /><span /></div>
              <div className="vsc-workspace">
                {WORKSPACES.map((w) => (
                  <button key={w.id} className={workspace === w.id ? 'active' : ''} onClick={() => setWorkspace(w.id)}>
                    {w.label}
                  </button>
                ))}
              </div>
              {workspace !== 'web' && (
                <button className="vsc-run" onClick={runCurrent} disabled={running}>
                  {running ? 'Running…' : '▶ Run'}
                </button>
              )}
            </div>

            <div className="vsc-body">
              <div className="vsc-activitybar">
                <span className="icon">description</span>
                <span className="icon">search</span>
                <span className="icon">source_control</span>
                <span className="icon">extension</span>
              </div>

              <div className="vsc-main">
                <div className="vsc-tabs">
                  {workspace === 'web'
                    ? (Object.keys(webFiles) as WebTab[]).map((k) => (
                        <button key={k} className={`vsc-tab ${webTab === k ? 'active' : ''}`} onClick={() => setWebTab(k)}>
                          {webFiles[k].label}
                        </button>
                      ))
                    : <button className="vsc-tab active">{editorProps?.fileLabel}</button>}
                </div>

                <div className="vsc-editor">
                  <Editor
                    height="480px"
                    theme="vs-dark"
                    language={workspace === 'web' ? webFiles[webTab].lang : editorProps!.language}
                    value={workspace === 'web' ? webFiles[webTab].value : editorProps!.value}
                    onChange={(v) => (workspace === 'web' ? webFiles[webTab].set(v || '') : editorProps!.onChange(v || ''))}
                    options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
                  />
                </div>
              </div>

              <div className="vsc-side">
                <div className="vsc-side-head">{workspace === 'web' ? 'PREVIEW' : 'TERMINAL'}</div>
                {workspace === 'web' && <iframe className="vsc-preview" title="Preview" srcDoc={preview} sandbox="allow-scripts" />}
                {workspace === 'python' && <pre className="vsc-terminal">{pyOutput}</pre>}
                {workspace === 'jawascript' && (
                  <>
                    <pre className="vsc-terminal">{jawaOutput === '__running__' ? 'Menjalankan...' : jawaOutput}</pre>
                    <iframe style={{ display: 'none' }} sandbox="allow-scripts" srcDoc={jawaDoc} title="jawascript-runner" />
                  </>
                )}
                {workspace === 'c' && <pre className="vsc-terminal">{cOutput}</pre>}
                {workspace === 'cpp' && <pre className="vsc-terminal">{cppOutput}</pre>}
              </div>
            </div>

            <div className="vsc-statusbar">
              <span>CHEXO Playground</span>
              <span>
                {workspace === 'web' ? webFiles[webTab].lang.toUpperCase()
                  : workspace === 'python' ? 'PYTHON 3 (Pyodide)'
                  : workspace === 'jawascript' ? 'JAWASCRIPT'
                  : workspace === 'c' ? 'C (GCC, via Wandbox)'
                  : 'C++ (GCC, via Wandbox)'}
              </span>
              <span>UTF-8</span>
            </div>
          </div>
          {(workspace === 'c' || workspace === 'cpp') && (
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Compile &amp; run C/C++ memakai layanan publik <a href="https://wandbox.org" target="_blank" rel="noreferrer">Wandbox</a> — butuh koneksi internet dan bisa agak lambat saat sibuk.
            </p>
          )}
        </section>
      </div>
    </Shell>
  );
}
