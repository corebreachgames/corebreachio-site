(() => {
const gameProgress = window.corebreachGameProgress ?? [];
const scriptURL = new URL(document.currentScript.src);
const homeURL = new URL(scriptURL.protocol === 'file:' ? './index.html' : './', scriptURL);

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const formatDate = date => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(new Date(date));

// Preserve the original inline content as a no-JavaScript fallback, while using
// the shared list as the source of truth when the enhancements are available.
for (const game of gameProgress) {
  const inline = document.querySelector(`[data-game-progress="${game.id}"]`);
  if (!inline) continue;
  for (const meter of game.meters) {
    const progress = inline.querySelector(`#progress-${meter.id}`);
    if (!progress) continue;
    progress.value = meter.value;
    progress.textContent = `${meter.value}%`;
    const row = progress.closest('.progress-item');
    row.querySelector('label').textContent = meter.label;
    row.querySelector('.progress-label > span').replaceChildren(
      document.createTextNode(String(meter.value)), element('span', 'percent', '%'),
    );
  }
  const date = inline.querySelector('time');
  if (date) {
    date.dateTime = game.updated;
    date.textContent = formatDate(game.updated);
  }
}

if (gameProgress.length) {
  const panel = element('aside', 'progress-panel');
  panel.setAttribute('aria-labelledby', 'game-progress-title');
  const header = element('div', 'progress-panel-header');
  const title = element('h2', 'progress-panel-title', 'Game progress');
  title.id = 'game-progress-title';
  const toggle = element('button', 'progress-panel-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'game-progress-content');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Collapse game progress');
  toggle.title = 'Collapse game progress';
  const toggleIcon = element('span', '', '−');
  toggleIcon.setAttribute('aria-hidden', 'true');
  toggle.append(toggleIcon);
  header.append(title, toggle);
  const content = element('div', 'progress-panel-content');
  content.id = 'game-progress-content';

  for (const game of gameProgress) {
    const section = element('section', 'progress-panel-game');
    const heading = element('h3', 'progress-panel-game-title');
    heading.id = `floating-game-${game.id}`;
    section.setAttribute('aria-labelledby', heading.id);
    const gameLink = element('a', '', game.name);
    gameLink.href = new URL(`#${game.id}`, homeURL).href;
    heading.append(gameLink);
    const date = element('time', 'progress-panel-date', `Updated ${formatDate(game.updated)}`);
    date.dateTime = game.updated;
    section.append(heading, date);

    for (const meter of game.meters) {
      const row = element('div', 'progress-panel-meter');
      const labelRow = element('div', 'progress-panel-label');
      const label = element('label', '', meter.label);
      label.htmlFor = `floating-progress-${game.id}-${meter.id}`;
      const value = element('span', '', `${meter.value}%`);
      const progress = element('progress', '', `${meter.value}%`);
      progress.id = label.htmlFor;
      progress.max = 100;
      progress.value = meter.value;
      labelRow.append(label, value);
      row.append(labelRow, progress);
      section.append(row);
    }
    content.append(section);
  }

  panel.append(header, content);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} game progress`);
    toggle.title = toggle.getAttribute('aria-label');
    toggleIcon.textContent = expanded ? '−' : '+';
    content.hidden = !expanded;
    panel.classList.toggle('is-collapsed', !expanded);
  });

  const siteHeader = document.querySelector('.site-header');
  const menuToggle = siteHeader?.querySelector('.menu-toggle');
  const navigation = siteHeader?.querySelector('.main-nav');
  let pendingFrame = false;
  const positionPanel = () => {
    pendingFrame = false;
    let headerBottom = siteHeader?.getBoundingClientRect().bottom ?? 0;
    if (menuToggle?.getAttribute('aria-expanded') === 'true' && navigation) {
      headerBottom = Math.max(headerBottom, navigation.getBoundingClientRect().bottom);
    }
    panel.style.setProperty('--progress-panel-top', `${Math.max(0, headerBottom) + 12}px`);
    // Make room for the initially expanded panel on narrow screens. Retain the
    // space when collapsing so the page does not jump underneath the reader.
    if (panel.isConnected && window.scrollY === 0 && !content.hidden) {
      document.body.style.setProperty('--progress-panel-reserved-height', `${panel.offsetHeight}px`);
    }
  };
  const schedulePosition = () => {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(positionPanel);
  };
  // Measure before insertion to avoid a flash in the wrong place on deep links.
  positionPanel();
  document.body.classList.add('has-progress-panel');
  document.body.append(panel);
  positionPanel();
  window.addEventListener('scroll', schedulePosition, { passive: true });
  window.addEventListener('resize', schedulePosition);
  if (siteHeader && typeof ResizeObserver === 'function') {
    new ResizeObserver(schedulePosition).observe(siteHeader);
    new ResizeObserver(schedulePosition).observe(panel);
  }
  if (menuToggle) {
    new MutationObserver(schedulePosition).observe(menuToggle, {
      attributes: true, attributeFilter: ['aria-expanded'],
    });
  }
}
})();
