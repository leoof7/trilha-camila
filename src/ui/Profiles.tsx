import { useState } from 'react';
import { useApp } from '../state';
import { Avatar } from './common';
import { uid } from '../store/db';
import type { Gender, Guardian, Student } from '../store/types';
import { photoFromFile } from '../lib/image';
import { APOSTILA } from '../content';
import { Mascot } from './Mascot';
import { LeseteSignature } from './Brand';

export function Profiles() {
  const { db, go } = useApp();
  const [role, setRole] = useState<'?' | 'prof' | 'aluno'>('?');
  const [askPin, setAskPin] = useState<null | { pin: string; title: string; then: () => void }>(null);
  const students = db.students.filter((s) => !s.archived);

  const openTeacher = () => (db.settings.pin ? setAskPin({ pin: db.settings.pin, title: `Olá, ${db.settings.teacherName}!`, then: () => go({ name: 'teacher' }) }) : go({ name: 'teacher' }));
  const openStudent = (s: Student) => (s.pin ? setAskPin({ pin: s.pin, title: `Oi, ${s.name}!`, then: () => go({ name: 'kid', studentId: s.id }) }) : go({ name: 'kid', studentId: s.id }));

  if (askPin) return <PinScreen pin={askPin.pin} title={askPin.title} onOk={askPin.then} onCancel={() => setAskPin(null)} />;

  return (
    <main className="profiles">
      <span className="eyebrow">📖 {APOSTILA.subtitle}</span>
      {role === '?' && (
        <>
          <h1>Quem está <b>entrando?</b></h1>
          <div className="pgrid">
            <button className="pcard prof" onClick={openTeacher}>
              <span className="face">🍎</span>
              <b>Sou a professora</b>
              <span>{db.settings.teacherName}{db.settings.pin ? ' · 🔒' : ''}</span>
            </button>
            <button className="pcard" onClick={() => setRole('aluno')}>
              <span className="face" style={{ background: 'linear-gradient(135deg,#E8458B,#1F5AE2)' }}>🎒</span>
              <b>Sou aluno(a)</b>
              <span>{students.length} {students.length === 1 ? 'aluno' : 'alunos'}</span>
            </button>
          </div>
          <Mascot size={110} say="Let's go!" />
        </>
      )}
      {role === 'aluno' && (
        <>
          <h1>Quem vai estudar <b>hoje?</b></h1>
          <div className="pgrid">
            {students.map((s) => (
              <button key={s.id} className="pcard" onClick={() => openStudent(s)}>
                <span className="face" style={{ background: s.gender === 'm' ? '#1F5AE2' : '#E8458B' }}>
                  {s.photo ? <img src={s.photo} alt="" /> : s.name[0]}
                </span>
                <b>{s.name}</b>
                <span>{s.pin ? '🔒 com senha' : `Unit ${s.currentUnit}`}</span>
              </button>
            ))}
          </div>
          {students.length === 0 && <p className="mute">A professora ainda não cadastrou alunos.</p>}
          <button className="link" onClick={() => setRole('?')}>‹ Voltar</button>
        </>
      )}
      <LeseteSignature />
    </main>
  );
}

export function PinScreen({ onOk, onCancel, title, pin }: { onOk: () => void; onCancel: () => void; title?: string; pin?: string }) {
  const { db } = useApp();
  const target = pin ?? db.settings.pin;
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const press = (d: string) => {
    if (v.length >= 4) return;
    const nv = v + d;
    setV(nv);
    if (nv.length === 4) {
      if (nv === target) onOk();
      else {
        setBad(true);
        setTimeout(() => { setBad(false); setV(''); }, 450);
      }
    }
  };
  return (
    <main className="profiles">
      <div className="pin">
        <h1 style={{ fontSize: 32 }}>{title ?? `Olá, ${db.settings.teacherName}!`}</h1>
        <p className="mute">Digite a senha de 4 números</p>
        <div className={`pin-dots${bad ? ' shake' : ''}`} aria-live="polite">
          {[0, 1, 2, 3].map((i) => <i key={i} className={i < v.length ? 'on' : ''} />)}
        </div>
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => press(d)}>{d}</button>)}
          <button onClick={onCancel} aria-label="Voltar" style={{ fontSize: 15 }}>Voltar</button>
          <button onClick={() => press('0')}>0</button>
          <button onClick={() => setV(v.slice(0, -1))} aria-label="Apagar">⌫</button>
        </div>
      </div>
    </main>
  );
}

