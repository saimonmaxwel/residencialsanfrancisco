/* ============================================================
   js/nav.js — Componente de navegação compartilhado
   Chame NAV.inject() em cada página pública para montar
   o header e o footer dinamicamente com dados do localStorage.
   ============================================================ */

'use strict';

const NAV = {

  /* Detecta qual página está ativa pelo nome do arquivo */
  _activePage() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    return { 'index.html':'inicio', '':'inicio',
             'avisos.html':'avisos', 'regras.html':'regras',
             'descarte.html':'descarte', 'galeria.html':'galeria' }[file] || 'inicio';
  },

  /* Gera um link de nav com classe 'active' quando corresponde */
  _lnk(href, key, label, active) {
    return `<a href="${href}" class="nav-link${active === key ? ' active' : ''}">${label}</a>`;
  },
  _mlnk(href, key, label, active) {
    return `<a href="${href}" class="mobile-nav-link${active === key ? ' active' : ''}">${label}</a>`;
  },

  /* Injeta o header + footer na página */
  inject() {
    const cfg    = DB.get('config');
    const active = this._activePage();
    const L      = (h,k,l) => this._lnk(h,k,l,active);
    const M      = (h,k,l) => this._mlnk(h,k,l,active);

    /* ── Header ───────────────────────────────────────── */
    const navRoot = document.getElementById('nav-root');
    if (navRoot) {
      navRoot.outerHTML = `
<header class="header" id="header">
  <div class="header-inner">
    <a href="index.html" class="logo">
      ${cfg.logo
        ? `<img src="${cfg.logo}" class="logo-img" alt="Logo do condomínio">`
        : `<span class="logo-icon">🏢</span>`}
      <div class="logo-text">
        <span class="logo-title">${cfg.nome}</span>
        <span class="logo-subtitle">Central de Informações</span>
      </div>
    </a>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="🔍 Buscar..." autocomplete="off">
      <button id="clearSearch" class="clear-btn" aria-label="Limpar busca">✕</button>
    </div>
    <nav class="nav" aria-label="Menu principal">
      ${L('index.html',    'inicio',   '🏠 Início')}
      ${L('avisos.html',   'avisos',   '📢 Avisos')}
      ${L('regras.html',   'regras',   '📋 Regras')}
      ${L('descarte.html', 'descarte', '♻️ Descarte')}
      ${L('galeria.html',  'galeria',  '📷 Galeria')}
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="mobile-nav" id="mobileNav" aria-label="Menu mobile">
    <div class="mobile-nav-search">
      <input type="text" id="searchInputMobile" placeholder="🔍 Buscar..." autocomplete="off">
    </div>
    ${M('index.html',    'inicio',   '🏠 Início')}
    ${M('avisos.html',   'avisos',   '📢 Avisos')}
    ${M('regras.html',   'regras',   '📋 Regras')}
    ${M('descarte.html', 'descarte', '♻️ Descarte')}
    ${M('galeria.html',  'galeria',  '📷 Galeria')}
  </nav>
</header>
<div id="searchBanner" class="search-banner hidden">
  <div class="container search-banner-inner">
    <span id="searchCount"></span>
    <button id="clearSearchBanner">✕ Limpar busca</button>
  </div>
</div>`;
    }

    /* ── Footer ───────────────────────────────────────── */
    const footerRoot = document.getElementById('footer-root');
    if (footerRoot) {
      footerRoot.outerHTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>🏢 ${cfg.nome}</h4>
        <p>Central de informações do condomínio. Dúvidas? Fale com a administração.</p>
      </div>
      <div class="footer-col">
        <h4>📞 Contatos</h4>
        <ul>
          <li>Portaria: ${cfg.portaria}</li>
          <li>Síndico: ${cfg.sindico}</li>
          <li>Administradora: ${cfg.administradora}</li>
          <li>WhatsApp: ${cfg.whatsapp}</li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>🚨 Emergências</h4>
        <ul>
          <li>Polícia: 190</li>
          <li>Bombeiros: 193</li>
          <li>SAMU: 192</li>
          <li>Defesa Civil: 199</li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>🔗 Links Rápidos</h4>
        <ul>
          <li><a href="index.html">🏠 Início</a></li>
          <li><a href="avisos.html">📢 Avisos</a></li>
          <li><a href="regras.html">📋 Regras</a></li>
          <li><a href="descarte.html">♻️ Descarte</a></li>
          <li><a href="galeria.html">📷 Galeria</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} ${cfg.nome} — Todos os direitos reservados.</p>
      <button class="footer-admin-link" onclick="openAdminModal()" title="Acesso restrito à administração">
        🔑 Área Administrativa
      </button>
    </div>
  </div>
</footer>`;
    }

    /* ── Modal de login admin ────────────────────────── */
    if (!document.getElementById('adminLoginModal')) {
      document.body.insertAdjacentHTML('beforeend', `
<div id="adminLoginModal" class="adm-modal-overlay" onclick="if(event.target===this)closeAdminModal()">
  <div class="adm-modal-box">
    <button class="adm-modal-close" onclick="closeAdminModal()" aria-label="Fechar">✕</button>
    <div class="adm-modal-icon">🔑</div>
    <h2 class="adm-modal-title">Área Administrativa</h2>
    <p class="adm-modal-sub">Digite a senha para acessar o painel.</p>
    <div id="admLoginError" class="adm-modal-error hidden"></div>
    <input type="password" id="admLoginPass" class="adm-modal-input"
           placeholder="Senha" autocomplete="current-password"
           onkeydown="if(event.key==='Enter')submitAdminLogin()">
    <button class="adm-modal-btn" onclick="submitAdminLogin()">Entrar</button>
    <button class="adm-modal-recover-link" onclick="showAdminRecover()">Esqueci a senha</button>
    <div id="admRecoverSection" class="hidden" style="margin-top:1rem">
      <hr style="margin-bottom:1rem;border-color:#e2e8f0">
      <p class="adm-modal-sub" style="margin-bottom:.5rem">Código de recuperação:</p>
      <input type="text" id="admRecoverCode" class="adm-modal-input" placeholder="Código de recuperação">
      <input type="password" id="admNewPass" class="adm-modal-input" placeholder="Nova senha" style="margin-top:.5rem">
      <button class="adm-modal-btn" onclick="submitAdminRecover()" style="margin-top:.5rem">Redefinir senha</button>
    </div>
  </div>
</div>`);
    }

    /* ── Comportamentos do nav ────────────────────────── */
    this._initBehaviors();
  },

  /* Inicializa hamburger, busca, back-to-top e fade-up */
  _initBehaviors() {
    const hamburger    = document.getElementById('hamburger');
    const mobileNav    = document.getElementById('mobileNav');
    const searchInput  = document.getElementById('searchInput');
    const searchMobile = document.getElementById('searchInputMobile');
    const clearBtn     = document.getElementById('clearSearch');
    const banner       = document.getElementById('searchBanner');
    const countEl      = document.getElementById('searchCount');
    const clearBanner  = document.getElementById('clearSearchBanner');
    const btt          = document.getElementById('backToTop');

    /* Hamburger */
    hamburger?.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.mobile-nav-link').forEach(l =>
      l.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
      })
    );
    document.addEventListener('click', e => {
      const hdr = document.getElementById('header');
      if (hdr && !hdr.contains(e.target)) {
        mobileNav?.classList.remove('open');
        hamburger?.classList.remove('open');
      }
    });

    /* Busca */
    let timer;
    const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

    const doSearch = q => {
      const term = normalize(q.trim());
      if (!term) { clearSearch(); return; }
      let n = 0;
      document.querySelectorAll('[data-searchable]').forEach(el => {
        const match = normalize(el.innerText || '').includes(term);
        el.style.display = match ? '' : 'none';
        if (match) n++;
      });
      if (banner) {
        banner.classList.remove('hidden');
        countEl.textContent = n
          ? `${n} resultado${n !== 1 ? 's' : ''} para "${q}"`
          : `Nenhum resultado para "${q}"`;
      }
    };

    const clearSearch = () => {
      document.querySelectorAll('[data-searchable]').forEach(el => el.style.display = '');
      banner?.classList.add('hidden');
      if (searchInput)  searchInput.value  = '';
      if (searchMobile) searchMobile.value = '';
    };

    [searchInput, searchMobile].forEach(inp => {
      inp?.addEventListener('input', e => {
        if (inp !== searchInput  && searchInput)  searchInput.value  = e.target.value;
        if (inp !== searchMobile && searchMobile) searchMobile.value = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(() => doSearch(e.target.value), 250);
      });
    });

    clearBtn?.addEventListener('click',    clearSearch);
    clearBanner?.addEventListener('click', clearSearch);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && searchInput?.value) clearSearch();
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault(); searchInput?.focus();
      }
    });

    /* Back to top */
    window.addEventListener('scroll', () =>
      btt?.classList.toggle('visible', window.scrollY > 350),
      { passive: true }
    );

    /* Fade-up */
    const fadeObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); fadeObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));
  }
};

/* ── Funções globais do modal admin ──────────────────────────── */
function openAdminModal() {
  if (sessionStorage.getItem('condo_session') === 'ok') {
    window.location.href = 'admin/index.html';
    return;
  }
  const modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('admLoginPass')?.focus(), 80);
}

function closeAdminModal() {
  const modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  const err = document.getElementById('admLoginError');
  if (err) { err.textContent = ''; err.classList.add('hidden'); }
  const rec = document.getElementById('admRecoverSection');
  if (rec) rec.classList.add('hidden');
  const pass = document.getElementById('admLoginPass');
  if (pass) pass.value = '';
}

function submitAdminLogin() {
  const pass     = document.getElementById('admLoginPass')?.value || '';
  const stored   = localStorage.getItem('condo_admin_pass') || 'admin123';
  const errEl    = document.getElementById('admLoginError');

  if (pass === stored) {
    sessionStorage.setItem('condo_session', 'ok');
    window.location.href = 'admin/index.html';
  } else {
    errEl.textContent = '❌ Senha incorreta. Tente novamente.';
    errEl.classList.remove('hidden');
    const inp = document.getElementById('admLoginPass');
    if (inp) { inp.value = ''; inp.focus(); }
  }
}

function showAdminRecover() {
  document.getElementById('admRecoverSection')?.classList.toggle('hidden');
}

function submitAdminRecover() {
  const code    = document.getElementById('admRecoverCode')?.value.trim() || '';
  const newPass = document.getElementById('admNewPass')?.value || '';
  const stored  = localStorage.getItem('condo_admin_recover') || 'recuperar123';
  const errEl   = document.getElementById('admLoginError');

  if (!code || !newPass) {
    errEl.textContent = '❌ Preencha o código e a nova senha.';
    errEl.classList.remove('hidden');
    return;
  }
  if (code !== stored) {
    errEl.textContent = '❌ Código de recuperação incorreto.';
    errEl.classList.remove('hidden');
    return;
  }
  localStorage.setItem('condo_admin_pass', newPass);
  sessionStorage.setItem('condo_session', 'ok');
  window.location.href = 'admin/index.html';
}

/* Aplica o CSS da barra de rolagem definido nas configurações */
function applyScrollbar() {
  const sb = DB.get('config').scrollbar || {};
  if (!sb.width) return;
  let el = document.getElementById('condo-scrollbar-style');
  if (!el) {
    el = document.createElement('style');
    el.id = 'condo-scrollbar-style';
    document.head.appendChild(el);
  }
  const w = sb.width + 'px';
  const r = (sb.radius || '0') + 'px';
  el.textContent =
    `::-webkit-scrollbar{width:${w}}` +
    `::-webkit-scrollbar-track{background:${sb.trackColor||'#f1f1f1'}}` +
    `::-webkit-scrollbar-thumb{background:${sb.thumbColor||'#888'};border-radius:${r}}` +
    `::-webkit-scrollbar-thumb:hover{background:${sb.thumbHoverColor||'#555'}}` +
    `*{scrollbar-width:auto;scrollbar-color:${sb.thumbColor||'#888'} ${sb.trackColor||'#f1f1f1'}}`;
}
applyScrollbar();

/* Utilitário global para fallback de imagem */
function imgFallback(img) {
  img.style.display = 'none';
  const wrap = img.closest('[class*="wrap"], [class*="img-wrap"], .gallery-item');
  const ph   = wrap?.querySelector('[class*="placeholder"]');
  if (ph) ph.style.display = 'flex';
}
