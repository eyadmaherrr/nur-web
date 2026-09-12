'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Heart,
  Home,
  LocateFixed,
  MapPin,
  Moon,
  Play,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Sun,
  Timer,
  Volume2,
} from 'lucide-react';

/* =========================================================
   TYPES
   ========================================================= */

type Screen =
  | 'home'
  | 'prayers'
  | 'quran'
  | 'athkar'
  | 'tasbeeh'
  | 'qibla';

type Prayer = {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
};

type AthkarItem = {
  arabic: string;
  english: string;
  target: number;
};

/* =========================================================
   CONSTANTS
   ========================================================= */

const FALLBACK_PRAYERS: Prayer[] = [
  { name: 'Fajr', time: '05:06' },
  { name: 'Dhuhr', time: '12:52' },
  { name: 'Asr', time: '16:25' },
  { name: 'Maghrib', time: '19:08' },
  { name: 'Isha', time: '20:27' },
];

const ATHKAR: AthkarItem[] = [
  { arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', target: 33 },
  { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', target: 33 },
  { arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', target: 34 },
];

const CAIRO = { lat: 30.0444, lon: 31.2357 };

const KAABA = { lat: 21.4225, lon: 39.8262 };

/* =========================================================
   PURE HELPERS
   ========================================================= */

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

function parseTime(time: string): [number, number] {
  const [h, m] = time.split(':').map(Number);
  return [h, m];
}

function secondsUntil(time: string): number {
  const now = new Date();
  const [h, m] = parseTime(time);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatCountdown(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
}

function getNextPrayer(prayers: Prayer[]): Prayer {
  const now = new Date();
  for (const p of prayers) {
    const [h, m] = parseTime(p.time);
    const t = new Date(now);
    t.setHours(h, m, 0, 0);
    if (t > now) return p;
  }
  return prayers[0];
}

function calculateQibla(lat: number, lon: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lon - lon);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);
}

function shortestAngleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

function vibrate(pattern: number | number[] = 8) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

/* =========================================================
   STORAGE HOOK
   ========================================================= */

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/* =========================================================
   LIVE CLOCK
   ========================================================= */

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* =========================================================
   COUNTDOWN
   ========================================================= */

function useCountdown(nextPrayerTime: string) {
  const [seconds, setSeconds] = useState(() => secondsUntil(nextPrayerTime));

  useEffect(() => {
    setSeconds(secondsUntil(nextPrayerTime));
    const id = setInterval(() => {
      setSeconds(secondsUntil(nextPrayerTime));
    }, 1000);
    return () => clearInterval(id);
  }, [nextPrayerTime]);

  return seconds;
}

/* =========================================================
   DEVICE HEADING (smoothed)
   ========================================================= */

function useDeviceHeading() {
  const [heading, setHeading] = useState(0);
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: DeviceOrientationEvent) => {
      const wk = event as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };

      let compass: number;
      if (typeof wk.webkitCompassHeading === 'number') {
        compass = wk.webkitCompassHeading;
      } else if (typeof event.alpha === 'number') {
        compass = 360 - event.alpha;
      } else {
        return;
      }

      compass = (compass + 360) % 360;

      if (smoothed.current === null) {
        smoothed.current = compass;
      } else {
        // Low-pass filter for smooth motion.
        const diff = shortestAngleDiff(compass, smoothed.current);
        smoothed.current = (smoothed.current + diff * 0.18 + 360) % 360;
      }

      setHeading(Math.round(smoothed.current));
    };

    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  return heading;
}

/* =========================================================
   PRAYER TIMES + LOCATION
   ========================================================= */

type AladhanResponse = {
  code: number;
  data: {
    timings: Record<string, string>;
    date: { hijri: { day: string; month: { en: string }; year: string } };
  };
};

type NominatimResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
};

