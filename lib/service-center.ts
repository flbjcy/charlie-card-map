// Street address geocoded by OpenStreetMap; independent from station reports.
export const serviceCenter={lat:42.3572933,lng:-71.0582814,address:'296 Washington Street'};

export function addServiceCenterMarker(L:any,map:any){
 const content=document.createElement('div');
 content.innerHTML='<strong>Charlie Service Center</strong><span>296 Washington Street</span><p>Street-level service counter near State station.</p><p class="store-stock">All 8 card designs reported Oct 30, 2:45 PM ET. Availability may change.</p><div><a href="https://www.google.com/maps/dir/?api=1&destination=296+Washington+Street+Boston+MA+02108&travelmode=transit" target="_blank" rel="noreferrer">Directions ↗</a><a href="https://www.reddit.com/r/mbta/comments/1xhdiol/comment/19rw83ssv8vt0/" target="_blank" rel="noreferrer">Card report ↗</a></div>';
 // Between route paths (400) and station markers/cards (600).
 const pane=map.getPane('serviceCenterPane')||map.createPane('serviceCenterPane');
 pane.style.zIndex='450';
 const marker=L.marker([serviceCenter.lat,serviceCenter.lng],{
  pane:'serviceCenterPane',
  icon:L.divIcon({className:'service-center-marker',html:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="m20 4 4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L20 29l-9.8 5.1 1.9-10.9-7.9-7.7 10.9-1.6Z"/></svg>',iconSize:[24,24],iconAnchor:[12,12]}),
  title:'Charlie Service Center — hover or tap for details',alt:'Charlie Service Center',keyboard:true
 }).addTo(map).bindTooltip(content,{className:'service-center-tooltip',direction:'auto',offset:[0,-6],interactive:true,opacity:1});
 // Allow crossing the small gap to the tooltip without making it permanent.
 let closeTimer:ReturnType<typeof setTimeout>|undefined;
 const cancelClose=()=>{if(closeTimer!==undefined){clearTimeout(closeTimer);closeTimer=undefined}};
 const close=()=>{cancelClose();marker.closeTooltip()};
 const scheduleClose=()=>{cancelClose();closeTimer=setTimeout(()=>{
  closeTimer=undefined;
  if(!content.matches(':focus-within'))marker.closeTooltip();
 },220)};
 const open=()=>{cancelClose();marker.openTooltip()};
 marker.off('mouseout',marker.closeTooltip);
 marker.on('mouseover',cancelClose).on('mouseout',scheduleClose).on('click',open);
 marker.on('tooltipopen',()=>{
  const box=marker.getTooltip().getElement();
  box.onmouseenter=cancelClose;
  box.onmouseleave=scheduleClose;
 });
 map.on('click',close);
 const el=marker.getElement();
 // Replace Leaflet's immediate blur close so keyboard users can reach the links.
 if(el)L.DomEvent.off(el,'blur');
 el?.addEventListener('focus',open);
 el?.addEventListener('blur',scheduleClose);
 content.addEventListener('focusin',cancelClose);
 content.addEventListener('focusout',scheduleClose);
 const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close()};
 el?.addEventListener('keydown',escape);
 content.addEventListener('keydown',escape);
 marker.on('remove',()=>{cancelClose();map.off('click',close)});
 return marker;
}
