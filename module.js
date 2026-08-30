(function () {
  'use strict';

  const body = document.body;
  const root = body.dataset.root || '../';
  const moduleNumber = Number(body.dataset.module || 0);
  const moduleMeta = (window.COURSE_MODULES || []).find((item) => Number(item.id) === moduleNumber);
  const contentRoot = window.COURSE_CONTENT || {};
  const contentModules = Array.isArray(contentRoot) ? contentRoot : (contentRoot.modules || []);
  const moduleContent = contentModules.find((item) => {
    const raw = item.module_id ?? item.code ?? item.id;
    const numeric = Number(String(raw).replace(/\D/g, ''));
    return numeric === moduleNumber;
  }) || {};

  if (!moduleMeta) return;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const arr = (value) => Array.isArray(value) ? value : (value ? [value] : []);
  const pad = (value) => String(value).padStart(2, '0');
  const moduleCode = moduleMeta.code || `m${pad(moduleNumber)}`;
  const presentationName = moduleMeta.presentation || `Year-12-Textiles-Module-${pad(moduleNumber)}.pptx`;
  const contentSections = arr(moduleContent.sections);
  const sectionMeta = arr(moduleMeta.sections);
  const sections = sectionMeta.map((meta, index) => {
    const found = contentSections.find((item) => (item.section_id || item.id) === meta.id) || contentSections[index] || {};
    return { ...meta, ...found, section_id: found.section_id || found.id || meta.id, title: found.title || meta.title };
  });

  const hero = document.querySelector('[data-module-hero]');
  const main = document.querySelector('[data-module-main]');
  const aside = document.querySelector('[data-module-aside]');
  if (!hero || !main || !aside) return;

  const outcomes = arr(moduleContent.outcomes || moduleMeta.outcomes);
  const modulePurpose = moduleContent.summary || moduleMeta.summary || 'Build connected HSC knowledge, evidence and independent textile decision-making.';
  const scrollBehaviour = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  const helpLink = (feedback, fallback) => {
    const text = String(feedback || 'Review the named theory point, then try again.');
    const match = text.match(/#([A-Za-z][\w-]*)/);
    const target = match ? `#${match[1]}` : fallback;
    const cleanedText = text.replace(/#[A-Za-z][\w-]*/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
    const cleaned = esc(cleanedText ? cleanedText[0].toUpperCase() + cleanedText.slice(1) : cleanedText);
    return `${cleaned} <a class="feedback-help" href="${esc(target)}">Review the linked theory</a>.`;
  };
  const feedbackDetail = (feedback) => String(feedback || '').replace(/^\s*(?:Correct|Try again)\.?(?:\s+|$)/i, '');

  const normaliseTheoryHeadings = (markup) => {
    const template = document.createElement('template');
    template.innerHTML = markup;
    template.content.querySelectorAll('h2').forEach((heading) => {
      const replacement = document.createElement('h3');
      Array.from(heading.attributes).forEach((attribute) => replacement.setAttribute(attribute.name, attribute.value));
      replacement.append(...heading.childNodes);
      heading.replaceWith(replacement);
    });
    return template.innerHTML;
  };
  const theoryHtml = (section) => {
    const value = section.theory_html ?? section.theoryHtml ?? section.theory;
    if (typeof value === 'string' && value.trim()) return normaliseTheoryHeadings(value);
    if (Array.isArray(value)) return value.map((item) => `<p>${esc(item)}</p>`).join('');
    return '<p class="status-note">This source-grounded theory section is still being integrated into the local candidate.</p>';
  };

  const visualData = (section) => section.visual || section.visual_brief || {};
  const mediaData = (section) => section.media_alternative || section.media || {};
  const questionData = (section) => arr(section.mcqs || section.questions || section.knowledge_check).slice(0, 10);
  const responseData = (section) => section.long_response || section.higher_order_response || section.written_response || {};
  const activityData = (section) => section.applied_activity || section.activity || {};

  const renderMediaAlternative = (media, sectionId) => {
    if (!media || !Object.keys(media).length) return '';
    const title = media.title || media.format || 'Purposeful non-video learning pathway';
    const during = arr(media.during || media.steps || media.instructions);
    return `<aside class="media-alternative" id="${esc(sectionId)}-media" aria-label="Non-video learning pathway">
      <p class="eyebrow">Non-video pathway</p>
      <h3>${esc(title)}</h3>
      ${media.before ? `<p><strong>Before:</strong> ${esc(media.before)}</p>` : ''}
      ${during.length ? `<ol>${during.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>` : ''}
      ${media.after ? `<p><strong>After:</strong> ${esc(media.after)}</p>` : ''}
    </aside>`;
  };

  const optionRecord = (question, option, optionIndex) => {
    if (typeof option === 'string') {
      return {
        id: String.fromCharCode(97 + optionIndex),
        text: option,
        feedback: 'Review the linked theory and compare this choice with the evidence in the section.',
        correct: Number(question.correct_index) === optionIndex
      };
    }
    const id = option.option_id || option.id || option.value || String.fromCharCode(97 + optionIndex);
    const correctId = question.correct_option_id ?? question.correct_id ?? question.answer;
    return {
      id,
      text: option.text || option.label || option.option || '',
      feedback: option.feedback || option.explanation || '',
      correct: option.correct === true || String(correctId) === String(id) || Number(question.correct_index) === optionIndex
    };
  };

  const renderQuestions = (section) => {
    const questions = questionData(section);
    if (!questions.length) return '<p class="status-note">The ten-question knowledge check is still being integrated.</p>';
    return questions.map((question, questionIndex) => {
      const qid = question.question_id || question.id || `${section.section_id}q${pad(questionIndex + 1)}`;
      const options = arr(question.options || question.answers).map((option, optionIndex) => optionRecord(question, option, optionIndex));
      const fallback = question.help_anchor || question.theory_anchor || `#${section.section_id}-theory`;
      return `<fieldset class="mcq" data-question="${esc(qid)}" data-help="${esc(fallback)}">
        <legend><span>${questionIndex + 1}</span>${esc(question.prompt || question.question)}</legend>
        <div class="mcq-options">
          ${options.map((option) => `<label>
            <input type="radio" name="${esc(qid)}" value="${esc(option.id)}" data-correct="${option.correct ? 'true' : 'false'}" data-feedback="${esc(option.feedback)}">
            <span>${esc(option.text)}</span>
          </label>`).join('')}
        </div>
        <p class="question-feedback" data-question-feedback aria-live="polite"></p>
      </fieldset>`;
    }).join('');
  };

  const renderResponse = (section) => {
    const response = responseData(section);
    const prompts = arr(response.scaffold_prompts || response.scaffold || response.steps);
    const criteria = arr(response.success_criteria || response.criteria);
    const prompt = response.prompt || 'Explain how the evidence in this section supports a justified textile decision.';
    const responseId = response.response_id || `${section.section_id}-long-response`;
    return `<section class="written-response" id="${esc(section.section_id)}-response">
      <p class="eyebrow">Higher-order response</p>
      <h3>${esc(prompt)}</h3>
      <div class="response-guide">
        <div><h4>Build your response</h4>${prompts.length ? `<ol>${prompts.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : '<p>Use evidence, explain the relationship and make a supported judgement.</p>'}</div>
        <div><h4>Success criteria</h4>${criteria.length ? `<ul>${criteria.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>Accurate evidence, connected reasoning and a clear conclusion.</p>'}</div>
      </div>
      ${response.sentence_starter ? `<p class="sentence-starter"><strong>Optional start:</strong> ${esc(response.sentence_starter)}</p>` : ''}
      <label class="text-field"><span>Your draft</span><textarea id="${esc(responseId)}" rows="9" data-response data-evidence-response placeholder="Draft here. Saving keeps this response only on this device."></textarea></label>
    </section>`;
  };

  const renderActivity = (section) => {
    const activity = activityData(section);
    const instructions = arr(activity.instructions || activity.steps);
    const title = activity.title || 'Apply the concept';
    const support = activity.answer_neutral_support || activity.support || '';
    const feedback = activity.feedback || activity.feedback_model || '';
    const lowTech = activity.printable_low_tech_alternative || activity.printable_low_tech || '';
    return `<section class="applied-activity" id="${esc(section.section_id)}-activity">
      <p class="eyebrow">${esc(activity.formative_label || activity.saved_record_label || 'Formative practice only')}</p>
      <h3>${esc(title)}</h3>
      ${activity.concept || activity.concept_anchor ? `<p><strong>Concept:</strong> ${esc(activity.concept || activity.concept_anchor)}</p>` : ''}
      ${activity.mechanic ? `<p><strong>Method:</strong> ${esc(activity.mechanic)}</p>` : ''}
      ${instructions.length ? `<ol>${instructions.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : ''}
      ${support ? `<details><summary>Process support</summary><p>${esc(support)}</p></details>` : ''}
      ${feedback ? `<details><summary>Feedback model</summary><p>${esc(feedback)}</p></details>` : ''}
      ${lowTech ? `<p class="low-tech"><strong>Printable / low-tech:</strong> ${esc(lowTech)}</p>` : ''}
      <label class="text-field"><span>Working note or evidence summary</span><textarea rows="5" data-activity-note placeholder="Record your thinking or result here."></textarea></label>
    </section>`;
  };

  const renderLearningPackage = (section, index) => `<details class="learning-cycle section-learning" id="${esc(section.section_id)}-learning" data-section-package="${esc(section.section_id)}">
    <summary><span><strong>Learning package ${index + 1}</strong><small>10-question check, higher-order response and applied activity</small></span><span aria-hidden="true">Open</span></summary>
    <div class="learning-body">
      <section class="knowledge-check" aria-labelledby="${esc(section.section_id)}-check-heading">
        <p class="eyebrow">Feedback-rich knowledge check</p>
        <h3 id="${esc(section.section_id)}-check-heading">Check your understanding</h3>
        <p>Select one answer for each question. Feedback appears only after you make a choice and links back to the exact theory point.</p>
        ${renderQuestions(section)}
      </section>
      ${renderResponse(section)}
      ${renderActivity(section)}
      <div class="evidence-controls">
        <button class="button" type="button" data-save-section>Save this section</button>
        <button class="button secondary" type="button" data-reset-section>Reset this section</button>
        <button class="button secondary" type="button" data-print-section>Print / save PDF</button>
        <p class="save-status" data-save-status tabindex="-1" aria-live="polite">Not yet saved on this device.</p>
      </div>
      <p class="fine evidence-boundary">This is a local learning record, not a formal assessment submission or the official MTP supporting documentation. Follow the current teacher-issued instructions for all assessed evidence.</p>
    </div>
  </details>`;

  const renderTheorySection = (section, index) => {
    const visual = visualData(section);
    const imagePath = visual.path || `assets/images/${section.section_id}.png`;
    const alt = visual.alt || `Purposeful learning image for ${section.title}`;
    const caption = visual.caption || '';
    const notice = visual.notice_prompt || visual.notice || '';
    const noticeText = notice.replace(/^\s*notice(?:\s*:)?\s*/i, '');
    const dialogId = `${section.section_id}-visual-dialog`;
    const dialogLabelId = `${dialogId}-label`;
    return `<article class="theory-section theory-block" id="${esc(section.section_id)}-theory" data-section-container="${esc(section.section_id)}">
      <p class="eyebrow">Theory section ${index + 1} of 3</p>
      <h2>${esc(section.title)}</h2>
      ${section.purpose ? `<p class="lede">${esc(section.purpose)}</p>` : ''}
      <div class="theory-copy">${theoryHtml(section)}</div>
    </article>
    <figure class="section-visual teaching-visual" id="${esc(section.section_id)}-visual">
        <img src="${esc(root + imagePath)}" alt="${esc(alt)}" loading="lazy">
        <figcaption>${caption ? `<span>${esc(caption)}</span>` : ''}${noticeText ? `<span><strong>Notice:</strong> ${esc(noticeText)}</span>` : ''}<button class="open-larger" type="button" data-open-visual="${esc(dialogId)}">Open larger</button></figcaption>
        <dialog class="visual-dialog" id="${esc(dialogId)}" aria-labelledby="${esc(dialogLabelId)}"><div class="visual-dialog-frame"><img src="${esc(root + imagePath)}" alt="${esc(alt)}" loading="lazy" decoding="async"><div><p id="${esc(dialogLabelId)}">${esc(caption || section.title)}</p><button class="button secondary" type="button" data-close-visual>Close image</button></div></div></dialog>
    </figure>
    ${renderMediaAlternative(mediaData(section), section.section_id)}`;
  };

  hero.innerHTML = `<p class="eyebrow">${esc(moduleCode.toUpperCase())} · ${esc(moduleMeta.term || '')} · ${esc(moduleMeta.hours || 8)} hours</p>
    <h1>${esc(moduleMeta.title)}</h1>
    <p class="lede">${esc(modulePurpose)}</p>`;

  const outcomesHtml = outcomes.length ? `<ul>${outcomes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>Connected HSC theory, Major Textiles Project thinking and examination reasoning.</p>';
  const previous = moduleNumber > 1 ? `module-${pad(moduleNumber - 1)}.html` : '../index.html';
  const next = moduleNumber < (window.COURSE_MODULES || []).length ? `module-${pad(moduleNumber + 1)}.html` : '../index.html';

  main.innerHTML = `<section class="primary-presentation-card" id="${esc(moduleCode)}-presentation" data-module-presentation aria-labelledby="${esc(moduleCode)}-presentation-heading">
      <div><p class="eyebrow">Classroom presentation</p><h2 id="${esc(moduleCode)}-presentation-heading">Module ${moduleNumber} presentation</h2><p>Eight source-matched slides: purpose, three theory sections, retrieval, response scaffold and exit evidence.</p></div>
      <a class="button" id="${esc(moduleCode)}-presentation-download" data-module-presentation-download href="${esc(root + 'presentations/' + presentationName)}" download>Download PowerPoint</a>
    </section>
    <section class="module-overview">
      <div><p class="eyebrow">Module purpose</p><h2>What this module connects</h2><p>${esc(modulePurpose)}</p><div class="module-meta"><span>3 named theory sections</span><span>30 formative questions</span><span>3 higher-order responses</span><span>3 applied activities</span></div></div>
      <div class="module-overview-action"><h3>Learning outcomes</h3>${outcomesHtml}</div>
    </section>
    <section class="student-evidence-strip"><div><p class="eyebrow">Student evidence</p><h2>One complete package per section</h2><p>Each saved record stays on this device until the student prints or exports it.</p></div><ul class="evidence-list"><li>Knowledge check</li><li>Higher-order response</li><li>Applied learning activity</li></ul></section>
    ${sections.map((section, index) => `${renderTheorySection(section, index)}${renderLearningPackage(section, index)}`).join('')}
    <section class="completion-card module-review-checklist" id="${esc(moduleCode)}-review" data-module-review><p class="eyebrow">Module review and checklist</p><h2><span data-progress-count>0</span> of 3 packages complete</h2><p>Open the exact package you need. The drawers stay closed until you choose one.</p><ul class="module-review-grid" id="${esc(moduleCode)}-review-checklist">${sections.map((section, index) => `<li><a href="#${esc(section.section_id)}-learning" data-review-link="${esc(section.section_id)}"><span>Package ${index + 1}: ${esc(section.title)}</span><strong data-review-state="${esc(section.section_id)}">Not saved</strong></a></li>`).join('')}</ul><div class="completion-actions"><a class="button secondary" href="#${esc(sections[0]?.section_id || '')}-learning" data-resume>Resume next package</a><a class="button secondary" href="${esc(previous)}">Previous</a><a class="button" href="${esc(next)}">Next module</a></div><p class="fine">A package is complete when all ten questions, the higher-order response and the applied activity note are saved. Formal assessment evidence follows current teacher-issued instructions.</p></section>`;

  aside.innerHTML = `<nav class="module-aside-card" aria-label="On this module"><p class="eyebrow">On this module</p><ol>${sections.map((section) => `<li><a href="#${esc(section.section_id)}-theory">${esc(section.title)}</a><a class="aside-learning-link" href="#${esc(section.section_id)}-learning">Learning package</a></li>`).join('')}</ol><a class="button secondary" href="${esc(root + 'index.html')}">Course home</a></nav>`;

  const storageKey = (sectionId) => `${window.TEXTILES_STORAGE_PREFIX || 'tas:textiles:year12-hsc:v1'}:learning:${sectionId}`;
  let storageReadFailed = false;
  const safeStorage = {
    read(storageId) {
      try { return { ok: true, value: localStorage.getItem(storageId) }; }
      catch (_) { storageReadFailed = true; return { ok: false, value: null }; }
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
  const readRecord = (sectionId) => {
    const stored = safeStorage.read(storageKey(sectionId));
    if (!stored.ok) return null;
    try { return JSON.parse(stored.value || 'null'); } catch (_) { return null; }
  };
  const selectedAnswers = (packageElement) => {
    const answers = {};
    packageElement.querySelectorAll('[data-question]').forEach((fieldset) => {
      const selected = fieldset.querySelector('input[type="radio"]:checked');
      if (selected) answers[fieldset.dataset.question] = selected.value;
    });
    return answers;
  };
  const questionCompletion = (packageElement) => {
    const completion = {};
    packageElement.querySelectorAll('[data-question]').forEach((fieldset) => {
      completion[fieldset.dataset.question] = Boolean(fieldset.querySelector('input[type="radio"]:checked'));
    });
    return completion;
  };
  const showFeedback = (input) => {
    const fieldset = input.closest('[data-question]');
    const output = fieldset.querySelector('[data-question-feedback]');
    const correct = input.dataset.correct === 'true';
    output.className = `question-feedback ${correct ? 'is-correct' : 'is-retry'}`;
    output.innerHTML = `<strong>${correct ? 'Correct.' : 'Try again.'}</strong> ${helpLink(feedbackDetail(input.dataset.feedback), fieldset.dataset.help || '#main')}`;
  };
  const updateProgress = () => {
    const complete = sections.filter((section) => readRecord(section.section_id)?.complete === true).length;
    document.querySelectorAll('[data-progress-count]').forEach((node) => { node.textContent = String(complete); });
    sections.forEach((section) => {
      const record = readRecord(section.section_id);
      document.querySelectorAll(`[data-review-state="${CSS.escape(section.section_id)}"]`).forEach((node) => {
        node.textContent = record?.complete ? 'Complete' : record?.savedAt ? 'Saved draft' : 'Not saved';
        node.dataset.state = record?.complete ? 'saved' : record?.savedAt ? 'draft' : 'not-saved';
      });
    });
    const nextSection = sections.find((section) => readRecord(section.section_id)?.complete !== true) || sections[sections.length - 1];
    const resume = document.querySelector('[data-resume]');
    if (resume && nextSection) {
      if (complete === sections.length) {
        const moduleTotal = (window.COURSE_MODULES || []).length;
        if (moduleNumber < moduleTotal) {
          const nextModuleMeta = (window.COURSE_MODULES || []).find((item) => Number(item.id) === moduleNumber + 1);
          const nextModuleSection = nextModuleMeta?.sections?.[0]?.id || `m${pad(moduleNumber + 1)}s01`;
          resume.href = `module-${pad(moduleNumber + 1)}.html#${nextModuleSection}-learning`;
          resume.textContent = `Continue to Module ${moduleNumber + 1}`;
        } else {
          resume.href = '../folio.html#folio-01';
          resume.textContent = 'Continue to the folio';
        }
      } else {
        resume.href = `#${nextSection.section_id}-learning`;
        resume.textContent = `Resume: ${nextSection.title}`;
      }
    }
  };

  document.querySelectorAll('[data-section-package]').forEach((packageElement) => {
    const sectionId = packageElement.dataset.sectionPackage;
    const record = readRecord(sectionId);
    if (storageReadFailed) packageElement.querySelector('[data-save-status]').textContent = 'Browser storage is unavailable. Print or save a PDF to keep this work.';
    if (record) {
      Object.entries(record.answers || {}).forEach(([questionId, value]) => {
        const fieldset = packageElement.querySelector(`[data-question="${CSS.escape(questionId)}"]`);
        const input = fieldset?.querySelector(`input[value="${CSS.escape(String(value))}"]`);
        if (input) { input.checked = true; showFeedback(input); }
      });
      const response = packageElement.querySelector('[data-response]');
      const activity = packageElement.querySelector('[data-activity-note]');
      if (response) response.value = record.response || '';
      if (activity) activity.value = record.activityNote || '';
      if (record.savedAt) packageElement.querySelector('[data-save-status]').textContent = `Saved on this device: ${new Date(record.savedAt).toLocaleString('en-AU')}.`;
    }

    let saveTimer;
    const persistPackage = (announceSave = false) => {
      const answers = selectedAnswers(packageElement);
      const responseValue = packageElement.querySelector('[data-response]')?.value || '';
      const activityValue = packageElement.querySelector('[data-activity-note]')?.value || '';
      const recordToSave = {
        answers,
        questionCompletion: questionCompletion(packageElement),
        response: responseValue,
        activityNote: activityValue,
        complete: Object.keys(answers).length === packageElement.querySelectorAll('[data-question]').length && responseValue.trim().length >= 40 && activityValue.trim().length >= 20,
        savedAt: new Date().toISOString()
      };
      const status = packageElement.querySelector('[data-save-status]');
      if (safeStorage.write(storageKey(sectionId), JSON.stringify(recordToSave))) {
        status.textContent = `${announceSave ? 'Saved' : 'Autosaved'} on this device: ${new Date(recordToSave.savedAt).toLocaleString('en-AU')}.`;
      } else {
        status.textContent = 'This browser could not save the record. Print or save a PDF instead.';
      }
      if (announceSave) status.focus();
      updateProgress();
    };
    const scheduleAutosave = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => persistPackage(false), 260);
    };

    packageElement.addEventListener('change', (event) => {
      if (event.target.matches('input[type="radio"]')) showFeedback(event.target);
      scheduleAutosave();
    });
    packageElement.addEventListener('input', (event) => {
      if (event.target.matches('[data-response], [data-activity-note]')) scheduleAutosave();
    });
    packageElement.querySelector('[data-save-section]').addEventListener('click', () => persistPackage(true));
    packageElement.querySelector('[data-reset-section]').addEventListener('click', () => {
      if (!window.confirm('Reset only this section’s saved answers and draft on this device?')) return;
      clearTimeout(saveTimer);
      saveTimer = undefined;
      const status = packageElement.querySelector('[data-save-status]');
      if (!safeStorage.remove(storageKey(sectionId))) {
        status.textContent = 'This browser could not reset the saved record. Your visible work has not been cleared.';
        status.focus();
        return;
      }
      packageElement.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
      packageElement.querySelectorAll('[data-question-feedback]').forEach((node) => { node.textContent = ''; node.className = 'question-feedback'; });
      const response = packageElement.querySelector('[data-response]');
      const activity = packageElement.querySelector('[data-activity-note]');
      if (response) response.value = '';
      if (activity) activity.value = '';
      status.textContent = 'This section has been reset on this device.';
      status.focus();
      updateProgress();
    });
    packageElement.querySelector('[data-print-section]').addEventListener('click', () => {
      packageElement.open = true;
      window.print();
    });
  });

  const focusPackageFromHash = () => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (!target?.matches('[data-section-package]')) return;
    target.open = true;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
  };
  document.querySelectorAll('[data-review-link], [data-resume], .aside-learning-link').forEach((link) => {
    link.addEventListener('click', () => setTimeout(focusPackageFromHash, 0));
  });
  window.addEventListener('hashchange', focusPackageFromHash);

  document.querySelectorAll('[data-open-visual]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openVisual);
      if (!dialog) return;
      dialog.dataset.returnFocus = button.dataset.openVisual;
      dialog.showModal();
      dialog.querySelector('[data-close-visual]')?.focus();
    });
  });
  document.querySelectorAll('.visual-dialog').forEach((dialog) => {
    dialog.querySelector('[data-close-visual]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => document.querySelector(`[data-open-visual="${CSS.escape(dialog.id)}"]`)?.focus());
  });

  updateProgress();
  focusPackageFromHash();
})();
