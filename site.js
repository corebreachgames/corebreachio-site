/* Progressive enhancements. Content, downloads and navigation work without JS. */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
}

const video = document.querySelector('#gameplay-video');
const videoCover = document.querySelector('.video-cover');
if (video && videoCover) {
  videoCover.hidden = false;
  videoCover.addEventListener('click', async () => {
    videoCover.hidden = true;
    try {
      await video.play();
      video.focus();
    } catch {
      // Leave the native controls exposed so playback can be retried.
      video.focus();
    }
  });
  video.addEventListener('play', () => {
    videoCover.hidden = true;
    video.closest('.video-frame').classList.add('is-playing');
  });
  video.addEventListener('ended', () => {
    video.closest('.video-frame').classList.remove('is-playing');
    videoCover.hidden = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
  });
}

const gallery = [...document.querySelectorAll('[data-gallery]')];
const lightbox = document.querySelector('#screenshot-dialog');
if (gallery.length && lightbox && typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('#lightbox-image');
  const caption = lightbox.querySelector('#lightbox-caption');
  const counter = lightbox.querySelector('.lightbox-counter');
  let activeIndex = 0;
  let opener;
  const showImage = (index) => {
    activeIndex = (index + gallery.length) % gallery.length;
    const item = gallery[activeIndex];
    image.src = item.href;
    image.alt = item.querySelector('img').alt;
    caption.textContent = item.dataset.caption;
    counter.textContent = `${activeIndex + 1} / ${gallery.length}`;
  };
  gallery.forEach((item, index) => item.addEventListener('click', (event) => {
    // Preserve normal new-tab and download behavior for modified clicks.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = item;
    showImage(index);
    lightbox.showModal();
    document.body.classList.add('modal-open');
  }));
  lightbox.querySelector('[data-close-lightbox]').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.gallery-prev').addEventListener('click', () => showImage(activeIndex - 1));
  lightbox.querySelector('.gallery-next').addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target !== lightbox) return;
    const rect = lightbox.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus({preventScroll: true});
  });
}
