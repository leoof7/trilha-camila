import type { GradeScale } from '../engine/grade';

export type Gender = 'f' | 'm';
export type Presence = 'P' | 'F' | 'J'; // presente, falta, falta justificada
export type Modality = 'presencial' | 'online';

export interface Student {
  id: string;
  name: string;
  gender: Gender;           // define o tema: rosa (menina) ou azul (menino)
  age: number;
  photo?: string;           // imagem pequena (data URL) guardada só neste aparelho
  guardian?: string;        // (antigo) nome do responsável
  guardians?: Guardian[];   // mãe, pai ou outro responsável
  currentUnit: number;      // a Camila libera as units até esta
  pin?: string;             // senha de 4 números do aluno (opcional), criada pela professora
  createdAt: string;
  archived?: boolean;
}

export interface Guardian {
  role: 'mae' | 'pai' | 'outro';
  name: string;
  phone?: string;           // WhatsApp, para a Camila mandar recado
}

export interface LessonResult {
  id: string;
  studentId: string;
  lessonId: string;
  unitId: number;
  mode: 'lesson' | 'quiz';
  date: string;             // AAAA-MM-DD
  at: string;               // ISO
  total: number;
  correctFirst: number;
  mistakes: number;
  points: number;           // 0–100
  xp: number;
  stars: 1 | 2 | 3;
  seconds: number;
  missed: string[];         // ids dos itens errados
  withTeacher?: boolean;    // feito na aula, com a Camila do lado
}

export interface Grade {
  id: string;
  studentId: string;
  date: string;
  unitId?: number;
  title: string;
  points: number;           // 0–100
  source: 'provinha' | 'manual' | 'homework' | 'prova';
  resultId?: string;
}

export interface ClassRecord {
  id: string;
  date: string;
  start?: string;           // "16:00"
  modality: Modality;
  attendance: Record<string, Presence>;
  lessons: string[];        // ids das lições trabalhadas (geram as páginas)
  notes: string;            // descrição da aula
  nextGoal: string;
  status?: 'aberta' | 'finalizada';
  startedAt?: string;       // ISO, quando a professora tocou em Iniciar aula
  end?: string;             // "17:05"
  plan?: string[];          // plano da aula: lições sugeridas/escolhidas ao iniciar (quiz-uN = provinha)
}

export interface HomeworkMark {   // Trabalhos: homework de cada unit
  studentId: string;
  unitId: number;
  delivered: boolean;       // entregou a folha da apostila
  signed: boolean;          // assinatura dos pais
  stars: number;            // 0–5, como o Teacher's feedback
  note?: string;
  date: string;
}

export interface Goal {
  id: string;
  studentId: string;
  unitId: number;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface StickerGiven {
  id: string;
  studentId: string;
  sticker: string;
  date: string;
  by: 'app' | 'camila';
  reason?: string;
}

export interface Feedback {        // "Teacher's feedback ⭐⭐⭐⭐⭐" de cada unit
  studentId: string;
  unitId: number;
  stars: number;
  note?: string;
}

export interface KeyReview {       // gabarito revisado pela Camila
  answer: string;
  approved: boolean;
  at: string;
}

export interface Settings {
  teacherName: string;
  pin: string;
  scale: GradeScale;
  schoolYear: number;
  setupDone: boolean;
  teacherPhoto?: string;   // foto da professora (pequena, data URL)
  pinOptional?: boolean;   // v2: senha passou a ser opcional
  activeClassId?: string;  // aula em andamento
  noClassDays?: string[];  // dias marcados como "hoje não tem aula"
}

export interface DB {
  version: 1;
  settings: Settings;
  students: Student[];
  results: LessonResult[];
  grades: Grade[];
  classes: ClassRecord[];
  goals: Goal[];
  stickers: StickerGiven[];
  feedback: Feedback[];
  keys: Record<string, KeyReview>;
  studyDays: Record<string, string[]>; // studentId -> dias com estudo
  drafts?: Record<string, Draft>;      // lição começada e não terminada
  homework?: HomeworkMark[];
  exams?: Exam[];                      // caderno de provas criado pela professora
}

export interface Exam {
  id: string;
  title: string;
  unitIds: number[];
  itemIds: string[];        // ids dos exercícios da apostila (lessonId#i)
  createdAt: string;
}

export interface Draft {
  queue: string[];
  idx: number;
  hearts: number;
  firstTry: Record<string, boolean>;
  missed: string[];
  mistakes: number;
  at: string;
}
