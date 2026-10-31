// Street address geocoded by OpenStreetMap; independent from station reports.
export const serviceCenter={lat:42.3572933,lng:-71.0582814,address:'296 Washington Street'};

export function addServiceCenterMarker(L:any,map:any){
 const content=document.createElement('div');
 content.innerHTML='<strong>Charlie Service Center</strong><span>296 Washington Street</span><p>Street-level service counter near State station.</p><p class="store-stock">All 8 card designs reported Oct 30, 2:45 PM ET. Availability may change.</p><div><a href="https://www.google.com/maps/dir/?api=1&destination=296+Washington+Street+Boston+MA+02108&travelmode=transit" target="_blank" rel="noreferrer">Directions ↗</a><a href="https://www.reddit.com/r/mbta/comments/1xhdiol/comment/19rw83ssv8vt0/" target="_blank" rel="noreferrer">Card report ↗</a></div>';
 const marker=L.marker([serviceCenter.lat,serviceCenter.lng],{
  icon:L.divIcon({className:'service-center-marker',html:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="m20 4 4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L20 29l-9.8 5.1 1.9-10.9-7.9-7.7 10.9-1.6Z"/></svg>',iconSize:[34,34],iconAnchor:[17,17]}),
  title:'Charlie Service Center — hover or tap for details',alt:'Charlie Service Center',keyboard:true,zIndexOffset:1500
 }).addTo(map).bindTooltip(content,{className:'service-center-tooltip',direction:'auto',offset:[0,-10],interactive:true,opacity:1});
 marker.on('click',()=>marker.openTooltip());
 map.on('click',()=>marker.closeTooltip());
 const el=marker.getElement();el?.addEventListener('focus',()=>marker.openTooltip());el?.addEventListener('blur',()=>marker.closeTooltip());
 return marker;
}
