import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

type PersonId = 'rabbit' | 'dragon';
type Page = 'home' | 'checkin' | 'calendar' | 'medals' | 'stats';
type StatsRange = 'week' | 'month' | 'year';

type WorkoutLog = {
  id: string;
  person: PersonId;
  date: string;
  completed: boolean;
  activity: string;
  minutes: number;
  distance?: number;
  weight?: number;
  note?: string;
  createdAt: string;
};

type SupabaseWorkoutLog = {
  id: string;
  couple_id: string;
  person: PersonId;
  date: string;
  completed: boolean;
  activity: string;
  minutes: number;
  distance: number | null;
  weight: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type Progress = {
  position: number;
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  totalMinutes: number;
  totalDistance: number;
  lastWeight?: number;
};

const COUPLE_ID = 'dudu_dragon_private';

const profiles = {
  rabbit: {
    id: 'rabbit' as PersonId,
    name: '小嘟嘟',
    title: '普拉提 / 金刚功选手',
    defaultActivity: '普拉提',
    gradient: 'ice-card',
  },
  dragon: {
    id: 'dragon' as PersonId,
    name: '大猪蹄子',
    title: '游泳选手',
    defaultActivity: '游泳',
    gradient: 'sport-card',
  },
};

const medalNames = [
  '起步就很性感',
  '稳定发光',
  '自律小怪兽',
  '性感自律王',
  '双人坚持冠军',
  '闪闪发光体质',
  '超强行动力',
  '长期主义恋人',
];

function AvatarIcon({
  person,
  size = 56,
}: {
  person: PersonId;
  size?: number;
}) {
  const src = person === 'rabbit' ? '/dudu_avatar.png' : '/dragon_avatar.png';
  const alt = person === 'rabbit' ? '小嘟嘟头像' : '大猪蹄子头像';

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        borderRadius: '18px',
      }}
    />
  );
}

function HeroIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26 3L9 27H23L20 45L39 19H25L26 3Z"
        fill="#2D7FF9"
        stroke="#10233F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavIcon({ type }: { type: Page }) {
  const iconProps = {
    width: 23,
    height: 23,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  if (type === 'home') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <path
          d="M4 11L12 4L20 11"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 10.5V20H17V10.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'checkin') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.4" />
        <path
          d="M8.3 12.2L10.8 14.8L16 9.4"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M8 3V7M16 3V7M4 10H20"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'medals') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <path
          d="M9 4H15L14 10H10L9 4Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="15" r="5" stroke="currentColor" strokeWidth="2.4" />
        <path
          d="M12 12.3L12.8 14L14.6 14.2L13.3 15.5L13.6 17.3L12 16.4L10.4 17.3L10.7 15.5L9.4 14.2L11.2 14L12 12.3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg {...iconProps} aria-hidden="true">
      <path
        d="M5 20V12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12 20V5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M19 20V9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MedalIcon({ locked = false }: { locked?: boolean }) {
  if (locked) {
    return (
      <svg
        width="38"
        height="38"
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="10"
          y="18"
          width="22"
          height="17"
          rx="5"
          fill="#EEF5FC"
          stroke="#7E95AD"
          strokeWidth="2.4"
        />
        <path
          d="M14 18V14C14 10 17 7 21 7C25 7 28 10 28 14V18"
          stroke="#7E95AD"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14 4H30L27 15H17L14 4Z"
        fill="#BFE4FF"
        stroke="#2D7FF9"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle
        cx="22"
        cy="25"
        r="12"
        fill="#FFFFFF"
        stroke="#2D7FF9"
        strokeWidth="2.4"
      />
      <path
        d="M22 18L24 22L28.4 22.6L25.2 25.7L26 30L22 28L18 30L18.8 25.7L15.6 22.6L20 22L22 18Z"
        fill="#2D7FF9"
      />
    </svg>
  );
}

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayString() {
  return formatDateLocal(new Date());
}

function parseDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function sameMonth(date: string, base = new Date()) {
  const d = parseDate(date);
  return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth();
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date = new Date()) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isThisWeek(date: string) {
  const d = parseDate(date);
  return d >= startOfWeek() && d <= endOfWeek();
}

