(() => {
  'use strict';
  const body=document.body,root=body.dataset.root||'',active=body.dataset.active||'course';
  const destinations=[['course',`${root}index.html`,'Course'],['modules',`${root}index.html#modules`,'Modules'],['videos',`${root}video-learning/index.html`,'Video learning'],['busy',`${root}busy-work/index.html`,'Busy Work'],['folio',`${root}folio.html`,'My folio'],['assessment',`${root}assessment.html`,'Assessment'],['teacher',`${root}teacher-resources.html`,'Teacher resources'],['main','https://stevencowell.github.io/Main-Page/','Main Menu']];
  const mount=document.querySelector('[data-site-nav]');
  if(mount) mount.innerHTML=`<div class="site-nav"><div class="wrap nav-inner"><a class="brand" href="${root}index.html"><span class="brand-mark">T&amp;D</span><span>Year 12 Textiles and Design</span></a><nav class="nav-links" aria-label="Course navigation">${destinations.map(([key,url,label])=>`<a href="${url}"${key===active?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div></div>`;
  document.addEventListener('click',(event)=>{
    const open=event.target.closest('[data-open-global-visual]');
    if(open){
      const dialog=document.getElementById(open.dataset.openGlobalVisual);
      if(dialog){dialog.showModal();dialog.querySelector('[data-close-visual]')?.focus();}
      return;
    }
    const close=event.target.closest('[data-close-visual]');
    if(close?.closest('dialog')) close.closest('dialog').close();
  });
  document.addEventListener('click',(event)=>{if(event.target.matches('dialog.visual-dialog'))event.target.close();});
  document.querySelectorAll('dialog.visual-dialog').forEach((dialog)=>dialog.addEventListener('close',()=>document.querySelector(`[data-open-global-visual="${CSS.escape(dialog.id)}"]`)?.focus()));
})();
