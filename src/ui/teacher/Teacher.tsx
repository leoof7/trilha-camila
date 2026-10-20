import { useApp } from '../../state';
import { TeacherAvatar } from './TeacherAvatar';
export { TeacherAvatar };
import { Dashboard } from './Dashboard';
import { Students, StudentFile } from './Students';
import { Classes } from './Classes';
import { YearCalendar } from './YearCalendar';
import { KeyReview } from './KeyReview';
import { SettingsPage } from './SettingsPage';
import { LeseteSignature } from '../Brand';
import { ApostilaShelf } from '../Apostila';
import { ClassBar } from './ClassFlow';
import { Exams, Homeworks, GradesBoard, Absences } from './Records';

const NAV: { group: string; items: { id: string; icon: string; label: string }[] }[] = [
  { group: 'Dia a dia', items: [
    { id: 'home', icon: '☀️', label: 'Hoje' },
    { id: 'students', icon: '👧', label: 'Alunos' },
    { id: 'calendar', icon: '📅', label: 'Calendário' },
    { id: 'classes', icon: '📝', label: 'Diário de aulas' },
  ] },
  { group: 'Material', items: [
    { id: 'book', icon: '📖', label: 'Apostila' },
    { id: 'exams', icon: '🏆', label: 'Provas' },
    { id: 'homework', icon: '🏠', label: 'Trabalhos' },
    { id: 'keys', icon: '✅', label: 'Gabarito' },
  ] },
  { group: 'Caderneta', items: [
    { id: 'grades', icon: '🅰️', label: 'Notas' },
    { id: 'absences', icon: '🙋', label: 'Faltas' },
  ] },
];


export function Teacher({ tab = 'home', studentId }: { tab?: string; studentId?: string }) {
  const { db, go } = useApp();
  const set = (t: string, sid?: string) => go({ name: 'teacher', tab: t, studentId: sid });
  return (
    <div className="teacher">
      <nav className="tside" aria-label="Menu da professora">
        <button className="tprofile" onClick={() => set('settings')} title="Meu perfil">
          <TeacherAvatar size={52} />
          <span><b>{db.settings.teacherName}</b><span className="tbadge">Professora</span></span>
        </button>
        {NAV.map((g) => (
          <div key={g.group} className="navgroup">
            <span className="navlbl">{g.group}</span>
            {g.items.map((n) => (
              <button key={n.id} className="nav" aria-current={tab === n.id || (tab === 'student' && n.id === 'students')} onClick={() => set(n.id)}>
                <span aria-hidden="true">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
        ))}
        <div className="spacer" />
        <button className="nav" aria-current={tab === 'settings'} onClick={() => set('settings')}><span aria-hidden="true">⚙️</span>Configurações</button>
        <button className="nav" onClick={() => go({ name: 'profiles' })}><span aria-hidden="true">🚪</span>Sair</button>
        <div className="brandsig"><LeseteSignature light /></div>
      </nav>
      <main className="tmain">
        <ClassBar />
        {tab === 'home' && <Dashboard open={set} />}
        {tab === 'students' && <Students open={set} />}
        {tab === 'student' && studentId && <StudentFile id={studentId} open={set} />}
        {tab === 'classes' && <Classes />}
        {tab === 'calendar' && <YearCalendar />}
        {tab === 'keys' && <KeyReview />}
        {tab === 'exams' && <Exams />}
        {tab === 'homework' && <Homeworks />}
        {tab === 'grades' && <GradesBoard />}
        {tab === 'absences' && <Absences />}
        {tab === 'book' && <><div className="thead"><h1 className="grow">Apostila 1</h1></div><ApostilaShelf name={db.settings.teacherName} color="#0A0F1F" /></>}
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
