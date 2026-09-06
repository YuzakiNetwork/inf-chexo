'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shell } from '@/components/shell';

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

type Workspace = 'web' | 'python';
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

export default function Playground() {
  const [workspace, setWorkspace] = useState<Workspace>('web');
  const [webTab, setWebTab] = useState<WebTab>('html');
  const [html, setHtml] = useState(starterHtml);
  const [css, setCss] = useState(starterCss);
  const [js, setJs] = useState(starterJs);
  const [py, setPy] = useState(starterPy);
  const [pyOutput, setPyOutput] = useState('Klik "Run" untuk menjalankan kode Python.');
  const [pyRunning, setPyRunning] = useState(false);
  const pyodideRef = useRef<any>(null);

  const webFiles: Record<WebTab, { label: string; icon: string; value: string; set: (v: string) => void; lang: string }> = {
    html: { label: 'index.html', icon: 'html', value: html, set: setHtml, lang: 'html' },
    css: { label: 'style.css', icon: 'css', value: css, set: setCss, lang: 'css' },
    js: { label: 'script.js', icon: 'js', value: js, set: setJs, lang: 'javascript' },
  };

  const preview = useMemo(() => `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${html}<script>${js.replace(/<\/script>/gi, '<\\/script>')}<\/script></body>
</html>`, [html, css, js]);

  const runPython = async () => {
    setPyRunning(true);
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
      setPyRunning(false);
    }
  };

  return (
    <Shell>
      <div className="container">
        <section className="page-head">
          <div className="eyebrow">CHEXO Playground</div>
          <h1>Belajar dengan mencoba.</h1>
          <p>Editor sekelas VS Code, langsung di browser. Pilih Web (HTML/CSS/JS) atau Python.</p>
        </section>

        <section className="section">
          <div className="vsc">
            <div className="vsc-topbar">
              <div className="vsc-dots"><span /><span /><span /></div>
              <div className="vsc-workspace">
                <button className={workspace === 'web' ? 'active' : ''} onClick={() => setWorkspace('web')}>🌐 Web</button>
                <button className={workspace === 'python' ? 'active' : ''} onClick={() => setWorkspace('python')}>🐍 Python</button>
              </div>
              {workspace === 'python' && (
                <button className="vsc-run" onClick={() => void runPython()} disabled={pyRunning}>
                  {pyRunning ? 'Running…' : '▶ Run'}
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
                    : <button className="vsc-tab active">main.py</button>}
                </div>

                <div className="vsc-editor">
                  <Editor
                    height="480px"
                    theme="vs-dark"
                    language={workspace === 'web' ? webFiles[webTab].lang : 'python'}
                    value={workspace === 'web' ? webFiles[webTab].value : py}
                    onChange={(v) => (workspace === 'web' ? webFiles[webTab].set(v || '') : setPy(v || ''))}
                    options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
                  />
                </div>
              </div>

              <div className="vsc-side">
                <div className="vsc-side-head">{workspace === 'web' ? 'PREVIEW' : 'TERMINAL'}</div>
                {workspace === 'web' ? (
                  <iframe className="vsc-preview" title="Preview" srcDoc={preview} sandbox="allow-scripts" />
                ) : (
                  <pre className="vsc-terminal">{pyOutput}</pre>
                )}
              </div>
            </div>

            <div className="vsc-statusbar">
              <span>CHEXO Playground</span>
              <span>{workspace === 'web' ? webFiles[webTab].lang.toUpperCase() : 'PYTHON 3 (Pyodide)'}</span>
              <span>UTF-8</span>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
