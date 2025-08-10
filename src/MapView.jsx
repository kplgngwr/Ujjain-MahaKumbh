import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// layers prop: { ghats, temples, wards, restaurants, hospitals, hotels }
// Default: all off; parent controls activation
const MapView = ({ layers = { ghats: false, temples: false, wards: false, restaurants: false, hospitals: false, hotels: false }, toggleLayer }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);

  // Map view toggles
  const [satellite, setSatellite] = useState(true); // default satellite
  const [showLabels, setShowLabels] = useState(false); // default no labels
  const [basemapOpen, setBasemapOpen] = useState(false);

  // Cache fetched GeoJSON to avoid refetching
  const geoJsonCache = useRef({});
  // Track features / markers separately
  const ghatsFeaturesRef = useRef([]);
  const templeMarkersRef = useRef([]);
  const wardsFeaturesRef = useRef([]);
  const restaurantFeaturesRef = useRef([]);
  // Separate data layer refs so polygon sets don't interfere
  const ghatsDataRef = useRef(null);
  const wardsDataRef = useRef(null);
  const restaurantsDataRef = useRef(null);
  const hospitalMarkersRef = useRef([]);
  const hotelMarkersRef = useRef([]);

  const GHATS_URL = 'https://services5.arcgis.com/73n8CSGpSSyHr1T9/arcgis/rest/services/Simhastha_Ghats/FeatureServer/0/query?where=1=1&outFields=*&f=geojson';
  const TEMPLES_URL = 'https://services5.arcgis.com/73n8CSGpSSyHr1T9/arcgis/rest/services/Temples_Ujjain_20250808110129/FeatureServer/0/query?where=1=1&outFields=*&f=geojson';
  const WARDS_URL = 'https://livingatlas.esri.in/server/rest/services/Ujjain_Ward_Boundary/MapServer/0/query?where=1=1&outFields=*&f=geojson';
  const RESTAURANTS_URL = 'https://services5.arcgis.com/73n8CSGpSSyHr1T9/arcgis/rest/services/Restaurants_Ujjain_20250810190258/FeatureServer/0/query?where=1=1&outFields=*&f=geojson';

  // (Layer toggling handled by parent)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader.load().then(() => {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 23.165, lng: 75.770 },
        zoom: 13,
        mapTypeId: 'satellite', // start satellite imagery (no labels)
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      });
      mapInstanceRef.current = mapInstance;
      infoWindowRef.current = new google.maps.InfoWindow();

      // Independent data layers
      ghatsDataRef.current = new google.maps.Data({ map: null });
      wardsDataRef.current = new google.maps.Data({ map: null });
      restaurantsDataRef.current = new google.maps.Data({ map: null });

      ghatsDataRef.current.setStyle({ fillColor: '#2563eb', strokeColor: '#1e3a8a', strokeWeight: 2, fillOpacity: 0.45 });
      wardsDataRef.current.setStyle({ fillOpacity: 0, strokeColor: '#dc2626', strokeWeight: 2 });
      // Restaurant points styled with provided image icon (smaller size)
      restaurantsDataRef.current.setStyle(() => ({
        icon: {
          url: '/restaurant-building.png',
          scaledSize: new google.maps.Size(16, 16),
          anchor: new google.maps.Point(8, 8),
        }
      }));

      const bindClicks = (dataLayer) => {
        dataLayer.addListener('click', (event) => {
          if (!event || !event.feature) return;
          const f = event.feature;
          const name = f.getProperty('Ghat_Name') || f.getProperty('Name') || f.getProperty('Temple_Name') || 
                       f.getProperty('Temple Name') || f.getProperty('GHAT_NAME') || f.getProperty('Ward_No') || 
                       f.getProperty('Ward_Name') || f.getProperty('WARD_NO') || f.getProperty('Restaurant_Name') || 
                       f.getProperty('Restaurant Name') || 'Unnamed Feature';
          infoWindowRef.current.setContent(`<div style="min-width:140px;font:500 13px system-ui">${name}</div>`);
          infoWindowRef.current.setPosition(event.latLng);
          infoWindowRef.current.open(mapInstance);
        });
      };
  bindClicks(ghatsDataRef.current);
  bindClicks(wardsDataRef.current);
  bindClicks(restaurantsDataRef.current);
    });

    return () => {
      // Cleanup if needed
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  // Effect to sync layers from parent
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // GHATS (polygons via dedicated data layer)
    const handleGhats = async () => {
      const dataLayer = ghatsDataRef.current; if (!dataLayer) return;
      if (layers.ghats) {
        dataLayer.setMap(map);
        if (!geoJsonCache.current.ghats) {
          try {
            const res = await fetch(GHATS_URL);
            const data = await res.json();
            geoJsonCache.current.ghats = data;
          } catch (e) { console.error('Failed to fetch ghats', e); return; }
        }
        if (ghatsFeaturesRef.current.length === 0) {
          ghatsFeaturesRef.current = dataLayer.addGeoJson(geoJsonCache.current.ghats);
        }
      } else {
        dataLayer.setMap(null);
      }
    };

  // TEMPLES (markers)
    const handleTemples = async () => {
      if (layers.temples) {
        if (!geoJsonCache.current.temples) {
          try {
            const res = await fetch(TEMPLES_URL);
            const data = await res.json();
            geoJsonCache.current.temples = data;
          } catch (e) { console.error('Failed to fetch temples', e); return; }
        }
        if (templeMarkersRef.current.length === 0) {
          const data = geoJsonCache.current.temples;
          if (data && data.features) {
            data.features.forEach(feat => {
              if (!feat.geometry) return;
              let coords = null;
              if (feat.geometry.type === 'Point') {
                coords = { lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0] };
              } else if (feat.geometry.type === 'MultiPoint') {
                const c = feat.geometry.coordinates[0];
                if (c) coords = { lat: c[1], lng: c[0] };
              }
              if (!coords) return;
              const name = feat.properties?.Temple_Name || feat.properties?.Name || feat.properties?.Temple || 'Temple';
              const marker = new google.maps.Marker({
                position: coords,
                map,
                title: name,
                icon: {
                  url: '/temple.png',
                  scaledSize: new google.maps.Size(28, 28),
                  anchor: new google.maps.Point(14, 14),
                },
                opacity: 0.9,
              });
              marker.addListener('click', () => {
                infoWindowRef.current.setContent(`<div style="min-width:140px;font:500 13px system-ui">${name}</div>`);
                infoWindowRef.current.open(map, marker);
              });
              templeMarkersRef.current.push(marker);
            });
          }
        }
      } else if (templeMarkersRef.current.length) {
        templeMarkersRef.current.forEach(m => m.setMap(null));
        templeMarkersRef.current = [];
      }
    };

    // WARDS (polygons via dedicated data layer)
    const handleWards = async () => {
      const dataLayer = wardsDataRef.current; if (!dataLayer) return;
      if (layers.wards) {
        dataLayer.setMap(map);
        if (!geoJsonCache.current.wards) {
          try {
            const res = await fetch(WARDS_URL);
            const data = await res.json();
            geoJsonCache.current.wards = data;
          } catch (e) { console.error('Failed to fetch wards', e); return; }
        }
        if (wardsFeaturesRef.current.length === 0) {
          wardsFeaturesRef.current = dataLayer.addGeoJson(geoJsonCache.current.wards);
        }
      } else {
        dataLayer.setMap(null);
      }
    };

    // RESTAURANTS (points via dedicated data layer)
    const handleRestaurants = async () => {
      const dataLayer = restaurantsDataRef.current; if (!dataLayer) return;
      if (layers.restaurants) {
        dataLayer.setMap(map);
        if (!geoJsonCache.current.restaurants) {
          try {
            const res = await fetch(RESTAURANTS_URL);
            const data = await res.json();
            geoJsonCache.current.restaurants = data;
          } catch (e) { console.error('Failed to fetch restaurants', e); return; }
        }
        if (restaurantFeaturesRef.current.length === 0) {
          restaurantFeaturesRef.current = dataLayer.addGeoJson(geoJsonCache.current.restaurants);
        }
      } else {
        dataLayer.setMap(null);
      }
    };

    // HOSPITALS (placeholder - implement endpoint when available)
    const handleHospitals = async () => {
      const map = mapInstanceRef.current; if (!map) return;
      if (layers.hospitals) {
        if (hospitalMarkersRef.current.length === 0) {
          // Placeholder: center marker to indicate layer scaffold
          const marker = new google.maps.Marker({
            position: map.getCenter(),
            map,
            title: 'Hospitals layer placeholder',
            icon: { url: 'https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png' }
          });
          hospitalMarkersRef.current.push(marker);
        }
      } else if (hospitalMarkersRef.current.length) {
        hospitalMarkersRef.current.forEach(m=>m.setMap(null));
        hospitalMarkersRef.current=[];
      }
    };

    // HOTELS (placeholder)
    const handleHotels = async () => {
      const map = mapInstanceRef.current; if (!map) return;
      if (layers.hotels) {
        if (hotelMarkersRef.current.length === 0) {
          const marker = new google.maps.Marker({
            position: map.getCenter(),
            map,
            title: 'Hotels layer placeholder',
            icon: { url: 'https://maps.gstatic.com/mapfiles/ms2/micons/lodging.png' }
          });
          hotelMarkersRef.current.push(marker);
        }
      } else if (hotelMarkersRef.current.length) {
        hotelMarkersRef.current.forEach(m=>m.setMap(null));
        hotelMarkersRef.current=[];
      }
    };

    handleGhats();
    handleTemples();
  handleWards();
  handleRestaurants();
    handleHospitals();
    handleHotels();
  }, [layers]);

  // Effect to apply mapType / labels changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (satellite) {
      // Satellite with or without labels
      map.setMapTypeId(showLabels ? 'hybrid' : 'satellite');
      // Clear custom styles when using satellite/hybrid
      map.setOptions({ styles: null });
    } else {
      map.setMapTypeId('roadmap');
      if (showLabels) {
        map.setOptions({ styles: null });
      } else {
        // Hide labels style definition
        const hideLabels = [
          { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ];
        map.setOptions({ styles: hideLabels });
      }
    }
  }, [satellite, showLabels]);

  return (
    <div className="relative w-full h-full">
      {/* Dynamic legend for active layers */}
  { (layers?.ghats || layers?.temples || layers?.wards || layers?.restaurants || layers?.hospitals || layers?.hotels || layers?.lostFound || layers?.publicToilets || layers?.policeStations || layers?.busStand || layers?.atms || layers?.entryExit || layers?.fireStations || layers?.stayTents) && (
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur rounded-2xl shadow border border-teal-300 px-3.5 py-2.5 text-[11px] font-medium space-y-1 min-w-[130px] text-slate-800">
          <div className="uppercase tracking-wide text-[10px] text-teal-700 font-semibold mb-1">Legend</div>
          {layers.ghats && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow" /> <span className="text-slate-700">Ghats</span></div>
          )}
          {layers.temples && (
            <div className="flex items-center gap-2"><img src="/temple.png" alt="Temple" className="w-4 h-4" /> <span className="text-slate-700">Temples</span></div>
          )}
          {layers.wards && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-600 shadow" /> <span className="text-slate-700">Wards</span></div>
          )}
          {layers.restaurants && (
            <div className="flex items-center gap-2"><img src="/restaurant-building.png" alt="Restaurant" className="w-4 h-4" /> <span className="text-slate-700">Restaurants</span></div>
          )}
          {layers.hospitals && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500 border border-pink-700 shadow" /> <span className="text-slate-700">Hospitals</span></div>
          )}
          {layers.hotels && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow" /> <span className="text-slate-700">Hotels</span></div>
          )}
          {layers.lostFound && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-700 shadow" /> <span className="text-slate-700">Lost & Found</span></div>
          )}
          {layers.publicToilets && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-teal-400 border border-teal-600 shadow" /> <span className="text-slate-700">Public Toilets</span></div>
          )}
          {layers.policeStations && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-600 border border-indigo-800 shadow" /> <span className="text-slate-700">Police</span></div>
          )}
          {layers.busStand && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lime-500 border border-lime-700 shadow" /> <span className="text-slate-700">Bus Stand</span></div>
          )}
          {layers.atms && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-fuchsia-500 border border-fuchsia-700 shadow" /> <span className="text-slate-700">ATM</span></div>
          )}
          {layers.entryExit && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500 border border-slate-700 shadow" /> <span className="text-slate-700">Entry/Exit</span></div>
          )}
          {layers.fireStations && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 border border-red-800 shadow" /> <span className="text-slate-700">Fire</span></div>
          )}
          {layers.stayTents && (
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-800 shadow" /> <span className="text-slate-700">Stay Tents</span></div>
          )}
        </div>
      )}
  {/* Basemap chooser trigger (bottom-left) */}
  {/* Removed inline quick layer toggles (redundant with left panel) */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          aria-label="Basemap chooser"
          onClick={() => setBasemapOpen(o => !o)}
          className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/90 backdrop-blur border border-teal-200 shadow transition hover:shadow-md ${basemapOpen ? 'ring-2 ring-teal-400' : ''}`}
        >
          {/* minimalist map icon */}
          <span className="w-6 h-6 text-teal-700 font-semibold">🗺️</span>
        </button>
        {basemapOpen && (
          <div className="mt-3 w-60 p-4 bg-white/95 backdrop-blur rounded-3xl border border-teal-200 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wide text-teal-700 uppercase">Basemaps</span>
              <button onClick={() => setBasemapOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-100">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px] font-medium text-slate-700">
              {[
                { id: 'satNoLbl', label: 'Satellite', active: satellite && !showLabels, apply: () => { setSatellite(true); setShowLabels(false); }, preview: 'from-slate-700 via-slate-800 to-slate-900' },
                { id: 'hybrid', label: 'Hybrid', active: satellite && showLabels, apply: () => { setSatellite(true); setShowLabels(true); }, preview: 'from-slate-600 via-green-800 to-stone-800' },
                { id: 'road', label: 'Road', active: !satellite && showLabels, apply: () => { setSatellite(false); setShowLabels(true); }, preview: 'from-emerald-50 to-emerald-200' },
                { id: 'clean', label: 'Clean', active: !satellite && !showLabels, apply: () => { setSatellite(false); setShowLabels(false); }, preview: 'from-slate-100 to-slate-300' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { opt.apply(); setBasemapOpen(false); }}
                  className={`relative rounded-xl aspect-square flex items-center justify-center border overflow-hidden group ${opt.active ? 'border-teal-500 ring-2 ring-teal-400' : 'border-slate-200 hover:border-teal-300'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${opt.preview}`}></div>
                  {opt.id === 'hybrid' && <span className="absolute top-1 left-1 text-[9px] px-1 py-0.5 rounded bg-black/60 text-white tracking-wide">LBL</span>}
                  <span className={`absolute bottom-1 left-1 right-1 text-center rounded-full py-0.5 ${opt.active ? 'bg-teal-600 text-white' : 'bg-white/80 text-slate-700'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default MapView;