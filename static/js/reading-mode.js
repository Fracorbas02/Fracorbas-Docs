/**
 * Mode lecture plein écran pour les articles du blog.
 * Ajoute un bouton dans le coin supérieur droit de la zone de lecture,
 * qui masque navbar, sidebar et footer pour ne laisser que l'article.
 * Le sommaire reste consultable au survol du bord droit de l'écran.
 * Aucun composant du thème n'est modifié : script + CSS uniquement.
 * Le bouton vit dans document.body, hors de l'arbre React, pour ne
 * jamais perturber l'hydration.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'reading-mode-active';
  // État porté par un attribut data- et non par une classe : Docusaurus
  // réécrit l'attribut className de <html> via Helmet (qui remplace la
  // valeur entière), ce qui effacerait une classe ajoutée ici. React ne
  // touche jamais aux attributs data-.
  var ACTIVE_ATTR = 'data-reading-mode';
  var BUTTON_CLASS = 'reading-mode-toggle';

  // Les deux icônes sont dans le bouton dès sa création : c'est le CSS
  // qui choisit laquelle afficher. Ainsi, activer/désactiver le mode ne
  // modifie jamais le DOM géré ici (pas de boucle MutationObserver).
  var ICONS =
    '<svg class="icon-enter" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>' +
    '<svg class="icon-exit" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

  var button = null;

  function isActive() {
    return document.documentElement.hasAttribute(ACTIVE_ATTR);
  }

  function isDesktop() {
    return window.matchMedia('(min-width: 997px)').matches;
  }

  function isBlogPostPage() {
    var path = window.location.pathname;
    if (path.indexOf('/blog/') !== 0) {
      return false;
    }
    if (path === '/blog/') {
      return false;
    }
    if (/^\/blog\/(page|archive|tags|authors)(\/|$)/.test(path)) {
      return false;
    }
    return Boolean(document.querySelector('main article'));
  }

  // Coin supérieur droit de la zone de lecture : aligné sur le bord
  // droit du contenu, juste sous la navbar (ou en haut en mode actif).
  function positionButton() {
    if (!button) {
      return;
    }
    var main = document.querySelector('main');
    if (!main || !isBlogPostPage() || !isDesktop()) {
      button.style.display = 'none';
      return;
    }
    button.style.display = '';
    var mainRect = main.getBoundingClientRect();
    button.style.right =
      (document.documentElement.clientWidth - mainRect.right) + 'px';
    var top = 8;
    if (!isActive()) {
      var navbar = document.querySelector('.navbar');
      if (navbar) {
        top = navbar.getBoundingClientRect().bottom + 4;
      }
    }
    button.style.top = top + 'px';
  }

  function updateAria() {
    if (!button) {
      return;
    }
    var active = isActive();
    button.title = active
      ? 'Quitter le mode plein écran'
      : 'Mode plein écran';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-pressed', String(active));
  }

  // Zone du sommaire : uniquement la gouttière entre le bord droit du
  // contenu et le bord droit de l'écran. Aucun survol ni affichage
  // possible au-dessus ou à gauche de la partie lisible.
  function positionRail(active) {
    var rail = document.querySelector('.row > div.col--2');
    if (!rail) {
      return;
    }
    if (!active) {
      rail.style.left = '';
      rail.style.right = '';
      rail.style.width = '';
      return;
    }
    var main = document.querySelector('main');
    if (!main) {
      return;
    }
    rail.style.left = main.getBoundingClientRect().right + 'px';
    rail.style.right = '0px';
    rail.style.width = 'auto';
  }

  function setActive(active) {
    if (active) {
      document.documentElement.setAttribute(ACTIVE_ATTR, 'on');
    } else {
      document.documentElement.removeAttribute(ACTIVE_ATTR);
    }
    window.localStorage.setItem(STORAGE_KEY, String(active));
    positionButton();
    positionRail(active);
    updateAria();
  }

  function sync() {
    var isPost = isBlogPostPage();

    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = BUTTON_CLASS;
      button.innerHTML = ICONS;
      button.addEventListener('click', function () {
        setActive(!isActive());
      });
      document.body.appendChild(button);
    }

    // Le mode ne s'applique que sur les pages d'articles.
    if (!isPost) {
      document.documentElement.removeAttribute(ACTIVE_ATTR);
      button.style.display = 'none';
    } else {
      if (window.localStorage.getItem(STORAGE_KEY) === 'true') {
        document.documentElement.setAttribute(ACTIVE_ATTR, 'on');
      } else {
        document.documentElement.removeAttribute(ACTIVE_ATTR);
      }
    }
    positionButton();
    positionRail(isActive());
    updateAria();
  }

  var scheduled = false;
  function scheduleSync() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      sync();
    }, 50);
  }

  function init() {
    sync();
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isActive()) {
        setActive(false);
      }
    });
    window.addEventListener('resize', scheduleSync);
    // Re-synchronisation lors des navigations côté client (SPA).
    new MutationObserver(scheduleSync).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
