/* ============================================================
   js/data.js — Camada de dados do condomínio
   Todos os dados ficam no localStorage.
   Edite os DEFAULTS para alterar os valores iniciais do site.
   ============================================================ */

'use strict';

/* ── Valores padrão ──────────────────────────────────────────── */
const DEFAULTS = {

  config: {
    nome:            'Residencial San Francisco',
    frase:           'Bem-vindo à central de informações do condomínio. Aqui você encontra regras, orientações, locais de descarte e informações importantes para uma boa convivência.',
    portaria:        '(11) 99999-0000',
    sindico:         '(11) 99999-1111',
    administradora:  '(11) 99999-2222',
    whatsapp:        '(11) 99999-9999',
    logo:            '',
    heroBg:          '',
    scrollbar: {
      width:          '8',
      trackColor:     '#f1f1f1',
      thumbColor:     '#94a3b8',
      thumbHoverColor:'#64748b',
      radius:         '6'
    }
  },

  avisos: [
    { id:1, tipo:'warning', badge:'⚠️ Manutenção',
      titulo:'Manutenção da Bomba d\'Água',
      corpo:'No dia <strong>21/05/2026 (quinta-feira)</strong>, das <strong>08h às 12h</strong>, haverá interrupção no fornecimento de água para manutenção preventiva da bomba. Armazenem água previamente.',
      data:'19/05/2026', tag:'🔧 Infraestrutura' },
    { id:2, tipo:'info', badge:'♻️ Coleta',
      titulo:'Alteração na Coleta de Lixo Reciclável',
      corpo:'A partir de <strong>junho/2026</strong>, a coleta de lixo reciclável será às <strong>terças e quintas-feiras</strong>, às 18h. Deixar recicláveis na área designada até 17h30.',
      data:'15/05/2026', tag:'♻️ Reciclagem' },
    { id:3, tipo:'success', badge:'🎉 Salão',
      titulo:'Reservas do Salão de Festas',
      corpo:'O sistema de reservas foi atualizado. Para reservar, entre em contato pelo <strong>WhatsApp (11) 99999-9999</strong> ou pessoalmente na portaria de seg–sex, 9h às 17h.',
      data:'10/05/2026', tag:'🎊 Eventos' },
    { id:4, tipo:'danger', badge:'🚨 Segurança',
      titulo:'Alerta — Acesso de Visitantes',
      corpo:'<strong>Nenhum visitante deve entrar sem identificação</strong> e confirmação do morador. Em caso de suspeitas, acione a portaria: <strong>(11) 99999-0000</strong>.',
      data:'05/05/2026', tag:'🔒 Segurança' }
  ],

  regras: [
    { id:1,  categoria:'gerais',      icon:'📌', titulo:'Respeito e Boa Convivência',
      descricao:'É dever de todos os moradores manter o respeito, a limpeza e a boa convivência nas áreas comuns. O bem-estar coletivo é responsabilidade de todos.',
      lista:['Em caso de conflito, acione a administração antes de tomar qualquer medida unilateral'],
      importante:'Em caso de conflito entre moradores, acione a administração antes de tomar qualquer medida.' },
    { id:2,  categoria:'gerais',      icon:'🚯', titulo:'Limpeza das Áreas Comuns',
      descricao:'É proibido jogar lixo, bitucas de cigarro ou qualquer objeto nas áreas comuns.',
      lista:['O lixo deve ser descartado nos locais adequados, sempre bem embalado e nos horários permitidos'],
      importante:'Infratores estão sujeitos a multa conforme convenção do condomínio.' },
    { id:3,  categoria:'areas-comuns',icon:'🌳', titulo:'Uso das Áreas Comuns',
      descricao:'As áreas comuns devem ser utilizadas com responsabilidade. Qualquer dano deve ser comunicado imediatamente à administração.',
      lista:['Proibido fumar nas áreas comuns fechadas','Crianças até 12 anos: acompanhamento obrigatório de responsável','Equipamentos da academia: uso com orientação prévia','Proibido jogar bola nas vias de circulação de veículos'],
      importante:'' },
    { id:4,  categoria:'piscina',     icon:'🏊', titulo:'Regras da Piscina',
      descricao:'Uso restrito a moradores e convidados (máx. 2 por apartamento). Horário: 08h às 22h.',
      lista:['Uso obrigatório de touca e traje de banho adequado','Proibido bebidas alcoólicas na beira da piscina','Proibido mergulho de cabeça (raso)','Crianças até 12 anos: responsável obrigatório','Animais não permitidos na área da piscina'],
      importante:'O condomínio não se responsabiliza por acidentes decorrentes do descumprimento das regras.' },
    { id:5,  categoria:'salao',       icon:'🎊', titulo:'Reserva e Uso do Salão',
      descricao:'Reserva com antecedência mínima de 3 dias. O morador responsável deve estar presente durante todo o evento.',
      lista:['Horário: 10h–23h (seg–sex) | 10h–00h (fins de semana)','Capacidade máxima: 80 pessoas','Limpeza pós-evento: responsabilidade do locatário','Danos ao salão são cobrados do responsável','Proibido fogos de artifício dentro do condomínio'],
      importante:'Reservas: WhatsApp (11) 99999-9999 ou na portaria de seg–sex.' },
    { id:6,  categoria:'garagem',     icon:'🚗', titulo:'Uso da Garagem',
      descricao:'Vagas apenas para veículos autorizados. Proibido estacionar em vagas alheias ou áreas de circulação.',
      lista:['Velocidade máxima: 10 km/h','Proibido lavar veículos sem autorização prévia','Proibido armazenar objetos fora dos limites da vaga','Motocicletas: usar vagas designadas','Portão: manter fechado após passagem'],
      importante:'Veículos em local proibido serão notificados e multados conforme convenção.' },
    { id:7,  categoria:'animais',     icon:'🐾', titulo:'Animais de Estimação',
      descricao:'Animais são bem-vindos, desde que tutores sigam as regras de convivência.',
      lista:['Guia obrigatória nas áreas comuns','Obrigatório recolher fezes em qualquer área do condomínio','Não permitidos na piscina nem no salão de festas','Grande porte: focinheira obrigatória nas áreas comuns','Barulho no horário de silêncio deve ser controlado'],
      importante:'O tutor responde por danos causados pelo animal a terceiros ou ao patrimônio.' },
    { id:8,  categoria:'silencio',    icon:'🔇', titulo:'Horário de Silêncio',
      descricao:'Horário de silêncio: 22h às 07h todos os dias.',
      lista:['Proibido uso de furadeira ou ferramentas ruidosas antes das 08h','Som alto deve respeitar limites toleráveis a qualquer hora','Festas no salão devem encerrar no horário definido na reserva'],
      importante:'Reclamações de barulho excessivo podem resultar em notificação e multa.' },
    { id:9,  categoria:'seguranca',   icon:'🔒', titulo:'Normas de Segurança',
      descricao:'A segurança do condomínio é responsabilidade coletiva de todos os moradores.',
      lista:['Não fornecer senhas ou acesso a pessoas não autorizadas','Não deixar portões ou portas abertas sem supervisão','Comunicar à portaria qualquer movimentação suspeita','Não compartilhar senhas de acesso em grupos de redes sociais'],
      importante:'🚨 Portaria: (11) 99999-0000 | Polícia: 190 | Bombeiros: 193 | SAMU: 192' },
    { id:10, categoria:'visitantes',  icon:'👤', titulo:'Acesso de Visitantes',
      descricao:'O morador é inteiramente responsável pelo comportamento de seus visitantes dentro do condomínio.',
      lista:['Todo visitante apresenta documento com foto na portaria','Morador autoriza expressamente a entrada','Prestadores de serviço comunicados previamente à portaria','Visitantes sem acesso livre às áreas comuns','Entregadores aguardam na portaria — não sobem sem autorização'],
      importante:'' },
    { id:11, categoria:'obras',       icon:'🔨', titulo:'Obras e Reformas',
      descricao:'Reformas comunicadas à administração com antecedência mínima de 5 dias úteis.',
      lista:['Horário: seg–sex 08h–18h | sábado 09h–13h','Proibido obras aos domingos e feriados','Entulho: caçamba externa contratada pelo morador','Funcionários de obras identificam-se obrigatoriamente na portaria','O morador protege as áreas comuns durante trânsito de materiais'],
      importante:'Obras estruturais exigem ART de engenheiro ou arquiteto responsável.' }
  ],

  descarte: [
    { id:1, titulo:'Lixo Comum',             icon:'🗑️', cor:'#64748b',
      descricao:'Resíduos orgânicos, restos de comida, papel higiênico e itens não recicláveis.',
      local:'Lixeiras cinzas no corredor do térreo, próximo ao elevador',
      coleta:'Segunda, quarta e sexta — às 19h',
      obs:'⚠️ Ensacar bem o lixo antes de descartar. Não deixar fora do horário.',
      imgSrc:'img/lixeira-comum.jpg' },
    { id:2, titulo:'Recicláveis',             icon:'♻️', cor:'#16a34a',
      descricao:'Papel, papelão, plástico, metal e embalagens limpas. Separe e lave antes de descartar.',
      local:'Lixeiras verdes na área externa (portão lateral)',
      coleta:'Terças e quintas — às 18h',
      obs:'💡 Lave as embalagens antes de descartar. Não misture com lixo comum.',
      imgSrc:'img/reciclaveis.jpg' },
    { id:3, titulo:'Vidro',                   icon:'🫙', cor:'#0ea5e9',
      descricao:'Garrafas, potes, frascos e outros materiais de vidro. Cuidado com vidros quebrados.',
      local:'Contêiner azul na área de reciclagem (portão lateral)',
      coleta:'Sábados — às 09h',
      obs:'⚠️ Vidros quebrados: embalar em caixa resistente com etiqueta "VIDRO CORTANTE".',
      imgSrc:'img/vidro.jpg' },
    { id:4, titulo:'Óleo de Cozinha',         icon:'🫗', cor:'#f59e0b',
      descricao:'Óleo vegetal usado deve ser armazenado em garrafa PET fechada.',
      local:'Recipiente laranja na entrada da portaria',
      coleta:'1º sábado do mês — empresa especializada',
      obs:'💡 NUNCA despeje óleo na pia ou vaso sanitário. Guarde em garrafa PET fechada.',
      imgSrc:'img/oleo-cozinha.jpg' },
    { id:5, titulo:'Móveis e Objetos Grandes', icon:'🛋️', cor:'#8b5cf6',
      descricao:'Sofás, armários, eletrodomésticos e itens de grande porte. Requer agendamento prévio.',
      local:'Área de descarte no portão de serviço — somente com agendamento',
      coleta:'Agendamento pelo 156 (Prefeitura) ou empresa parceira',
      obs:'⚠️ Não deixar móveis nas áreas comuns sem agendamento. Multa prevista.',
      imgSrc:'img/moveis-grandes.jpg' },
    { id:6, titulo:'Entulho de Obra',         icon:'🏗️', cor:'#ef4444',
      descricao:'Resíduos de reformas: cerâmicas, tijolos, argamassa e similares.',
      local:'Caçamba externa contratada pelo próprio morador',
      coleta:'O morador é responsável por contratar e agendar a remoção',
      obs:'⚠️ Entulho NÃO pode ser descartado nas lixeiras comuns do condomínio.',
      imgSrc:'img/entulho.jpg' }
  ],

  galeria: [
    { id:1, src:'img/entrada.jpg',       alt:'Entrada principal',   caption:'🏢 Entrada Principal' },
    { id:2, src:'img/portaria.jpg',      alt:'Portaria',            caption:'🛡️ Portaria' },
    { id:3, src:'img/garagem.jpg',       alt:'Garagem',             caption:'🚗 Garagem' },
    { id:4, src:'img/piscina.jpg',       alt:'Piscina',             caption:'🏊 Piscina' },
    { id:5, src:'img/salao.jpg',         alt:'Salão de festas',     caption:'🎊 Salão de Festas' },
    { id:6, src:'img/area-comum.jpg',    alt:'Área de lazer',       caption:'🌳 Área de Lazer' },
    { id:7, src:'img/lixeiras.jpg',      alt:'Área de lixeiras',    caption:'♻️ Área de Lixeiras' },
    { id:8, src:'img/quadro-avisos.jpg', alt:'Quadro de avisos',    caption:'📋 Quadro de Avisos' }
  ]
};

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
};
