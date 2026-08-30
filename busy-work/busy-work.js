(() => {
  'use strict';
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const arr = (value) => Array.isArray(value) ? value : (value ? [value] : []);
  const modules = (window.COURSE_CONTENT || {}).modules || [];
  const meta = window.COURSE_MODULES || [];
  const list = document.querySelector('[data-busy-list]');
  const moduleFilter = document.querySelector('[data-module-filter]');
  const areaFilter = document.querySelector('[data-area-filter]');
  const count = document.querySelector('[data-busy-count]');
  if (!list || !moduleFilter || !areaFilter || !count) return;

  const moduleNumber = (module) => Number(String(module.module_id || module.code || module.id).replace(/\D/g, ''));
  const areaFor = (number) => number <= 8 ? 'design-mtp' : number <= 12 ? 'properties' : number <= 14 ? 'industry' : 'synthesis';
  const areaLabel = (area) => ({
    'design-mtp': 'Design and Major Textiles Project',
    properties: 'Properties and Performance of Textiles',
    industry: 'Australian Textiles, Clothing, Footwear and Allied Industries',
    synthesis: 'Whole-course synthesis'
  }[area]);
  const activities = [];
  modules.forEach((module) => {
    const number = moduleNumber(module);
    const moduleMeta = meta.find((item) => Number(item.id) === number) || {};
    arr(module.sections).forEach((section) => {
      const activity = section.applied_activity || section.activity;
      if (!activity) return;
      activities.push({ module, moduleMeta, section, activity, number, area: areaFor(number) });
    });
  });

  meta.forEach((module) => {
    const option = document.createElement('option');
    option.value = String(module.id);
    option.textContent = `Module ${module.id}: ${module.title}`;
    moduleFilter.append(option);
  });

  const storageKey = (sectionId) => `${window.TEXTILES_STORAGE_PREFIX || 'tas:textiles:year12-hsc:v1'}:busy:${sectionId}`;
  const safeStorage = {
    read(storageId) {
      try { return { ok: true, value: localStorage.getItem(storageId) }; }
      catch (_) { return { ok: false, value: null }; }
    },
    write(storageId, value) {
      try { localStorage.setItem(storageId, value); return true; }
      catch (_) { return false; }
    },
    remove(storageId) {
      try { localStorage.removeItem(storageId); return true; }
      catch (_) { return false; }
    }
  };
  const renderCard = ({ moduleMeta, section, activity, number, area }) => {
    const sectionId = section.section_id || section.id;
    const instructions = arr(activity.instructions || activity.steps);
    const support = activity.answer_neutral_support || activity.support || '';
    const feedback = activity.feedback || activity.feedback_model || '';
    const lowTech = activity.printable_low_tech_alternative || activity.printable_low_tech || '';
    const title = activity.title || section.title || 'Apply the section concept';
    const concept = activity.concept || activity.concept_anchor || `Apply the central idea from ${section.title}.`;
    return `<article class="busy-card" data-module="${number}" data-area="${esc(area)}">
      <p class="module-area">Module ${number} · ${esc(moduleMeta.term || '')} · ${esc(areaLabel(area))}</p>
      <h2>${esc(title)}</h2>
      <p>${esc(concept)}</p>
      ${activity.mechanic ? `<p class="fine"><strong>Mechanic:</strong> ${esc(activity.mechanic)}</p>` : ''}
      <details><summary>Open the work sequence</summary>
        ${instructions.length ? `<ol>${instructions.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>` : ''}
        ${support ? `<p><strong>Process support:</strong> ${esc(support)}</p>` : ''}
        ${feedback ? `<p><strong>Feedback model:</strong> ${esc(feedback)}</p>` : ''}
        ${lowTech ? `<p><strong>Printable / low-tech:</strong> ${esc(lowTech)}</p>` : ''}
      </details>
      <label class="busy-note"><span>Formative working note</span><textarea rows="5" data-busy-note="${esc(sectionId)}" placeholder="Record the evidence, reasoning or result you would carry back to the module."></textarea></label>
      <p class="save-status" data-busy-status="${esc(sectionId)}" aria-live="polite"></p>
      <div class="button-row"><a class="button" href="../modules/module-${String(number).padStart(2, '0')}.html#${esc(sectionId)}-theory">Return to the theory</a><button class="button secondary" type="button" data-busy-reset="${esc(sectionId)}">Reset note</button></div>
    </article>`;
  };
  list.innerHTML = activities.length ? activities.map(renderCard).join('') : '<div class="status-note caution"><strong>Activities are still being integrated.</strong> Return after the named section content has been added to this local candidate.</div>';

  const saveTimers = new Map();
  const statusTimers = new Map();
  document.querySelectorAll('[data-busy-note]').forEach((field) => {
    const sectionId = field.dataset.busyNote;
    const stored = safeStorage.read(storageKey(sectionId));
    field.value = stored.value || '';
    if (!stored.ok) document.querySelector(`[data-busy-status="${sectionId}"]`).textContent = 'Browser storage is unavailable. Print work you need to keep.';
    field.addEventListener('input', () => {
      clearTimeout(saveTimers.get(sectionId));
      saveTimers.set(sectionId, setTimeout(() => {
        saveTimers.delete(sectionId);
        const status = document.querySelector(`[data-busy-status="${sectionId}"]`);
        if (!safeStorage.write(storageKey(sectionId), field.value)) {
          clearTimeout(statusTimers.get(sectionId));
          statusTimers.delete(sectionId);
          status.textContent = 'Not saved: browser storage is unavailable. Print work you need to keep.';
          return;
        }
        status.textContent = 'Saved on this device';
        clearTimeout(statusTimers.get(sectionId));
        statusTimers.set(sectionId, setTimeout(() => {
          statusTimers.delete(sectionId);
          status.textContent = '';
        }, 1400));
      }, 220));
    });
  });
  document.querySelectorAll('[data-busy-reset]').forEach((button) => button.addEventListener('click', () => {
    if (!window.confirm('Reset only this activity note on this device?')) return;
    const sectionId = button.dataset.busyReset;
    clearTimeout(saveTimers.get(sectionId));
    clearTimeout(statusTimers.get(sectionId));
    saveTimers.delete(sectionId);
    statusTimers.delete(sectionId);
    const status = document.querySelector(`[data-busy-status="${sectionId}"]`);
    if (!safeStorage.remove(storageKey(sectionId))) {
      status.textContent = 'This note could not be reset because browser storage is unavailable. The visible note has not been cleared.';
      return;
    }
    document.querySelector(`[data-busy-note="${sectionId}"]`).value = '';
    status.textContent = 'This activity note has been reset.';
  }));

  const applyFilters = () => {
    let visible = 0;
    list.querySelectorAll('.busy-card').forEach((card) => {
      const showModule = moduleFilter.value === 'all' || card.dataset.module === moduleFilter.value;
      const showArea = areaFilter.value === 'all' || card.dataset.area === areaFilter.value;
      card.hidden = !(showModule && showArea);
      if (!card.hidden) visible += 1;
    });
    count.textContent = `${visible} of ${activities.length} purposeful activities shown.`;
  };
  moduleFilter.addEventListener('change', applyFilters);
  areaFilter.addEventListener('change', applyFilters);
  document.querySelector('[data-print]').addEventListener('click', () => window.print());
  applyFilters();
})();
