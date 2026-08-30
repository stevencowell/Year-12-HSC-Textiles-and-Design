(() => {
  'use strict';
  const grid = document.getElementById('module-pathway');
  if (!grid) return;
  const prefix = window.TEXTILES_STORAGE_PREFIX || 'tas:textiles:year12-hsc:v1';
  const pad = (value) => String(value).padStart(2, '0');
  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  };
  const sectionRecord = (sectionId) => read(`${prefix}:learning:${sectionId}`);
  const folioProgress = read(`${prefix}:folio:v1:progress`) || { complete: 0, total: 10, next_id: 'folio-01', next_title: 'Preliminary foundations into HSC decisions' };
  const sectionSaved = (sectionId) => Boolean(sectionRecord(sectionId)?.savedAt);
  const sectionComplete = (sectionId) => sectionRecord(sectionId)?.complete === true;
  const moduleState = (module) => {
    const saved = module.sections.filter((section) => sectionSaved(section.id)).length;
    const completeSections = module.sections.filter((section) => sectionComplete(section.id)).length;
    return { saved, completeSections, complete: completeSections === module.sections.length };
  };

  grid.innerHTML = COURSE_MODULES.map((module) => {
    const state = moduleState(module);
    const status = state.complete ? 'All 3 packages complete' : state.saved ? `${state.completeSections} complete · ${state.saved} saved` : 'Not started';
    return `<article class="module-card"><div class="module-number">${pad(module.id)}</div><p class="module-area">${module.term} · ${module.hours || 8} hours</p><h3>${module.title}</h3><p>${module.sections.map((section) => section.title).join(' · ')}</p><p class="module-card-progress" data-state="${state.complete ? 'complete' : state.saved ? 'started' : 'not-started'}">${status}</p><a class="module-link" href="modules/module-${pad(module.id)}.html">${state.complete ? 'Review Module ' + module.id : state.saved ? 'Resume Module ' + module.id : module.id === 1 ? 'Start Module 1' : 'Open Module ' + module.id} →</a></article>`;
  }).join('');

  const completedModules = COURSE_MODULES.filter((module) => moduleState(module).complete).length;
  const savedSections = COURSE_MODULES.reduce((total, module) => total + moduleState(module).saved, 0);
  const nextModule = COURSE_MODULES.find((module) => !moduleState(module).complete);
  const nextSection = nextModule?.sections.find((section) => !sectionComplete(section.id)) || nextModule?.sections[0];
  const modulesComplete = completedModules === COURSE_MODULES.length;
  const resumeHref = modulesComplete
    ? `folio.html#${folioProgress.next_id || 'folio-01'}`
    : `modules/module-${pad(nextModule.id)}.html#${nextSection.id}-learning`;
  const summary = document.querySelector('[data-course-progress-summary]');
  const detail = document.querySelector('[data-course-progress-detail]');
  if (summary) summary.textContent = `${completedModules} of ${COURSE_MODULES.length} modules complete`;
  if (detail) detail.textContent = `${savedSections} of 45 section records saved on this device. Folio: ${Number(folioProgress.complete) || 0} of ${Number(folioProgress.total) || 10} evidence records complete.`;
  document.querySelectorAll('[data-course-resume]').forEach((link) => {
    link.href = resumeHref;
    link.textContent = modulesComplete
      ? (Number(folioProgress.complete) >= Number(folioProgress.total) ? 'Review folio evidence' : `Continue folio: ${folioProgress.next_title || 'next evidence record'}`)
      : savedSections ? `Resume Module ${nextModule.id}` : 'Start Module 1';
  });
})();
