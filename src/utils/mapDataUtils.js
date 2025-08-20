import { ghatsData } from '../ghatsData';
import { templesData } from '../templesData';
import { accommodationData } from '../accommodationData';
import { emergencyInfoData } from '../emergencyInfoData';

export function findLocationByName(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  const ghat = ghatsData.find(g => g.name.toLowerCase().includes(q));
  if (ghat) return { type: 'ghat', name: ghat.name, position: ghat.position || null, data: ghat };

  const temple = templesData.find(t => t.name.toLowerCase().includes(q));
  if (temple) return { type: 'temple', name: temple.name, position: temple.location || temple.position || null, data: temple };

  const acc = accommodationData.find(a => a.name.toLowerCase().includes(q));
  if (acc) return { type: 'accommodation', name: acc.name, position: acc.position || null, data: acc };

  const em = emergencyInfoData.find(e => e.name.toLowerCase().includes(q));
  if (em) return { type: 'emergency', name: em.name, position: em.position || null, data: em };

  return null;
}

// ArcGIS FeatureServer endpoints
const GHATS_URL = 'https://services5.arcgis.com/73n8CSGpSSyHr1T9/arcgis/rest/services/Simhastha_Ghats/FeatureServer/0/query';
const TEMPLES_URL = 'https://services5.arcgis.com/73n8CSGpSSyHr1T9/arcgis/rest/services/Temples_Ujjain_20250808110129/FeatureServer/0/query';

async function queryArcGISFeatureByName(baseUrl, nameFieldCandidates, name) {
  // Try multiple fields (since schema names differ)
  const safeName = name.replace(/'/g, "''");
  const whereParts = nameFieldCandidates.map(f => `${f} LIKE '%${safeName}%'`);
  const where = encodeURIComponent(whereParts.join(' OR '));
  const url = `${baseUrl}?where=${where}&outFields=*&f=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat || !feat.geometry) return null;
    let position = null;
    if (feat.geometry.type === 'Point') {
      position = { lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0] };
    } else if (feat.geometry.type === 'MultiPoint') {
      const c = feat.geometry.coordinates?.[0];
      if (c) position = { lat: c[1], lng: c[0] };
    } else if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
      // Use centroid approximation from first ring
      const coords = feat.geometry.type === 'Polygon' ? feat.geometry.coordinates?.[0] : feat.geometry.coordinates?.[0]?.[0];
      if (Array.isArray(coords) && coords.length) {
        const avg = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
        position = { lng: avg[0] / coords.length, lat: avg[1] / coords.length };
      }
    }
    const props = feat.properties || {};
    const nameProp = props.Ghat_Name || props.GHAT_NAME || props.Temple_Name || props['Temple Name'] || props.Name || name;
    return { name: nameProp, position };
  } catch (e) {
    console.warn('ArcGIS query failed', e);
    return null;
  }
}

export async function findLocationByNameAsync(query) {
  if (!query) return null;
  const local = findLocationByName(query);
  if (local?.position) return local;

  const q = query.trim();
  // Try Ghats
  const ghat = await queryArcGISFeatureByName(GHATS_URL, ['Ghat_Name', 'GHAT_NAME', 'Name'], q);
  if (ghat?.position) return { type: 'ghat', name: ghat.name, position: ghat.position, data: {} };
  // Try Temples
  const temple = await queryArcGISFeatureByName(TEMPLES_URL, ['Temple_Name', 'Temple Name', 'Name', 'Temple'], q);
  if (temple?.position) return { type: 'temple', name: temple.name, position: temple.position, data: {} };

  return local; // may be null or object without position
}
