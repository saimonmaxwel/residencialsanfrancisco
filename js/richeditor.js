/* ============================================================
   js/richeditor.js — Editor de texto rico (WYSIWYG) leve
   Uso: const ed = new RichEditor('idDoTextarea');
        ed.getValue()   → retorna HTML
        ed.setValue(html)
        ed.clear()
   ============================================================ */

'use strict';

class RichEditor {

  constructor(id) {
    this.ta = typeof id === 'string' ? document.getElementById(id) : id;
    if (!this.ta) return;
    this._savedRange = null;
    this._build();
  }

  /* ── Montagem do componente ─────────────────────────────── */
  _build() {
    const wrap = document.createElement('div');
    wrap.className = 'rte-wrap';

    const tb = this._makeToolbar();
    this.toolbar = tb;

    const ed = document.createElement('div');
    ed.className     = 'rte-editor';
    ed.contentEditable = 'true';
    ed.spellcheck    = true;
    ed.innerHTML     = this.ta.value || '';
    this.editable    = ed;
    this.wrap        = wrap;

    wrap.appendChild(tb);
    wrap.appendChild(ed);
    this.ta.insertAdjacentElement('beforebegin', wrap);
    this.ta.style.display = 'none';

    /* Sincroniza de volta ao textarea oculto */
    ed.addEventListener('input', () => { this.ta.value = ed.innerHTML; });

    /* Atualiza estado ativo dos botões */
    ed.addEventListener('keyup',   () => this._refreshState());
    ed.addEventListener('mouseup', () => this._refreshState());

    /* Cole apenas texto simples para não trazer estilos externos */
    ed.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  /* ── Criação da barra de ferramentas ────────────────────── */
  _makeToolbar() {
    const tb = document.createElement('div');
    tb.className = 'rte-toolbar';

    const items = [
      /* Formatação básica */
      { type:'btn', cmd:'bold',          html:'<b>N</b>',        title:'Negrito (Ctrl+B)' },
      { type:'btn', cmd:'italic',        html:'<i>I</i>',        title:'Itálico (Ctrl+I)' },
      { type:'btn', cmd:'underline',     html:'<u>S</u>',        title:'Sublinhado (Ctrl+U)' },
      { type:'btn', cmd:'strikeThrough', html:'<s>T</s>',        title:'Tachado' },
      { type:'sep' },
      /* Fonte e tamanho */
      { type:'select', cmd:'fontName', title:'Fonte', opts:[
          { v:'',                              l:'Fonte…' },
          { v:'Arial, sans-serif',             l:'Arial' },
          { v:"'Trebuchet MS', sans-serif",    l:'Trebuchet MS' },
          { v:'Georgia, serif',                l:'Georgia' },
          { v:"'Times New Roman', serif",      l:'Times New Roman' },
          { v:"'Courier New', monospace",      l:'Courier New' },
          { v:'Verdana, sans-serif',           l:'Verdana' },
      ]},
      { type:'select', cmd:'fontSize', title:'Tamanho', opts:[
          { v:'',  l:'Tamanho…' },
          { v:'1', l:'Pequeno'  },
          { v:'3', l:'Normal'   },
          { v:'4', l:'Grande'   },
          { v:'5', l:'Maior'    },
          { v:'6', l:'Grande+'  },
          { v:'7', l:'Enorme'   },
      ]},
      { type:'sep' },
      /* Cores */
      { type:'color', cmd:'foreColor',   label:'A',  title:'Cor do texto',  def:'#1d4ed8' },
      { type:'color', cmd:'hiliteColor', label:'M',  title:'Cor de fundo / marcador', def:'#fef08a' },
      { type:'sep' },
      /* Alinhamento */
      { type:'btn', cmd:'justifyLeft',   html:'⬚L', title:'Alinhar à esquerda' },
      { type:'btn', cmd:'justifyCenter', html:'⬚C', title:'Centralizar' },
      { type:'btn', cmd:'justifyRight',  html:'⬚R', title:'Alinhar à direita' },
      { type:'sep' },
      /* Listas */
      { type:'btn', cmd:'insertUnorderedList', html:'• &nbsp;Lista', title:'Lista com marcadores' },
      { type:'btn', cmd:'insertOrderedList',   html:'1. Lista',      title:'Lista numerada' },
      { type:'sep' },
      /* Link e limpar */
      { type:'btn', cmd:'createLink',   html:'🔗',      title:'Inserir link' },
      { type:'btn', cmd:'removeFormat', html:'✕ fmt',   title:'Remover formatação' },
    ];

    for (const item of items) {
      if (item.type === 'sep') {
        const s = document.createElement('span');
        s.className = 'rte-sep';
        tb.appendChild(s);
        continue;
      }

      if (item.type === 'btn') {
        const btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'rte-btn';
        btn.dataset.cmd = item.cmd;
        btn.innerHTML = item.html;
        btn.title     = item.title;
        btn.addEventListener('mousedown', e => {
          e.preventDefault();          /* evita desfocar o editor */
          this.editable.focus();
          if (item.cmd === 'createLink') {
            const url = prompt('URL do link (ex: https://):');
            if (url) document.execCommand('createLink', false, url);
          } else {
            document.execCommand(item.cmd, false, null);
          }
          this.ta.value = this.editable.innerHTML;
          this._refreshState();
        });
        tb.appendChild(btn);
        continue;
      }

      if (item.type === 'select') {
        const sel = document.createElement('select');
        sel.className   = 'rte-select';
        sel.title       = item.title;
        sel.dataset.cmd = item.cmd;
        for (const o of item.opts) {
          const opt = document.createElement('option');
          opt.value       = o.v;
          opt.textContent = o.l;
          sel.appendChild(opt);
        }
        /* Salva a seleção antes de abrir o dropdown */
        sel.addEventListener('mousedown', () => this._saveRange());
        sel.addEventListener('change', () => {
          if (!sel.value) return;
          this._restoreRange();
          document.execCommand(item.cmd, false, sel.value);
          this.ta.value = this.editable.innerHTML;
          sel.value = '';           /* reseta para o placeholder */
          this._refreshState();
        });
        tb.appendChild(sel);
        continue;
      }

      if (item.type === 'color') {
        const lbl = document.createElement('label');
        lbl.className = 'rte-color-label';
        lbl.title     = item.title;

        const preview = document.createElement('span');
        preview.className   = 'rte-color-preview';
        preview.textContent = item.label;

        const inp = document.createElement('input');
        inp.type      = 'color';
        inp.value     = item.def;
        inp.className = 'rte-color-input';
        inp.dataset.cmd = item.cmd;

        /* Salva seleção ao clicar no seletor de cor */
        inp.addEventListener('focus', () => this._saveRange());
        inp.addEventListener('change', () => {
          preview.style.borderBottomColor = inp.value;
          this._restoreRange();
          document.execCommand(item.cmd, false, inp.value);
          this.ta.value = this.editable.innerHTML;
        });

        lbl.appendChild(preview);
        lbl.appendChild(inp);
        tb.appendChild(lbl);
        continue;
      }
    }

    return tb;
  }

  /* ── Helpers de seleção ─────────────────────────────────── */
  _saveRange() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this._savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  _restoreRange() {
    if (!this._savedRange) { this.editable.focus(); return; }
    const sel = window.getSelection();
    try {
      sel.removeAllRanges();
      sel.addRange(this._savedRange);
    } catch (_) {}
    this.editable.focus();
  }

  /* Acende/apaga botões conforme o estado da seleção atual */
  _refreshState() {
    const stateCmds = ['bold','italic','underline','strikeThrough',
                       'justifyLeft','justifyCenter','justifyRight',
                       'insertUnorderedList','insertOrderedList'];
    stateCmds.forEach(cmd => {
      const btn = this.toolbar.querySelector(`[data-cmd="${cmd}"]`);
      if (!btn) return;
      try { btn.classList.toggle('active', document.queryCommandState(cmd)); } catch (_) {}
    });
  }

  /* ── API pública ────────────────────────────────────────── */
  getValue() {
    return this.editable.innerHTML;
  }

  setValue(html) {
    this.editable.innerHTML = html || '';
    this.ta.value           = html || '';
  }

  clear() {
    this.setValue('');
  }

  /* Retorna texto puro (útil para validação de "campo vazio") */
  getTextContent() {
    return this.editable.innerText.trim();
  }
}
