import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Editor from '@monaco-editor/react'
import JSZip from 'jszip'
import './styles.css'

const starterFiles = [
  { name: 'FreightFrenzyTeleOp.java', content: `package org.firstinspires.ftc.teamcode;\n\nimport com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;\nimport com.qualcomm.robotcore.eventloop.opmode.TeleOp;\nimport com.qualcomm.robotcore.hardware.DcMotor;\nimport com.qualcomm.robotcore.hardware.Servo;\n\n@TeleOp(name = "Freight Frenzy")\npublic class FreightFrenzyTeleOp extends LinearOpMode {\n    private DcMotor leftDrive;\n    private DcMotor rightDrive;\n    private Servo claw;\n\n    @Override\n    public void runOpMode() {\n        leftDrive = hardwareMap.get(DcMotor.class, "leftDrive");\n        rightDrive = hardwareMap.get(DcMotor.class, "rightDrive");\n        claw = hardwareMap.get(Servo.class, "claw");\n\n        waitForStart();\n        while (opModeIsActive()) {\n            double drive = -gamepad1.left_stick_y;\n            leftDrive.setPower(drive);\n            rightDrive.setPower(drive);\n\n            if (gamepad1.a) {\n                claw.setPosition(0.8);\n            }\n        }\n    }\n}` },
  { name: 'RobotHardware.java', content: `package org.firstinspires.ftc.teamcode;\n\nimport com.qualcomm.robotcore.hardware.DcMotor;\nimport com.qualcomm.robotcore.hardware.HardwareMap;\n\npublic class RobotHardware {\n    public DcMotor leftDrive;\n    public DcMotor rightDrive;\n\n    public void init(HardwareMap hardwareMap) {\n        leftDrive = hardwareMap.get(DcMotor.class, "leftDrive");\n        rightDrive = hardwareMap.get(DcMotor.class, "rightDrive");\n    }\n}` },
  { name: 'Autonomous.java', content: `package org.firstinspires.ftc.teamcode;\n\nimport com.qualcomm.robotcore.eventloop.opmode.Autonomous;\nimport com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;\nimport com.qualcomm.robotcore.hardware.DcMotor;\n\n@Autonomous(name = "Red Warehouse")\npublic class RedWarehouse extends LinearOpMode {\n    @Override\n    public void runOpMode() {\n        DcMotor leftDrive = hardwareMap.get(DcMotor.class, "leftDrive");\n        waitForStart();\n        leftDrive.setPower(0.35);\n        sleep(1200);\n        leftDrive.setPower(0);\n    }\n}` },
]

