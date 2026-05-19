/* ============================================================
   admin/admin.js — Utilitários compartilhados do painel admin
   Incluído em todas as páginas do admin.
   ============================================================ */

'use strict';

/* ── Autenticação ─────────────────────────────────────────────
   Cada página admin chama adminAuth() no topo do script.
   Se não houver sessão ativa, redireciona para login.html.
   ──────────────────────────────────────────────────────────── */
function adminAuth() {
  if (sessionStorage.getItem('condo_session') !== 'ok') {
    window.location.href = 'login.html';
  }
}

/* ── Toast de notificação ─────────────────────────────────────
   type: 'success' | 'error' | 'info'
   ──────────────────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className   = `adm-toast ${type}`;
  el.textContent = `${icons[type] || ''} ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('fading');
    setTimeout(() => el.remove(), 400);
  }, 2800);
}

/* ── Sidebar móvel ────────────────────────────────────────────
   ──────────────────────────────────────────────────────────── */
function initSidebar() {
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── Link ativo na sidebar ────────────────────────────────────
   ──────────────────────────────────────────────────────────── */
function initActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    link.classList.toggle('active', href === current);
  });
}

/* ── Logout ───────────────────────────────────────────────────
   ──────────────────────────────────────────────────────────── */
function initLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Deseja sair do painel administrativo?')) {
      sessionStorage.removeItem('condo_session');
      window.location.href = '../index.html';
    }
  });
}

/* ── Modal genérico ───────────────────────────────────────────
   Cada página admin gerencia seu próprio modal, mas estas
   funções utilitárias ajudam a abrir/fechar com acessibilidade.
   ──────────────────────────────────────────────────────────── */
function openModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

/* Fecha modal ao clicar no overlay (fora da caixa) */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

/* ── Botão "Voltar ao Site" na topbar ─────────────────────────
   Injetado dinamicamente para não precisar editar cada página.
   ──────────────────────────────────────────────────────────── */
function injectBackToSite() {
  const topbar = document.querySelector('.admin-topbar');
  if (!topbar) return;
  let right = topbar.querySelector('.topbar-right');
  if (!right) {
    right = document.createElement('div');
    right.className = 'topbar-right';
    topbar.appendChild(right);
  }
  if (!right.querySelector('.btn-back-site')) {
    right.insertAdjacentHTML('afterbegin',
      `<a href="../index.html" class="btn btn-ghost btn-sm btn-back-site">← Voltar ao Site</a>`
    );
  }
}

/* ── Sincroniza js/data.js no repositório GitHub ─────────────
   Gera o data.js com os dados atuais e faz commit via API.
   Retorna true em caso de sucesso.
   ──────────────────────────────────────────────────────────── */
async function syncDataJS() {
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem('condo_github') || '{}'); } catch(_) { return false; }
  if (!cfg.token || !cfg.owner || !cfg.repo) return false;

  const branch  = cfg.branch || 'main';
  const path    = 'js/data.js';
  const apiUrl  = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const headers = { 'Authorization': `token ${cfg.token}`, 'Content-Type': 'application/json' };

  try {
    /* Obtém o SHA atual do arquivo (necessário para atualizar) */
    let sha = '';
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
    if (getRes.ok) { sha = (await getRes.json()).sha; }

    /* Monta os dados — remove base64 da galeria (muito grandes para o arquivo) */
    const keys = ['config', 'avisos', 'regras', 'descarte', 'galeria'];
    const data = {};
    keys.forEach(k => { data[k] = DB.get(k); });
    data.galeria = data.galeria.map(item => {
      if (item.src && item.src.startsWith('data:')) {
        const name = (item.alt || item.caption || 'foto')
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return { ...item, src: 'img/' + name + '.jpg' };
      }
      return item;
    });

    const content = `/* ============================================================
   js/data.js — Camada de dados do condomínio
   Sincronizado em: ${new Date().toLocaleString('pt-BR')}
   ============================================================ */

'use strict';

const DEFAULTS = ${JSON.stringify(data, null, 2)};

/* ── Interface de acesso ao banco de dados ───────────────────── */
const DB = {
  get(key) {
    const raw = localStorage.getItem('condo_' + key);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULTS[key]));
  },
  set(key, value) {
    localStorage.setItem('condo_' + key, JSON.stringify(value));
  },
  reset(key) {
    localStorage.removeItem('condo_' + key);
  },
  nextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
  },
  add(key, item) {
    const arr = this.get(key);
    item.id   = this.nextId(arr);
    arr.push(item);
    this.set(key, arr);
    return item;
  },
  update(key, id, data) {
    const arr = this.get(key);
    const idx = arr.findIndex(i => i.id === id);
    if (idx !== -1) { arr[idx] = { ...arr[idx], ...data }; this.set(key, arr); }
  },
  remove(key, id) {
    this.set(key, this.get(key).filter(i => i.id !== id));
  }
};`;

    /* Converte para base64 (necessário pela API do GitHub) */
    const bytes  = new TextEncoder().encode(content);
    let binary   = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    const b64    = btoa(binary);

    const body = { message: 'Sync: atualiza data.js via painel admin', branch, content: b64 };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    return putRes.ok;
  } catch(e) {
    console.warn('syncDataJS falhou:', e);
    return false;
  }
}

/* ── Upload de imagem para o GitHub ───────────────────────────
   Requer configuração em Configurações → GitHub.
   Retorna a URL pública (raw.githubusercontent.com) ou null.
   ──────────────────────────────────────────────────────────── */
async function uploadToGitHub(file, base64Data) {
  let cfg;
  try { cfg = JSON.parse(localStorage.getItem('condo_github') || '{}'); } catch(_) { return null; }
  if (!cfg.token || !cfg.owner || !cfg.repo) return null;

  const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const path     = `img/uploads/${filename}`;
  const branch   = cfg.branch || 'main';

  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { 'Authorization': `token ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Galeria: upload ${filename}`, branch, content: base64Data })
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('GitHub upload erro:', res.status, err.message || '');
      return null;
    }
    return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${branch}/${path}`;
  } catch(e) {
    console.warn('GitHub upload falhou:', e);
    return null;
  }
}

/* ── Inicialização automática ─────────────────────────────────
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initActiveLink();
  initLogout();
  injectBackToSite();
});
