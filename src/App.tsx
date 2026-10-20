import { useApp } from './state';
import { Profiles, Setup } from './ui/Profiles';
import { KidHome } from './ui/kid/KidHome';
import { Player } from './ui/kid/Player';
import { Teacher } from './ui/teacher/Teacher';
import { ToastHost } from './ui/common';
import { ApostilaHost } from './ui/Apostila';
import { Login } from './ui/Login';

export function App() {
  const { ready, screen } = useApp();
  if (!ready) return <div className="profiles"><h1>Trilha da <b>Camila</b></h1></div>;
  return (
    <>
      {screen.name === 'login' && <Login />}
      {screen.name === 'setup' && <Setup />}
      {screen.name === 'profiles' && <Profiles />}
      {screen.name === 'kid' && <KidHome studentId={screen.studentId} tab={screen.tab} withTeacher={screen.withTeacher} />}
      {screen.name === 'play' && <Player key={screen.lessonId + screen.mode} studentId={screen.studentId} unitId={screen.unitId} lessonId={screen.lessonId} mode={screen.mode} withTeacher={screen.withTeacher} />}
      {screen.name === 'teacher' && <Teacher tab={screen.tab} studentId={screen.studentId} />}
      <ToastHost />
      <ApostilaHost />
    </>
  );
}
