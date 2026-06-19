//STARS BACKGROUND - Flutter Style
(function () {
    const canvas = document.getElementById('bg-stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    let stars = [];
    let animationValue = 0;
    let shootingStar = null;
    let shootingStarProgress = 0;
    let shootingStarActive = false;

    const isHomePage = window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/');
    const STAR_COUNT = isHomePage ? 80 : 30;

    // Couleurs du gradient Flutter
    const gradientColors = isHomePage
        ? ['#0a3050', '#115083', '#318aad', '#115083', '#0a3050']
        : ['#318aad', '#165b94', '#061e31'];
    const gradientStops = isHomePage
        ? [0.0, 0.25, 0.5, 0.75, 1.0]
        : [0, 0.4, 0.9];

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    }

    // Générer les étoiles avec détection de collision
    function generateStars() {
        stars = [];
        const maxAttempts = 1000;

        for (let i = 0; i < STAR_COUNT; i++) {
            let newStar = null;
            let attempts = 0;

            while (newStar === null && attempts < maxAttempts) {
                const candidateX = Math.random();
                const candidateY = Math.random();
                const candidateSize = Math.random() * 4 + 1; // Taille entre 1 et 5

                const candidate = {
                    x: candidateX,
                    y: candidateY,
                    size: candidateSize,
                    opacity: Math.random() * 0.8 + 0.2,
                    animationOffset: Math.random() * 2 * Math.PI
                };

                // Vérifier les collisions
                let hasCollision = false;
                for (const existingStar of stars) {
                    if (starsCollide(candidate, existingStar)) {
                        hasCollision = true;
                        break;
                    }
                }

                if (!hasCollision) {
                    newStar = candidate;
                }
                attempts++;
            }

            if (newStar) {
                stars.push(newStar);
            }
        }
    }

    function starsCollide(star1, star2) {
        const distance = Math.sqrt(
            Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
        );
        const minDistance = (star1.size + star2.size) * 0.015 + 0.02;
        return distance < minDistance;
    }

    // Dessiner une étoile en forme de croix à 4 branches
    function drawCrossStar(x, y, size, opacity) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        const outerRadius = size * 1.2;
        const innerRadius = size * 0.4;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4);
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Créer une étoile filante
    function createShootingStar() {
        let startX, startY, endX, endY;
        const direction = Math.floor(Math.random() * 4);

        switch (direction) {
            case 0: // Du haut gauche vers bas droite
                startX = -0.2;
                startY = Math.random() * 0.3;
                endX = 1.2;
                endY = startY + 0.7 + Math.random() * 0.3;
                break;
            case 1: // Du haut droite vers bas gauche
                startX = 1.2;
                startY = Math.random() * 0.3;
                endX = -0.2;
                endY = startY + 0.7 + Math.random() * 0.3;
                break;
            case 2: // Du haut vers bas (légèrement incliné)
                startX = 0.2 + Math.random() * 0.6;
                startY = -0.1;
                endX = startX + (Math.random() - 0.5) * 0.4;
                endY = 1.1;
                break;
            default: // Diagonal classique
                startX = -0.1;
                startY = 0.1 + Math.random() * 0.3;
                endX = 1.1;
                endY = startY + 0.5 + Math.random() * 0.4;
        }

        shootingStar = {
            startX, startY, endX, endY,
            length: 0.08 + Math.random() * 0.04
        };
        shootingStarProgress = 0;
        shootingStarActive = true;
    }

    // Dessiner l'étoile filante
    function drawShootingStar() {
        if (!shootingStar || !shootingStarActive) return;

        const currentX = shootingStar.startX + (shootingStar.endX - shootingStar.startX) * shootingStarProgress;
        const currentY = shootingStar.startY + (shootingStar.endY - shootingStar.startY) * shootingStarProgress;

        const trailStartX = currentX - (shootingStar.endX - shootingStar.startX) * shootingStar.length;
        const trailStartY = currentY - (shootingStar.endY - shootingStar.startY) * shootingStar.length;

        const currentPos = { x: currentX * w, y: currentY * h };
        const trailStartPos = { x: trailStartX * w, y: trailStartY * h };

        // Calculer l'opacité (fade out à la fin)
        const opacity = shootingStarProgress < 0.8 ? 1.0 : (1.0 - shootingStarProgress) / 0.2;

        // Dessiner la traînée avec gradient
        const gradient = ctx.createLinearGradient(trailStartPos.x, trailStartPos.y, currentPos.x, currentPos.y);
        gradient.addColorStop(0, `rgba(255, 221, 142, 0)`);
        gradient.addColorStop(0.7, `rgba(255, 221, 142, ${0.5 * opacity})`);
        gradient.addColorStop(1, `rgba(255, 221, 142, ${opacity})`);

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(trailStartPos.x, trailStartPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        // Dessiner la tête
        ctx.fillStyle = `rgba(255, 221, 142, ${opacity})`;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Halo
        ctx.fillStyle = `rgba(255, 221, 142, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Dessiner le fond avec gradient diagonal
    function drawBackground() {
        let gradient;
        if (isHomePage) {
            gradient = ctx.createLinearGradient(0, 0, w, h);
        } else {
            gradient = ctx.createLinearGradient(w / 2, 0, w / 2, h);
        }

        for (let i = 0; i < gradientColors.length; i++) {
            gradient.addColorStop(gradientStops[i], gradientColors[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    // Animation principale
    let lastTime = 0;
    const animationDuration = 3000; // 3 secondes pour un cycle complet
    const shootingStarDuration = 1500; // 1.5 secondes pour l'étoile filante

    function draw(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;

        // Mettre à jour l'animation de scintillement
        animationValue = (animationValue + delta / animationDuration) % 1;

        // Mettre à jour l'étoile filante
        if (shootingStarActive) {
            shootingStarProgress += delta / shootingStarDuration;
            if (shootingStarProgress >= 1) {
                shootingStarActive = false;
                shootingStar = null;
            }
        }

        lastTime = timestamp;

        // Dessiner le fond
        drawBackground();

        // Dessiner les étoiles
        for (const star of stars) {
            const animatedOpacity = star.opacity * (0.3 + 0.7 * (1 + Math.sin(animationValue * 2 * Math.PI + star.animationOffset)) / 2);
            drawCrossStar(star.x * w, star.y * h, star.size, animatedOpacity);
        }

        // Dessiner l'étoile filante
        drawShootingStar();

        requestAnimationFrame(draw);
    }

    // Programmer les étoiles filantes (seulement sur la page d'accueil)
    function scheduleShootingStar() {
        if (!isHomePage) return;
        const delay = 5000 + Math.random() * 5000; // 5-10 secondes
        setTimeout(() => {
            createShootingStar();
            scheduleShootingStar();
        }, delay);
    }

    window.addEventListener('resize', function () {
        resize();
        generateStars();
    });

    resize();
    generateStars();
    scheduleShootingStar();
    requestAnimationFrame(draw);
})();

//LANG SWITCH JS + TRADUCTIONS 
const translations = window.translations;

// Langues disponibles + ordre d'affichage dans le menu déroulant
const LANG_ORDER = ['fr', 'en', 'ro'];
const LANGS = {
    fr: { label: 'FR', flag: 'img/fr.svg', alt: 'Drapeau français' },
    en: { label: 'EN', flag: 'img/gb.svg', alt: 'UK flag' },
    ro: { label: 'RO', flag: 'img/ro.svg', alt: 'Drapeau roumain' },
};

function updateLangBtn(lang) {
    const flagIcon = document.getElementById('flagIcon');
    if (flagIcon) {
        const info = LANGS[lang] || LANGS.fr;
        flagIcon.innerHTML = `${info.label} <img src="${info.flag}" alt="${info.alt}" style="height:1.2em;vertical-align:middle;"> <span class="lang-caret" aria-hidden="true">▾</span>`;
    }
    // Met en évidence la langue active dans le menu déroulant (si présent)
    const menu = document.getElementById('langMenu');
    if (menu) {
        menu.querySelectorAll('[data-lang]').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });
    }
}

// Détermine la langue de départ, par ordre de priorité :
// 1) Paramètre d'URL ?lang=xx (ex. lien ouvert depuis l'app Mystia)
// 2) Choix précédemment mémorisé par l'utilisateur
// 3) Langue du navigateur
// 4) Français par défaut
function detectInitialLang() {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang && LANG_ORDER.includes(urlLang)) {
        localStorage.setItem('mystiaLang', urlLang); // mémorise pour la navigation suivante
        return urlLang;
    }
    const stored = localStorage.getItem('mystiaLang');
    if (stored && LANG_ORDER.includes(stored)) {
        return stored;
    }
    const navLang = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    if (LANG_ORDER.includes(navLang)) {
        return navLang;
    }
    return 'fr';
}

let currentLang = detectInitialLang();

function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    updateLangBtn(lang);

    // Traductions texte
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations && translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Traductions images (src)
    document.querySelectorAll('[data-i18n-src]').forEach(el => {
        const key = el.getAttribute('data-i18n-src');
        if (translations && translations[lang] && translations[lang][key]) {
            el.src = translations[lang][key];
        }
    });
}

const langBtn = document.getElementById('langBtn');
if (langBtn) {
    // Enveloppe le bouton dans un conteneur positionné pour ancrer le menu
    const dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    langBtn.parentNode.insertBefore(dropdown, langBtn);
    dropdown.appendChild(langBtn);

    langBtn.setAttribute('aria-haspopup', 'true');
    langBtn.setAttribute('aria-expanded', 'false');

    // Construit le menu déroulant des langues
    const menu = document.createElement('div');
    menu.className = 'lang-menu hide';
    menu.id = 'langMenu';
    menu.setAttribute('role', 'menu');

    function openLangMenu() {
        menu.classList.remove('hide');
        langBtn.setAttribute('aria-expanded', 'true');
    }
    function closeLangMenu() {
        menu.classList.add('hide');
        langBtn.setAttribute('aria-expanded', 'false');
    }

    function chooseLang(code) {
        closeLangMenu();
        if (code === currentLang) return;
        localStorage.setItem('mystiaLang', code);
        // Sur les pages avec un PDF dépendant de la langue (CGU, confidentialité),
        // on recharge pour re-générer le document dans la nouvelle langue.
        if (document.getElementById('pdf-container')) {
            location.reload();
        } else {
            setLang(code);
        }
    }

    LANG_ORDER.forEach(code => {
        const info = LANGS[code];
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'lang-option';
        item.setAttribute('data-lang', code);
        item.setAttribute('role', 'menuitem');
        item.innerHTML = `<img src="${info.flag}" alt="${info.alt}"><span>${info.label}</span>`;
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            chooseLang(code);
        });
        menu.appendChild(item);
    });
    dropdown.appendChild(menu);

    // Ouvre / ferme le menu au clic sur le bouton
    langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (menu.classList.contains('hide')) openLangMenu();
        else closeLangMenu();
    });

    // Ferme le menu si on clique en dehors
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target)) closeLangMenu();
    });
}

// Initialiser la langue au chargement
setLang(currentLang);

// Met à jour l'onglet actif en fonction de la page
(function () {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.nav-desktop a').forEach(link => {
        const href = link.getAttribute('href');
        if (
            (path === '' && href === 'index.html') ||
            (path === href)
        ) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
})();

//MENU BURGER JS 
const burgerBtn = document.getElementById('burgerBtn');
const navMobile = document.getElementById('navMobile');
if (burgerBtn && navMobile) {
    let menuOpen = false;

    function openMenu() {
        navMobile.classList.remove('hide');
        menuOpen = true;
    }

    function closeMenu() {
        navMobile.classList.add('hide');
        menuOpen = false;
    }

    burgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (menuOpen) closeMenu();
        else openMenu();
    });

    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });

    document.addEventListener('click', function (e) {
        if (menuOpen && !navMobile.contains(e.target) && e.target !== burgerBtn) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 700) closeMenu();
    });

    // Par défaut, menu caché
    navMobile.classList.add('hide');
}