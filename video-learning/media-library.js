(() => {
  'use strict';
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const arr = (value) => Array.isArray(value) ? value : (value ? [value] : []);
  const modules = (window.COURSE_CONTENT || {}).modules || [];
  const meta = window.COURSE_MODULES || [];
  const mount = document.querySelector('[data-media-library]');
  const filter = document.querySelector('[data-media-filter]');
  const count = document.querySelector('[data-media-count]');
  if (!mount || !filter || !count) return;

  const records = [];
  modules.forEach((module) => {
    const number = Number(String(module.module_id || module.code || module.id).replace(/\D/g, ''));
    const moduleMeta = meta.find((item) => Number(item.id) === number) || {};
    arr(module.sections).forEach((section) => {
      const media = section.media_alternative || section.media;
      if (media) records.push({ number, moduleMeta, section, media });
    });
  });
  meta.forEach((module) => {
    const option = document.createElement('option');
    option.value = String(module.id);
    option.textContent = `Module ${module.id}: ${module.title}`;
    filter.append(option);
  });

  mount.innerHTML = records.length ? records.map(({ number, moduleMeta, section, media }) => {
    const sectionId = section.section_id || section.id;
    const title = media.title || media.format || 'Purposeful non-video pathway';
    const during = arr(media.during || media.steps || media.instructions);
    const visual = section.visual || section.visual_brief || {};
    const dialogId = `media-${sectionId}-dialog`;
    const dialogLabelId = `${dialogId}-label`;
    return `<article class="video-library-card media-pathway-card" id="media-${esc(sectionId)}" data-module="${number}">
      <div class="video-card-copy">
        <p class="module-area">Module ${number} · ${esc(moduleMeta.term || '')}</p>
        <h2>${esc(section.title)}</h2>
        <p><strong>Pathway:</strong> ${esc(title)}</p>
        <p class="fine">This pathway performs the section’s media-learning job without relying on an unverified video.</p>
        <div class="video-card-links"><a class="button secondary compact" href="../modules/module-${String(number).padStart(2, '0')}.html#${esc(sectionId)}-theory">Read the matching theory</a></div>
      </div>
      <div class="media-pathway-panel">
        <figure class="section-visual teaching-visual"><img src="../assets/images/${esc(sectionId)}.png" alt="${esc(visual.alt || `Purposeful learning image for ${section.title}`)}" loading="lazy"><figcaption>${visual.caption ? `<span>${esc(visual.caption)}</span>` : ''}${visual.notice_prompt ? `<span><strong>Notice:</strong> ${esc(visual.notice_prompt)}</span>` : ''}<button class="open-larger" type="button" data-open-media-visual="${esc(dialogId)}">Open larger</button></figcaption><dialog class="visual-dialog" id="${esc(dialogId)}" aria-labelledby="${esc(dialogLabelId)}"><div class="visual-dialog-frame"><img src="../assets/images/${esc(sectionId)}.png" alt="${esc(visual.alt || `Purposeful learning image for ${section.title}`)}" loading="lazy" decoding="async"><div><p id="${esc(dialogLabelId)}">${esc(visual.caption || section.title)}</p><button class="button secondary" type="button" data-close-visual>Close image</button></div></div></dialog></figure>
        ${media.before ? `<p><strong>Before:</strong> ${esc(media.before)}</p>` : ''}
        ${during.length ? `<ol>${during.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>` : ''}
        ${media.after ? `<p><strong>After:</strong> ${esc(media.after)}</p>` : ''}
      </div>
    </article>`;
  }).join('') : '<div class="status-note caution"><strong>Media pathways are still being integrated.</strong> No placeholder video has been substituted.</div>';

  mount.querySelectorAll('[data-open-media-visual]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.openMediaVisual);
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector('[data-close-visual]')?.focus();
  }));
  mount.querySelectorAll('.visual-dialog').forEach((dialog) => {
    dialog.querySelector('[data-close-visual]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => mount.querySelector(`[data-open-media-visual="${CSS.escape(dialog.id)}"]`)?.focus());
  });

  const applyFilter = () => {
    let visible = 0;
    mount.querySelectorAll('.media-pathway-card').forEach((card) => {
      card.hidden = filter.value !== 'all' && card.dataset.module !== filter.value;
      if (!card.hidden) visible += 1;
    });
    count.textContent = `${visible} of ${records.length} section-matched pathways shown`;
  };
  filter.addEventListener('change', applyFilter);
  document.querySelector('[data-print]').addEventListener('click', () => window.print());
  applyFilter();
})();
