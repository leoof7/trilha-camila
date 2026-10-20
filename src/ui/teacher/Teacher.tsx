import { useApp } from '../../state';
import { Dashboard } from './Dashboard';
import { Students, StudentFile } from './Students';
import { Classes } from './Classes';
import { YearCalendar } from './YearCalendar';
import { KeyReview } from './KeyReview';
import { SettingsPage } from './SettingsPage';
import { LeseteSignature } from '../Brand';
import { ApostilaShelf } from '../Apostila';

const NAV = [
  { id: 'home', icon: '🏠', label: 'Início' },
  { id: 'students', icon: '👧', label: 'Alunos' },
  { id: 'classes', icon: '📝', label: 'Diário de aula' },
  { id: 'calendar', icon: '📅', label: 'Calendário anual' },
  { id: 'book', icon: '📖', label: 'Apostila' },
  { id: 'keys', icon: '✅', label: 'Gabarito' },
  { id: 'settings', icon: '⚙️', label: 'Configurações' },
];

export function Teacher({ tab = 'home', studentId }: { tab?: string; studentId?: string }) {
  const { db, go } = useApp();
  const set = (t: string, sid?: string) => go({ name: 'teacher', tab: t, studentId: sid });
  return (
    <div className="teacher">
      <nav className="tside" aria-label="Menu da professora">
        <div className="brand"><b>Trilha da</b>Professora {db.settings.teacherName}</div>
        {NAV.map((n) => (
          <button key={n.id} className="nav" aria-current={tab === n.id || (tab === 'student' && n.id === 'students')} onClick={() => set(n.id)}>
            <span aria-hidden="true">{n.icon}</span>{n.label}
          </button>
        ))}
        <div className="spacer" />
        <div className="brandsig"><LeseteSignature light /></div>
        <button className="nav" onClick={() => go({ name: 'profiles' })}><span aria-hidden="true">🚪</span>Sair</button>
      </nav>
      <main className="tmain">
        {tab === 'home' && <Dashboard open={set} />}
        {tab === 'students' && <Students open={set} />}
        {tab === 'student' && studentId && <StudentFile id={studentId} open={set} />}
        {tab === 'classes' && <Classes />}
        {tab === 'calendar' && <YearCalendar />}
        {tab === 'keys' && <KeyReview />}
        {tab === 'book' && <><div className="thead"><h1 className="grow">Apostila 1</h1></div><ApostilaShelf /></>}
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
