(() => {
  'use strict';
  const config = window.DAWN_CONFIG || {};
  function safeUrl(value) {
    if (!value || typeof value !== 'string') return null;
    try { const url = new URL(value,location.href); return ['http:','https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  }
  const authors = (config.authors || []).filter(a=>a && typeof a.name==='string' && a.name.trim());
  const authorContainer=document.getElementById('authors');
  authors.forEach(author=>{
    const url=safeUrl(author.url);
    const el=document.createElement(url ? 'a' : 'span');
    el.textContent=author.name;
    if(url){el.href=url;el.target='_blank';el.rel='noopener noreferrer';}
    const sup=document.createElement('sup');
    sup.textContent=[author.affiliation,author.equal ? '*' : '',author.corresponding ? '†' : ''].filter(Boolean).join('');
    el.append(sup); authorContainer.append(el);
  });
  const affiliations=document.getElementById('affiliations');
  (config.affiliations || []).filter(a=>a && a.name).forEach(a=>{
    const span=document.createElement('span'); const sup=document.createElement('sup');
    sup.textContent=a.id || '';span.append(sup,document.createTextNode(a.name));affiliations.append(span);
  });
  const notes=document.createElement('div');notes.className='contribution-notes';
  if(authors.some(a=>a.equal)){const span=document.createElement('span');span.textContent='* Equal contribution';notes.append(span);}
  if(authors.some(a=>a.corresponding)){const span=document.createElement('span');span.textContent='† Corresponding author';notes.append(span);}
  affiliations.append(notes);

  function hydrate(video){if(video?.dataset.src){video.src=video.dataset.src;delete video.dataset.src;video.load();}}
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){hydrate(entry.target);observer.unobserve(entry.target);}}),{rootMargin:'180px'});
    document.querySelectorAll('video[data-src]').forEach(video=>observer.observe(video));
  }else document.querySelectorAll('video[data-src]').forEach(hydrate);

  const motionAllowed=!(matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData);
  document.querySelectorAll('.overview-frame').forEach(frame=>{
    const video=frame.querySelector('video');const toggle=frame.querySelector('.overview-toggle');
    if(!motionAllowed){video.autoplay=false;video.pause();}
    const update=()=>{toggle.textContent=video.paused ? 'Play' : 'Pause';toggle.setAttribute('aria-label',video.paused ? 'Play overview video' : 'Pause overview video');};
    toggle.addEventListener('click',async()=>{hydrate(video);if(video.paused){try{await video.play();}catch{}}else video.pause();update();});
    video.addEventListener('play',update);video.addEventListener('pause',update);update();
  });
  const platformTabs=[...document.querySelectorAll('.platform-tabs [role=tab]')];
  const platformPanels=[...document.querySelectorAll('.platform-panel')];
  function showPlatform(index,focus=false){
    platformTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index ? 0 : -1;});
    platformPanels.forEach((panel,i)=>{panel.hidden=i!==index;const video=panel.querySelector('video');if(panel.hidden)video.pause();else{hydrate(video);if(motionAllowed)video.play().catch(()=>{});}});
    if(focus)platformTabs[index].focus();
  }
  platformTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showPlatform(i));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();showPlatform(event.key==='Home' ? 0 : event.key==='End' ? 1 : 1-i,true);}});});
  document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});}));

  const tabs=[...document.querySelectorAll('.task-tabs [role=tab]')];const panels=[...document.querySelectorAll('.task-panels [role=tabpanel]')];
  const previous=document.getElementById('previous-task');const next=document.getElementById('next-task');const position=document.getElementById('task-position');
  let index=0;
  function showTask(target,focus=false){
    index=Math.max(0,Math.min(tabs.length-1,target));
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index ? 0 : -1;});
    panels.forEach((panel,i)=>{panel.hidden=i!==index;if(panel.hidden)panel.querySelector('video').pause();else hydrate(panel.querySelector('video'));});
    previous.disabled=index===0;next.disabled=index===tabs.length-1;position.textContent=`${index+1} / ${tabs.length}`;
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>showTask(i));
    tab.addEventListener('keydown',event=>{
      let target;
      if(event.key==='ArrowRight')target=(i+1)%tabs.length;
      else if(event.key==='ArrowLeft')target=(i+tabs.length-1)%tabs.length;
      else if(event.key==='Home')target=0;else if(event.key==='End')target=tabs.length-1;
      else return;
      event.preventDefault();showTask(target,true);
    });
  });
  previous.addEventListener('click',()=>showTask(index-1));next.addEventListener('click',()=>showTask(index+1));
})();
