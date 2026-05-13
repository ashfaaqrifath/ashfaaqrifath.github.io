(function () {
  document.documentElement.classList.remove('no-js');

  var body = document.body;
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');
  var lastScrollY = window.scrollY;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('open', isOpen);
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      body.classList.toggle('menu-open', isOpen);
    });

    mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu();
  });

  if (header && !prefersReducedMotion) {
    window.addEventListener(
      'scroll',
      function () {
        var current = window.scrollY;
        header.classList.toggle('scrolled', current > 50);
        header.classList.toggle('hide', current > lastScrollY && current > 50);
        lastScrollY = Math.max(current, 0);
      },
      { passive: true },
    );
  }

  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (link.host !== window.location.host) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  var scrollBattery = document.querySelector('.scroll-battery');
  var scrollBatteryPercent = document.querySelector('[data-scroll-progress-percent]');
  var scrollBatteryFill = document.querySelector('[data-scroll-progress-fill]');

  function updateScrollBattery() {
    if (!scrollBattery || !scrollBatteryPercent || !scrollBatteryFill) return;

    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    var percent = Math.min(100, Math.max(0, Math.round(progress * 100)));

    scrollBatteryPercent.textContent = percent + '%';
    scrollBatteryFill.style.height = percent + '%';
    scrollBattery.setAttribute('aria-valuenow', String(percent));
  }

  if (scrollBattery) {
    updateScrollBattery();
    window.addEventListener('scroll', updateScrollBattery, { passive: true });
    window.addEventListener('resize', updateScrollBattery);
  }

  var siteTimer = document.querySelector('[data-site-timer]');
  if (siteTimer) {
    var timerStorageKey = 'portfolioSiteTimerStart';
    var timerStart = Date.now();

    try {
      var savedTimerStart = window.sessionStorage.getItem(timerStorageKey);
      if (savedTimerStart) {
        timerStart = Number(savedTimerStart) || timerStart;
      } else {
        window.sessionStorage.setItem(timerStorageKey, String(timerStart));
      }
    } catch (error) {
      timerStart = Date.now();
    }

    function padTimerUnit(value) {
      return String(value).padStart(2, '0');
    }

    function updateSiteTimer() {
      var elapsedSeconds = Math.max(0, Math.floor((Date.now() - timerStart) / 1000));
      var hours = Math.floor(elapsedSeconds / 3600);
      var minutes = Math.floor((elapsedSeconds % 3600) / 60);
      var seconds = elapsedSeconds % 60;

      siteTimer.textContent =
        padTimerUnit(hours) + ':' + padTimerUnit(minutes) + ':' + padTimerUnit(seconds);
    }

    updateSiteTimer();
    window.setInterval(updateSiteTimer, 1000);
  }

  var projectsSection = document.querySelector('.projects');
  var moreButton = document.querySelector('.more-button');
  if (projectsSection && moreButton) {
    moreButton.addEventListener('click', function () {
      var showingAll = projectsSection.classList.toggle('show-all');
      moreButton.textContent = showingAll ? 'Show Less' : 'Show More';
    });
  }

  var projectCards = Array.from(document.querySelectorAll('.project-card'));
  if (projectCards.length) {
    var githubIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<title>GitHub</title>' +
      '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>' +
      '</svg>';
    var externalIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<title>External Link</title>' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' +
      '<polyline points="15 3 21 3 21 9"></polyline>' +
      '<line x1="10" y1="14" x2="21" y2="3"></line>' +
      '</svg>';
    var placeholderGithub = 'https://github.com/ashfaaqrifath';
    var placeholderDeploy = '#projects';

    var lastFocusedElement = null;
    var projectModal = document.createElement('div');
    projectModal.className = 'project-modal';
    projectModal.setAttribute('aria-hidden', 'true');
    projectModal.innerHTML =
      '<div class="project-modal-card" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">' +
      '<button class="project-modal-close" type="button" aria-label="Close project details">&times;</button>' +
      '<div class="project-modal-media">' +
      '<div class="project-modal-image"><img src="assets/images/project-6.png" alt="Project preview" /></div>' +
      '</div>' +
      '<div class="project-modal-copy">' +
      '<h3 class="project-modal-title" id="project-modal-title"></h3>' +
      '<div class="project-modal-description"></div>' +
      '<ul class="project-modal-tech-list"></ul>' +
      '<div class="project-modal-links"></div>' +
      '</div>' +
      '</div>';
    document.body.appendChild(projectModal);

    var modalTitle = projectModal.querySelector('.project-modal-title');
    var modalDescription = projectModal.querySelector('.project-modal-description');
    var modalTechList = projectModal.querySelector('.project-modal-tech-list');
    var modalLinks = projectModal.querySelector('.project-modal-links');
    var modalClose = projectModal.querySelector('.project-modal-close');

    function makeProjectLink(href, label, className, icon) {
      var link = document.createElement('a');
      link.href = href;
      link.setAttribute('aria-label', label);
      if (href.indexOf('http') === 0) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
      if (className) link.className = className;
      link.innerHTML = icon;
      return link;
    }

    function normalizeProjectLinks(card) {
      var projectTop = card.querySelector('.project-top');
      if (!projectTop) return;

      var links = card.querySelector('.project-links');
      if (!links) {
        links = document.createElement('div');
        links.className = 'project-links';
        projectTop.appendChild(links);
      }

      var linkItems = Array.from(links.querySelectorAll('a'));

      function getProjectLinkType(link) {
        var label = (link.getAttribute('aria-label') || '').toLowerCase();
        var title = (link.querySelector('title') ? link.querySelector('title').textContent : '').toLowerCase();
        var href = (link.getAttribute('href') || '').toLowerCase();
        if (link.classList.contains('external') || label.indexOf('external') !== -1 || title.indexOf('external') !== -1) {
          return 'external';
        }
        if (href.indexOf('github.com') !== -1 || label.indexOf('github') !== -1 || title.indexOf('github') !== -1) {
          return 'github';
        }
        return '';
      }

      function firstProjectLink(type) {
        return linkItems.find(function (link) {
          return getProjectLinkType(link) === type;
        });
      }

      function removeDuplicateProjectLinks(type) {
        var seen = false;
        linkItems.forEach(function (link) {
          if (getProjectLinkType(link) !== type) return;
          if (seen) {
            link.remove();
            return;
          }
          seen = true;
        });
      }

      removeDuplicateProjectLinks('github');
      removeDuplicateProjectLinks('external');

      var githubLink = firstProjectLink('github');
      var externalLink = firstProjectLink('external');

      if (!githubLink) {
        links.insertBefore(
          makeProjectLink(placeholderGithub, 'GitHub Link', '', githubIcon),
          links.firstChild,
        );
      }

      if (!externalLink) {
        links.appendChild(makeProjectLink(placeholderDeploy, 'External Link', 'external', externalIcon));
      }
    }

    function closeProjectModal() {
      projectModal.classList.remove('open');
      projectModal.setAttribute('aria-hidden', 'true');
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    function openProjectModal(card) {
      var title = card.querySelector('.project-title');
      var description = card.querySelector('.project-description');
      var techList = card.querySelector('.project-tech-list');
      var links = card.querySelector('.project-links');
      if (!title || !description) return;

      lastFocusedElement = document.activeElement;
      modalTitle.textContent = title.textContent.trim();
      modalDescription.innerHTML = description.innerHTML;
      modalTechList.innerHTML = techList ? techList.innerHTML : '';
      modalLinks.innerHTML = links ? links.innerHTML : '';
      projectModal.classList.add('open');
      projectModal.setAttribute('aria-hidden', 'false');
      modalClose.focus();
    }

    projectCards.forEach(function (card) {
      normalizeProjectLinks(card);

      var inner = card.querySelector('.project-inner');
      if (!inner) return;

      inner.setAttribute('role', 'button');
      inner.setAttribute('tabindex', '0');
      inner.setAttribute('aria-label', 'View project details');

      card.addEventListener('click', function (event) {
        if (event.target.closest('.project-links a')) return;
        event.preventDefault();
        openProjectModal(card);
      });

      inner.addEventListener('keydown', function (event) {
        if (event.target.closest('a')) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProjectModal(card);
        }
      });
    });

    modalClose.addEventListener('click', closeProjectModal);
    projectModal.addEventListener('click', function (event) {
      if (event.target === projectModal) closeProjectModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && projectModal.classList.contains('open')) {
        closeProjectModal();
      }
    });
  }

  var galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  if (galleryCards.length) {
    var activeGalleryIndex = 0;
    var galleryLastFocus = null;
    var galleryImages = galleryCards
      .map(function (card) {
        return card.querySelector('img');
      })
      .filter(Boolean);

    var galleryLightbox = document.createElement('div');
    galleryLightbox.className = 'gallery-lightbox';
    galleryLightbox.setAttribute('aria-hidden', 'true');
    galleryLightbox.innerHTML =
      '<button class="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="Previous image">&larr;</button>' +
      '<div class="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-label="Gallery image preview" tabindex="-1">' +
      '<img class="gallery-lightbox-image" alt="" />' +
      '</div>' +
      '<button class="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="Next image">&rarr;</button>';
    document.body.appendChild(galleryLightbox);

    var galleryLightboxImage = galleryLightbox.querySelector('.gallery-lightbox-image');
    var galleryLightboxPanel = galleryLightbox.querySelector('.gallery-lightbox-panel');
    var galleryLightboxPrev = galleryLightbox.querySelector('.gallery-lightbox-prev');
    var galleryLightboxNext = galleryLightbox.querySelector('.gallery-lightbox-next');

    function showGalleryImage(index) {
      activeGalleryIndex = (index + galleryImages.length) % galleryImages.length;
      var image = galleryImages[activeGalleryIndex];
      galleryLightboxImage.src = image.currentSrc || image.src;
      galleryLightboxImage.alt = image.alt || 'Gallery image';
    }

    function openGalleryLightbox(index) {
      galleryLastFocus = document.activeElement;
      showGalleryImage(index);
      galleryLightbox.classList.add('open');
      galleryLightbox.setAttribute('aria-hidden', 'false');
      galleryLightboxPanel.focus();
    }

    function closeGalleryLightbox() {
      galleryLightbox.classList.remove('open');
      galleryLightbox.setAttribute('aria-hidden', 'true');
      if (galleryLastFocus) galleryLastFocus.focus();
    }

    galleryCards.forEach(function (card, index) {
      card.addEventListener('click', function () {
        openGalleryLightbox(index);
      });
    });

    galleryLightboxPrev.addEventListener('click', function () {
      showGalleryImage(activeGalleryIndex - 1);
    });

    galleryLightboxNext.addEventListener('click', function () {
      showGalleryImage(activeGalleryIndex + 1);
    });

    galleryLightbox.addEventListener('click', function (event) {
      if (event.target === galleryLightbox) closeGalleryLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!galleryLightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeGalleryLightbox();
      if (event.key === 'ArrowLeft') showGalleryImage(activeGalleryIndex - 1);
      if (event.key === 'ArrowRight') showGalleryImage(activeGalleryIndex + 1);
    });
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    document.querySelectorAll('.reveal').forEach(function (element) {
      observer.observe(element);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (element) {
      element.classList.add('visible');
    });
  }

  if (body.classList.contains('loading')) {
    window.setTimeout(function () {
      body.classList.remove('loading');
    }, prefersReducedMotion ? 0 : 1700);
  }
})();

