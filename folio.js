(() => {
  'use strict';
  const COURSE_ID = 'year-12-hsc-textiles-and-design';
  const PREFIX = `${window.TEXTILES_STORAGE_PREFIX || 'tas:textiles:year12-hsc:v1'}:folio:v1`;
  const DB_NAME = 'year12-textiles-folio-v1';
  const DB_STORE = 'photos';
  const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
  const JPEG_DATA_URL_PREFIX = 'data:image/jpeg;base64,';
  const MAX_PHOTO_DATA_URL_LENGTH = JPEG_DATA_URL_PREFIX.length + (Math.ceil(MAX_PHOTO_BYTES / 3) * 4);
  const MAX_PHOTO_NAME_LENGTH = 180;
  const MAX_DETAIL_LENGTH = 300;
  const MAX_TEXT_FIELD_LENGTH = 64 * 1024;
  const MAX_RESTORE_TEXT_LENGTH = 2 * 1024 * 1024;
  const scrollBehaviour = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const key = (cardId, fieldId) => `${PREFIX}:${cardId}:${fieldId}`;
  const detailKey = (id) => `${PREFIX}:detail:${id}`;
  const progressKey = `${PREFIX}:progress`;

  const cards = [
    {
      id: 'folio-01', number: 1, groupId: 'folio-course-bridge', group: 'Course bridge', title: 'Preliminary foundations into HSC decisions',
      action: 'Choose one Year 11 foundation and show how it supports more independent work across theory, the MTP or examination preparation.',
      why: 'The two-year course is connected, but Preliminary and HSC expectations must remain distinct.',
      evidence: 'A named foundation, a Year 12 application and an explanation of how the reasoning becomes more independent.',
      source: 'Module 1 · The HSC course map and two-year bridge', sourceUrl: 'modules/module-01.html#m01s01-theory',
      fields: [
        ['foundation', 'Preliminary foundation', 'One Preliminary foundation I can carry forward is…'],
        ['application', 'HSC application', 'In Year 12 this supports…'],
        ['reasoning', 'How the decision becomes more independent', 'The decision requires me to connect… because…']
      ],
      starters: ['A foundation that remains useful is…', 'This contributes to the HSC strand of…', 'The reasoning becomes more independent when…']
    },
    {
      id: 'folio-02', number: 2, groupId: 'folio-course-bridge', group: 'Course bridge', title: 'Focus area, purpose and workable brief',
      action: 'Record the teacher-confirmed focus area and build a concise brief from an identified need, intended user, end use and design intention.',
      why: 'A useful brief gives later design choices a purpose and a basis for evaluation.',
      evidence: 'The confirmed focus area, a bounded need/user/end-use statement and a draft brief using only current instructions.',
      source: 'Module 1 · MTP focus areas and workable brief', sourceUrl: 'modules/module-01.html#m01s02-theory',
      boundary: 'The focus area, project identity, formal requirements and approval state are Teacher to confirm. Do not use this scaffold as project approval.',
      fields: [
        ['context', 'Confirmed context', 'My teacher-confirmed focus area and context are…'],
        ['need', 'Need, user and end use', 'The identified need is… The intended user/end use is…'],
        ['brief', 'Draft workable brief', 'I will investigate and develop… so that…']
      ],
      starters: ['The identified need is…', 'The textile item or items are intended to…', 'A successful direction should…']
    },
    {
      id: 'folio-03', number: 3, groupId: 'folio-design-development', group: 'Design development', title: 'Inspiration and attributed influences',
      action: 'Collect relevant inspiration, record its source and explain how an observed feature could influence a design decision without copying.',
      why: 'Attribution and transformation make the design pathway visible and reduce unsupported or culturally unsafe claims.',
      evidence: 'A source record or authorised image, an observation, a cautious influence statement and a design response.',
      source: 'Modules 1–3 and 6 · inspiration, designers and cultural evidence', sourceUrl: 'modules/module-03.html',
      boundary: 'Do not copy culturally significant motifs or claim meanings without attributed evidence. Current reproduction permissions remain Teacher to confirm.',
      fields: [
        ['source', 'Source and attribution', 'Creator/source, title or description, date/access record and permission status…'],
        ['observation', 'Observed feature and supported context', 'I can observe… The attributed context establishes…'],
        ['influence', 'Transformed design influence', 'This could influence my own decision by… without copying…']
      ],
      starters: ['The directly observable feature is…', 'This source suggests… within this documented context…', 'I will transform the influence by…'], photo: true
    },
    {
      id: 'folio-04', number: 4, groupId: 'folio-design-development', group: 'Design development', title: 'Idea range and final direction',
      action: 'Record genuinely different concepts, compare them against relevant criteria and justify the direction selected for further development.',
      why: 'A final direction is stronger when it comes from comparison and evidence rather than the first idea or personal preference alone.',
      evidence: 'An authorised image of concepts, criteria used, comparison notes and a reasoned selection including why alternatives were not chosen.',
      source: 'Module 7 · Generating ideas and choosing a final direction', sourceUrl: 'modules/module-07.html#m07s01-theory',
      fields: [
        ['range', 'Range of ideas', 'My concepts differ meaningfully in…'],
        ['criteria', 'Criteria and comparison', 'The most important criteria are… The evidence for each concept shows…'],
        ['selection', 'Selected direction and justification', 'I selected… because… I did not select… because…']
      ],
      starters: ['The concepts explore different…', 'The criterion matters because…', 'The strongest overall direction is…'], photo: true
    },
    {
      id: 'folio-05', number: 5, groupId: 'folio-design-development', group: 'Design development', title: 'Functional and aesthetic reasoning',
      action: 'Connect functional and aesthetic requirements to specific design features and judge whether the proposed direction balances them.',
      why: 'Strong textile design considers what the item must do and communicate, then explains trade-offs with evidence.',
      evidence: 'Named requirements, linked features, a trade-off or interaction and a supported judgement.',
      source: 'Module 7 · Functional and aesthetic analysis', sourceUrl: 'modules/module-07.html#m07s02-theory',
      fields: [
        ['functional', 'Functional requirement and evidence', 'The functional requirement is… The proposed feature supports it by…'],
        ['aesthetic', 'Aesthetic requirement and evidence', 'The aesthetic intention is… The design choice contributes by…'],
        ['judgement', 'Interaction and judgement', 'These requirements interact when… The current balance is effective/needs refinement because…']
      ],
      starters: ['For the intended end use, the item must…', 'The visual intention is communicated through…', 'A trade-off occurs because…'], photo: true
    },
    {
      id: 'folio-06', number: 6, groupId: 'folio-design-development', group: 'Design development', title: 'Drawings, specifications and time planning',
      action: 'Record how one drawing, specification or time decision communicates the intended solution and reduces uncertainty before making.',
      why: 'Clear communication helps technical and non-technical audiences understand what is intended and what must be checked.',
      evidence: 'An authorised drawing or plan, the information it communicates, an identified gap and the next checkpoint.',
      source: 'Module 7 · Drawings, specifications and time planning', sourceUrl: 'modules/module-07.html#m07s03-theory',
      boundary: 'Current specification formats, dates, dimensions, machinery and production procedures remain Teacher to confirm.',
      fields: [
        ['communication', 'What the record communicates', 'This drawing/specification/time plan communicates…'],
        ['check', 'Gap, dependency or checkpoint', 'Before proceeding I need to confirm…'],
        ['revision', 'Revision made and reason', 'I revised… because the evidence/feedback showed…']
      ],
      starters: ['A technical reader needs to know…', 'A non-technical reader can understand…', 'The next controlled checkpoint is…'], photo: true
    },
    {
      id: 'folio-07', number: 7, groupId: 'folio-evidence-handoff', group: 'Evidence and handoff', title: 'Experimentation, samples and material decisions',
      action: 'Record one teacher-authorised investigation from question and fair comparison through observations, evaluation and design consequence.',
      why: 'Investigation is useful when results influence a material, process or design decision—not when samples sit disconnected from the project.',
      evidence: 'Question, variables, teacher-authorised method reference, coded samples/results, evaluation and a justified next decision.',
      source: 'Modules 8–12 · experimentation, properties, performance and end use', sourceUrl: 'modules/module-08.html',
      boundary: 'Use only the safe method, equipment, quantities and controls supplied or approved by your teacher. This page provides no practical procedure.',
      fields: [
        ['plan', 'Question, comparison and controls', 'The investigation asked… I compared… I controlled… The approved method was…'],
        ['results', 'Observations and results', 'The coded evidence showed… A pattern, difference or limitation was…'],
        ['decision', 'Evaluation and design consequence', 'This evidence supports changing/keeping… because…']
      ],
      starters: ['To keep the comparison fair…', 'The evidence indicates…', 'A limitation of this evidence is…'], photo: true
    },
    {
      id: 'folio-08', number: 8, groupId: 'folio-evidence-handoff', group: 'Evidence and handoff', title: 'Making checkpoints and approved changes',
      action: 'Record a meaningful project checkpoint, the evidence observed, any teacher-approved response and the next quality check.',
      why: 'A credible process record explains decisions and quality control rather than becoming an unlabelled sequence of photographs.',
      evidence: 'A checkpoint or authorised photo, issue/decision, approved action, observed result and next check.',
      source: 'Modules 7, 8 and 15 · project management and completion', sourceUrl: 'modules/module-15.html#m15s01-theory',
      boundary: 'Record only the procedure, equipment and change actually approved. This folio cannot certify authorship, safe practice or practical competence.',
      fields: [
        ['checkpoint', 'Checkpoint and evidence', 'At this checkpoint the visible or recorded evidence showed…'],
        ['action', 'Approved response', 'After teacher feedback/approval I… because…'],
        ['result', 'Result and next quality check', 'The result was… The next thing to verify is…']
      ],
      starters: ['The checkpoint was useful because…', 'The evidence showed…', 'The approved response improved/changed…'], photo: true
    },
    {
      id: 'folio-09', number: 9, groupId: 'folio-evidence-handoff', group: 'Evidence and handoff', title: 'Evaluation against purpose and evidence',
      action: 'Judge the developed result against confirmed functional and aesthetic requirements, using specific evidence and a realistic improvement.',
      why: 'Evaluation closes the reasoning loop by returning to the intended purpose rather than simply stating that the result looks good.',
      evidence: 'Confirmed requirements, two evidence-based strengths, one limitation and a realistic improvement or future decision.',
      source: 'Modules 8 and 15 · evaluation and evidence handoff', sourceUrl: 'modules/module-08.html#m08s03-theory',
      boundary: 'Use teacher-confirmed requirements. Do not turn external HSC marking criteria into an internal project rubric.',
      fields: [
        ['criteria', 'Confirmed requirements used', 'The relevant confirmed requirements are…'],
        ['evaluation', 'Evidence-based judgement', 'The result met… because the evidence shows… It was less successful in…'],
        ['improvement', 'Realistic improvement', 'A realistic improvement or future decision would be… because…']
      ],
      starters: ['The strongest evidence of success is…', 'A limitation shown by… is…', 'The improvement is realistic because…'], photo: true
    },
    {
      id: 'folio-10', number: 10, groupId: 'folio-evidence-handoff', group: 'Evidence and handoff', title: 'MTP evidence handoff and HSC synthesis',
      action: 'Separate what belongs in the formal teacher-controlled MTP handoff from what helps you retrieve and communicate whole-course theory for the written examination.',
      why: 'The MTP and written paper are connected by textile reasoning but have different evidence, logistics and authority paths.',
      evidence: 'A handoff readiness check, unresolved Teacher-to-confirm items, a whole-course concept map and one planned HSC response.',
      source: 'Module 15 · MTP handoff and HSC synthesis', sourceUrl: 'modules/module-15.html',
      boundary: 'Submission, certification, packaging, display, collection and examination logistics remain Teacher to confirm. A saved record here is not submission evidence.',
      fields: [
        ['handoff', 'MTP handoff readiness', 'The evidence I have organised is… The teacher-controlled requirements I still need to verify are…'],
        ['synthesis', 'Whole-course connections', 'A connection across Design, Properties and Performance, Industry and the MTP is…'],
        ['response', 'HSC response plan', 'For the command term… I will use the evidence… and organise the response by…']
      ],
      starters: ['The formal handoff authority is…', 'This concept connects to… because…', 'The command term requires me to…']
    }
  ];

  const photoCardIds = new Set(cards.filter((card) => card.photo).map((card) => card.id));
  const maxBackupBytes = (photoCardIds.size * MAX_PHOTO_DATA_URL_LENGTH) + (1024 * 1024);
  const validatePhotoRecord = (record) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('invalid photo record');
    const id = typeof record.id === 'string' ? record.id : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const dataUrl = typeof record.dataUrl === 'string' ? record.dataUrl : '';
    if (!photoCardIds.has(id)) throw new Error('unknown photo card');
    if (!name || name.length > MAX_PHOTO_NAME_LENGTH || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('invalid photo name');
    if (dataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) throw new Error('photo is too large');
    const match = dataUrl.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match || match[1].length % 4 !== 0) throw new Error('invalid photo data');
    let binary;
    try { binary = atob(match[1]); } catch (_) { throw new Error('invalid photo encoding'); }
    if (!binary.length || binary.length > MAX_PHOTO_BYTES) throw new Error('photo is too large');
    if (binary.length < 4 || binary.charCodeAt(0) !== 0xff || binary.charCodeAt(1) !== 0xd8 || binary.charCodeAt(binary.length - 2) !== 0xff || binary.charCodeAt(binary.length - 1) !== 0xd9) throw new Error('photo is not a JPEG');
    if (record.type !== undefined && record.type !== 'image/jpeg') throw new Error('invalid photo type');
    if (record.size !== undefined && (!Number.isSafeInteger(record.size) || record.size !== binary.length)) throw new Error('invalid photo size');
    const updated = typeof record.updated === 'string' && record.updated.length <= 40 ? record.updated : '';
    if (!updated || !Number.isFinite(Date.parse(updated)) || new Date(updated).toISOString() !== updated) throw new Error('invalid photo date');
    return { id, name, type: 'image/jpeg', size: binary.length, dataUrl, updated };
  };
  const validatePhotoRecords = (records) => {
    if (!Array.isArray(records) || records.length > photoCardIds.size) throw new Error('invalid photo list');
    const seen = new Set();
    return records.map((record) => {
      const validated = validatePhotoRecord(record);
      if (seen.has(validated.id)) throw new Error('duplicate photo card');
      seen.add(validated.id);
      return validated;
    });
  };
  const validateRestoreText = (payload) => {
    const sourceDetails = payload.details === undefined ? {} : payload.details;
    const sourceEvidence = payload.evidence === undefined ? {} : payload.evidence;
    if (!sourceDetails || typeof sourceDetails !== 'object' || Array.isArray(sourceDetails)) throw new Error('invalid details');
    if (!sourceEvidence || typeof sourceEvidence !== 'object' || Array.isArray(sourceEvidence)) throw new Error('invalid evidence');
    let totalLength = 0;
    const details = {};
    document.querySelectorAll('[data-detail]').forEach((input) => {
      const value = sourceDetails[input.dataset.detail] ?? '';
      if (typeof value !== 'string' || value.length > MAX_DETAIL_LENGTH) throw new Error('invalid detail value');
      totalLength += value.length;
      details[input.dataset.detail] = value;
    });
    const evidence = {};
    cards.forEach((card) => {
      const sourceCard = sourceEvidence[card.id] === undefined ? {} : sourceEvidence[card.id];
      if (!sourceCard || typeof sourceCard !== 'object' || Array.isArray(sourceCard)) throw new Error('invalid evidence card');
      evidence[card.id] = {};
      card.fields.forEach(([id]) => {
        const value = sourceCard[id] ?? '';
        if (typeof value !== 'string' || value.length > MAX_TEXT_FIELD_LENGTH) throw new Error('invalid evidence value');
        totalLength += value.length;
        if (totalLength > MAX_RESTORE_TEXT_LENGTH) throw new Error('restored text is too large');
        evidence[card.id][id] = value;
      });
    });
    return { details, evidence };
  };

  const grid = document.querySelector('[data-folio-grid]');
  const statusNode = document.querySelector('[data-global-status]');
  if (!grid || !statusNode) return;

  const renderCard = (card, index) => {
    const previousGroup = cards[index - 1]?.groupId;
    const groupHeading = previousGroup !== card.groupId ? `<header class="folio-group-heading" id="${esc(card.groupId)}"><p class="eyebrow">Evidence group</p><h2>${esc(card.group)}</h2></header>` : '';
    const fields = card.fields.map(([id, label, placeholder]) => `<div class="folio-field"><label for="${esc(card.id)}-${esc(id)}">${esc(label)} <span class="required-note">Required for this record</span></label><textarea id="${esc(card.id)}-${esc(id)}" data-folio-field data-card-id="${esc(card.id)}" data-field-id="${esc(id)}" rows="6" placeholder="${esc(placeholder)}"></textarea></div>`).join('');
    const boundary = card.boundary ? `<p class="folio-source-boundary"><strong>Authority boundary:</strong> ${esc(card.boundary)}</p>` : '';
    const photo = card.photo ? `<section class="folio-photo screen-control"><h3>Optional local image</h3><p>Add only a source, sketch, sample, result or project image you are authorised to store here.</p><label class="button secondary compact" for="photo-${esc(card.id)}">Choose image</label><input class="sr-only" id="photo-${esc(card.id)}" type="file" accept="image/*" data-photo-input="${esc(card.id)}"><button class="button secondary compact" type="button" data-photo-remove="${esc(card.id)}" hidden>Remove image</button><div class="folio-photo-preview" data-photo-preview="${esc(card.id)}"><p class="fine">No image added.</p></div></section>` : '';
    return `${groupHeading}<article class="folio-stage" id="${esc(card.id)}" data-card="${esc(card.id)}" tabindex="-1"><header class="folio-stage-head"><div class="folio-number" aria-hidden="true">${String(card.number).padStart(2, '0')}</div><div><p class="module-area">${esc(card.group)}</p><h2>${esc(card.title)}</h2><p class="folio-card-state">Browser-local learning record</p></div><span class="folio-status" data-card-status="${esc(card.id)}">Blank</span></header><div class="folio-purpose"><article><h3>Your action</h3><p>${esc(card.action)}</p></article><article><h3>Why this matters</h3><p>${esc(card.why)}</p></article><article><h3>Evidence to collect</h3><p>${esc(card.evidence)}</p></article></div>${boundary}<div class="folio-fields">${fields}</div><details class="response-guide"><summary>Sentence starters</summary><ul>${card.starters.map((starter) => `<li>${esc(starter)}</li>`).join('')}</ul></details>${photo}<footer class="folio-stage-footer"><p><strong>Return to learning:</strong> <a href="${esc(card.sourceUrl)}">${esc(card.source)}</a></p><p class="save-status" data-card-save="${esc(card.id)}" aria-live="polite"></p></footer></article>`;
  };
  grid.innerHTML = cards.map(renderCard).join('');

  const announce = (message, { error = false, focus = false } = {}) => {
    clearTimeout(announce.timer);
    statusNode.textContent = message;
    statusNode.dataset.state = error ? 'error' : 'status';
    if (focus) statusNode.focus();
    if (!error) announce.timer = setTimeout(() => { statusNode.textContent = ''; delete statusNode.dataset.state; }, 2600);
  };
  let storageFailureReported = false;
  const reportStorageFailure = (focus = false) => {
    if (!storageFailureReported || focus) announce('Browser storage is unavailable. Download or print work you need to keep, then check this browser’s storage settings.', { error: true, focus });
    storageFailureReported = true;
  };
  const safeStorage = {
    read(storageId) {
      try { return { ok: true, value: localStorage.getItem(storageId) }; }
      catch (_) { reportStorageFailure(); return { ok: false, value: null }; }
    },
    write(storageId, value) {
      try { localStorage.setItem(storageId, value); return true; }
      catch (_) { reportStorageFailure(); return false; }
    },
    remove(storageId) {
      try { localStorage.removeItem(storageId); return true; }
      catch (_) { reportStorageFailure(); return false; }
    }
  };
  const readStoredValue = (storageId) => safeStorage.read(storageId).value;

  const stateFor = (card) => {
    const values = card.fields.map(([id]) => (readStoredValue(key(card.id, id)) || '').trim());
    const started = values.some(Boolean);
    const complete = values.every((value) => value.length >= 20);
    return complete ? 'Evidence added' : started ? 'Started' : 'Blank';
  };

  const updateProgress = () => {
    const states = cards.map(stateFor);
    const complete = states.filter((state) => state === 'Evidence added').length;
    const started = states.filter((state) => state === 'Started').length;
    const blank = states.filter((state) => state === 'Blank').length;
    cards.forEach((card, index) => {
      const badge = document.querySelector(`[data-card-status="${card.id}"]`);
      badge.textContent = states[index];
      badge.dataset.state = states[index].toLowerCase().replaceAll(' ', '-');
    });
    document.querySelector('[data-progress-summary]').textContent = `${complete} of ${cards.length} records complete`;
    document.querySelector('[data-progress-detail]').textContent = `${complete} evidence added · ${started} started · ${blank} blank.`;
    const nextIndex = states.findIndex((state) => state !== 'Evidence added');
    const next = cards[nextIndex < 0 ? cards.length - 1 : nextIndex];
    const nextLink = document.querySelector('[data-next-action]');
    nextLink.href = `#${next.id}`;
    nextLink.textContent = nextIndex < 0 ? 'Review evidence and make a backup' : `Next: ${next.title}`;
    safeStorage.write(progressKey, JSON.stringify({
      complete,
      total: cards.length,
      next_id: next.id,
      next_title: next.title,
      updated_at: new Date().toISOString()
    }));
    const details = [readStoredValue(detailKey('student-name')), readStoredValue(detailKey('class'))].filter(Boolean).join(' · ');
    document.querySelector('[data-record-id]').textContent = details || 'No student details entered';
  };

  document.querySelectorAll('[data-detail]').forEach((input) => {
    input.value = readStoredValue(detailKey(input.dataset.detail)) || '';
    input.addEventListener('input', () => {
      safeStorage.write(detailKey(input.dataset.detail), input.value);
      updateProgress();
    });
  });
  const dateInput = document.querySelector('[data-detail="date-started"]');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
    safeStorage.write(detailKey('date-started'), dateInput.value);
  }
  const folioSaveTimers = new Map();
  document.querySelectorAll('[data-folio-field]').forEach((field) => {
    field.value = readStoredValue(key(field.dataset.cardId, field.dataset.fieldId)) || '';
    field.addEventListener('input', () => {
      clearTimeout(folioSaveTimers.get(field));
      folioSaveTimers.set(field, setTimeout(() => {
        folioSaveTimers.delete(field);
        const savedLocally = safeStorage.write(key(field.dataset.cardId, field.dataset.fieldId), field.value);
        const saved = document.querySelector(`[data-card-save="${field.dataset.cardId}"]`);
        saved.textContent = savedLocally ? 'Saved on this device' : 'Not saved: browser storage is unavailable';
        if (savedLocally) setTimeout(() => { saved.textContent = ''; }, 1600);
        updateProgress();
      }, 220));
    });
  });

  const openDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const transact = async (mode, callback) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, mode);
      const request = callback(tx.objectStore(DB_STORE));
      let result;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  };
  const getPhoto = async (id) => { try { return await transact('readonly', (store) => store.get(id)); } catch (_) { return undefined; } };
  const getAllPhotos = async () => transact('readonly', (store) => store.getAll());
  const putPhoto = async (record) => transact('readwrite', (store) => store.put(record));
  const deletePhoto = async (id) => transact('readwrite', (store) => store.delete(id));
  const clearPhotos = async () => transact('readwrite', (store) => store.clear());
  const replacePhotos = async (records) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.clear();
      records.forEach((record) => store.put(record));
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    });
  };

  const fileToUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const preparePhoto = async (file) => {
    const source = await fileToUrl(file);
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = source; });
    const limit = 1400;
    const scale = Math.min(1, limit / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  };
  const renderPhoto = async (id) => {
    const record = await getPhoto(id);
    const preview = document.querySelector(`[data-photo-preview="${id}"]`);
    const remove = document.querySelector(`[data-photo-remove="${id}"]`);
    if (!preview || !remove) return;
    preview.replaceChildren();
    if (!record) {
      const message = document.createElement('p');
      message.className = 'fine';
      message.textContent = 'No image added.';
      preview.append(message);
      remove.hidden = true;
      return;
    }
    let safeRecord;
    try { safeRecord = validatePhotoRecord(record); } catch (_) {
      const message = document.createElement('p');
      message.className = 'fine';
      message.textContent = 'This stored image is invalid. Remove it and choose a JPEG again.';
      preview.append(message);
      remove.hidden = false;
      return;
    }
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');
    image.src = safeRecord.dataUrl;
    image.alt = 'Locally stored evidence preview';
    image.decoding = 'async';
    caption.textContent = safeRecord.name;
    figure.append(image, caption);
    preview.append(figure);
    remove.hidden = false;
  };
  document.querySelectorAll('[data-photo-input]').forEach((input) => input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { announce('Choose an image file.', { error: true, focus: true }); input.value = ''; return; }
    if (file.size > MAX_PHOTO_BYTES) { announce('That image is over 5 MB. Choose a smaller copy.', { error: true, focus: true }); input.value = ''; return; }
    try {
      const record = validatePhotoRecord({ id: input.dataset.photoInput, name: file.name, dataUrl: await preparePhoto(file), updated: new Date().toISOString() });
      await putPhoto(record);
      await renderPhoto(input.dataset.photoInput);
      announce('Image optimised and saved on this device.');
    } catch (_) { announce('The image could not be saved in this browser.', { error: true, focus: true }); }
    input.value = '';
  }));
  document.querySelectorAll('[data-photo-remove]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('Remove this local image from this folio card?')) return;
    try {
      await deletePhoto(button.dataset.photoRemove);
      await renderPhoto(button.dataset.photoRemove);
      announce('Image removed from this device.');
    } catch (_) { announce('The image could not be removed from this browser.', { error: true, focus: true }); }
  }));

  const collectText = () => {
    const details = {};
    document.querySelectorAll('[data-detail]').forEach((input) => {
      details[input.dataset.detail] = input.value;
      if (!safeStorage.write(detailKey(input.dataset.detail), input.value)) throw new Error('browser storage unavailable');
    });
    const evidence = {};
    cards.forEach((card) => { evidence[card.id] = {}; });
    document.querySelectorAll('[data-folio-field]').forEach((field) => {
      clearTimeout(folioSaveTimers.get(field));
      folioSaveTimers.delete(field);
      const value = field.value;
      if (!safeStorage.write(key(field.dataset.cardId, field.dataset.fieldId), value)) throw new Error('browser storage unavailable');
      evidence[field.dataset.cardId][field.dataset.fieldId] = value;
    });
    updateProgress();
    return { details, evidence };
  };
  document.querySelector('[data-backup]').addEventListener('click', async () => {
    try {
      const photos = validatePhotoRecords(await getAllPhotos());
      const payload = { schema: 1, course_id: COURSE_ID, exported_at: new Date().toISOString(), ...collectText(), photos };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `year-12-textiles-folio-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      announce('Editable folio backup downloaded.');
    } catch (_) { announce('The editable backup could not be created because browser-local data is unavailable or invalid.', { error: true, focus: true }); }
  });
  document.getElementById('restore-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > maxBackupBytes) throw new Error('backup is too large');
      const payload = JSON.parse(await file.text());
      if (payload.course_id !== COURSE_ID || payload.schema !== 1) throw new Error('wrong schema');
      const photos = validatePhotoRecords(payload.photos === undefined ? [] : payload.photos);
      const restoredText = validateRestoreText(payload);
      if (!window.confirm('Restore this backup over the current browser-local folio?')) { event.target.value = ''; return; }
      const restoreEntries = [];
      Object.entries(restoredText.details).forEach(([id, value]) => restoreEntries.push([detailKey(id), value]));
      cards.forEach((card) => card.fields.forEach(([id]) => restoreEntries.push([key(card.id, id), restoredText.evidence[card.id][id]])));
      const previousEntries = restoreEntries.map(([storageKey]) => {
        const stored = safeStorage.read(storageKey);
        if (!stored.ok) throw new Error('browser storage unavailable');
        return [storageKey, stored.value];
      });
      try {
        restoreEntries.forEach(([storageKey, value]) => {
          if (!safeStorage.write(storageKey, value)) throw new Error('browser storage unavailable');
        });
        await replacePhotos(photos);
      } catch (error) {
        restoreEntries.forEach(([storageKey]) => safeStorage.remove(storageKey));
        previousEntries.forEach(([storageKey, value]) => { if (value !== null) safeStorage.write(storageKey, value); });
        if (error?.message === 'browser storage unavailable') throw error;
        throw new Error('browser data unavailable');
      }
      location.reload();
    } catch (error) {
      const unavailable = /browser (?:storage|data) unavailable/.test(error?.message || '');
      announce(unavailable ? 'This browser could not restore the backup. Your existing local folio has been retained where browser storage allowed.' : 'That file is not a valid Year 12 Textiles folio backup.', { error: true, focus: true });
    }
    event.target.value = '';
  });
  document.querySelector('[data-print]').addEventListener('click', () => window.print());
  document.querySelector('[data-next-action]').addEventListener('click', (event) => {
    const target = document.querySelector(event.currentTarget.hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', event.currentTarget.hash);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
  });
  const focusHashTarget = () => {
    if (!/^#folio-\d{2}$/.test(location.hash)) return;
    const target = document.querySelector(location.hash);
    if (!target) return;
    requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
    });
  };
  window.addEventListener('hashchange', focusHashTarget);
  document.querySelector('[data-reset]').addEventListener('click', async () => {
    if (!window.confirm('Reset all browser-local Year 12 folio fields and photos? Download a backup first if you may need them.')) return;
    folioSaveTimers.forEach((timer) => clearTimeout(timer));
    folioSaveTimers.clear();
    const resetKeys = [progressKey];
    document.querySelectorAll('[data-detail]').forEach((input) => resetKeys.push(detailKey(input.dataset.detail)));
    cards.forEach((card) => card.fields.forEach(([id]) => resetKeys.push(key(card.id, id))));
    const previousEntries = [];
    for (const storageKey of resetKeys) {
      const stored = safeStorage.read(storageKey);
      if (!stored.ok) { reportStorageFailure(true); return; }
      previousEntries.push([storageKey, stored.value]);
    }
    let previousPhotos;
    try { previousPhotos = await getAllPhotos(); }
    catch (_) { announce('The folio was not reset because local images are unavailable in this browser.', { error: true, focus: true }); return; }
    try {
      resetKeys.forEach((storageKey) => {
        if (!safeStorage.remove(storageKey)) throw new Error('browser storage unavailable');
      });
      await clearPhotos();
    } catch (_) {
      previousEntries.forEach(([storageKey, value]) => { if (value !== null) safeStorage.write(storageKey, value); });
      try { await replacePhotos(previousPhotos); } catch (_) { /* Best-effort rollback; the persistent message remains truthful. */ }
      announce('The folio was not fully reset. Existing browser-local data was restored where the browser allowed.', { error: true, focus: true });
      return;
    }
    location.reload();
  });

  cards.filter((card) => card.photo).forEach((card) => renderPhoto(card.id));
  updateProgress();
  focusHashTarget();
})();
