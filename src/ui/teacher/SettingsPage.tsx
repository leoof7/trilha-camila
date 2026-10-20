import { useState } from 'react';
import { useApp } from '../../state';
import { exportBackup, parseBackup, saveDB } from '../../store/db';
import { download, photoFromFile } from '../../lib/image';
import { TeacherAvatar } from './TeacherAvatar';
import { toast } from '../common';
import { dayKey } from '../../engine/game';
import { cloudOn, signOut } from '../../store/cloud';

export function SettingsPage() {
  const { db, update, account, sync, go } = useApp();
  const [name, setName] = useState(db.settings.teacherName);
  const [pin, setPin] = useState('');
  const [scale, setScale] = useState(db.settings.scale);
  const [err, setErr] = useState('');

  const backup = () => {
    download(exportBackup(db), `trilha-camila-backup-${dayKey()}.json`);
    toast('Backup baixado. Guarde na pasta Camila.');
  };
  const restore = async (f: File) => {
    try {
      const next = parseBackup(await f.text());
      await saveDB(next);
      update(() => next);
      toast('Backup restaurado.');
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <>
      <div className="thead"><h1 className="grow">Configurações</h1></div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <section className="card">
          <h3>Meu perfil</h3>
          <div className="photo-pick">
            <TeacherAvatar size={88} />
            <div className="col" style={{ gap: 6 }}>
              <label className="btn sm blue" style={{ textAlign: 'center', boxShadow: '0 3px 0 var(--blue-d)' }}>
                {db.settings.teacherPhoto ? 'Trocar foto' : '📷 Colocar foto'}
                <input type="file" accept="image/*" className="sr" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { const ph = await photoFromFile(f); update((d) => ({ ...d, settings: { ...d.settings, teacherPhoto: ph } })); toast('Foto salva.'); } catch (x) { setErr((x as Error).message); }
                }} />
              </label>
              {db.settings.teacherPhoto && <button className="link small" onClick={() => update((d) => ({ ...d, settings: { ...d.settings, teacherPhoto: undefined } }))}>Tirar foto</button>}
            </div>
          </div>
          <div className="field"><label htmlFor="sn">Nome</label><input id="sn" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="sp">{db.settings.pin ? 'Nova senha (4 números)' : 'Criar senha (opcional, 4 números)'}</label><input id="sp" className="input" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder={db.settings.pin ? 'deixe vazio para manter' : 'sem senha'} /></div>
          {db.settings.pin && <button className="link small" style={{ alignSelf: 'flex-start' }} onClick={() => { update((d) => ({ ...d, settings: { ...d.settings, pin: '' } })); toast('Senha removida.'); }}>Tirar a senha</button>}
          <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={() => {
            if (pin && pin.length !== 4) return setErr('A senha precisa ter 4 números.');
            update((d) => ({ ...d, settings: { ...d.settings, teacherName: name.trim() || 'Camila', pin: pin || d.settings.pin } }));
            setPin(''); setErr(''); toast('Salvo.');
          }}>Salvar</button>
        </section>
        <section className="card">
          <h3>Escala de notas</h3>
          <p className="small mute">Pontos mínimos para cada letra. Abaixo de C é D.</p>
          <div className="row wrap">
            {(['A', 'B', 'C'] as const).map((k) => (
              <div key={k} className="field" style={{ width: 90 }}><label htmlFor={`sc${k}`}>{k} a partir de</label><input id={`sc${k}`} className="input" inputMode="numeric" value={scale[k]} onChange={(e) => setScale({ ...scale, [k]: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></div>
            ))}
          </div>
          <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={() => {
            if (!(scale.A > scale.B && scale.B > scale.C)) return setErr('A precisa ser maior que B, e B maior que C.');
            update((d) => ({ ...d, settings: { ...d.settings, scale } })); setErr(''); toast('Escala salva.');
          }}>Salvar escala</button>
        </section>
        <section className="card">
          <h3>Conta e banco de dados</h3>
          {account ? (
            <>
              {db.settings.schoolCode && <div className="codebox"><span>Código da turma</span><b>{db.settings.schoolCode}</b><small>O aluno entra no celular dele com este código, o nome dele e a senha (o próprio nome, se você não trocou).</small></div>}
              <p>Entrou como <b>{account}</b>. {sync === 'saving' ? 'Salvando…' : sync === 'offline' ? 'Sem internet: salvo no aparelho, sobe quando voltar.' : 'Tudo salvo na nuvem ✓'}</p>
              <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={async () => { await signOut(); go({ name: 'login' }); }}>Sair da conta</button>
            </>
          ) : cloudOn ? (
            <>
              <p className="small">Você está usando sem conta: os dados ficam só neste aparelho.</p>
              <button className="btn blue sm" style={{ alignSelf: 'flex-start' }} onClick={() => { try { localStorage.removeItem('trilha-so-aparelho'); } catch { /* ignora */ } go({ name: 'login' }); }}>Entrar com e-mail para salvar na nuvem</button>
            </>
          ) : <p className="small mute">Banco na nuvem ainda não configurado nesta versão.</p>}
        </section>
        <section className="card">
          <h3>Backup</h3>
          <p className="small">Tudo fica guardado neste navegador. Baixe um backup toda semana e guarde na pasta <b>Camila</b>. Se trocar de computador, é só restaurar.</p>
          <div className="row wrap">
            <button className="btn yellow" onClick={backup}>Baixar backup</button>
            <label className="btn ghost">Restaurar backup<input type="file" accept=".json,application/json" className="sr" onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} /></label>
          </div>
          <p className="small mute">{db.students.length} aluno(s) · {db.results.length} lições feitas · {db.classes.length} aulas · {db.grades.length} notas</p>
        </section>
        {err && <p className="err">{err}</p>}
      </div>
    </>
  );
}
