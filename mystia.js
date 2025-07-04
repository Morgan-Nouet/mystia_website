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
        link.addEventListener('click', function (e) {
            closeMenu();
            // Pour certains navigateurs mobiles récalcitrants :
            window.location.href = this.getAttribute('href');
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

//ANG SWITCH JS + TRADUCTIONS 
const translations = window.translations;


function updateLangBtn(lang) {
    const flagIcon = document.getElementById('flagIcon');
    if (flagIcon) {
        if (lang === 'fr') {
            // Quand on est en français, on propose de passer à l’anglais
            flagIcon.innerHTML = 'EN <img src="img/gb.svg" alt="UK flag" style="height:1.2em;vertical-align:middle;">';
        } else {
            // Quand on est en anglais, on propose de passer au français
            flagIcon.innerHTML = 'FR <img src="img/fr.svg" alt="Drapeau français" style="height:1.2em;vertical-align:middle;">';
        }
    }
}


let currentLang = localStorage.getItem('mystiaLang') || (navigator.language.startsWith("en") ? "en" : "fr");
function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    updateLangBtn(lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let html = translations[lang][key];
        if (html) el.innerHTML = html;
    });
}




document.getElementById('langBtn').addEventListener('click', function () {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    localStorage.setItem('mystiaLang', newLang);
    setLang(newLang);
});

setLang(currentLang);

//STARS BACKGROUND
(function () {
    const canvas = document.getElementById('bg-stars');
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    let stars = [];
    let shootingStars = [];
    let nextShooting = Date.now() + 2000 + Math.random() * 4000;

    const STAR_COUNT = Math.max(120, Math.floor(w * h / 2500));

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    }

    function addShootingStar() {
        const fromLeft = Math.random() > 0.5;
        const yStart = Math.random() * h * 0.5 + h * 0.1;
        const length = 800 + Math.random() * 800;
        shootingStars.push({
            x: fromLeft ? -50 : w + 50,
            y: yStart,
            vx: fromLeft ? 7 + Math.random() * 5 : -(7 + Math.random() * 5),
            vy: 2 + Math.random() * 1.5,
            alpha: 1,
            length: length,
            traveled: 0,
            width: 2 + Math.random() * 2
        });
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 0.8 + 0.3,
                vx: (Math.random() - 0.5) * 0.20,
                vy: (Math.random() - 0.5) * 0.20,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            ctx.save();
            ctx.globalAlpha = s.opacity;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "#fffbe8";
            ctx.shadowColor = "#fffbe8";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();

            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = w;
            if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h;
            if (s.y > h) s.y = 0;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let s = shootingStars[i];
            ctx.save();
            ctx.globalAlpha = s.alpha;
            let grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
            grad.addColorStop(0, "#fffbe8");
            grad.addColorStop(1, "rgba(255,255,230,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = s.width;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
            ctx.stroke();
            ctx.restore();

            s.x += s.vx;
            s.y += s.vy;
            s.traveled += Math.sqrt(s.vx * s.vx + s.vy * s.vy);
            s.alpha -= 0.008;

            if (s.traveled > s.length || s.alpha <= 0) shootingStars.splice(i, 1);
        }

        if (Date.now() > nextShooting) {
            addShootingStar();
            nextShooting = Date.now() + 4000 + Math.random() * 4000;
        }

        requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', function () {
        resize();
        createStars();
    });

    resize();
    createStars();
    drawStars();
})();

// Met à jour l'onglet actif en fonction de la page
(function () {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.nav-desktop a').forEach(link => {
        // Pour que "index.html" ET "/" soient actifs sur la home
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

