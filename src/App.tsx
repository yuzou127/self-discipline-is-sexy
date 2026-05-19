import { useEffect, useMemo, useState } from 'react';
import './App.css';

type PersonId = 'rabbit' | 'dragon';
type Page = 'home' | 'checkin' | 'calendar' | 'medals' | 'stats';

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

type Progress = {
  position: number;
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  totalMinutes: number;
  totalDistance: number;
  lastWeight?: number;
};

const STORAGE_KEY = 'self-discipline-is-sexy-v2';

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
  size = 68,
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
      }}
    />
  );
}

function HeroIcon() {
  return (
    <svg
      width="76"
      height="76"
      viewBox="0 0 76 76"
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
      <circle cx="22" cy="25" r="12" fill="#FFFFFF" stroke="#2D7FF9" strokeWidth="2.4" />
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

function loadLogs(): WorkoutLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
  const [logs, setLogs] = useState<WorkoutLog[]>(loadLogs);
  const [selectedPerson, setSelectedPerson] = useState<PersonId>('rabbit');
  const [date, setDate] = useState(todayString());
  const [completed, setCompleted] = useState(true);
  const [activity, setActivity] = useState(profiles.rabbit.defaultActivity);
  const [minutes, setMinutes] = useState('30');
  const [distance, setDistance] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

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

  const saveLog = () => {
    const newLog: WorkoutLog = {
      id: `${selectedPerson}-${date}`,
      person: selectedPerson,
      date,
      completed,
      activity: activity || profiles[selectedPerson].defaultActivity,
      minutes:
        selectedPerson === 'rabbit' && completed ? Number(minutes || 0) : 0,
      distance:
        selectedPerson === 'dragon' && completed && distance
          ? Number(distance)
          : undefined,
      weight: weight ? Number(weight) : undefined,
      note,
      createdAt: new Date().toISOString(),
    };

    setLogs((prev) => [
      ...prev.filter(
        (log) => !(log.person === selectedPerson && log.date === date)
      ),
      newLog,
    ]);

    setToast(
      completed
        ? `${profiles[selectedPerson].name} 打卡成功，前进 1 格！`
        : `${profiles[selectedPerson].name} 今天休息，后退 2 格。`
    );

    setNote('');
  };

  const resetData = () => {
    const yes = window.confirm('确定要清空所有打卡数据吗？这个操作不能恢复。');
    if (yes) {
      setLogs([]);
      localStorage.removeItem(STORAGE_KEY);
      setToast('数据已清空，可以重新开始啦。');
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
                  <AvatarIcon person={person} size={68} />
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

        <button className="primary-button" onClick={saveLog}>
          保存打卡
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

    return (
      <main className="page">
        <section className="page-header">
          <p className="eyebrow">运动统计</p>
          <h1>看看我们变好了多少</h1>
          <p>小嘟嘟看运动分钟，大猪蹄子看游泳米数。</p>
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

        <section className="clay-card">
          <div className="section-title">
            <div>
              <h2>数据管理</h2>
              <p>第一版数据保存在当前浏览器里。</p>
            </div>
          </div>
          <button className="danger-button" onClick={resetData}>
            清空所有数据
          </button>
        </section>
      </main>
    );
  };

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