const Icon = ({ name, size = 17 }) => {
  const paths = { code: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>, upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>, share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/></>, copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>, download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>, comment: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>, lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>, globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></>, close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>, plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>, check: <polyline points="20 6 9 17 4 12"/>, arrow: <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>, menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></> }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function getMeta(files) {
  const code = files.map(f => f.content).join('\n')
  const modes = []
  if (/@TeleOp\b/.test(code)) modes.push('TeleOp')
  if (/@Autonomous\b/.test(code)) modes.push('Autonomous')
  if (!modes.length) modes.push('Subsystem / Helper')
  const devices = [...new Set([...code.matchAll(/hardwareMap\s*\.\s*get\s*\(\s*([\w.]+)\s*\.class/g)].map(m => m[1].split('.').pop()))]
  const known = [['RoadRunner', /(?:roadrunner|com\.acmerobotics)/i], ['PedroPathing', /pedroPathing|pedropathing/i], ['FTCLib', /(?:ftclib|com\.arcrobotics)/i], ['EasyOpenCV', /easyopencv/i], ['VisionPortal', /VisionPortal/]]
  const libraries = known.filter(([, rx]) => rx.test(code)).map(([label]) => label)
  return { modes, devices, libraries }
}

function App() {
  const shareId = window.location.pathname.match(/^\/s\/([^/]+)/)?.[1]
  const [files, setFiles] = useState(starterFiles)
  const [active, setActive] = useState(starterFiles[0].name)
  const [share, setShare] = useState(null)
  const [loading, setLoading] = useState(Boolean(shareId))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState('')
  const [visibility, setVisibility] = useState('unlisted')
  const [dragging, setDragging] = useState(false)
  const [selectedLine, setSelectedLine] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [author, setAuthor] = useState('Mentor')
  const [showNotes, setShowNotes] = useState(false)
  const editorRef = useRef(null)
  const fileInput = useRef(null)
  const currentFiles = share?.files || files
  const currentFile = currentFiles.find(f => f.name === active) || currentFiles[0]
  const meta = useMemo(() => getMeta(currentFiles), [currentFiles])
  const shared = Boolean(shareId)

  useEffect(() => {
    if (!shareId) return
    fetch(`/api/shares/${shareId}`).then(async r => { if (!r.ok) throw new Error((await r.json()).error); return r.json() })
      .then(data => { setShare(data); setActive(data.files[0]?.name); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [shareId])

  function updateCode(value) {
    if (shared || !currentFile) return
    setFiles(previous => previous.map(f => f.name === currentFile.name ? { ...f, content: value ?? '' } : f))
  }
  async function importFiles(list) {
    const picked = [...list]
    const imported = []
    for (const file of picked) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file)
        for (const entry of Object.values(zip.files)) if (!entry.dir && entry.name.endsWith('.java')) imported.push({ name: entry.name.split('/').pop(), content: await entry.async('string') })
      } else if (file.name.endsWith('.java')) imported.push({ name: file.name, content: await file.text() })
    }
    if (!imported.length) { setNotice('Choose .java files or a .zip containing Java files.'); return }
    setFiles(previous => {
      const merged = [...previous]
      imported.forEach(next => { const i = merged.findIndex(old => old.name === next.name); if (i >= 0) merged[i] = next; else merged.push(next) })
      setActive(imported[0].name)
      return merged
    })
    setNotice(`${imported.length} file${imported.length === 1 ? '' : 's'} added`)
  }
  async function publish() {
    setError('')
    try {
      const response = await fetch('/api/shares', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files, visibility, title: files[0]?.name.replace(/\.java$/, '') || 'FTC project' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      window.history.pushState({}, '', `/s/${data.id}`)
      setShare(data.share); setActive(data.share.files[0].name); setModal('published')
    } catch (e) { setError(e.message || 'Could not publish. Is the API server running?') }
  }
  async function copy(text, message = 'Copied to clipboard') {
    try { await navigator.clipboard.writeText(text); setNotice(message) }
    catch { setNotice('Clipboard access unavailable — select and copy the code instead.') }
  }
  function downloadFile() {
    if (!currentFile) return
    const blob = new Blob([currentFile.content], { type: 'text/x-java-source' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = currentFile.name; a.click(); URL.revokeObjectURL(a.href)
  }
  async function downloadZip() {
    const zip = new JSZip(); currentFiles.forEach(file => zip.file(file.name, file.content))
    const blob = await zip.generateAsync({ type: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ftc-code.zip'; a.click(); URL.revokeObjectURL(a.href)
  }
  function addComment() {
    if (!commentText.trim() || !selectedLine) return
    fetch(`/api/shares/${shareId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line: selectedLine, file: currentFile.name, text: commentText, author }) })
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setShare(old => ({ ...old, comments: [...old.comments, data] })); setCommentText(''); setSelectedLine(null); setShowNotes(true) })
      .catch(e => setNotice(e.message))
  }
  function onEditorMount(editor) {
    editorRef.current = editor
    if (shared) editor.onMouseDown(event => {
      if (event.target.type === 2 && event.target.position) { setSelectedLine(event.target.position.lineNumber); setCommentText('') }
    })
  }

  if (loading) return <div className="center-state">Loading shared code…</div>
  if (error && shared && !share) return <div className="center-state error-state"><span className="eyebrow">CODEDOCK / 404</span><h1>Share not found</h1><p>{error}</p><a className="button primary" href="/">Back to workspace</a></div>

  return <div className="app-shell" onDragOver={e => { e.preventDefault(); if (!shared) setDragging(true) }} onDragLeave={e => { if (e.currentTarget === e.target) setDragging(false) }} onDrop={e => { e.preventDefault(); setDragging(false); if (!shared) importFiles(e.dataTransfer.files) }}>
    {dragging && <div className="drop-overlay"><div><Icon name="upload" size={28}/><strong>Drop Java files or a ZIP</strong><span>Files are ready to join your workspace</span></div></div>}
    <header className="topbar">
      <a className="brand" href="/"><span className="brand-mark"><Icon name="code" size={19}/></span><span>code<span className="brand-light">dock</span></span><span className="brand-tag">FTC</span></a>
      <div className="topbar-center"><span className="status-dot"/>{shared ? 'Shared workspace' : 'Your workspace'}<span className="crumb-slash">/</span><span className="project-name">{share?.title || 'Untitled project'}</span></div>
      <div className="topbar-actions">{shared ? <><span className={`visibility-pill ${share.visibility}`}><Icon name={share.visibility === 'public' ? 'globe' : 'lock'} size={13}/>{share.visibility === 'public' ? 'Public' : 'Unlisted'}</span><button className="button subtle" onClick={() => copy(window.location.href, 'Share link copied')}><Icon name="copy"/>Copy link</button></> : <><span className="save-indicator"><span className="status-dot"/>All changes saved locally</span><button className="button primary" onClick={() => setModal('publish')}><Icon name="share"/>Publish share</button></>}</div>
    </header>
    <main className="workspace">
      <section className="intro-row"><div><div className="eyebrow"><span className="eyebrow-line"/>{shared ? 'TEAM CODE REVIEW' : 'FTC JAVA WORKSPACE'}</div><h1>{shared ? share.title : <>Code that <span className="heading-accent">moves you.</span></>}</h1><p>{shared ? 'Read, run through, and leave feedback on this team’s code.' : 'Your team’s code, organized and ready to share.'}</p></div><div className="hero-mark">{shared ? <span className="review-count"><Icon name="comment" size={15}/>{share.comments?.length || 0} notes</span> : <div className="team-chip"><span className="team-avatar">T</span><span><b>Team workspace</b><small>Season 2026–27</small></span><span className="chip-chevron">⌄</span></div>}</div></section>
      {error && !shared && <div className="inline-error">{error}</div>}
      <section className="metadata-strip"><div className="meta-leading"><span className="meta-icon"><Icon name="code" size={15}/></span><div><b>Code insights</b><small>Detected from your Java files</small></div></div><div className="meta-group"><span className="meta-label">OPMODE</span>{meta.modes.map(x => <span className="badge mode" key={x}><i/> {x}</span>)}</div><div className="meta-group"><span className="meta-label">HARDWARE</span>{meta.devices.length ? meta.devices.slice(0, 4).map(x => <span className="badge" key={x}>{x}</span>) : <span className="meta-empty">Not detected</span>}{meta.devices.length > 4 && <span className="badge">+{meta.devices.length - 4}</span>}</div><div className="meta-group libraries"><span className="meta-label">LIBRARIES</span>{meta.libraries.length ? meta.libraries.map(x => <span className="badge library" key={x}>{x}</span>) : <span className="meta-empty">Standard FTC SDK</span>}</div></section>
      <section className="editor-card"><div className="editor-top"><div className="file-tabs">{currentFiles.map((file, i) => <button key={file.name} className={`file-tab ${file.name === currentFile?.name ? 'active' : ''}`} onClick={() => setActive(file.name)}><span className={`java-icon ${i === 0 ? 'warm' : ''}`}>J</span>{file.name}{file.name === currentFile?.name && <span className="tab-close"/>}</button>)}{!shared && <button className="add-tab" title="Add Java files" onClick={() => fileInput.current?.click()}><Icon name="plus" size={15}/></button>}</div><div className="editor-tools">{shared && <button className={`tool-button ${showNotes ? 'selected' : ''}`} onClick={() => setShowNotes(!showNotes)}><Icon name="comment" size={15}/>Notes <span className="note-count">{share.comments?.length || 0}</span></button>}<span className="tool-separator"/><span className="language-tag"><i/>Java</span><button className="tool-button more-button" title="More actions" onClick={() => shared ? downloadFile() : fileInput.current?.click()}><Icon name={shared ? 'download' : 'folder'} size={16}/></button></div></div>
        <div className={`editor-body ${showNotes && shared ? 'with-notes' : ''}`}><div className="monaco-wrap"><Editor height="500px" language="java" value={currentFile?.content || ''} theme="vs-dark" onChange={updateCode} onMount={onEditorMount} options={{ readOnly: shared, minimap: { enabled: false }, fontFamily: 'DM Mono, JetBrains Mono, monospace', fontSize: 13, lineHeight: 23, fontLigatures: true, padding: { top: 17, bottom: 20 }, lineNumbers: 'on', renderLineHighlight: 'all', guides: { indentation: true, bracketPairs: true }, bracketPairColorization: { enabled: true }, folding: true, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 4, wordWrap: 'off', cursorBlinking: 'smooth', smoothScrolling: true, contextmenu: true }} /></div>
          {showNotes && shared && <aside className="notes-panel"><div className="notes-head"><div><b>Mentor notes</b><span>{share.comments?.length || 0} on this file</span></div><button className="icon-button" onClick={() => setShowNotes(false)}><Icon name="close" size={16}/></button></div>{selectedLine && <div className="comment-compose"><div className="line-ref"><span className="line-bullet"/>Comment on line {selectedLine}</div><input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name" aria-label="Your name"/><textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Share a debugging tip or question…" rows="3"/><button className="button primary full-button" onClick={addComment} disabled={!commentText.trim()}>Add note <Icon name="arrow" size={15}/></button></div>}{(share.comments || []).filter(c => c.file === currentFile?.name).length ? <div className="comments-list">{share.comments.filter(c => c.file === currentFile?.name).map(c => <article className="comment-card" key={c.id}><button className="comment-line" onClick={() => editorRef.current?.revealLineInCenter(c.line)}>L{c.line}<Icon name="arrow" size={12}/></button><div className="comment-content"><b>{c.author}</b><time>{new Date(c.createdAt).toLocaleDateString()}</time><p>{c.text}</p></div></article>)}</div> : <div className="notes-empty"><span className="empty-bubble"><Icon name="comment" size={18}/></span><b>No notes yet</b><p>Click a line number to leave the first mentor note.</p></div>}<div className="notes-hint">Click any line number to start a conversation.</div></aside>}</div>
        <div className="editor-footer"><div className="footer-left"><span>Java 17</span><span className="footer-dot">·</span><span>UTF-8</span><span className="footer-dot">·</span><span>LF</span></div><div className="footer-right"><span><span className="status-dot"/> {shared ? 'Read only' : 'Ready'}</span><span>{(currentFile?.content || '').split('\n').length} lines</span></div></div>
      </section>
      <section className="action-bar"><div className="action-copy"><div className="action-symbol"><Icon name={shared ? 'comment' : 'share'} size={17}/></div><div><b>{shared ? 'Make this code yours' : 'Ready for another set of eyes?'}</b><span>{shared ? 'Copy the code or download the project files.' : 'Create a link your team can open anywhere.'}</span></div></div><div className="action-buttons">{shared ? <><button className="button subtle" onClick={() => copy(currentFile?.content || '', 'Code copied')}><Icon name="copy"/>Copy code</button><button className="button subtle" onClick={() => copy((currentFile?.content || '').replace(/^\s*package\s+[^;]+;\s*\n?/gm, ''), 'OnBot Java code copied')}><Icon name="code"/>Copy for OnBot</button><button className="button primary" onClick={currentFiles.length > 1 ? downloadZip : downloadFile}><Icon name="download"/>{currentFiles.length > 1 ? 'Download ZIP' : 'Download .java'}</button>{currentFiles.length > 1 && <button className="button subtle compact-download" onClick={downloadFile}><Icon name="download"/>.java</button>}</> : <><button className="button subtle" onClick={() => fileInput.current?.click()}><Icon name="upload"/>Add files</button><button className="button primary" onClick={() => setModal('publish')}><Icon name="share"/>Create share link <Icon name="arrow" size={15}/></button></>}</div></section>
      <footer className="page-footer"><span><span className="footer-logo">C</span> Built for the teams who build robots.</span><span>FIRST Tech Challenge <i>×</i> CodeDock</span></footer>
    </main>
    <input ref={fileInput} className="hidden-input" type="file" multiple accept=".java,.zip" onChange={e => importFiles(e.target.files)} />
    {notice && <div className="toast"><span className="toast-check"><Icon name="check" size={14}/></span>{notice}<button onClick={() => setNotice('')}><Icon name="close" size={14}/></button></div>}
    {modal && <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal('')}><div className="modal-card">{modal === 'publish' ? <><button className="modal-close" onClick={() => setModal('')}><Icon name="close"/></button><div className="modal-icon"><Icon name="share" size={21}/></div><div className="eyebrow">SHARE YOUR WORK</div><h2>Make room for feedback.</h2><p className="modal-description">Publish your Java files as a read-only workspace. Teammates can inspect the code and leave notes on any line.</p><div className="visibility-options"><button className={visibility === 'unlisted' ? 'visibility-option chosen' : 'visibility-option'} onClick={() => setVisibility('unlisted')}><span className="visibility-option-icon"><Icon name="lock"/></span><span><b>Unlisted</b><small>Only people with the link</small></span><span className="radio-dot"/></button><button className={visibility === 'public' ? 'visibility-option chosen' : 'visibility-option'} onClick={() => setVisibility('public')}><span className="visibility-option-icon"><Icon name="globe"/></span><span><b>Public</b><small>Anyone can view this share</small></span><span className="radio-dot"/></button></div><button className="button primary publish-button" onClick={publish}><Icon name="share"/>Publish {files.length} {files.length === 1 ? 'file' : 'files'} <Icon name="arrow" size={16}/></button><div className="modal-footnote"><Icon name="lock" size={12}/> Your original files stay in your workspace.</div></> : <><button className="modal-close" onClick={() => setModal('')}><Icon name="close"/></button><div className="success-mark"><Icon name="check" size={22}/></div><div className="eyebrow">LINK IS LIVE</div><h2>Good code travels.</h2><p className="modal-description">Your {share?.visibility} share is ready. Send this link to your team.</p><div className="link-box"><span>{window.location.origin}/s/{share?.id}</span><button onClick={() => copy(`${window.location.origin}/s/${share?.id}`, 'Share link copied')}><Icon name="copy" size={15}/>Copy</button></div><div className="success-meta"><span className="status-dot"/>{share?.files.length} Java {share?.files.length === 1 ? 'file' : 'files'} <span>·</span> {share?.visibility === 'public' ? 'Public access' : 'Link-only access'}</div><button className="button subtle full-button" onClick={() => setModal('')}>Back to workspace</button></>}</div></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
