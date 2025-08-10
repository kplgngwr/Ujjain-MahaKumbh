
import React, { useMemo } from 'react';
import MapView from './MapView';
import { MapPin, Hotel, Landmark, Car, DoorOpen, Menu, X, Globe, Filter, ParkingCircle, Route, UsersRound, MessageSquare, Layers, Sun, Moon, CalendarDays, Zap } from 'lucide-react';
import { Diya, MandalaBG, NavPill, Chip, TogglePill } from './themeComponents';

function App() {
  const [open, setOpen] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);
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
            {[{ icon: MapPin, label: 'Home' }, { icon: Landmark, label: 'Ghats' }, { icon: Hotel, label: 'Accommodation' }, { icon: ParkingCircle, label: 'Parking & Shuttle' }, { icon: DoorOpen, label: 'Entry/Exit' }, { icon: Landmark, label: 'Temples' }].map(n => (
              <NavPill key={n.label} icon={n.icon} label={n.label} active={activeTab === n.label} onClick={() => setActiveTab(n.label)} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-300/30 hover:bg-indigo-900/50"><Globe className="w-4 h-4" /><span className="text-sm">EN / HI</span></button>
            <button onClick={() => setDark(d => !d)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-300/30 hover:bg-indigo-900/50">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}<span className="text-sm">{dark ? 'Light' : 'Dark'}</span></button>
          </div>
        </div>
  {/* Search bar removed for now (to be re-added over map later) */}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 w-full overflow-hidden min-h-0">
  <aside className="lg:col-span-3 space-y-4 h-full overflow-y-auto pr-1 flex flex-col min-h-0 scrollbar-hide">
          <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-amber-300" /> Layers</h2>
              <button className="text-xs text-amber-300 inline-flex items-center gap-1"><Filter className="w-3 h-3" />Manage</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[{key:'ghats', label:'Ghats'}, {key:'temples', label:'Temples'}, {key:'wards', label:'Wards'}, {key:'hospitals', label:'Hospitals'}, {key:'hotels', label:'Hotels'}, {key:'lostFound', label:'Lost & Found'}, {key:'publicToilets', label:'Public Toilets'}, {key:'policeStations', label:'Police Stations'}, {key:'busStand', label:'Bus Stand'}, {key:'atms', label:'ATM'}, {key:'entryExit', label:'Entry/Exit'}, {key:'fireStations', label:'Fire Station'}, {key:'stayTents', label:'Stay Tents'}]
                .map(l => (
                  <TogglePill key={l.key} label={l.label} checked={filters[l.key]} onChange={() => toggleFilter(l.key)} />
                ))}
            </div>
          </section>
          <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
            <h2 className="font-semibold flex items-center gap-2 text-amber-300"><CalendarDays className="w-4 h-4"/> Day & Routes</h2>
            <div className="mt-3 space-y-3 text-sm">
              <select value={dayType} onChange={e=>setDayType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-indigo-900/50 border border-indigo-300/30 focus:outline-none focus:border-amber-400 text-indigo-100">
                <option className="bg-indigo-900">Regular Day</option>
                <option className="bg-indigo-900">Shahi Snan</option>
                <option className="bg-indigo-900">Festival / Parva</option>
              </select>
              <div className="flex flex-col gap-2 text-[11px] font-medium">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-200/15 border border-amber-300/30 text-amber-200"><UsersRound className="w-3.5 h-3.5"/> Dynamic routing active</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-900/60 border border-indigo-300/30 text-indigo-200"><Zap className="w-3.5 h-3.5 text-amber-300"/> Live traffic (5 min)</div>
              </div>
            </div>
          </section>
          {activeTab === 'Temples' && (
            <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-3">
              <h2 className="px-1 py-1 font-semibold">Temples</h2>
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
            <p>© 2025 Ujjain Mahakumbh • Midnight Aarti Theme</p>
            <p>Indigo · Gold devotional UI</p>
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

      {/* Global floating AI button (outside map) */}
      <button aria-label="Open AI Assistant" onClick={() => setShowAI(true)} className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-indigo-950 shadow-xl flex items-center justify-center hover:shadow-amber-400/70 hover:scale-[1.03] active:scale-95">
        <Diya className="w-8 h-8" />
      </button>

      {showAI && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAI(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-indigo-950/95 text-indigo-50 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-indigo-400/20 flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-amber-300" /><span className="font-semibold">Anubhava AI</span></div><button onClick={() => setShowAI(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3 overflow-auto flex-1">
              <div className="text-xs text-amber-200">You’re chatting about: <b>Context</b></div>
              <div className="bg-indigo-900/60 border border-indigo-300/25 rounded-2xl p-3 text-sm">Ask questions about ghats, temples or travel logistics.</div>
            </div>
            <div className="p-3 border-t border-indigo-400/20 flex gap-2"><input className="flex-1 px-3 py-2 rounded-xl bg-indigo-900/60 border border-indigo-300/25 placeholder-indigo-200/70" placeholder="Ask about routes, amenities, timings…" /><button className="px-4 py-2 rounded-xl bg-amber-400 text-indigo-950">Send</button></div>
          </div>
        </div>
      )}

  {/* Footer moved inside right scroll column */}
    </div>
  );
}

export default App;
