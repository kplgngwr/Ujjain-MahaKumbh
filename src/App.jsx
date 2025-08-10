
import React, { useMemo } from 'react';
import { useLang } from './useLang';
import MapView from './MapView';
import { MapPin, Hotel, Landmark, DoorOpen, Menu, X, Globe, Filter, ParkingCircle, UsersRound, MessageSquare, Layers, Sun, Moon, CalendarDays, Zap } from 'lucide-react';
import { Diya, MandalaBG, NavPill, Chip, TogglePill } from './themeComponents';

function App() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);
  const [showAnnouncement, setShowAnnouncement] = React.useState(true); // show popup each load
  const [activeTab, setActiveTab] = React.useState('Home');
  const [dark, setDark] = React.useState(true);
  // Start with no layers selected; user can enable manually
  const [filters, setFilters] = React.useState({
    ghats: false,
    temples: false,
    wards: false,
    hospitals: false,
    hotels: false,
    lostFound: false,
    publicToilets: false,
    policeStations: false,
    busStand: false,
    atms: false,
    entryExit: false,
    fireStations: false,
    stayTents: false,
  });
  const [dayType, setDayType] = React.useState('Regular Day');

  const toggleFilter = (k) => setFilters(f => ({ ...f, [k]: !f[k] }));

  // Demo lists (could be externalized)
  const temples = useMemo(() => ([{ name: 'Mahakaleshwar Jyotirlinga', crowd: 'High' }, { name: 'Harsiddhi Temple', crowd: 'Moderate' }]), []);

  return (
    <div className={`min-h-screen h-screen ${dark ? 'bg-gradient-to-b from-[#0B1026] via-[#12173A] to-[#1A1240]' : 'bg-gradient-to-b from-amber-50 via-white to-rose-50'} text-indigo-50 flex flex-col`}>
      <header className="sticky top-0 z-50 border-b border-indigo-400/20 bg-indigo-950/60 backdrop-blur">
        <div className="absolute inset-0 pointer-events-none"><MandalaBG /></div>
        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="w-6 h-6 text-amber-300" /></button>
          <div className="flex items-center gap-2"><Diya /><div className="leading-tight"><p className="text-xs text-amber-200/80">Ujjain Mahakumbh</p><h1 className="text-lg font-bold tracking-wide">Simhastha 2028</h1></div></div>
          <nav className="hidden md:flex ml-6 gap-2">
            {[
              { icon: MapPin, label: t('home') },
              { icon: Landmark, label: t('ghats') },
              { icon: Hotel, label: t('accommodation') },
              { icon: ParkingCircle, label: t('parking') },
              { icon: DoorOpen, label: t('entryExit') },
              { icon: Landmark, label: t('temples') },
            ].map(n => (
              <NavPill key={n.label} icon={n.icon} label={n.label} active={activeTab === n.label} onClick={() => setActiveTab(n.label)} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-300/30 hover:bg-indigo-900/50"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{t('enHi')}</span>
            </button>
            <button onClick={() => setDark(d => !d)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-300/30 hover:bg-indigo-900/50">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}<span className="text-sm">{dark ? t('light') : t('dark')}</span></button>
          </div>
        </div>
        {/* Search bar removed for now (to be re-added over map later) */}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 w-full overflow-hidden min-h-0">
        <aside className="lg:col-span-3 space-y-4 h-full overflow-y-auto pr-1 flex flex-col min-h-0 scrollbar-hide">
          <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-amber-300" /> {t('layers')}</h2>
              <button className="text-xs text-amber-300 inline-flex items-center gap-1"><Filter className="w-3 h-3" />{t('manage')}</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[{ key: 'ghats', label: 'Ghats' }, { key: 'temples', label: 'Temples' }, { key: 'wards', label: 'Wards' }, { key: 'hospitals', label: 'Hospitals' }, { key: 'hotels', label: 'Hotels' }, { key: 'lostFound', label: 'Lost & Found' }, { key: 'publicToilets', label: 'Public Toilets' }, { key: 'policeStations', label: 'Police Stations' }, { key: 'busStand', label: 'Bus Stand' }, { key: 'atms', label: 'ATM' }, { key: 'entryExit', label: 'Entry/Exit' }, { key: 'fireStations', label: 'Fire Station' }, { key: 'stayTents', label: 'Stay Tents' }]
                .map(l => (
                  <TogglePill key={l.key} label={l.label} checked={filters[l.key]} onChange={() => toggleFilter(l.key)} />
                ))}
            </div>
          </section>
          <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
            <h2 className="font-semibold flex items-center gap-2 text-amber-300"><CalendarDays className="w-4 h-4" /> {t('dayRoutes')}</h2>
            <div className="mt-3 space-y-3 text-sm">
              <select value={dayType} onChange={e => setDayType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-indigo-900/50 border border-indigo-300/30 focus:outline-none focus:border-amber-400 text-indigo-100">
                <option className="bg-indigo-900">{t('regularDay')}</option>
                <option className="bg-indigo-900">{t('shahiSnan')}</option>
                <option className="bg-indigo-900">{t('festival')}</option>
              </select>
              <div className="flex flex-col gap-2 text-[11px] font-medium">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-200/15 border border-amber-300/30 text-amber-200"><UsersRound className="w-3.5 h-3.5" /> {t('dynamicRouting')}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-900/60 border border-indigo-300/30 text-indigo-200"><Zap className="w-3.5 h-3.5 text-amber-300" /> {t('liveTraffic')}</div>
              </div>
            </div>
          </section>
          {activeTab === 'Temples' && (
            <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-3">
              <h2 className="px-1 py-1 font-semibold">{t('temples')}</h2>
              <div className="mt-2 grid gap-2 max-h-[26rem] overflow-auto pr-1 text-xs">
                {temples.map(t => <div key={t.name} className="rounded-lg bg-indigo-900/50 border border-indigo-300/20 p-2 flex justify-between"><span>{t.name}</span><Chip>{t.crowd}</Chip></div>)}
              </div>
            </section>
          )}
        </aside>
        <section className="lg:col-span-9 flex flex-col space-y-4 h-full overflow-y-auto min-h-0 scrollbar-hide">
          <div className="relative flex-1 min-h-[560px] rounded-3xl overflow-hidden border border-indigo-300/25 bg-indigo-900/40">
            <MapView layers={filters} />
          </div>
          <div className="mt-2 border-t border-indigo-400/20 pt-4 pb-6 text-sm text-indigo-200 flex flex-wrap items-center justify-between gap-2">
            <p>{t('copyright')} • {t('midnightAarti')}</p>
            <p>{t('devotionalUi')}</p>
          </div>
        </section>
      </main>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-indigo-950/95 text-indigo-50 shadow-2xl p-4 space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Diya /><span className="font-semibold">Menu</span></div><button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
            {[{ icon: MapPin, label: 'Home' }, { icon: Landmark, label: 'Ghats' }, { icon: Hotel, label: 'Accommodation' }, { icon: ParkingCircle, label: 'Parking & Shuttle' }, { icon: DoorOpen, label: 'Entry/Exit' }, { icon: Landmark, label: 'Temples' }].map(n => (
              <NavPill key={n.label} icon={n.icon} label={n.label} active={activeTab === n.label} onClick={() => setActiveTab(n.label)} />
            ))}
          </div>
        </div>
      )}


      <div
        aria-label="Open AI Assistant"
        onClick={() => setShowAI(true)}
        className="fixed bottom-5 right-5 z-40 group cursor-pointer"
      >
        {/* Default state is just the orange circle with Diya */}
        <div 
          className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 shadow-xl flex items-center justify-center group-hover:hidden transition-all"
        >
          <Diya className="w-8 h-8" />
        </div>
        
        {/* Hover state shows the orange pill with text */}
        <div 
          className="hidden group-hover:flex items-center px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 shadow-xl transition-all"
        >
          <div className="flex items-center justify-center rounded-full bg-indigo-700 w-7 h-7 mr-3">
            <Diya className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold text-indigo-950">{t('aiAsk')}</span>
        </div>
      </div>

      {showAnnouncement && (() => {
        if (!window.__announcementTimer) {
          window.__announcementTimer = setTimeout(() => {
            setShowAnnouncement(false);
            window.__announcementTimer = null;
          }, 3000);
        }
        return (
          <div className="fixed inset-0 z-[70]">
            <video
              src="/Diya_and_Water_Flow_Video.mp4"
              alt="Ujjain Mahakumbh Simhastha 2028 announcement"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
            <div className="absolute inset-0 bg-black/40" />
            <button
              aria-label="Close announcement"
              onClick={() => {
                clearTimeout(window.__announcementTimer);
                window.__announcementTimer = null;
                setShowAnnouncement(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-amber-200 flex items-center justify-center border border-amber-300/30 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })()}

      {showAI && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAI(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-indigo-950/95 text-indigo-50 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-indigo-400/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-300" />
                <span className="font-semibold">{t('aiTitle')}</span>
              </div>
              <button onClick={() => setShowAI(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-auto flex-1">
              <div className="text-xs text-amber-200">{t('aiContext')}</div>
              <div className="bg-indigo-900/60 border border-indigo-300/25 rounded-2xl p-3 text-sm">
                {t('aiPrompt')}
              </div>
            </div>
            <div className="p-3 border-t border-indigo-400/20 flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-indigo-900/60 border border-indigo-300/25 placeholder-indigo-200/70"
                placeholder={t('aiPlaceholder')}
              />
              <button className="px-4 py-2 rounded-xl bg-amber-400 text-indigo-950">{t('send')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer moved inside right scroll column */}
    </div>
  );
}

export default App;
