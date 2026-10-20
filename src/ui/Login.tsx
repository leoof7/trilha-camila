import { useState } from 'react';
import { useApp } from '../state';
import { signIn, signUp } from '../store/cloud';
import { Mascot } from './Mascot';
import { LeseteSignature } from './Brand';

export function Login() {
  const { afterLogin, go, db } = useApp();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setMsg('Escreva um e-mail válido.');
    if (pass.length < 6) return setMsg('A senha precisa ter pelo menos 6 caracteres.');
    setBusy(true); setMsg('');
    try {
      if (mode === 'up') {
        const s = await signUp(email.trim(), pass);
        if (!s) { setMsg('Conta criada! Abra o e-mail que chegou e confirme. Depois volte aqui e toque em Entrar.'); setMode('in'); setBusy(false); return; }
      } else await signIn(email.trim(), pass);
      await afterLogin();
    } catch (x) { setMsg((x as Error).message || 'Sem internet agora. Tente de novo.'); }
    setBusy(false);
  };
  const localOnly = () => {
    try { localStorage.setItem('trilha-so-aparelho', '1'); } catch { /* ignora */ }
    go(db.settings.setupDone ? { name: 'profiles' } : { name: 'setup' });
  };

  return (
    <main className="setup">
      <div className="setup-wrap">
        <aside className="setup-side">
          <span className="small" style={{ fontWeight: 800, letterSpacing: 1.4, color: '#8FB0FF' }}>TRILHA DA CAMILA</span>
          <h1>Suas aulas <b>salvas</b> em qualquer aparelho.</h1>
          <p>Entre com o seu e-mail. Alunos, notas, faltas e o diário ficam guardados na sua conta, e só você vê.</p>
          <Mascot size={130} mood="happy" say="Hi, teacher!" />
        </aside>
        <form className="sheet" onSubmit={submit}>
          <div className="seg"><button type="button" aria-pressed={mode === 'in'} onClick={() => setMode('in')}>Entrar</button><button type="button" aria-pressed={mode === 'up'} onClick={() => setMode('up')}>Criar conta</button></div>
          <h2>{mode === 'in' ? 'Entrar' : 'Criar conta da professora'}</h2>
          <div className="field"><label htmlFor="le">E-mail</label><input id="le" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label htmlFor="lp">Senha</label><input id="lp" className="input" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pass} onChange={(e) => setPass(e.target.value)} /></div>
          {msg && <p className={msg.startsWith('Conta criada') ? 'small' : 'err'}>{msg}</p>}
          <button className="btn blue block" type="submit" disabled={busy}>{busy ? 'Aguarde…' : mode === 'in' ? 'Entrar' : 'Criar conta'}</button>
          <button type="button" className="link small" onClick={localOnly}>Usar sem conta (salva só neste aparelho)</button>
          <LeseteSignature />
        </form>
      </div>
    </main>
  );
}