function dbRowToLog(row: SupabaseWorkoutLog): WorkoutLog {
  return {
    id: row.id,
    person: row.person,
    date: row.date,
    completed: row.completed,
    activity: row.activity,
    minutes: Number(row.minutes || 0),
    distance: row.distance === null ? undefined : Number(row.distance),
    weight: row.weight === null ? undefined : Number(row.weight),
    note: row.note || '',
    createdAt: row.created_at,
  };
}

function calculateProgress(logs: WorkoutLog[]): Record<PersonId, Progress> {
  const result: Record<PersonId, Progress> = {
    rabbit: {
      position: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalCompleted: 0,
      totalMinutes: 0,
      totalDistance: 0,
    },
    dragon: {
      position: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalCompleted: 0,
      totalMinutes: 0,
      totalDistance: 0,
    },
  };

  (Object.keys(profiles) as PersonId[]).forEach((person) => {
    const personLogs = logs
      .filter((log) => log.person === person)
      .sort((a, b) => a.date.localeCompare(b.date));

    let position = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let totalCompleted = 0;
    let totalMinutes = 0;
    let totalDistance = 0;
    let lastWeight: number | undefined = undefined;

    personLogs.forEach((log) => {
      if (log.completed) {
        position += 1;
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
        totalCompleted += 1;
        totalMinutes += Number(log.minutes || 0);
        totalDistance += Number(log.distance || 0);
      } else {
        position = Math.max(0, position - 2);
        currentStreak = 0;
      }

      if (typeof log.weight === 'number' && !Number.isNaN(log.weight)) {
        lastWeight = log.weight;
      }
    });

    result[person] = {
      position,
      currentStreak,
      maxStreak,
      totalCompleted,
      totalMinutes,
      totalDistance,
      lastWeight,
    };
  });

  return result;
}

function getMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: string[] = [];

  for (let day = 1; day <= last.getDate(); day++) {
    days.push(formatDateLocal(new Date(year, month, day)));
  }

  const firstDay = first.getDay() === 0 ? 7 : first.getDay();
  const blanks = Array.from({ length: firstDay - 1 }, () => '');

  return [...blanks, ...days];
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [statsRange, setStatsRange] = useState<StatsRange>('month');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonId>('rabbit');
  const [date, setDate] = useState(todayString());
  const [completed, setCompleted] = useState(true);
  const [activity, setActivity] = useState(profiles.rabbit.defaultActivity);
  const [minutes, setMinutes] = useState('30');
  const [distance, setDistance] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncText, setSyncText] = useState('正在同步云端数据...');

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('couple_id', COUPLE_ID)
        .order('date', { ascending: true })
        .order('person', { ascending: true });

      if (error) throw error;

      const mappedLogs = ((data || []) as SupabaseWorkoutLog[]).map(dbRowToLog);
      setLogs(mappedLogs);
      setSyncText('云端同步已开启');
    } catch (error) {
      console.error(error);
      setSyncText('云端同步失败，请检查 Supabase 设置');
      setToast('云端同步失败，请检查 Supabase 设置。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();

    const timer = window.setInterval(() => {
      fetchLogs();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [fetchLogs]);

  useEffect(() => {
    setActivity(profiles[selectedPerson].defaultActivity);
    setDistance('');
  }, [selectedPerson]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const progress = useMemo(() => calculateProgress(logs), [logs]);
  const todayLogs = logs.filter((log) => log.date === todayString());

  const saveLog = async () => {
    setIsSaving(true);

    const dbLog = {
      id: `${COUPLE_ID}-${selectedPerson}-${date}`,
      couple_id: COUPLE_ID,
      person: selectedPerson,
      date,
      completed,
      activity: activity || profiles[selectedPerson].defaultActivity,
      minutes:
        selectedPerson === 'rabbit' && completed ? Number(minutes || 0) : 0,
      distance:
        selectedPerson === 'dragon' && completed && distance
          ? Number(distance)
          : null,
      weight: weight ? Number(weight) : null,
      note: note || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .upsert(dbLog, {
          onConflict: 'couple_id,person,date',
        })
        .select()
        .single();

      if (error) throw error;

      const savedLog = dbRowToLog(data as SupabaseWorkoutLog);

      setLogs((prev) => [
        ...prev.filter(
          (log) => !(log.person === selectedPerson && log.date === date)
        ),
        savedLog,
      ]);

      setToast(
        completed
          ? `${profiles[selectedPerson].name} 打卡成功，已同步到云端！`
          : `${profiles[selectedPerson].name} 今天休息，已同步到云端。`
      );

      setSyncText('刚刚已同步');
      setNote('');
    } catch (error) {
      console.error(error);
      setToast('保存失败，请检查 Supabase 表和权限。');
    } finally {
      setIsSaving(false);
    }
  };

  const resetData = async () => {
    const yes = window.confirm('确定要清空所有云端打卡数据吗？这个操作不能恢复。');
    if (!yes) return;

    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('couple_id', COUPLE_ID);

      if (error) throw error;

      setLogs([]);
      setToast('云端数据已清空，可以重新开始啦。');
    } catch (error) {
      console.error(error);
      setToast('清空失败，请检查 Supabase 权限。');
    }
  };

  const renderHome = () => {
    const boardCells = Array.from({ length: 36 }, (_, index) => index);

    return (
      <main className="page">
        <section className="hero">
          <div>
            <p className="eyebrow">双人自律训练计划</p>
            <h1>自律是最性感的事</h1>
            <p className="subtitle">和喜欢的人一起变好，今天也要前进一格。</p>
          </div>
          <div className="hero-bubble">
            <HeroIcon />
          </div>
        </section>

        <section className="clay-card">
          <div className="section-title">
            <div>
              <h2>云端同步</h2>
              <p>{syncText}</p>
            </div>
            <button className="small-button" onClick={fetchLogs}>
              刷新同步
            </button>
          </div>
        </section>

        <section className="two-cards">
          {(Object.keys(profiles) as PersonId[]).map((person) => {
            const p = profiles[person];
            const data = progress[person];

            let needDays = 10;
            if (data.currentStreak > 0) {
              needDays = 10 - (data.currentStreak % 10);
              if (needDays === 10) needDays = 0;
            }

            return (
              <div className={`person-card ${p.gradient}`} key={person}>
                <div className="avatar">
                  <AvatarIcon person={person} size={58} />
                </div>
                <div>
                  <h2>{p.name}</h2>
                  <p>{p.title}</p>
                  <div className="mini-stats">
                    <span>第 {data.position} 格</span>
                    <span>连续 {data.currentStreak} 天</span>
                    <span>
                      {needDays === 0
                        ? '已解锁新奖牌'
                        : `差 ${needDays} 天奖牌`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="clay-card">
          <div className="section-title">
            <div>
              <h2>双人前进棋盘</h2>
              <p>完成 +1 格，未完成 -2 格。</p>
            </div>
            <button className="small-button" onClick={() => setPage('checkin')}>
              今日打卡
            </button>
          </div>

          <div className="board">
            {boardCells.map((cell) => {
              const rabbitHere = progress.rabbit.position === cell;
              const dragonHere = progress.dragon.position === cell;

              return (
                <div
                  className={`board-cell ${cell === 0 ? 'start-cell' : ''}`}
                  key={cell}
                >
                  <span className="cell-number">{cell === 0 ? '起点' : cell}</span>
                  <div className="pieces">
                    {rabbitHere && (
                      <span className="piece">
                        <AvatarIcon person="rabbit" size={24} />
                      </span>
                    )}
                    {dragonHere && (
                      <span className="piece">
                        <AvatarIcon person="dragon" size={24} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="clay-card">
          <div className="section-title">
            <div>
              <h2>今日状态</h2>
              <p>{todayString()}</p>
            </div>
          </div>

          <div className="today-list">
            {(Object.keys(profiles) as PersonId[]).map((person) => {
              const log = todayLogs.find((item) => item.person === person);

              return (
                <div className="today-item" key={person}>
                  <span className="small-avatar">
                    <AvatarIcon person={person} size={38} />
                  </span>
                  <div>
                    <strong>{profiles[person].name}</strong>
                    <p>
                      {log
                        ? log.completed
                          ? person === 'dragon'
                            ? `${log.activity} ${log.distance || 0} 米，已完成`
                            : `${log.activity} ${log.minutes} 分钟，已完成`
                          : '今天未完成 / 休息'
                        : '还没有打卡'}
                    </p>
                  </div>
                  <span className={log?.completed ? 'status good' : 'status'}>
                    {log ? (log.completed ? '完成' : '未完成') : '待打卡'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  };

  const renderCheckin = () => (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">今日打卡</p>
        <h1>今天训练了吗？</h1>
        <p>记录运动，也记录一点点变好的证据。</p>
      </section>

      <section className="clay-card form-card">
        <label>选择是谁打卡</label>
        <div className="segmented">
          {(Object.keys(profiles) as PersonId[]).map((person) => (
            <button
              key={person}
              className={selectedPerson === person ? 'active' : ''}
              onClick={() => setSelectedPerson(person)}
            >
              <AvatarIcon person={person} size={24} />
              <span>{profiles[person].name}</span>
            </button>
          ))}
        </div>

        <label>日期</label>
        <input value={date} onChange={(e) => setDate(e.target.value)} type="date" />

        <label>今天是否完成运动</label>
        <div className="segmented">
          <button
            className={completed ? 'active' : ''}
            onClick={() => setCompleted(true)}
          >
            完成，前进 1 格
          </button>
          <button
            className={!completed ? 'active danger' : ''}
            onClick={() => setCompleted(false)}
          >
            未完成，后退 2 格
          </button>
        </div>

        <label>运动类型</label>
        <select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option>普拉提</option>
          <option>金刚功</option>
          <option>游泳</option>
          <option>力量训练</option>
          <option>跑步</option>
          <option>散步</option>
          <option>其他</option>
        </select>

        {selectedPerson === 'rabbit' && (
          <>
            <label>运动时长 / 分钟</label>
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              type="number"
              min="0"
              placeholder="比如 30"
            />
          </>
        )}

        {selectedPerson === 'dragon' && (
          <>
            <label>游泳距离 / 米</label>
            <input
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              type="number"
              min="0"
              placeholder="比如 1000"
            />
            <p className="hint">游泳不计算分钟，主要记录游了多少米。</p>
          </>
        )}

        <label>今日体重 / kg，可不填</label>
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          type="number"
          step="0.1"
          placeholder="比如 48.6"
        />

        <label>备注</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="比如：今天有点累，但做完之后很爽。"
        />

        <button className="primary-button" onClick={saveLog} disabled={isSaving}>
          {isSaving ? '正在保存...' : '保存打卡'}
        </button>

        <p className="hint">同一个人同一天只能保留一条记录，重新保存会覆盖旧记录。</p>
      </section>
    </main>
  );

  const renderCalendar = () => {
    const days = getMonthDays();
    const weekNames = ['一', '二', '三', '四', '五', '六', '日'];

    return (
      <main className="page">
        <section className="page-header">
          <p className="eyebrow">日历格子</p>
          <h1>这个月的坚持痕迹</h1>
          <p>每一个小格子，都是一次没有放弃。</p>
        </section>

        <section className="clay-card">
          <div className="week-row">
            {weekNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((day, index) => {
              if (!day) return <div className="calendar-cell empty" key={index} />;

              const dayLogs = logs.filter((log) => log.date === day);
              const rabbit = dayLogs.find((log) => log.person === 'rabbit');
              const dragon = dayLogs.find((log) => log.person === 'dragon');

              return (
                <div className="calendar-cell" key={day}>
                  <strong>{parseDate(day).getDate()}</strong>
                  <div className="calendar-emojis">
                    <span className={rabbit?.completed ? 'done calendar-avatar' : 'muted calendar-avatar'}>
                      <AvatarIcon person="rabbit" size={18} />
                    </span>
                    <span className={dragon?.completed ? 'done calendar-avatar' : 'muted calendar-avatar'}>
                      <AvatarIcon person="dragon" size={18} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  };

  const renderMedals = () => (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">奖励机制</p>
        <h1>奖牌和好吃的</h1>
        <p>每连续完成 10 天，就可以获得一枚奖牌。</p>
      </section>

      {(Object.keys(profiles) as PersonId[]).map((person) => {
        const p = profiles[person];
        const data = progress[person];
        const medals = Math.floor(data.maxStreak / 10);

        return (
          <section className="clay-card" key={person}>
            <div className="section-title">
              <div>
                <h2>
                  <span className="title-with-icon">
                    <AvatarIcon person={person} size={28} />
                    {p.name} 的奖牌
                  </span>
                </h2>
                <p>历史最高连续完成：{data.maxStreak} 天</p>
              </div>
            </div>

            <div className="medal-grid">
              {Array.from({ length: 8 }, (_, index) => {
                const unlocked = index < medals;

                return (
                  <div className={`medal ${unlocked ? 'unlocked' : ''}`} key={index}>
                    <div className="medal-icon">
                      <MedalIcon locked={!unlocked} />
                    </div>
                    <strong>{(index + 1) * 10} 天</strong>
                    <p>{medalNames[index]}</p>
                    <small>{unlocked ? '奖励：对方请吃好吃的' : '继续坚持解锁'}</small>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );

  const renderStats = () => {
    const rangeLabel =
      statsRange === 'week'
        ? '最近 7 天'
        : statsRange === 'month'
          ? '最近 30 天'
          : '最近 12 个月';

    const getStats = (person: PersonId) => {
      const personLogs = logs.filter((log) => log.person === person && log.completed);
      const weekLogs = personLogs.filter((log) => isThisWeek(log.date));
      const monthLogs = personLogs.filter((log) => sameMonth(log.date));

      const weights = logs
        .filter(
          (log) =>
            log.person === person &&
            typeof log.weight === 'number' &&
            !Number.isNaN(log.weight)
        )
        .sort((a, b) => a.date.localeCompare(b.date));

      const firstWeight = weights[0]?.weight;
      const lastWeight = weights[weights.length - 1]?.weight;

      const weightChange =
        typeof firstWeight === 'number' && typeof lastWeight === 'number'
          ? Number((lastWeight - firstWeight).toFixed(1))
          : undefined;

      return {
        weekDays: weekLogs.length,
        monthDays: monthLogs.length,
        weekMinutes: weekLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0),
        monthMinutes: monthLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0),
        weekDistance: weekLogs.reduce((sum, log) => sum + Number(log.distance || 0), 0),
        monthDistance: monthLogs.reduce((sum, log) => sum + Number(log.distance || 0), 0),
        weightChange,
      };
    };

    const getRecentDates = (count: number) => {
      return Array.from({ length: count }, (_, index) => {
        const d = new Date();
        d.setDate(d.getDate() - (count - 1 - index));
        return formatDateLocal(d);
      });
    };

    const getRecentMonths = (count: number) => {
      return Array.from({ length: count }, (_, index) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (count - 1 - index));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');

        return `${year}-${month}`;
      });
    };

    const shortLabel = (date: string) => {
      const d = parseDate(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const monthLabel = (monthKey: string) => {
      const [, month] = monthKey.split('-');
      return `${Number(month)}月`;
    };

    const getRangeDates = () => {
      if (statsRange === 'week') return getRecentDates(7);
      if (statsRange === 'month') return getRecentDates(30);
      return [];
    };

    const getCompletionPoints = (person: PersonId) => {
      if (statsRange === 'year') {
        return getRecentMonths(12).map((monthKey) => {
          const monthLogs = logs.filter(
            (log) =>
              log.person === person &&
              log.completed &&
              log.date.startsWith(monthKey)
          );

          return {
            label: monthLabel(monthKey),
            value: monthLogs.length,
          };
        });
      }

      return getRangeDates().map((date) => {
        const log = logs.find((item) => item.person === person && item.date === date);

        return {
          label: shortLabel(date),
          value: log?.completed ? 1 : 0,
        };
      });
    };

    const getMetricPoints = (person: PersonId) => {
      if (statsRange === 'year') {
        return getRecentMonths(12).map((monthKey) => {
          const monthLogs = logs.filter(
            (log) =>
              log.person === person &&
              log.completed &&
              log.date.startsWith(monthKey)
          );

          const value = monthLogs.reduce((sum, log) => {
            return (
              sum +
              (person === 'dragon'
                ? Number(log.distance || 0)
                : Number(log.minutes || 0))
            );
          }, 0);

          return {
            label: monthLabel(monthKey),
            value,
          };
        });
      }

      return getRangeDates().map((date) => {
        const log = logs.find(
          (item) => item.person === person && item.date === date && item.completed
        );

        const value =
          person === 'dragon'
            ? Number(log?.distance || 0)
            : Number(log?.minutes || 0);

        return {
          label: shortLabel(date),
          value,
        };
      });
    };

    const getWeightPoints = (person: PersonId) => {
      if (statsRange === 'year') {
        return getRecentMonths(12)
          .map((monthKey) => {
            const monthWeights = logs
              .filter(
                (log) =>
                  log.person === person &&
                  log.date.startsWith(monthKey) &&
                  typeof log.weight === 'number' &&
                  !Number.isNaN(log.weight)
              )
              .sort((a, b) => a.date.localeCompare(b.date));

            const latest = monthWeights[monthWeights.length - 1];

            if (!latest || typeof latest.weight !== 'number') return null;

            return {
              label: monthLabel(monthKey),
              value: Number(latest.weight),
            };
          })
          .filter(Boolean) as { label: string; value: number }[];
      }

      const dates = getRangeDates();
      const start = dates[0];
      const end = dates[dates.length - 1];

      return logs
        .filter(
          (log) =>
            log.person === person &&
            log.date >= start &&
            log.date <= end &&
            typeof log.weight === 'number' &&
            !Number.isNaN(log.weight)
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({
          label: shortLabel(log.date),
          value: Number(log.weight),
        }));
    };

    function MiniBarChart({
      points,
      unit,
      chartType = 'metric',
    }: {
      points: { label: string; value: number }[];
      unit: string;
      chartType?: 'completion' | 'metric';
    }) {
      const maxValue = Math.max(1, ...points.map((point) => point.value));
      const total = points.reduce((sum, point) => sum + point.value, 0);
      const activeItems = points.filter((point) => point.value > 0).length;
      const average = Number((total / points.length).toFixed(1));
      const hasAnyData = points.some((point) => point.value > 0);
      const isCompact = points.length > 14;

      if (!hasAnyData) {
        return <p className="chart-empty">暂无数据，打卡后这里会出现变化。</p>;
      }

      return (
        <div className="chart-with-summary">
          <div className="chart-summary-row">
            {chartType === 'completion' ? (
              statsRange === 'year' ? (
                <>
                  <span>
                    总完成 <strong>{total}</strong> 天
                  </span>
                  <span>
                    最高 <strong>{maxValue}</strong> 天/月
                  </span>
                  <span>
                    月均 <strong>{average}</strong> 天
                  </span>
                </>
              ) : (
                <>
                  <span>
                    完成 <strong>{activeItems}</strong> / {points.length} 天
                  </span>
                  <span>
                    完成率 <strong>{Math.round((activeItems / points.length) * 100)}%</strong>
                  </span>
                </>
              )
            ) : (
              <>
                <span>
                  总计 <strong>{total}</strong> {unit}
                </span>
                <span>
                  最高 <strong>{maxValue}</strong> {unit}
                </span>
                <span>
                  平均 <strong>{average}</strong> {unit}
                </span>
              </>
            )}
          </div>

          <div
            className={`mini-chart-bars ${isCompact ? 'compact-bars' : ''}`}
            style={{ gridTemplateColumns: `repeat(${points.length}, 1fr)` }}
          >
            {points.map((point, index) => {
              const height = Math.max(8, Math.round((point.value / maxValue) * 86));
              const isDailyCompletion = chartType === 'completion' && statsRange !== 'year';

              const valueLabel = isDailyCompletion
                ? point.value > 0
                  ? '完成'
                  : '休息'
                : point.value > 0
                  ? String(point.value)
                  : '';

              return (
                <div className="mini-bar-column" key={`${point.label}-${index}`}>
                  <div className="bar-value-label">{valueLabel}</div>

                  <div className="mini-bar-track">
                    <div
                      className={`mini-bar ${point.value > 0 ? 'filled' : ''}`}
                      style={{ height: `${point.value > 0 ? height : 12}%` }}
                      title={
                        chartType === 'completion'
                          ? `${point.label}: ${point.value}${unit}`
                          : `${point.label}: ${point.value}${unit}`
                      }
                    />
                  </div>

                  {(!isCompact || index % 5 === 0 || index === points.length - 1) && (
                    <span>{point.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    function WeightLineChart({
      points,
    }: {
      points: { label: string; value: number }[];
    }) {
      if (points.length < 2) {
        return <p className="chart-empty">至少记录两次体重后，会显示体重趋势。</p>;
      }

      const values = points.map((point) => point.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      const coordinates = points
        .map((point, index) => {
          const x =
            points.length === 1
              ? 150
              : 24 + (index * 252) / (points.length - 1);
          const y = 92 - ((point.value - min) / range) * 62;
          return `${x},${y}`;
        })
        .join(' ');

      const first = points[0];
      const last = points[points.length - 1];
      const change = Number((last.value - first.value).toFixed(1));
      const directionText =
        change === 0
          ? '持平'
          : change > 0
            ? `增加 ${change} kg`
            : `减少 ${Math.abs(change)} kg`;

      return (
        <div className="weight-chart-wrap">
          <div className="chart-summary-row">
            <span>
              起始 <strong>{first.value}</strong> kg
            </span>
            <span>
              最新 <strong>{last.value}</strong> kg
            </span>
            <span>
              变化 <strong>{directionText}</strong>
            </span>
          </div>

          <svg
            className="weight-line-chart"
            viewBox="0 0 300 132"
            role="img"
            aria-label="体重变化折线图"
          >
            <line x1="24" y1="92" x2="276" y2="92" className="chart-axis" />
            <line x1="24" y1="30" x2="276" y2="30" className="chart-grid-line" />

            <text x="24" y="24" className="weight-axis-label">
              {max}kg
            </text>
            <text x="24" y="114" className="weight-axis-label">
              {min}kg
            </text>

            <polyline points={coordinates} className="weight-line" />

            {points.map((point, index) => {
              const x =
                points.length === 1
                  ? 150
                  : 24 + (index * 252) / (points.length - 1);
              const y = 92 - ((point.value - min) / range) * 62;

              return (
                <g key={`${point.label}-${index}`}>
                  <circle cx={x} cy={y} r="4.5" className="weight-dot" />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="weight-point-label"
                  >
                    {point.value}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="weight-chart-meta">
            <span>{first.label}</span>
            <strong>
              {change > 0 ? '+' : ''}
              {change} kg
            </strong>
            <span>{last.label}</span>
          </div>
        </div>
      );
    }

    return (
      <main className="page">
        <section className="page-header">
          <p className="eyebrow">运动统计</p>
          <h1>看看我们变好了多少</h1>
          <p>可以切换一周、一个月或一年，查看运动和体重变化。</p>
        </section>

        <section className="clay-card stats-range-card">
          <div className="range-switcher">
            <button
              className={statsRange === 'week' ? 'active' : ''}
              onClick={() => setStatsRange('week')}
            >
              一周
            </button>
            <button
              className={statsRange === 'month' ? 'active' : ''}
              onClick={() => setStatsRange('month')}
            >
              一个月
            </button>
            <button
              className={statsRange === 'year' ? 'active' : ''}
              onClick={() => setStatsRange('year')}
            >
              一年
            </button>
          </div>
          <p className="hint">
            当前查看：{rangeLabel}。一年视图会按月份汇总，更适合看长期变化。
          </p>
        </section>

        <section className="two-cards">
          {(Object.keys(profiles) as PersonId[]).map((person) => {
            const p = profiles[person];
            const s = getStats(person);

            return (
              <div className={`person-card ${p.gradient}`} key={person}>
                <div className="avatar">
                  <AvatarIcon person={person} size={58} />
                </div>
                <div className="stat-list">
                  <h2>{p.name}</h2>
                  <p>本周完成：{s.weekDays} 天</p>
                  <p>本月完成：{s.monthDays} 天</p>

                  {person === 'dragon' ? (
                    <>
                      <p>本周游泳：{s.weekDistance} 米</p>
                      <p>本月游泳：{s.monthDistance} 米</p>
                    </>
                  ) : (
                    <>
                      <p>本周运动：{s.weekMinutes} 分钟</p>
                      <p>本月运动：{s.monthMinutes} 分钟</p>
                    </>
                  )}

                  <p>
                    体重变化：
                    {typeof s.weightChange === 'number'
                      ? `${s.weightChange > 0 ? '+' : ''}${s.weightChange} kg`
                      : '暂无数据'}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {(Object.keys(profiles) as PersonId[]).map((person) => {
          const p = profiles[person];
          const metricUnit = person === 'dragon' ? '米' : '分钟';
          const metricTitle =
            person === 'dragon'
              ? `${rangeLabel}游泳米数`
              : `${rangeLabel}运动分钟`;

          return (
            <section className="clay-card chart-card" key={`chart-${person}`}>
              <div className="section-title">
                <div>
                  <h2>
                    <span className="title-with-icon">
                      <AvatarIcon person={person} size={28} />
                      {p.name} 的趋势
                    </span>
                  </h2>
                  <p>
                    {person === 'dragon'
                      ? '完成情况、游泳米数和体重变化。'
                      : '完成情况、运动分钟和体重变化。'}
                  </p>
                </div>
              </div>

              <div className="chart-grid">
                <div className="chart-block">
                  <h3>{rangeLabel}完成情况</h3>
                  <MiniBarChart
                    points={getCompletionPoints(person)}
                    unit="天"
                    chartType="completion"
                  />
                </div>

                <div className="chart-block">
                  <h3>{metricTitle}</h3>
                  <MiniBarChart
                    points={getMetricPoints(person)}
                    unit={metricUnit}
                    chartType="metric"
                  />
                </div>

                <div className="chart-block">
                  <h3>{rangeLabel}体重变化趋势</h3>
                  <WeightLineChart points={getWeightPoints(person)} />
                </div>
              </div>
            </section>
          );
        })}

        <section className="clay-card">
          <div className="section-title">
            <div>
              <h2>数据管理</h2>
              <p>当前数据已保存在 Supabase 云端。</p>
            </div>
          </div>
          <button className="danger-button" onClick={resetData}>
            清空所有云端数据
          </button>
        </section>
      </main>
    );
  };
  
  if (isLoading) {
    return (
      <div className="app-shell">
        <main className="page">
          <section className="hero">
            <div>
              <p className="eyebrow">正在加载</p>
              <h1>同步你们的训练记录...</h1>
              <p className="subtitle">正在连接 Supabase 云端数据。</p>
            </div>
            <div className="hero-bubble">
              <HeroIcon />
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {page === 'home' && renderHome()}
      {page === 'checkin' && renderCheckin()}
      {page === 'calendar' && renderCalendar()}
      {page === 'medals' && renderMedals()}
      {page === 'stats' && renderStats()}

      {toast && <div className="toast">{toast}</div>}

      <nav className="bottom-nav">
        <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>
          <NavIcon type="home" />
          <span>首页</span>
        </button>
        <button
          className={page === 'checkin' ? 'active' : ''}
          onClick={() => setPage('checkin')}
        >
          <NavIcon type="checkin" />
          <span>打卡</span>
        </button>
        <button
          className={page === 'calendar' ? 'active' : ''}
          onClick={() => setPage('calendar')}
        >
          <NavIcon type="calendar" />
          <span>日历</span>
        </button>
        <button
          className={page === 'medals' ? 'active' : ''}
          onClick={() => setPage('medals')}
        >
          <NavIcon type="medals" />
          <span>奖牌</span>
        </button>
        <button
          className={page === 'stats' ? 'active' : ''}
          onClick={() => setPage('stats')}
        >
          <NavIcon type="stats" />
          <span>统计</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
