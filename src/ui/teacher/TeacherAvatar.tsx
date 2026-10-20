import { useApp } from '../../state';

export function TeacherAvatar({ size = 48 }: { size?: number }) {
  const { db } = useApp();
  const name = db.settings.teacherName || 'Camila';
  return (
    <span className="tavatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {db.settings.teacherPhoto ? <img src={db.settings.teacherPhoto} alt="" /> : name[0].toUpperCase()}
    </span>
  );
}