function usePrayerTimes() {
  const [prayers, setPrayers] = useState<Prayer[]>(FALLBACK_PRAYERS);
  const [location, setLocation] = useState('Cairo, Egypt');
  const [hijri, setHijri] = useState('26 Rabīʿ al-awwal 1448 AH');
  const [loading, setLoading] = useState(false);
  const [qibla, setQibla] = useState<number | null>(null);

  const load = useCallback(async (lat: number, lon: number) => {
    try {
      const ts = Math.floor(Date.now() / 1000);
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lon}&method=5`,
      );
      const json: AladhanResponse = await res.json();
      if (json.code !== 200) return;

      const t = json.data.timings;
      setPrayers([
        { name: 'Fajr', time: t.Fajr.slice(0, 5) },
        { name: 'Dhuhr', time: t.Dhuhr.slice(0, 5) },
        { name: 'Asr', time: t.Asr.slice(0, 5) },
        { name: 'Maghrib', time: t.Maghrib.slice(0, 5) },
        { name: 'Isha', time: t.Isha.slice(0, 5) },
      ]);

      const h = json.data.date.hijri;
      setHijri(`${h.day} ${h.month.en} ${h.year} AH`);
    } catch {
      setPrayers(FALLBACK_PRAYERS);
    }
  }, []);

  const detect = useCallback(
    (onError?: (message: string) => void) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        onError?.('Location is not available in this browser.');
        return;
      }

      setLoading(true);

      const finish = async (lat: number, lon: number) => {
        setQibla(calculateQibla(lat, lon));
        await load(lat, lon);
        setLoading(false);
      };

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data: NominatimResponse = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village;
            const country = data.address?.country;
            if (city) setLocation(`${city}${country ? `, ${country}` : ''}`);
          } catch {
            /* keep prior location */
          }

          await finish(latitude, longitude);
        },
        async () => {
          setLocation('Cairo, Egypt');
          await finish(CAIRO.lat, CAIRO.lon);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
      );
    },
    [load],
  );

  return {
    prayers,
    location,
    hijri,
    loading,
    qibla,
    detect,
  };
}

/* =========================================================
   COMPASS PERMISSION
   ========================================================= */

async function requestCompassPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  type WithPermission = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  const DOE = DeviceOrientationEvent as WithPermission;

  if (typeof DOE?.requestPermission === 'function') {
    try {
      const result = await DOE.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  return true; // No permission flow required (Android / desktop).
}

/* =========================================================
   SCREEN: HOME
   ========================================================= */

type HomeProps = {
  location: string;
  hijri: string;
  prayers: Prayer[];
  nextPrayer: Prayer;
  countdown: number;
  tasbeeh: number;
  onGo: (screen: Screen) => void;
};

function HomeScreen({
  location,
  hijri,
  prayers,
  nextPrayer,
  countdown,
  tasbeeh,
  onGo,
}: HomeProps) {
  const now = useClock();

  return (
    <>
      <div className="nurTopBar">
        <img src="/nur.png" alt="Nur" />
        <button
          type="button"
          aria-label="Settings"
          onClick={() => onGo('prayers')}
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="nurHome">
        <div className="homeAyah">
          <button
            type="button"
            className="bookmarkButton"
            aria-label="Bookmark ayah"
          >
            <Bookmark size={17} />
          </button>

          <p className="arabicHome">
            إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ
          </p>
          <p className="ayahTranslation">
            Indeed, We have made it an Arabic Qur&apos;an that you might
            understand.
          </p>
          <span className="ayahReference">Az-Zukhruf · 43:3</span>
        </div>

        <div className="homeDateCard">
          <div className="homeLocation">
            <MapPin size={15} />
            <strong>{location}</strong>
          </div>
          <div className="homeDate">
            <strong>{hijri}</strong>
            <span>
              {now.toLocaleDateString([], {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <button
          className="homeNextPrayer"
          type="button"
          onClick={() => onGo('prayers')}
        >
          <div className="nextPrayerIcon">
            <Moon size={24} />
          </div>
          <div className="nextPrayerInfo">
            <span>Next Prayer</span>
            <strong>{nextPrayer.name}</strong>
          </div>
          <strong className="homeCountdown">
            {formatCountdown(countdown)}
          </strong>
        </button>

        <div className="homePrayerStrip">
          {prayers.map((prayer) => (
            <div
              key={prayer.name}
              className={prayer.name === nextPrayer.name ? 'active' : ''}
            >
              <b>{prayer.name}</b>
              <small>{prayer.time}</small>
            </div>
          ))}
        </div>

        <button
          className="homeContinue"
          type="button"
          onClick={() => onGo('quran')}
        >
          <div className="homeContinueIcon">
            <BookOpen size={21} />
          </div>
          <div>
            <span>CONTINUE READING</span>
            <strong>Al-Faatiha — ayah 1 of 7</strong>
          </div>
          <ChevronRight size={20} />
        </button>

        <button
          className="homeContinue"
          type="button"
          onClick={() => onGo('athkar')}
        >
          <div className="homeContinueIcon">
            <Heart size={21} />
          </div>
          <div>
            <span>CONTINUE ATHKAR</span>
            <strong>After eating</strong>
          </div>
          <ChevronRight size={20} />
        </button>

        <div className="homeQuickActions">
          <button type="button" onClick={() => onGo('quran')}>
            <BookOpen />
            <span>Quran</span>
          </button>
          <button type="button" onClick={() => onGo('athkar')}>
            <Heart />
            <span>Athkar</span>
          </button>
          <button type="button" onClick={() => onGo('tasbeeh')}>
            <Timer />
            <span>{tasbeeh} counted</span>
          </button>
          <button type="button" onClick={() => onGo('qibla')}>
            <Compass />
            <span>Qibla</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SCREEN: PRAYERS
   ========================================================= */

type PrayersProps = {
  prayers: Prayer[];
  nextPrayer: Prayer;
  countdown: number;
  location: string;
  locationLoading: boolean;
  hijri: string;
  onDetect: () => void;
  onGoQibla: () => void;
};

function PrayersScreen({
  prayers,
  nextPrayer,
  countdown,
  location,
  locationLoading,
  hijri,
  onDetect,
  onGoQibla,
}: PrayersProps) {
  const now = useClock();

  return (
    <>
      <div className="nurTopBar">
        <img src="/nur.png" alt="Nur" />
        <button type="button" aria-label="Reload location" onClick={onDetect}>
          <Settings size={20} />
        </button>
      </div>

      <div className="prayersScreen">
        <h2>Prayer Times</h2>

        <button className="prayerLocation" type="button" onClick={onDetect}>
          <MapPin size={16} />
          {locationLoading ? 'Locating…' : location}
        </button>

        <div className="prayerDates">
          <strong>{hijri}</strong>
          <span>
            {now.toLocaleDateString([], {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="prayersNextCard">
          <div className="prayerLargeIcon">
            <Moon size={27} />
          </div>
          <span>Next Prayer</span>
          <strong>{nextPrayer.name}</strong>
          <div className="prayerLargeCountdown">
            {formatCountdown(countdown)}
          </div>
        </div>

        <button
          type="button"
          className="openQiblaButton"
          onClick={onGoQibla}
        >
          <Compass size={16} />
          Open Qibla
        </button>

        <div className="prayerList">
          {prayers.map((prayer) => {
            const active = prayer.name === nextPrayer.name;
            const Icon = prayer.name === 'Dhuhr' ? Sun : Moon;
            const display = new Date(
              `2000-01-01T${prayer.time}:00`,
            ).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                className={active ? 'prayerRow active' : 'prayerRow'}
                key={prayer.name}
              >
                <div className="prayerRowIcon">
                  <Icon />
                </div>
                <strong>{prayer.name}</strong>
                <span>{display}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SCREEN: QIBLA
   ========================================================= */

type QiblaProps = {
  qibla: number | null;
  location: string;
  onBack: () => void;
  onRecalibrate: () => void;
};

function QiblaScreen({
  qibla,
  location,
  onBack,
  onRecalibrate,
}: QiblaProps) {
  const heading = useDeviceHeading();
  const [error, setError] = useState('');
  const [permissionAsked, setPermissionAsked] = useState(false);

  const enableCompass = useCallback(async () => {
    const granted = await requestCompassPermission();
    setPermissionAsked(true);
    setError(
      granted ? '' : 'Compass permission is required for live direction.',
    );
  }, []);

  const dialRotation = -heading;
  const needleRotation = qibla ?? 135;

  // Alignment check: how close are we facing the qibla?
  const delta =
    qibla !== null ? Math.abs(shortestAngleDiff(heading, qibla)) : 180;
  const aligned = delta <= 6;
  const near = delta <= 20;

  useEffect(() => {
    if (aligned) vibrate(15);
  }, [aligned]);

  return (
    <>
      <div className="detailHeader qiblaHeader">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ArrowLeft />
        </button>
        <img src="/nur.png" alt="Nur" />
        <button
          type="button"
          aria-label="Enable compass"
          onClick={enableCompass}
        >
          <Compass />
        </button>
      </div>

      <div className="qiblaScreen">
        <div className="screenEyebrow">QIBLA</div>
        <h2>Find the Qibla</h2>

        <p className="qiblaLocation">
          <MapPin size={14} />
          {location}
        </p>

        <div className="qiblaDirectionLabel">
          {qibla !== null
            ? `${qibla}° from North`
            : 'Calculating direction'}
        </div>

        <div className="qiblaCompass" aria-label="Qibla compass">
          <div
            className={
              aligned
                ? 'qiblaCompassOuter aligned'
                : 'qiblaCompassOuter'
            }
          >
            <span className="compassMark north">N</span>
            <span className="compassMark east">E</span>
            <span className="compassMark south">S</span>
            <span className="compassMark west">W</span>

            <div
              className="qiblaDial"
              style={{ transform: `rotate(${dialRotation}deg)` }}
            >
              <div className="qiblaTicks">
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    style={{ transform: `rotate(${i * 15}deg)` }}
                  />
                ))}
              </div>

              <div
                className="qiblaNeedle"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                <div className="needleHead">
                  <ChevronRight />
                </div>
                <div className="needleLine" />
                <span className="kaabaDot">
                  <Compass />
                </span>
              </div>
            </div>

            <div className="qiblaCenter">
              <Compass size={27} />
              <strong>{qibla ?? '—'}°</strong>
              <span>Qibla bearing</span>
            </div>
          </div>
        </div>

        <div className="qiblaInfoCard">
          <div className="qiblaInfoIcon">
            <LocateFixed />
          </div>
          <div>
            <strong>
              {aligned
                ? 'Aligned — you are facing the Qibla'
                : near
                  ? 'Almost there — adjust slightly'
                  : 'Face the gold marker'}
            </strong>
            <span>
              Rotate your phone until the Qibla marker aligns with the
              direction ahead.
            </span>
          </div>
        </div>

        {error && (
          <button
            type="button"
            className="qiblaPermission"
            onClick={enableCompass}
          >
            <Compass size={16} />
            Enable compass
          </button>
        )}

        {!permissionAsked && !error && (
          <button
            type="button"
            className="qiblaPermission"
            onClick={enableCompass}
          >
            <Compass size={16} />
            Calibrate compass
          </button>
        )}

        <button
          type="button"
          className="qiblaRefresh"
          onClick={onRecalibrate}
        >
          <RotateCcw size={15} />
          Recalibrate
        </button>

        <p className="qiblaFooter">
          Qibla direction is calculated from your current location.
        </p>
      </div>
    </>
  );
}

/* =========================================================
   SCREEN: TASBEEH
   ========================================================= */

type TasbeehProps = {
  count: number;
  setCount: (next: number) => void;
  onBack: () => void;
};

function TasbeehScreen({ count, setCount, onBack }: TasbeehProps) {
  const [choice, setChoice] = usePersistentState<number>(
    'nur:tasbeeh:choice',
    0,
  );
  const current = ATHKAR[choice];
  const remainder = count % current.target;

  const tap = () => {
    const next = count + 1;
    setCount(next);
    vibrate(6);
  };

  return (
    <>
      <div className="detailHeader">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ArrowLeft />
        </button>
        <img src="/nur.png" alt="Nur" />
        <span />
      </div>

      <div className="tasbeehScreen">
        <div className="screenEyebrow">TASBEEH</div>

        <div className="dhikrChoices">
          {ATHKAR.map((item, i) => (
            <button
              type="button"
              key={item.english}
              className={i === choice ? 'selected' : ''}
              aria-pressed={i === choice}
              onClick={() => {
                setChoice(i);
                setCount(0);
              }}
            >
              <strong>{item.arabic}</strong>
              <span>{item.english}</span>
            </button>
          ))}
        </div>

        <div className="currentCountLabel">CURRENT COUNT</div>
        <div className="tasbeehNumber">{count}</div>
        <div className="tasbeehSet">
          Set of {current.target} · {remainder}/{current.target}
        </div>

        <button
          className="tasbeehTap"
          type="button"
          onClick={tap}
          aria-label="Count one tasbeeh"
        >
          <span>+</span>
          <strong>Tap</strong>
        </button>

        <button
          className="resetCount"
          type="button"
          onClick={() => {
            setCount(0);
            vibrate([8, 30, 8]);
          }}
        >
          Reset count
        </button>

        <p className="tasbeehQuote">
          ✦ Remember Allah with presence, not haste.
        </p>
      </div>
    </>
  );
}

/* =========================================================
   SCREEN: ATHKAR
   ========================================================= */

function AthkarScreen({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="nurTopBar">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 0,
            color: 'inherit',
            padding: 0,
            width: 'auto',
            height: 'auto',
          }}
        >
          <ArrowLeft />
        </button>
        <img src="/nur.png" alt="Nur" />
        <button type="button" aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>

      <div className="athkarScreen">
        <h2>Athkar</h2>
        <p className="athkarSubtitle">
          Remember Allah throughout your day.
        </p>

        <div className="athkarSearch">
          <Search size={18} />
          <span>Search · sleep · نوم · anxiety</span>
        </div>

        <div className="morningCard">
          <span className="morningLabel">GOOD MORNING</span>
          <h3>Time for Morning Adhkar</h3>
          <div className="morningArabic">أذكار الصباح</div>

          <div className="morningBottom">
            <span>Completed today · alhamdulillah</span>
            <div className="completeCircle">
              <Check size={24} />
            </div>
          </div>

          <button type="button">
            <Play size={15} fill="currentColor" />
            Read again · Morning Adhkar
          </button>
        </div>

        <div className="athkarTwoCards">
          <button type="button">
            <div>
              <span>★</span>
            </div>
            <strong>Favourites</strong>
            <small>None yet</small>
          </button>

          <button type="button">
            <div>
              <SparkleIcon />
            </div>
            <strong>99 Names</strong>
            <small>Asma&apos; al-Husna</small>
          </button>
        </div>

        <div className="libraryHeader">
          <strong>LIBRARY</strong>
          <span>132 adhkar</span>
        </div>

        <div className="athkarLibrary">
          {[
            { icon: <Sun />, title: 'Morning & Evening', count: '2 topics' },
            { icon: <Moon />, title: 'Salah', count: '8 topics' },
            { icon: <Heart />, title: 'Protection', count: '6 topics' },
            { icon: <Home />, title: 'Daily Life', count: '12 topics' },
          ].map((item) => (
            <button key={item.title} type="button">
              <div>{item.icon}</div>
              <strong>{item.title}</strong>
              <span>{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SCREEN: QURAN
   ========================================================= */

type QuranProps = {
  onBack: () => void;
};

function QuranScreen({ onBack }: QuranProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);

  return (
    <>
      <div className="detailHeader">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ArrowLeft />
        </button>
        <img src="/nur.png" alt="Nur" />
        <button type="button" aria-label="Bookmark">
          <Bookmark />
        </button>
      </div>

      <div className="quranScreen">
        <div className="screenEyebrow">AL-FAATIHA</div>

        <div className="surahCard">
          <div className="surahArabic">سُورَةُ الْفَاتِحَةِ</div>
          <h2>The Opening</h2>
          <div className="surahPills">
            <span>Makki</span>
            <span>7 Ayahs</span>
          </div>
        </div>

        <div className="quranControls">
          <button type="button">Aa</button>
          <button className="active" type="button">
            文 Translation
          </button>
          <button
            className="active"
            type="button"
            onClick={() => setAudioPlaying((v) => !v)}
          >
            {audioPlaying ? '▶ Playing' : '▶ Play'}
          </button>
        </div>

        {[
          {
            ref: '1:1',
            arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translation:
              'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
          },
          {
            ref: '1:2',
            arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            translation: '[All] praise is [due] to Allah, Lord of the worlds.',
          },
          {
            ref: '1:3',
            arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
            translation: 'The Entirely Merciful, the Especially Merciful.',
          },
        ].map((ayah) => (
          <div className="quranAyah" key={ayah.ref}>
            <span className="ayahBadge">{ayah.ref}</span>
            <div className="ayahButtons">
              <button
                type="button"
                aria-label="Play ayah"
                onClick={() => setAudioPlaying((v) => !v)}
              >
                {audioPlaying ? (
                  <Volume2 />
                ) : (
                  <Play fill="currentColor" />
                )}
              </button>
              <button type="button" aria-label="Bookmark ayah">
                <Bookmark />
              </button>
              <button type="button" aria-label="Share ayah">
                <Share2 />
              </button>
            </div>

            <p className="quranArabic">{ayah.arabic}</p>
            <p className="quranTranslation">{ayah.translation}</p>
          </div>
        ))}
      </div>

      {audioPlaying && (
        <div className="floatingAudio">
          <div>
            <BookOpen />
          </div>
          <section>
            <strong>Al-Faatiha · Ayah 2</strong>
            <span>Abdurrahman As-Sudais · 2/7</span>
          </section>
          <button
            type="button"
            aria-label="Pause"
            onClick={() => setAudioPlaying(false)}
          >
            ❚❚
          </button>
        </div>
      )}
    </>
  );
}

/* =========================================================
   BOTTOM NAV
   ========================================================= */

/* =========================================================
   BOTTOM NAV
   ========================================================= */

import type { LucideIcon } from 'lucide-react';

type NavTab = {
  id: Screen;
  label: string;
  icon: LucideIcon;
};

const TABS: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'prayers', label: 'Prayers', icon: Moon },
  { id: 'quran', label: 'Quran', icon: BookOpen },
  { id: 'athkar', label: 'Athkar', icon: Heart },
  { id: 'qibla', label: 'Qibla', icon: Compass },
];

function BottomNav({
  active,
  onGo,
}: {
  active: Screen;
  onGo: (s: Screen) => void;
}) {
  return (
    <div className="nurBottomNav">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={active === id ? 'active' : ''}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onGo(id)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   ROOT
   ========================================================= */

export default function NurExperience() {
  const [screen, setScreen] = useState<Screen>('home');
  const [tasbeeh, setTasbeeh] = usePersistentState<number>(
    'nur:tasbeeh:count',
    0,
  );

  const {
    prayers,
    location,
    hijri,
    loading,
    qibla,
    detect,
  } = usePrayerTimes();

  const nextPrayer = useMemo(() => getNextPrayer(prayers), [prayers]);
  const countdown = useCountdown(nextPrayer.time);
  const now = useClock();

  useEffect(() => {
    detect();
  }, [detect]);

  const go = useCallback((next: Screen) => {
    vibrate(4);
    setScreen(next);
  }, []);

  const showNav =
    screen === 'home' || screen === 'prayers' || screen === 'athkar';

  return (
    <div className="nurExperience">
      <div className="iphoneDynamicIsland">
        <span className="dynamicIslandCamera" />
        <span className="dynamicIslandSensor" />
      </div>

      <div className="nurStatusBar">
        <span>
          {now.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <div className="statusIcons">
          <span>▦</span>
          <span>◔</span>
          <span className="battery">87%</span>
        </div>
      </div>

      {screen === 'home' && (
        <HomeScreen
          location={location}
          hijri={hijri}
          prayers={prayers}
          nextPrayer={nextPrayer}
          countdown={countdown}
          tasbeeh={tasbeeh}
          onGo={go}
        />
      )}

      {screen === 'prayers' && (
        <PrayersScreen
          prayers={prayers}
          nextPrayer={nextPrayer}
          countdown={countdown}
          location={location}
          locationLoading={loading}
          hijri={hijri}
          onDetect={detect}
          onGoQibla={() => go('qibla')}
        />
      )}

      {screen === 'qibla' && (
        <QiblaScreen
          qibla={qibla}
          location={location}
          onBack={() => go('home')}
          onRecalibrate={() => {
            detect();
          }}
        />
      )}

      {screen === 'tasbeeh' && (
        <TasbeehScreen
          count={tasbeeh}
          setCount={setTasbeeh}
          onBack={() => go('home')}
        />
      )}

      {screen === 'athkar' && (
        <AthkarScreen onBack={() => go('home')} />
      )}

      {screen === 'quran' && (
        <QuranScreen onBack={() => go('home')} />
      )}

      {showNav && <BottomNav active={screen} onGo={go} />}
    </div>
  );
}

/* =========================================================
   ICONS
   ========================================================= */

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}