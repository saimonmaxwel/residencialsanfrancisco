/* ============================================================
   script.js — Condomínio Residencial San Francisco
   ============================================================ */

'use strict';

/* ============================================================
   1. ELEMENTOS GLOBAIS
   ============================================================ */
const header          = document.getElementById('header');
const hamburger       = document.getElementById('hamburger');
const mobileNav       = document.getElementById('mobileNav');
const searchInput     = document.getElementById('searchInput');
const searchMobile    = document.getElementById('searchInputMobile');
const clearBtn        = document.getElementById('clearSearch');
const searchBanner    = document.getElementById('searchBanner');
const searchCount     = document.getElementById('searchCount');
const clearBannerBtn  = document.getElementById('clearSearchBanner');
const backToTopBtn    = document.getElementById('backToTop');
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const rulesGrid       = document.getElementById('rulesGrid');

/* ============================================================
   2. HAMBURGER / MENU MOBILE
   ============================================================ */
hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
});

// Fecha o menu ao clicar em qualquer link do menu mobile
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

function closeMobileMenu() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
}

// Fecha o menu ao clicar fora dele
document.addEventListener('click', e => {
    if (!header.contains(e.target)) closeMobileMenu();
});

/* ============================================================
   3. NAVEGAÇÃO ATIVA NO SCROLL
   Destaca o link do menu que corresponde à seção visível
   ============================================================ */
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const headerH   = () => parseInt(getComputedStyle(document.documentElement)
                                 .getPropertyValue('--header-h')) || 68;

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { rootMargin: `-${headerH()}px 0px -55% 0px`, threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   4. ACCORDION DAS REGRAS
   Clique no cabeçalho de uma regra para expandir/recolher
   ============================================================ */
function toggleRule(headerEl) {
    const card   = headerEl.closest('.rule-card');
    const isOpen = card.classList.contains('open');

    // Fecha todos os outros abertos
    document.querySelectorAll('.rule-card.open').forEach(c => c.classList.remove('open'));

    // Abre o atual (se estava fechado)
    if (!isOpen) card.classList.add('open');
}

/* ============================================================
   5. FILTRO DE CATEGORIAS DAS REGRAS
   ============================================================ */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Atualiza botão ativo
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Mostra/oculta cards de regra
        document.querySelectorAll('.rule-card').forEach(card => {
            const matches = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('hidden', !matches);
            if (!matches) card.classList.remove('open');
        });
    });
});

// Atalho: cards de início com data-filter-on-click ativam o filtro ao chegar nas regras
document.querySelectorAll('.quick-card[data-filter-on-click]').forEach(card => {
    card.addEventListener('click', () => {
        const filter = card.dataset.filterOnClick;
        setTimeout(() => {
            const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
            if (btn) btn.click();
        }, 700);
    });
});

/* ============================================================
   6. BUSCA GLOBAL
   Filtra todos os elementos com [data-searchable]
   ============================================================ */
function getSearchables() {
    return document.querySelectorAll('[data-searchable]');
}

// Remove acentos para busca sem sensibilidade a acentuação
function normalize(str) {
    return str.toLowerCase()
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '');
}

function runSearch(query) {
    const term = normalize(query.trim());

    if (!term) {
        clearSearch();
        return;
    }

    let count = 0;

    getSearchables().forEach(item => {
        const text    = normalize(item.innerText || item.textContent || '');
        const matches = text.includes(term);

        item.style.display = matches ? '' : 'none';

        if (matches) {
            count++;
            // Abre accordion automaticamente se for regra
            if (item.classList.contains('rule-card')) item.classList.add('open');
        }
    });

    // Atualiza banner de resultados
    searchBanner.classList.remove('hidden');
    searchCount.textContent = count === 0
        ? `Nenhum resultado encontrado para "${query}".`
        : `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''} para "${query}".`;

    // Reseta filtro de categorias para "Todas"
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
}

function clearSearch() {
    // Reexibe todos os elementos pesquisáveis
    getSearchables().forEach(item => {
        item.style.display = '';
        item.classList.remove('no-match');
    });

    // Fecha acordeons que foram abertos pela busca
    document.querySelectorAll('.rule-card.open').forEach(c => c.classList.remove('open'));

    // Oculta banner
    searchBanner.classList.add('hidden');

    // Limpa ambos os campos de busca
    searchInput.value    = '';
    searchMobile.value   = '';
}

// Debounce: espera 250ms antes de buscar (evita busca a cada tecla)
let searchTimer;
function onSearchInput(e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(e.target.value), 250);
}

searchInput.addEventListener('input',  onSearchInput);
searchMobile.addEventListener('input', e => {
    // Sincroniza campo desktop com mobile
    searchInput.value = e.target.value;
    onSearchInput(e);
});

// Sincroniza campo mobile ao abrir o menu
hamburger.addEventListener('click', () => {
    setTimeout(() => { searchMobile.value = searchInput.value; }, 50);
});

clearBtn.addEventListener('click',       clearSearch);
clearBannerBtn.addEventListener('click', clearSearch);

/* ============================================================
   7. BOTÃO VOLTAR AO TOPO
   ============================================================ */
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 350);
}, { passive: true });

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   8. SMOOTH SCROLL com offset do header fixo
   (fallback para browsers que não respeitam scroll-padding)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerH();
        window.scrollTo({ top, behavior: 'smooth' });

        // Fecha menu mobile se aberto
        closeMobileMenu();
    });
});

/* ============================================================
   9. GALERIA / LIGHTBOX
   ============================================================ */
function openLightbox(galleryItem) {
    const img     = galleryItem.querySelector('img');
    const caption = galleryItem.querySelector('.gallery-caption');

    // Se a imagem carregou, usa ela; senão mostra só a legenda
    if (img && img.complete && img.naturalWidth > 0) {
        lightboxImg.src     = img.src;
        lightboxImg.alt     = img.alt;
        lightboxImg.style.display = '';
    } else {
        lightboxImg.style.display = 'none';
    }

    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Limpa src após a animação
    setTimeout(() => { lightboxImg.src = ''; }, 300);
}

/* ============================================================
   10. TRATAMENTO GLOBAL DE IMAGENS COM ERRO
   Exibe o emoji placeholder quando a imagem não carrega
   ============================================================ */
function imgFallback(img) {
    img.style.display = 'none';
    const placeholder = img.closest('[class*="wrap"], .gallery-item')
                           ?.querySelector('[class*="placeholder"]');
    if (placeholder) placeholder.style.display = 'flex';
}

/* ============================================================
   11. ANIMAÇÃO FADE-UP AO ROLAR
   Cards entram suavemente conforme o usuário rola a página
   ============================================================ */
const fadeItems = document.querySelectorAll(
    '.aviso-card, .waste-card, .gallery-item, .rule-card'
);

fadeItems.forEach(el => el.classList.add('fade-up'));

const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

fadeItems.forEach(el => fadeObserver.observe(el));

/* ============================================================
   12. ATALHOS DE TECLADO
   ============================================================ */
document.addEventListener('keydown', e => {
    // ESC — fecha lightbox ou limpa busca
    if (e.key === 'Escape') {
        if (lightbox.classList.contains('open')) {
            closeLightbox();
        } else if (searchInput.value) {
            clearSearch();
        }
    }

    // Ctrl+F ou "/" foca o campo de busca
    if (
        (e.ctrlKey && e.key === 'f') ||
        (e.key === '/' && document.activeElement.tagName !== 'INPUT' &&
                         document.activeElement.tagName !== 'TEXTAREA')
    ) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
});
