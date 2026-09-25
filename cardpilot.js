(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const PAGE_SIZE = 100;
  const state = { headers: [], rawRows: [], transactions: [], page: 0, query: '' };
  const headerAliases = {
    date: ['이용일', '거래일', '승인일', '사용일', '날짜', '일자', 'transaction date', 'date'],
    merchant: ['가맹점명', '이용가맹점', '거래처', '이용처', '가맹점', '상호명', 'merchant', 'description', '거래내용'],
    amount: ['이용금액', '승인금액', '거래금액', '금액', '사용금액', '결제금액', 'amount'],
    extra: ['이용구분', '거래구분', '유형', '메모', '적요', '할인', '비고', 'type', 'memo']
  };

  function parseCsv(text, delimiter) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"' && cell.length === 0) quoted = true;
      else if (ch === delimiter) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i += 1;
        row.push(cell); cell = '';
        if (row.some((value) => value.trim() !== '')) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    return rows;
  }

  function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    return [',', '\t', ';'].map((delimiter) => ({
      delimiter,
      count: parseCsv(firstLine, delimiter)[0]?.length || 0
    })).sort((a, b) => b.count - a.count)[0].delimiter;
  }

  async function readCsv(file) {
    const buffer = await file.arrayBuffer();
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
    } catch (_) {
      try { return new TextDecoder('euc-kr').decode(buffer).replace(/^\uFEFF/, ''); }
      catch (_) { throw new Error('파일 문자 인코딩을 읽지 못했습니다. UTF-8 또는 한국어 CSV로 저장해 주세요.'); }
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[\s_()（）-]/g, '');
  }

  function findHeader(kind) {
    const aliases = headerAliases[kind].map(normalize);
    return state.headers.findIndex((header) => aliases.includes(normalize(header)));
  }

  function fillSelect(id, optional, selectedIndex) {
    const select = $(id);
    select.replaceChildren();
    const none = document.createElement('option');
    none.value = '';
    none.textContent = optional ? '선택 안 함' : '열을 선택하세요';
    select.append(none);
    state.headers.forEach((header, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${index + 1}. ${header || '(제목 없음)'}`;
      select.append(option);
    });
    if (selectedIndex >= 0) select.value = String(selectedIndex);
  }

  function parseAmount(raw) {
    let value = String(raw ?? '').trim();
    if (!value) return NaN;
    const negativeByParentheses = /^\(.*\)$/.test(value);
    value = value.replace(/[₩원,\s]/g, '').replace(/[()]/g, '');
    if (!/^-?\d+(\.\d+)?$/.test(value)) return NaN;
    const amount = Number(value);
    return negativeByParentheses ? -Math.abs(amount) : amount;
  }

  function money(value) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  function updateSummary() {
    const sums = { included: 0, excluded: 0, pending: 0, conditional: 0 };
    state.transactions.forEach((transaction) => { sums[transaction.status] += transaction.amount; });
    $('#sum-included').textContent = money(sums.included);
    $('#sum-excluded').textContent = money(sums.excluded);
    $('#sum-pending').textContent = money(sums.pending + sums.conditional);
    $('#sum-count').textContent = `${state.transactions.length.toLocaleString('ko-KR')}건`;
  }

  function visibleTransactions() {
    const query = normalize(state.query);
    return state.transactions.filter((transaction) => !query || normalize([
      transaction.date, transaction.merchant, transaction.extra, transaction.evidence, transaction.note
    ].join(' ')).includes(query));
  }

  function renderRows() {
    const visible = visibleTransactions();
    const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    state.page = Math.min(state.page, pageCount - 1);
    const pageRows = visible.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);
    const tbody = $('#transaction-rows');
    tbody.replaceChildren();
    pageRows.forEach((transaction) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${transaction.sourceIndex + 2}</td><td>${escapeHtml(transaction.date || '—')}</td><td>${escapeHtml(transaction.merchant || '—')}${transaction.extra ? `<div class="muted">${escapeHtml(transaction.extra)}</div>` : ''}</td><td>${money(transaction.amount)}</td><td><select aria-label="${escapeHtml(transaction.merchant)} 판정" data-status="${transaction.id}"><option value="pending">확인 필요</option><option value="included">인정</option><option value="excluded">제외</option><option value="conditional">조건부</option></select></td><td><div class="evidence">${escapeHtml(transaction.evidence)}</div><input type="text" maxlength="160" placeholder="검토 메모 (선택)" aria-label="${escapeHtml(transaction.merchant)} 검토 메모" data-note="${transaction.id}"></td>`;
      tr.querySelector('[data-status]').value = transaction.status;
      tr.querySelector('[data-note]').value = transaction.note;
      tbody.append(tr);
    });
    $('#page-label').textContent = `${state.page + 1} / ${pageCount} 페이지 · ${visible.length.toLocaleString('ko-KR')}건`;
    $('#previous-page').disabled = state.page === 0;
    $('#next-page').disabled = state.page >= pageCount - 1;
  }

  function loadFile() {
    const file = $('#csv-file').files[0];
    if (!file) { $('#file-status').textContent = '먼저 CSV 파일을 선택해 주세요.'; return; }
    if (!file.name.toLowerCase().endsWith('.csv')) { $('#file-status').textContent = 'CSV 파일만 지원합니다. 엑셀 파일은 CSV UTF-8 형식으로 저장해 주세요.'; return; }
    if (file.size > 20 * 1024 * 1024) { $('#file-status').textContent = '20MB 이하의 CSV 파일을 선택해 주세요.'; return; }
    $('#file-status').textContent = '파일을 브라우저에서 읽는 중입니다…';
    readCsv(file).then((text) => {
      const delimiter = detectDelimiter(text);
      const rows = parseCsv(text, delimiter);
      if (rows.length < 2 || rows[0].length < 2) throw new Error('제목행과 거래 데이터가 있는 CSV인지 확인해 주세요.');
      state.headers = rows[0].map((value, index) => value.trim() || `열 ${index + 1}`);
      state.rawRows = rows.slice(1).filter((row) => row.some((value) => value.trim() !== ''));
      fillSelect('#map-date', true, findHeader('date'));
      fillSelect('#map-merchant', false, findHeader('merchant'));
      fillSelect('#map-amount', false, findHeader('amount'));
      fillSelect('#map-extra', true, findHeader('extra'));
      $('#mapping-panel').hidden = false;
      $('#results').hidden = true;
      $('#row-count').textContent = `${state.rawRows.length.toLocaleString('ko-KR')}행 감지 · 구분자 ${delimiter === '\t' ? '탭' : delimiter}`;
      $('#file-status').textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB · 브라우저에서만 처리 중`;
    }).catch((error) => { $('#file-status').textContent = error.message || 'CSV를 읽지 못했습니다.'; });
  }

  function analyze() {
    const merchantIndex = Number($('#map-merchant').value);
    const amountIndex = Number($('#map-amount').value);
    if ($('#map-merchant').value === '' || $('#map-amount').value === '') {
      $('#file-status').textContent = '가맹점명과 이용금액 열을 선택해 주세요.';
      return;
    }
    const dateIndex = $('#map-date').value === '' ? -1 : Number($('#map-date').value);
    const extraIndex = $('#map-extra').value === '' ? -1 : Number($('#map-extra').value);
    const invalid = [];
    state.transactions = state.rawRows.map((row, index) => {
      const amount = parseAmount(row[amountIndex]);
      if (!Number.isFinite(amount)) invalid.push(index + 2);
      const merchant = String(row[merchantIndex] ?? '').trim();
      const date = dateIndex >= 0 ? String(row[dateIndex] ?? '').trim() : '';
      const extra = extraIndex >= 0 ? String(row[extraIndex] ?? '').trim() : '';
      const evidence = `${Number.isFinite(amount) ? '자동 판정 없음: 카드별 규칙 미등록' : '금액 형식 확인 필요: 합계에서 0원으로 처리'} · CSV ${index + 2}행${date ? ` · 일자 ${date}` : ''} · 가맹점 ${merchant || '(빈 값)'} · 원본 금액 ${row[amountIndex] ?? '(빈 값)'}`;
      return { id: index, sourceIndex: index, amount: Number.isFinite(amount) ? amount : 0, date, merchant, extra, status: 'pending', evidence, note: '', valid: Number.isFinite(amount) };
    });
    if (invalid.length) $('#file-status').textContent = `금액 형식을 읽지 못한 ${invalid.length}건은 0원으로 두었습니다. 원본 행: ${invalid.slice(0, 8).join(', ')}${invalid.length > 8 ? ' …' : ''}. 열 선택을 확인해 주세요.`;
    else $('#file-status').textContent = `${state.transactions.length.toLocaleString('ko-KR')}건 분석 완료. 카드별 자동 판정 규칙이 없어 모두 ‘확인 필요’로 시작합니다.`;
    state.page = 0;
    $('#results').hidden = false;
    updateSummary();
    renderRows();
  }

  $('#load-csv').addEventListener('click', loadFile);
  $('#analyze').addEventListener('click', analyze);
  $('#filter-rows').addEventListener('input', (event) => { state.query = event.target.value; state.page = 0; renderRows(); });
  $('#previous-page').addEventListener('click', () => { state.page -= 1; renderRows(); });
  $('#next-page').addEventListener('click', () => { state.page += 1; renderRows(); });
  $('#clear-analysis').addEventListener('click', () => {
    state.headers = [];
    state.rawRows = [];
    state.transactions = [];
    state.page = 0;
    state.query = '';
    $('#csv-file').value = '';
    $('#filter-rows').value = '';
    $('#mapping-panel').hidden = true;
    $('#results').hidden = true;
    $('#file-status').textContent = '분석 데이터를 초기화했습니다. CSV 파일은 브라우저에서만 처리됩니다.';
  });
  $('#transaction-rows').addEventListener('change', (event) => {
    const statusId = event.target.dataset.status;
    const noteId = event.target.dataset.note;
    if (statusId !== undefined) {
      state.transactions[Number(statusId)].status = event.target.value;
      updateSummary();
    } else if (noteId !== undefined) {
      state.transactions[Number(noteId)].note = event.target.value;
    }
  });
  $('#transaction-rows').addEventListener('input', (event) => {
    const noteId = event.target.dataset.note;
    if (noteId !== undefined) state.transactions[Number(noteId)].note = event.target.value;
  });
})();
