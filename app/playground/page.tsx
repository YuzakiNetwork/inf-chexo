'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shell } from '@/components/shell';
import { translateJawa } from '@/lib/jawascript';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

type FileItem = { id: string; name: string; content: string };
type RunKind = 'web' | 'python' | 'jawascript' | 'c' | 'cpp' | 'none';

function extOf(name: string) {
  return name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
}

const MONACO_LANG: Record<string, string> = {
  html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript',
  py: 'python', jawa: 'javascript', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
};

function monacoLang(name: string) {
  return MONACO_LANG[extOf(name)] || 'plaintext';
}

function runKindOf(name: string): RunKind {
  const ext = extOf(name);
  if (['html', 'htm', 'css', 'js', 'mjs'].includes(ext)) return 'web';
  if (ext === 'py') return 'python';
  if (ext === 'jawa') return 'jawascript';
  if (['c', 'h'].includes(ext)) return 'c';
  if (['cpp', 'cc', 'cxx', 'hpp'].includes(ext)) return 'cpp';
  return 'none';
}

const DEFAULT_FILES: FileItem[] = [
  { id: 'f1', name: 'index.html', content: `<main class="app">\n  <h1>Hello, CHEXO!</h1>\n  <p>Edit HTML, CSS, dan JavaScript, atau tambah file bahasa lain lewat Explorer.</p>\n  <button id="hello">Klik saya</button>\n</main>` },
  { id: 'f2', name: 'style.css', content: `body { margin: 0; font-family: Arial, sans-serif; background: #f4f6fb; }\n.app { max-width: 640px; margin: 40px auto; padding: 32px; border-radius: 16px; background: white; box-shadow: 0 12px 40px rgba(15,23,42,.08); }\nh1 { color: #334a91; }\nbutton { padding: 10px 14px; border: 0; border-radius: 8px; cursor: pointer; }` },
  { id: 'f3', name: 'script.js', content: `document.querySelector('#hello')?.addEventListener('click', () => {\n  alert('Halo dari JavaScript!');\n});` },
  { id: 'f4', name: 'main.py', content: `# Coba edit dan klik Run\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint("10 angka pertama deret Fibonacci:")\nprint(list(fibonacci(10)))` },
  { id: 'f5', name: 'main.jawa', content: `// JawaScript: JavaScript nganggo basa Jawa\n// https://github.com/arwildo/jawascript\nono x = 10;\nono y = 20;\n\ntampilno(x + y);\n\nyen (x < y) {\n    tampilno("x luwih cilik");\n} yen ora {\n    tampilno("x luwih gedhe");\n}` },
  { id: 'f6', name: 'main.c', content: `#include <stdio.h>\n\nint main() {\n    printf("Halo dari C!\\n");\n    return 0;\n}` },
  { id: 'f7', name: 'main.cpp', content: `#include <iostream>\n\nint main() {\n    std::cout << "Halo dari C++!" << std::endl;\n    return 0;\n}` },
];

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
  const [files, setFiles] = useState<FileItem[]>(DEFAULT_FILES);
  const [activeId, setActiveId] = useState('f1');
  const [newName, setNewName] = useState('');
  const [output, setOutput] = useState('Klik "Run" untuk menjalankan file yang aktif.');
  const [running, setRunning] = useState(false);
  const [jawaDoc, setJawaDoc] = useState('');
  const pyodideRef = useRef<any>(null);

  const active = files.find((f) => f.id === activeId) || files[0];
  const activeKind = runKindOf(active.name);

  const updateActiveContent = (value: string) => {
    setFiles((fs) => fs.map((f) => (f.id === active.id ? { ...f, content: value } : f)));
  };

  const addFile = () => {
    const name = newName.trim();
    if (!name) return;
    if (files.some((f) => f.name === name)) { alert('Nama file sudah dipakai.'); return; }
    const file: FileItem = { id: `f${Date.now()}`, name, content: '' };
    setFiles((fs) => [...fs, file]);
    setActiveId(file.id);
    setNewName('');
  };

  const deleteFile = (id: string) => {
    if (files.length <= 1) return;
    if (!confirm('Hapus file ini?')) return;
    setFiles((fs) => fs.filter((f) => f.id !== id));
    if (activeId === id) setActiveId(files.find((f) => f.id !== id)!.id);
  };

  // Web preview: gabungkan semua file .html/.css/.js/.mjs yang ada, bukan cuma 3 file bawaan.
  const webPreview = useMemo(() => {
    const htmlFile = files.find((f) => ['html', 'htm'].includes(extOf(f.name)));
    const css = files.filter((f) => extOf(f.name) === 'css').map((f) => f.content).join('\n');
    const js = files.filter((f) => ['js', 'mjs'].includes(extOf(f.name))).map((f) => f.content).join('\n');
    const body = htmlFile ? htmlFile.content : '<p style="font-family:sans-serif;color:#888">Belum ada file .html</p>';
    return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}<script>${js.replace(/<\/script>/gi, '<\\/script>')}<\/script></body></html>`;
  }, [files]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.source !== 'chexo-jawascript') return;
      if (e.data.type === 'log') setOutput((prev) => (prev === '__running__' ? e.data.text : `${prev}\n${e.data.text}`));
      if (e.data.type === 'error') setOutput((prev) => `${prev === '__running__' ? '' : prev + '\n'}Error: ${e.data.text}`);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const runPython = async () => {
    setRunning(true);
    setOutput('Menjalankan...');
    try {
      if (!pyodideRef.current) {
        setOutput('Menyiapkan runtime Python (pertama kali agak lama, ~10-20 detik)...');
        await loadScriptOnce(PYODIDE_URL);
        pyodideRef.current = await (window as any).loadPyodide();
      }
      const pyodide = pyodideRef.current;
      // Tulis semua file .py ke filesystem Pyodide, biar antar-file bisa saling import.
      files.filter((f) => extOf(f.name) === 'py').forEach((f) => pyodide.FS.writeFile(f.name, f.content));
      const lines: string[] = [];
      pyodide.setStdout({ batched: (s: string) => lines.push(s) });
      pyodide.setStderr({ batched: (s: string) => lines.push(s) });
      await pyodide.runPythonAsync(active.content);
      setOutput(lines.length ? lines.join('\n') : '(tidak ada output — coba tambahkan print())');
    } catch (err: any) {
      setOutput(`Error:\n${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  const runJawaScript = () => {
    setOutput('__running__');
    const translated = translateJawa(active.content);
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
    setRunning(true);
    setOutput('Meng-compile & menjalankan (layanan compiler publik, mohon tunggu)...');
    const siblings = files.filter((f) => f.id !== active.id && runKindOf(f.name) === language);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code: active.content,
          codes: siblings.map((f) => ({ file: f.name, code: f.content })),
        }),
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
    if (activeKind === 'python') void runPython();
    else if (activeKind === 'jawascript') runJawaScript();
    else if (activeKind === 'c' || activeKind === 'cpp') void runCompiled(activeKind);
  };

  const statusLabel: Record<RunKind, string> = {
    web: 'PREVIEW (HTML/CSS/JS)', python: 'PYTHON 3 (Pyodide)', jawascript: 'JAWASCRIPT',
    c: 'C (GCC, via Wandbox)', cpp: 'C++ (GCC, via Wandbox)', none: 'PLAINTEXT (tidak bisa dijalankan)',
  };

  return (
    <Shell>
      <div className="container">
        <section className="page-head">
          <div className="eyebrow">CHEXO Playground</div>
          <h1>Belajar dengan mencoba.</h1>
          <p>Editor sekelas VS Code. Tambah file apa saja — bahasanya otomatis terdeteksi dari ekstensi.</p>
        </section>

        <section className="section">
          <div className="vsc">
            <div className="vsc-topbar">
              <div className="vsc-dots"><span /><span /><span /></div>
              <span className="vsc-breadcrumb">{active.name}</span>
              {activeKind !== 'web' && activeKind !== 'none' && (
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

              <div className="vsc-explorer">
                <div className="vsc-explorer-head">EXPLORER</div>
                <div className="vsc-explorer-list">
                  {files.map((f) => (
                    <div key={f.id} className={`vsc-file ${f.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(f.id)}>
                      <span>{f.name}</span>
                      {files.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }} title="Hapus file">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="vsc-explorer-add">
                  <input
                    placeholder="nama-file.ext"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFile()}
                  />
                  <button onClick={addFile}>+</button>
                </div>
              </div>

              <div className="vsc-main">
                <div className="vsc-editor">
                  <Editor
                    height="480px"
                    theme="vs-dark"
                    path={active.name}
                    language={monacoLang(active.name)}
                    value={active.content}
                    onChange={(v) => updateActiveContent(v || '')}
                    options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
                  />
                </div>
              </div>

              <div className="vsc-side">
                <div className="vsc-side-head">{activeKind === 'web' ? 'PREVIEW' : 'TERMINAL'}</div>
                {activeKind === 'web' && <iframe className="vsc-preview" title="Preview" srcDoc={webPreview} sandbox="allow-scripts" />}
                {activeKind === 'jawascript' && (
                  <>
                    <pre className="vsc-terminal">{output === '__running__' ? 'Menjalankan...' : output}</pre>
                    <iframe style={{ display: 'none' }} sandbox="allow-scripts" srcDoc={jawaDoc} title="jawascript-runner" />
                  </>
                )}
                {(activeKind === 'python' || activeKind === 'c' || activeKind === 'cpp') && <pre className="vsc-terminal">{output}</pre>}
                {activeKind === 'none' && <pre className="vsc-terminal">Ekstensi file ini belum dikenali untuk dijalankan, tapi tetap bisa diedit &amp; disimpan.</pre>}
              </div>
            </div>

            <div className="vsc-statusbar">
              <span>CHEXO Playground</span>
              <span>{statusLabel[activeKind]}</span>
              <span>UTF-8</span>
            </div>
          </div>
          {(activeKind === 'c' || activeKind === 'cpp') && (
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Compile &amp; run C/C++ memakai layanan publik <a href="https://wandbox.org" target="_blank" rel="noreferrer">Wandbox</a> — butuh koneksi internet dan bisa agak lambat saat sibuk.
            </p>
          )}
        </section>
      </div>
    </Shell>
  );
}