const STEPS = ['Professora', 'Aluna', 'Família'];

/** Primeiro uso: professora (senha opcional), primeira aluna e responsáveis. */
export function Setup() {
  const { update, go } = useApp();
  const [step, setStep] = useState(1);
  const [teacher, setTeacher] = useState('Camila');
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [stu, setStu] = useState<Partial<Student>>({ name: 'Anne', gender: 'f', currentUnit: 1 });
  const [fam, setFam] = useState<Guardian[]>([{ role: 'mae', name: '', phone: '' }, { role: 'pai', name: '', phone: '' }]);

  const next1 = () => {
    if (!teacher.trim()) return setErr('Escreva seu nome.');
    if (usePin && !/^\d{4}$/.test(pin)) return setErr('A senha precisa ter 4 números.');
    setErr(''); setStep(2);
  };
  const next2 = () => {
    if (!stu.name?.trim()) return setErr('Escreva o nome da aluna.');
    if (!stu.age || stu.age < 4 || stu.age > 18) return setErr('Coloque a idade (ela aparece nos exercícios "I am ___ years old").');
    setErr(''); setStep(3);
  };
  const finish = () => {
    const guardians = fam.filter((g) => g.name.trim()).map((g) => ({ ...g, name: g.name.trim(), phone: g.phone?.trim() }));
    const s: Student = { id: uid(), name: stu.name!.trim(), gender: stu.gender as Gender, age: stu.age!, photo: stu.photo, guardians, currentUnit: 1, createdAt: new Date().toISOString() };
    update((d) => ({ ...d, settings: { ...d.settings, teacherName: teacher.trim(), pin: usePin ? pin : '', setupDone: true }, students: [...d.students, s] }));
    go({ name: 'profiles' });
  };
  const sayFor = ['Hi, teacher!', `Hello, ${stu.name || '…'}!`, 'Family time!'][step - 1];

  return (
    <main className="setup">
      <div className="setup-wrap">
        <aside className="setup-side">
          <span className="small" style={{ fontWeight: 800, letterSpacing: 1.4, color: '#8FB0FF' }}>PRIMEIRO ACESSO</span>
          <h1>Vamos montar a <b>Trilha</b> da {teacher || 'professora'}.</h1>
          <p>Três passos rápidos. Tudo fica guardado neste aparelho.</p>
          <div className="steps">
            {STEPS.map((l, i) => (
              <div key={l} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}><i>{i + 1 < step ? '✓' : i + 1}</i>{l}</div>
            ))}
          </div>
          <Mascot size={130} say={sayFor} nonce={step} mood="happy" />
        </aside>

        <section className="sheet">
          {step === 1 && (
            <>
              <h2>Sobre você</h2>
              <div className="field"><label htmlFor="tn">Seu nome</label><input id="tn" className="input" value={teacher} onChange={(e) => setTeacher(e.target.value)} /></div>
              <label className="toggle">
                <input type="checkbox" checked={usePin} onChange={() => setUsePin(!usePin)} />
                <span className="grow"><b>Proteger minha área com senha</b><br /><span className="small mute">Opcional. Evita que a criança abra as notas e o diário sozinha.</span></span>
              </label>
              {usePin && <div className="field"><label htmlFor="p1">Senha de 4 números</label><input id="p1" className="input" inputMode="numeric" maxLength={4} type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></div>}
              {err && <p className="err">{err}</p>}
              <button className="btn blue block" onClick={next1}>Continuar</button>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Primeira aluna</h2>
              <StudentFields value={stu} onChange={setStu} />
              {err && <p className="err">{err}</p>}
              <div className="row"><button className="btn ghost" onClick={() => setStep(1)}>Voltar</button><button className="btn blue grow" onClick={next2}>Continuar</button></div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Família de {stu.name}</h2>
              <p className="small mute">Opcional. Serve para a Camila saber com quem falar sobre o para casa e as faltas.</p>
              <GuardiansFields value={fam} onChange={setFam} />
              <div className="row"><button className="btn ghost" onClick={() => setStep(2)}>Voltar</button><button className="btn blue grow" onClick={finish}>Começar a trilha</button></div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const ROLE: Record<Guardian['role'], string> = { mae: '👩 Mãe', pai: '👨 Pai', outro: '🧑 Outro responsável' };

export function GuardiansFields({ value, onChange }: { value: Guardian[]; onChange: (g: Guardian[]) => void }) {
  const set = (i: number, patch: Partial<Guardian>) => onChange(value.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <div className="col">
      {value.map((g, i) => (
        <div key={i} className="guardian">
          <h4>{ROLE[g.role]}{g.role === 'outro' && <button className="link small" onClick={() => onChange(value.filter((_, j) => j !== i))}>remover</button>}</h4>
          <div className="g2">
            <div className="field"><label htmlFor={`gn${i}`}>Nome</label><input id={`gn${i}`} className="input" value={g.name} onChange={(e) => set(i, { name: e.target.value })} /></div>
            <div className="field"><label htmlFor={`gp${i}`}>WhatsApp</label><input id={`gp${i}`} className="input" inputMode="tel" placeholder="(31) 9 0000-0000" value={g.phone ?? ''} onChange={(e) => set(i, { phone: e.target.value })} /></div>
          </div>
        </div>
      ))}
      {!value.some((g) => g.role === 'outro') && <button className="link small" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...value, { role: 'outro', name: '', phone: '' }])}>+ Outro responsável (avó, tio…)</button>}
    </div>
  );
}

