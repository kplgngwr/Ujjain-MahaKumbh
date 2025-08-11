
import React, { useMemo } from 'react';
import { useLang } from './useLang';
import MapView from './MapView';
import { MapPin, Hotel, Landmark, DoorOpen, Menu, X, Globe, Filter, ParkingCircle, UsersRound, MessageSquare, Layers, Sun, Moon, CalendarDays, Zap, Clock, Droplets, Navigation, Search, BadgePlus, MapIcon } from 'lucide-react';
import { Diya, MandalaBG, NavPill, Chip, TogglePill } from './themeComponents';
import { templesData } from './templesData';

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
    restaurants: false, // Add restaurant layer
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

  // Effect to automatically toggle temples layer when on Temples tab
  React.useEffect(() => {
    if (activeTab === t('temples') && !filters.temples) {
      // Auto-enable temples layer when switching to Temples tab
      setFilters(prev => ({ ...prev, temples: true }));
    }
  }, [activeTab, filters.temples, t]);

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
              {[{ key: 'ghats', label: t('ghats') }, { key: 'temples', label: t('temples') }, { key: 'wards', label: t('wards') }, { key: 'restaurants', label: t('restaurants') }, { key: 'hospitals', label: t('hospitals') }, { key: 'hotels', label: t('hotels') }, { key: 'lostFound', label: t('lostFound') }, { key: 'publicToilets', label: t('publicToilets') }, { key: 'policeStations', label: t('policeStations') }, { key: 'busStand', label: t('busStand') }, { key: 'atms', label: t('atm') }, { key: 'entryExit', label: t('entryExit') }, { key: 'fireStations', label: t('fireStation') }, { key: 'stayTents', label: t('stayTents') }]
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
          {activeTab === t('temples') && (
            <>
              <div className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-300" /> {t('temples')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300" />
                      <input 
                        type="text" 
                        placeholder={t('searchTemples')} 
                        className="pl-8 pr-3 py-1.5 text-xs bg-indigo-900/50 rounded-lg border border-indigo-300/20 focus:outline-none focus:border-amber-400 placeholder-indigo-300/70 w-32"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <button className="px-3 py-1.5 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full text-xs whitespace-nowrap">
                    {t('allTemples')}
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-900/50 text-indigo-200 border border-indigo-300/20 rounded-full text-xs whitespace-nowrap hover:border-indigo-300/40">
                    {t('jyotirlinga')}
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-900/50 text-indigo-200 border border-indigo-300/20 rounded-full text-xs whitespace-nowrap hover:border-indigo-300/40">
                    {t('shaktipeeth')}
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-900/50 text-indigo-200 border border-indigo-300/20 rounded-full text-xs whitespace-nowrap hover:border-indigo-300/40">
                    {t('lessCrowded')}
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-900/50 text-indigo-200 border border-indigo-300/20 rounded-full text-xs whitespace-nowrap hover:border-indigo-300/40">
                    {t('wheelchairFriendly')}
                  </button>
                </div>
              </div>
              
              <section className="rounded-2xl border border-indigo-300/25 bg-indigo-950/40 p-4">
                <h2 className="mb-2 font-semibold">{t('darshanCards')}</h2>
                <div className="space-y-4 max-h-[26rem] overflow-auto pr-1 scrollbar-hide">
                  {templesData.map(temple => (
                    <div key={temple.id} className="rounded-xl bg-indigo-900/60 border border-indigo-300/30 overflow-hidden">
                      <div className="flex items-center p-3 border-b border-indigo-700">
                        <div className="h-10 w-10 bg-indigo-800 rounded-lg flex items-center justify-center overflow-hidden mr-3">
                          <img src={temple.image} alt={temple.name} className="h-9 w-9 object-contain" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-amber-200">{temple.name}</h3>
                          <p className="text-xs text-indigo-200">{t('deity')}: {temple.deity}</p>
                        </div>
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          temple.crowd === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 
                          temple.crowd === 'Moderate' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 
                          'bg-green-500/20 text-green-200 border border-green-500/30'
                        }`}>
                          {temple.crowd}
                        </div>
                      </div>
                      
                      <div className="px-3 py-2 grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span className="text-indigo-100">{t('darshan')}: {temple.darshan}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-amber-300" />
                          <span className="text-indigo-100">{t('nearestGhat')}: Ram Ghat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Diya className="w-3.5 h-3.5" />
                          <span className="text-indigo-100">{temple.aarti}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-amber-300" />
                          <span className="text-indigo-100">{t('distance')}: {temple.distance}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-indigo-700 px-3 py-2">
                        <h4 className="text-xs font-medium text-indigo-200 mb-1">{t('amenities')}:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {temple.amenities.map((amenity, i) => (
                            <div key={i} className="px-2 py-0.5 bg-indigo-800/70 rounded text-[10px] text-indigo-200 flex items-center gap-1">
                              {amenity.includes('Water') && <Droplets className="w-2.5 h-2.5 text-blue-300" />}
                              {amenity.includes('First Aid') && <BadgePlus className="w-2.5 h-2.5 text-red-300" />}
                              {amenity === 'Lockers' && <img src="/temple.png" alt="" className="w-2.5 h-2.5" />}
                              {amenity.includes('Wheel') && <img src="/temple.png" alt="" className="w-2.5 h-2.5" />}
                              {amenity.includes('Prasad') && <img src="/temple.png" alt="" className="w-2.5 h-2.5" />}
                              {amenity.includes('Parking') && <MapIcon className="w-2.5 h-2.5 text-green-300" />}
                              {amenity.includes('Garden') && <img src="/temple.png" alt="" className="w-2.5 h-2.5" />}
                              {amenity.includes('Seating') && <img src="/temple.png" alt="" className="w-2.5 h-2.5" />}
                              {t(amenity)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex border-t border-indigo-700 text-[11px]">
                        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-amber-300 hover:bg-amber-500/10">
                          <MapPin className="w-3 h-3" /> {t('guideMe')}
                        </button>
                        <div className="w-px bg-indigo-700"></div>
                        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-amber-300 hover:bg-amber-500/10">
                          <img src="/temple.png" alt="" className="w-3 h-3" /> {t('save')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </aside>
        <section className="lg:col-span-9 flex flex-col space-y-4 h-full overflow-y-auto min-h-0 scrollbar-hide">
          <div className="relative flex-1 min-h-[560px] rounded-3xl overflow-hidden border border-indigo-300/25 bg-indigo-900/40">
            <MapView layers={filters} toggleLayer={toggleFilter} />
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
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Diya /><span className="font-semibold">{t('menu')}</span></div><button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
            {[{ icon: MapPin, label: t('home') }, { icon: Landmark, label: t('ghats') }, { icon: Hotel, label: t('accommodation') }, { icon: ParkingCircle, label: t('parking') }, { icon: DoorOpen, label: t('entryExit') }, { icon: Landmark, label: t('temples') }].map(n => (
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
