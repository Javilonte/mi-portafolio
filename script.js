/* =========================================================
   JAVILONTE — Comportamiento del sitio
   ========================================================= */
(function () {
    'use strict';

    /* ---------- Masthead: ajuste al ancho ---------- */
    /* El template usa una fórmula fija; el nombre puede ser más
       largo que la caja, así que se reduce hasta llenar el ancho. */
    var masthead = document.querySelector('[data-masthead]');

    function contentWidth(el) {
        var cs = window.getComputedStyle(el.parentElement);
        return el.parentElement.clientWidth
            - parseFloat(cs.paddingLeft)
            - parseFloat(cs.paddingRight);
    }

    function fitMasthead() {
        if (!masthead) return;

        var available = contentWidth(masthead);
        if (available <= 0) return;

        // Se limpia el ajuste inline para leer el tamaño base de CSS.
        masthead.style.fontSize = '';
        var baseline = parseFloat(window.getComputedStyle(masthead).fontSize);
        if (!baseline) return;

        // Ancho real del texto. Range mide el texto, no la caja,
        // así que no se ve afectado por el desborde del inline-block.
        var range = document.createRange();
        range.selectNodeContents(masthead);
        var natural = range.getBoundingClientRect().width;
        if (!natural) return;

        if (natural > available) {
            // Se reduce para no desbordar.
            masthead.style.fontSize = (baseline * (available / natural)) + 'px';
        } else {
            // Crece hasta llenar el ancho, sin pasar la línea base.
            masthead.style.fontSize = Math.min(baseline * (available / natural), baseline) + 'px';
        }
    }

    /* ---------- Modo oscuro ---------- */
    var themeButton = document.getElementById('modo-oscuro');
    var themeLabel = themeButton && themeButton.querySelector('.theme-toggle__label');
    var STORAGE_KEY = 'javilonte-tema';

    function applyTheme(isDark) {
        document.documentElement.classList.toggle('oscuro', isDark);
        if (themeButton) {
            themeButton.setAttribute('aria-pressed', String(isDark));
        }
        if (themeLabel) {
            themeLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
        }
    }

    function storedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function persistTheme(isDark) {
        try {
            localStorage.setItem(STORAGE_KEY, isDark ? 'oscuro' : 'claro');
        } catch (e) {
            /* Almacenamiento no disponible: el toggle sigue funcionando en memoria. */
        }
    }

    if (themeButton) {
        applyTheme(storedTheme() === 'oscuro');
        themeButton.addEventListener('click', function () {
            var isDark = !document.body.classList.contains('oscuro');
            applyTheme(isDark);
            persistTheme(isDark);
        });
    }

    /* ---------- Menú móvil ---------- */
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu-movil');

    function setMenu(open) {
        if (!burger || !menu) return;
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        menu.hidden = !open;
        document.body.style.overflow = open ? 'hidden' : '';
    }

    if (burger && menu) {
        burger.addEventListener('click', function () {
            setMenu(burger.getAttribute('aria-expanded') !== 'true');
        });

        menu.addEventListener('click', function (event) {
            if (event.target.closest('a')) setMenu(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                burger.focus();
            }
        });
    }

    /* ---------- Arranque ---------- */
    function relayout() {
        fitMasthead();
    }

    relayout();

    /* La fuente de display cambia el ancho del texto: hay que volver a
       medir cuando la webfont esté realmente cargada, no solo cuando
       el navegador termine lo que ya había solicitado. */
    if (document.fonts) {
        if (document.fonts.load) {
            document.fonts.load('800 125% 100px Archivo').then(relayout, relayout);
        }
        if (document.fonts.ready) {
            document.fonts.ready.then(relayout, relayout);
        }
        if (document.fonts.addEventListener) {
            document.fonts.addEventListener('loadingdone', relayout);
        }
    }

    window.addEventListener('load', relayout);

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(relayout, 120);
    });
})();