export function StudentFields({ value, onChange }: { value: Partial<Student>; onChange: (s: Partial<Student>) => void }) {
  const [err, setErr] = useState('');
  return (
    <>
      <div className="photo-pick">
        <Avatar s={{ name: value.name || '?', photo: value.photo, gender: (value.gender as Gender) || 'f' }} size={92} />
        <div className="col" style={{ gap: 6 }}>
          <label className="btn sm blue" style={{ textAlign: 'center', boxShadow: '0 3px 0 var(--blue-d)' }}>
            {value.photo ? 'Trocar foto' : '📷 Colocar foto'}
            <input type="file" accept="image/*" capture="user" className="sr" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { onChange({ ...value, photo: await photoFromFile(f) }); setErr(''); } catch (x) { setErr((x as Error).message); }
            }} />
          </label>
          {value.photo && <button className="link small" onClick={() => onChange({ ...value, photo: undefined })}>Tirar foto</button>}
          <span className="small mute">A foto fica só neste aparelho.</span>
        </div>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="field"><label htmlFor="sn">Nome (como gosta de ser chamada)</label><input id="sn" className="input" value={value.name ?? ''} onChange={(e) => onChange({ ...value, name: e.target.value })} /></div>
      <div className="row wrap" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ width: 100 }}><label htmlFor="sa">Idade</label><input id="sa" className="input" inputMode="numeric" value={value.age ?? ''} onChange={(e) => onChange({ ...value, age: Number(e.target.value.replace(/\D/g, '')) || undefined })} /></div>
        <div className="field grow"><span className="lbl">Cor do app</span>
          <div className="seg">
            <button className="pink" aria-pressed={value.gender === 'f'} onClick={() => onChange({ ...value, gender: 'f' })}>🩷 Menina · rosa</button>
            <button className="blue" aria-pressed={value.gender === 'm'} onClick={() => onChange({ ...value, gender: 'm' })}>💙 Menino · azul</button>
          </div>
        </div>
      </div>
    </>
  );
}
