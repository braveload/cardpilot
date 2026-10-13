(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const PAGE_SIZE = 100;
  const cardTools = window.CARDPILOT_TOOLS || null;
  const state = { headers: [], rawRows: [], transactions: [], page: 0, query: '', ocrWorker: null };
  const headerAliases = {
    date: ['이용일', '거래일', '승인일', '사용일', '날짜', '일자', 'transaction date', 'date'],
    merchant: ['가맹점명', '이용가맹점', '거래처', '이용처', '가맹점', '상호명', 'merchant', 'description', '거래내용'],
    amount: ['이용금액', '승인금액', '거래금액', '금액', '사용금액', '결제금액', 'amount'],
    extra: ['이용구분', '거래구분', '유형', '메모', '적요', '할인', '비고', 'type', 'memo']
  };
  const products = window.CARDPILOT_RULES.products;

  function parseCsv(text, delimiter) {
    const rows = []; let row = [], cell = '', quoted = false;
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
        row.push(cell); cell = ''; if (row.some((value) => value.trim())) rows.push(row); row = [];
      } else cell += ch;
    }
    row.push(cell); if (row.some((value) => value.trim())) rows.push(row); return rows;
  }
  function detectDelimiter(text) {
    const first = text.split(/\r?\n/, 1)[0] || '';
    return [',', '\t', ';'].map((delimiter) => ({ delimiter, count: parseCsv(first, delimiter)[0]?.length || 0 })).sort((a, b) => b.count - a.count)[0].delimiter;
  }
  async function readCsv(file) {
    const buffer = await file.arrayBuffer();
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, ''); }
    catch (_) { return new TextDecoder('euc-kr').decode(buffer).replace(/^\uFEFF/, ''); }
  }
  function normalize(value) { return String(value || '').toLowerCase().replace(/[\s_()（）-]/g, ''); }
  function findHeader(kind) { return state.headers.findIndex((header) => headerAliases[kind].map(normalize).includes(normalize(header))); }
  function fillSelect(id, optional, selectedIndex) {
    const select = $(id); select.replaceChildren();
    const none = document.createElement('option'); none.value = ''; none.textContent = optional ? '선택 안 함' : '열을 선택하세요'; select.append(none);
    state.headers.forEach((header, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${index + 1}. ${header || '(제목 없음)'}`; select.append(option); });
    if (selectedIndex >= 0) select.value = String(selectedIndex);
  }
  function parseAmount(raw) {
    let value = String(raw ?? '').trim(); if (!value) return NaN;
    const paren = /^\(.*\)$/.test(value); value = value.replace(/[₩원,\s]/g, '').replace(/[()]/g, '');
    if (!/^-?\d+(\.\d+)?$/.test(value)) return NaN;
    const amount = Number(value); return paren ? -Math.abs(amount) : amount;
  }
  function money(value) { return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]); }
  function duplicateKey(row) {
    const amount = parseAmount(row.amount);
    if (!row.date || !row.merchant || !Number.isFinite(amount)) return '';
    if (row.requiresCardLink && (!row.cardIdentity?.issuer || !row.cardIdentity?.last4)) return '';
    const identity = row.requiresCardLink ? `${row.cardIdentity.issuer}|${row.cardIdentity.last4}|` : '';
    return `${identity}${normalize(row.date)}|${normalize(row.merchant)}|${amount}`;
  }
  function csvCell(value, protectFormula = false) {
    let text = String(value ?? '');
    if (protectFormula && /^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }
  function exportTransactions() {
    if (!state.transactions.length) { $('#file-status').textContent = '먼저 거래를 분석해 주세요.'; return; }
    const statusLabels = { included: '인정 예상', excluded: '제외 예상', pending: '확인 필요', conditional: '조건 확인' };
    const rows = [['출처', '이용일', '가맹점', '이용금액(원)', '선택 카드사', '선택 상품', '판정', '판정 근거', '메모']];
    state.transactions.forEach((item) => {
      const product = products.find((entry) => entry.id === item.productId) || currentProduct();
      rows.push([
        item.sourceLabel || `CSV ${item.sourceIndex + 2}행`, item.date, item.merchant, item.amount,
        item.requiresCardLink && !item.productId ? '카드 연결 확인 필요' : product.issuer, item.requiresCardLink && !item.productId ? '' : product.name, statusLabels[item.status] || '확인 필요', item.evidence, item.note
      ].map((value, index) => csvCell(value, index !== 3)));
    });
    const blob = new Blob([`\uFEFF${rows.map((row) => row.join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `cardpilot-details-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#file-status').textContent = `${state.transactions.length.toLocaleString('ko-KR')}건의 상세 판정 내역을 이 기기에 CSV로 다운로드했습니다. 서버에는 전송하지 않았습니다.`;
  }
  function currentProduct() { return products.find((product) => product.id === $('#product-select').value) || products[0]; }
  function renderCatalogDetail(product) {
    const detail = $('#catalog-detail');
    const status = product.verificationStatus === 'pending'
      ? '실적 판정 규칙 확인 중 · 거래 합산 보류'
      : `${product.thresholdLabel || (product.threshold ? `전월 실적 기준 ${money(product.threshold)}` : '전월 실적 조건 없음')} · 공식 기준 확인 ${product.checkedAt}`;
    detail.innerHTML = `<p><strong>${escapeHtml(product.issuer)} · ${escapeHtml(product.name)}</strong></p><p class="muted">${escapeHtml(status)}</p><a href="${escapeHtml(product.source)}" target="_blank" rel="noopener">선택 상품의 공식 안내·규칙 근거 보기 ↗</a>`;
  }

  function classify(transaction, product = currentProduct(), simulation = false) {
    if (transaction.requiresCardLink && !simulation) {
      const card = (cardTools?.getMappings() || []).find((c) => c.id === transaction.cardMappingId && c.productId === transaction.linkedProductId && c.issuer === transaction.linkedIssuer && c.last4 === transaction.linkedLast4);
      product = card && products.find((p) => p.id === card.productId);
      if (!product) { transaction.productId = ''; transaction.status = 'pending'; transaction.evidence = '카드 연결 확인 필요: ' + (transaction.cardLinkReason || '기존 연결이 수정·해제되었습니다. 거래 카드를 직접 확인해 주세요.'); return; }
    }
    const text = normalize([transaction.merchant, transaction.extra].join(' '));
    transaction.productId = product.id;
    if (!Number.isFinite(transaction.amount) || !transaction.merchant || transaction.amount <= 0) {
      transaction.status = 'pending'; transaction.evidence = '금액/가맹점 확인 필요: 결제취소·환불 또는 빈 항목일 수 있어 합산하지 않았습니다.'; return;
    }
    if (product.verificationStatus === 'pending') {
      transaction.status = 'conditional'; transaction.evidence = `확인 필요: ${product.name} 상품별 공식 전월 실적 기준·제외 항목을 검증 중입니다. 인정/제외 판정과 실적 합산을 보류합니다 · ${product.sourceTitle} (${product.checkedAt})`; return;
    }
    const discountExempt = (product.discountExemptionKeywords || []).some((word) => text.includes(normalize(word)));
    const productRules = product.extraExclusions.filter((rule) => !(discountExempt && rule.discountOnly));
    const rules = [...(product.useCommonExclusions === false ? [] : window.CARDPILOT_RULES.commonExclusions), ...productRules];
    const discountValue = parseAmount(String(transaction.discount || '').replace('%', ''));
    const discountStatus = normalize(transaction.discount || '');
    const discountApplied = (Number.isFinite(discountValue) && discountValue > 0) || ['yes', 'true', 'y', '예'].includes(discountStatus) || discountStatus.includes('할인적용') || discountStatus.includes('할인받음');
    const reportedDiscountRule = discountApplied ? productRules.find((rule) => rule.discountOnly) : null;
    const match = reportedDiscountRule || rules.find((rule) => rule.keywords.some((word) => text.includes(normalize(word))));
    if (match) { transaction.status = 'excluded'; transaction.evidence = `제외 예상: ${match.label}. ${product.name} 공식 안내 기준 · `; }
    else {
      const conditional = (product.conditional || []).find((rule) => rule.keywords.some((word) => text.includes(normalize(word))));
      if (conditional && !transaction.discount) {
        transaction.status = 'conditional'; transaction.evidence = `조건 확인: ${conditional.label}. 실제 할인 적용 여부를 확인하세요 · `;
      } else {
        transaction.status = 'included'; transaction.evidence = `인정 예상: 등록된 제외 키워드와 일치하지 않음. 업종코드·할인 적용을 확인하세요 · `;
      }
    }
    transaction.evidence += `${product.sourceTitle} (${product.checkedAt})`;
  }
  function updateSummary() {
    const sums = { included: 0, excluded: 0, pending: 0, conditional: 0 };
    state.transactions.forEach((item) => { sums[item.status] = (sums[item.status] || 0) + Math.max(0, item.amount); });
    $('#sum-included').textContent = money(sums.included); $('#sum-excluded').textContent = money(sums.excluded);
    $('#sum-pending').textContent = money(sums.pending + sums.conditional); $('#sum-count').textContent = `${state.transactions.length.toLocaleString('ko-KR')}건`;
    const product = currentProduct();
    if (product.verificationStatus === 'pending') {
      $('#product-rule-summary').textContent = `${product.name}: 상품 목록 등록 완료 · 공식 실적 기준 확인 중. 거래별 판정과 인정 실적 합산은 보류하며, 확인된 기존 규칙 ${window.CARDPILOT_RULES.summary.supportedCardCount}종은 계속 사용할 수 있습니다.`;
      return;
    }
    const selectedIncluded = state.transactions.filter((item) => item.productId === product.id && item.status === 'included').reduce((sum, item) => sum + Math.max(0,item.amount),0);
    const threshold = product.threshold;
    const supported = window.CARDPILOT_RULES.summary.supportedCardCount;
    const thresholdLabel = product.thresholdLabel || money(threshold);
    $('#product-rule-summary').textContent = threshold ? `공식 안내로 확인한 ${supported}종 규칙 등록 · 선택 상품 거래의 인정 예상 ${money(selectedIncluded)} / 기준 ${thresholdLabel} · 남은 예상액 ${money(Math.max(0, threshold - selectedIncluded))}. 상품에 따라 추가 혜택 기준은 다를 수 있습니다.` : `공식 안내로 확인한 ${supported}종 규칙 등록 · ${thresholdLabel}. 카드별 거래 제외 기준은 등록된 공식 안내를 확인하세요.`;
  }
  function renderSamplePreview() {
    const sampleProduct = products.find((product) => product.id === 'bc-kpass') || products[0];
    const samples = [
      { date: '2026-09-03', merchant: '스타벅스 강남점', amount: 8500 },
      { date: '2026-09-05', merchant: '아파트관리비', amount: 120000 },
      { date: '2026-09-08', merchant: '온라인 상품권몰', amount: 50000 }
    ].map((entry, index) => {
      const item = { ...entry, id: -index - 1, extra: '', discount: '', note: '', status: 'pending', evidence: '' };
      classify(item, sampleProduct); return item;
    });
    const totals = { included: 0, excluded: 0, pending: 0, conditional: 0 };
    samples.forEach((item) => { totals[item.status] = (totals[item.status] || 0) + Math.max(0, item.amount); });
    const labels = { included: '인정 예상', excluded: '제외 예상', pending: '확인 필요', conditional: '조건 확인' };
    $('#sample-product').textContent = `${sampleProduct.issuer} · ${sampleProduct.name} · ${sampleProduct.thresholdLabel || `전월 실적 기준 ${money(sampleProduct.threshold || 0)}`}`;
    $('#sample-included').textContent = money(totals.included);
    $('#sample-excluded').textContent = money(totals.excluded);
    $('#sample-pending').textContent = money(totals.pending + totals.conditional);
    $('#sample-count').textContent = `${samples.length}건`;
    const tbody = $('#sample-rows'); tbody.replaceChildren();
    samples.forEach((item) => {
      const tr = document.createElement('tr');
      [item.date, item.merchant, money(item.amount), `${labels[item.status]} · ${item.evidence}`].forEach((value) => {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      });
      tbody.append(tr);
    });
    const threshold = sampleProduct.threshold || 0;
    $('#sample-threshold').textContent = `기준 참고: ${sampleProduct.thresholdLabel || (threshold ? `전월 실적 ${money(threshold)}` : '전월 실적 기준 없음')} · 인정 예상 기준 남은 금액 ${money(Math.max(0, threshold - totals.included))}`;
  }
  function visibleTransactions() {
    const query = normalize(state.query);
    return state.transactions.filter((item) => !query || normalize([item.date, item.merchant, item.extra, item.evidence, item.note].join(' ')).includes(query));
  }
  function renderRows() {
    const visible = visibleTransactions(); const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE)); state.page = Math.min(state.page, pageCount - 1);
    const tbody = $('#transaction-rows'); tbody.replaceChildren();
    visible.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE).forEach((item) => {
      const tr = document.createElement('tr');
      const product = products.find((entry) => entry.id === item.productId) || currentProduct();
      const sourceLink = item.requiresCardLink && !item.productId ? '카드 연결 후 상품 근거 확인' : `<a href="${escapeHtml(product.source)}" target="_blank" rel="noopener">상품 근거 ↗</a>`;
      tr.innerHTML = `<td>${item.sourceLabel || `CSV ${item.sourceIndex + 2}행`}</td><td><div class="review-fields"><input aria-label="이용일 수정" maxlength="30" value="${escapeHtml(item.date)}" data-field="date" data-id="${item.id}"><input aria-label="가맹점 수정" maxlength="100" value="${escapeHtml(item.merchant)}" data-field="merchant" data-id="${item.id}"><input aria-label="금액 수정" inputmode="numeric" value="${escapeHtml(item.amount)}" data-field="amount" data-id="${item.id}"></div>${item.extra ? `<div class="muted">${escapeHtml(item.extra)}</div>` : ''}</td><td><select aria-label="${escapeHtml(item.merchant)} 판정" data-status="${item.id}"><option value="pending">확인 필요</option><option value="included">인정 예상</option><option value="excluded">제외 예상</option><option value="conditional">조건 확인</option></select></td><td><div class="evidence">${escapeHtml(item.evidence)} ${sourceLink}</div><input type="text" maxlength="160" placeholder="검토 메모 (선택)" aria-label="검토 메모" data-note="${item.id}" value="${escapeHtml(item.note)}"></td>`;
      if (cardTools && item.requiresCardLink) {
        const label = document.createElement('label'); label.textContent = '거래 카드 확인';
        const select = document.createElement('select'); select.setAttribute('aria-label','거래 카드 연결'); select.dataset.card = String(item.id);
        const none = document.createElement('option'); none.value = ''; none.textContent = '카드 연결 확인 필요'; select.append(none);
        cardTools.getMappings().forEach((card) => { const option = document.createElement('option'); option.value = card.id; option.textContent = cardTools.cardLabel(card); select.append(option); });
        if (item.productId) select.value = item.cardMappingId; label.append(select); tr.children[0].append(label);
      }
      tr.querySelector('[data-status]').value = item.status; tbody.append(tr);
    });
    $('#page-label').textContent = `${state.page + 1} / ${pageCount} 페이지 · ${visible.length.toLocaleString('ko-KR')}건`;
    $('#previous-page').disabled = state.page === 0; $('#next-page').disabled = state.page >= pageCount - 1;
  }
  function showResults(message) { $('#results').hidden = false; $('#file-status').textContent = message; updateSummary(); renderRows(); }
  function markComparisonStale() {
    if (!$('#comparison-results').hidden) {
      $('#comparison-results').hidden = true;
      $('#comparison-status').textContent = '거래 내용이 바뀌었습니다. 최신 내용으로 다시 비교해 주세요.';
    }
  }
  function compareProducts() {
    const selected = [...document.querySelectorAll('[data-compare-product]:checked')].map((input) => products.find((product) => product.id === input.value)).filter(Boolean);
    if (selected.length < 2) { $('#comparison-status').textContent = '비교할 카드를 2개 이상 선택해 주세요.'; return; }
    if (!state.transactions.length) { $('#comparison-status').textContent = '먼저 CSV 또는 캡처 내역을 분석해 주세요.'; return; }
    const results = selected.map((product) => {
      const sums = { included: 0, excluded: 0, pending: 0, conditional: 0 };
      state.transactions.forEach((item) => {
        const candidate = { ...item };
        classify(candidate, product, true);
        sums[candidate.status] = (sums[candidate.status] || 0) + Math.max(0, candidate.amount);
      });
      return { product, sums };
    }).sort((a, b) => b.sums.included - a.sums.included);
    const tbody = $('#comparison-rows'); tbody.replaceChildren();
    results.forEach(({ product, sums }) => {
      const tr = document.createElement('tr');
      const threshold = product.threshold ? `${escapeHtml(product.thresholdLabel || money(product.threshold))}<br><span class="muted">남은 예상 ${money(Math.max(0, product.threshold - sums.included))}</span>` : `${escapeHtml(product.thresholdLabel || '기본 혜택 실적 조건 없음')}`;
      tr.innerHTML = `<td><strong>${escapeHtml(product.issuer)} · ${escapeHtml(product.name)}</strong><br><a href="${escapeHtml(product.source)}" target="_blank" rel="noopener">공식 기준 ↗</a></td><td>${money(sums.included)}</td><td>${money(sums.excluded)}</td><td>${money(sums.pending + sums.conditional)}</td><td>${threshold}</td>`;
      tbody.append(tr);
    });
    $('#comparison-results').hidden = false;
    $('#comparison-status').textContent = `${state.transactions.length.toLocaleString('ko-KR')}건의 동일 거래를 ${selected.length}개 카드에 각각 적용했습니다. 거래별 수동 판정은 비교 계산에 반영되지 않으며, 규칙 키워드 기반 예상치입니다.`;
  }
  async function loadOcrLibrary() {
    if (window.Tesseract) return window.Tesseract;
    const sources = [
      'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js',
      'https://unpkg.com/tesseract.js@7.0.0/dist/tesseract.min.js'
    ];
    for (const src of sources) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script'); script.src = src; script.async = true;
          const timer = setTimeout(() => reject(new Error('OCR 엔진 응답 시간이 초과됐습니다.')), 15000);
          script.onload = () => { clearTimeout(timer); resolve(); };
          script.onerror = () => { clearTimeout(timer); reject(new Error('OCR 스크립트를 불러오지 못했습니다.')); };
          document.head.append(script);
        });
        if (window.Tesseract) return window.Tesseract;
      } catch (_) { /* Try the alternate CDN. */ }
    }
    throw new Error('한국어 OCR 엔진을 불러오지 못했습니다. 네트워크 연결을 확인하거나 CSV를 이용해 주세요.');
  }
  function ingestRows(rows, source) {
    const prepared = rows.map((row, index) => ({ row: { ...row, date: String(row.date || '').trim(), merchant: String(row.merchant || '').trim(), ...(source === '캡처' ? { requiresCardLink: true, cardIdentity: cardTools ? cardTools.detectCardIdentity(row.extra) : { issuer: '', last4: '', reason: '카드 연결 기능을 불러오지 못했습니다.' } } : {}) }, index }));
    const seen = new Set(state.transactions.map(duplicateKey).filter(Boolean));
    let duplicateCount = 0;
    prepared.forEach(({ row }) => {
      const key = duplicateKey(row);
      if (key && seen.has(key)) duplicateCount += 1;
      if (key) seen.add(key);
    });
    const excludeDuplicates = duplicateCount > 0 && window.confirm(`기존 내역 또는 이번 파일 안에서 날짜·가맹점·금액이 같은 거래 ${duplicateCount}건을 찾았습니다.\n\n[확인] 중복으로 보이는 거래 제외\n[취소] 중복 거래도 모두 추가`);
    const uniqueKeys = new Set(state.transactions.map(duplicateKey).filter(Boolean));
    const accepted = prepared.filter(({ row }) => {
      if (!excludeDuplicates) return true;
      const key = duplicateKey(row);
      if (!key) return true;
      if (uniqueKeys.has(key)) return false;
      uniqueKeys.add(key); return true;
    }).map(({ row, index }, acceptedIndex) => {
      const amount = parseAmount(row.amount); const item = { id: state.transactions.length + acceptedIndex, sourceIndex: index, sourceLabel: source ? `${source} ${index + 1}` : '', date: row.date, merchant: row.merchant, extra: String(row.extra || '').trim(), amount: Number.isFinite(amount) ? amount : 0, status: 'pending', evidence: '', note: '', discount: row.discount || '' };
      if (row.requiresCardLink) { item.requiresCardLink = true; item.cardIdentity = row.cardIdentity; const match = cardTools ? cardTools.resolveIdentity(row.cardIdentity) : { card: null, reason: row.cardIdentity.reason }; item.cardLinkReason = match.reason; if (match.card) bindCard(item,match.card); }
      classify(item); return item;
    });
    state.transactions.push(...accepted); state.page = Math.max(0, Math.ceil(state.transactions.length / PAGE_SIZE) - 1);
    const skipped = excludeDuplicates ? ` · 중복 의심 ${duplicateCount}건 제외` : duplicateCount ? ` · 중복 의심 ${duplicateCount}건 포함` : '';
    showResults(`${accepted.length}건 거래 후보를 추가했습니다${skipped}. 인식 결과와 예상 판정을 원본 내역과 대조해 주세요.`);
  }
  function setupProducts() {
    const issuerSelect = $('#issuer-select');
    const productSelect = $('#product-select');
    const issuers = [...new Set(products.map((product) => product.issuer))];
    issuers.forEach((issuer) => { const option = document.createElement('option'); option.value = issuer; option.textContent = `${issuer} · ${products.filter((product) => product.issuer === issuer).length}종`; issuerSelect.append(option); });
    function fillProductSelect(issuer, selectedId) {
      productSelect.replaceChildren();
      products.filter((product) => product.issuer === issuer).forEach((product) => {
        const option = document.createElement('option'); option.value = product.id;
        option.textContent = `${product.name}${product.verificationStatus === 'pending' ? ' · 규칙 확인 중' : ''}`;
        productSelect.append(option);
      });
      if (selectedId && [...productSelect.options].some((option) => option.value === selectedId)) productSelect.value = selectedId;
      renderCatalogDetail(currentProduct());
    }
    fillProductSelect(issuers[0]);
    const summary = window.CARDPILOT_RULES.summary;
    $('#product-rule-summary').textContent = `상품 목록 ${summary.catalogCardCount}종 · 공식 판정 규칙 ${summary.supportedCardCount}종 · 규칙 확인 중 ${summary.pendingRuleCount}종. BC 회원사 ${summary.bankBcIssuerCount}곳의 현재 목록은 ${summary.bankBcCardCount}종(회원사별 등록 가능 상품 수에 따라 다름)이며, 하나·신한·NH농협 일반 카드도 각 ${summary.hanaCardCount}종씩 별도 목록으로 추가했습니다. 확인 중 상품은 인정 실적에 합산하지 않습니다.`;
    const catalogCount = products.length;
    const issuerGroupCount = new Set(products.map((product) => product.issuer)).size;
    $('#catalog-count-public').textContent = `${issuerGroupCount}개 발급사·회원사 상품 목록 · 상품 ${catalogCount}종 · 공식 판정 규칙 ${summary.supportedCardCount}종 · 규칙 확인 중 ${summary.pendingRuleCount}종`;
    $('#catalog-count-notice').textContent = `현재 등록된 상품 ${catalogCount}종은 공식 실적 규칙을 확인했습니다. 이후 상품도 공식 자료에서 기준과 제외 항목을 확인한 뒤 순차 등록합니다. 최근 3개월 기준 상품은 해당 기간 거래내역을 포함해 분석해 주세요.`;
    const release = window.CARDPILOT_RULES.release;
    if (release) {
      $('#rules-update-date').textContent = `최근 규칙 업데이트: ${release.updatedAt}`;
      const history = $('#rules-update-history'); history.replaceChildren();
      release.notes.forEach((note) => { const item = document.createElement('li'); item.textContent = note; history.append(item); });
    }
    function selectedProductChanged() {
      state.transactions.forEach((item) => classify(item)); updateSummary(); renderRows(); markComparisonStale();
      renderCatalogDetail(currentProduct());
    }
    issuerSelect.addEventListener('change', () => { fillProductSelect(issuerSelect.value); selectedProductChanged(); });
    productSelect.addEventListener('change', selectedProductChanged);
    const compareList = $('#compare-products'); compareList.replaceChildren();
    [...new Set(products.map((product) => product.issuer))].forEach((issuer) => {
      const group = document.createElement('section'); group.className = 'issuer-group';
      const heading = document.createElement('h4'); heading.className = 'issuer-heading'; heading.textContent = issuer; group.append(heading);
      const grid = document.createElement('div'); grid.className = 'product-grid';
      products.filter((product) => product.issuer === issuer).forEach((product) => {
        const label = document.createElement('label'); label.className = 'product-item compare-option';
        label.innerHTML = `<input type="checkbox" data-compare-product value="${escapeHtml(product.id)}"><span><strong>${escapeHtml(product.name)}</strong><br><span class="muted">${escapeHtml(product.thresholdLabel || (product.threshold ? `전월 실적 ${money(product.threshold)}` : '기본 혜택 실적 조건 없음'))}</span></span>`;
        grid.append(label);
      });
      group.append(grid); compareList.append(group);
    });
    $('#compare-cards').addEventListener('click', compareProducts);
  }
  function loadFile() {
    const file = $('#csv-file').files[0];
    if (!file) { $('#file-status').textContent = '먼저 CSV 파일을 선택해 주세요.'; return; }
    if (!file.name.toLowerCase().endsWith('.csv')) { $('#file-status').textContent = 'CSV 파일만 지원합니다. 엑셀 파일은 CSV UTF-8 형식으로 저장해 주세요.'; return; }
    if (file.size > 20 * 1024 * 1024) { $('#file-status').textContent = '20MB 이하의 CSV 파일을 선택해 주세요.'; return; }
    $('#file-status').textContent = '파일을 브라우저에서 읽는 중입니다…';
    readCsv(file).then((text) => {
      const delimiter = detectDelimiter(text); const rows = parseCsv(text, delimiter);
      if (rows.length < 2 || rows[0].length < 2) throw new Error('제목행과 거래 데이터가 있는 CSV인지 확인해 주세요.');
      state.headers = rows[0].map((value, index) => value.trim() || `열 ${index + 1}`); state.rawRows = rows.slice(1).filter((row) => row.some((value) => value.trim()));
      fillSelect('#map-date', true, findHeader('date')); fillSelect('#map-merchant', false, findHeader('merchant')); fillSelect('#map-amount', false, findHeader('amount')); fillSelect('#map-extra', true, findHeader('extra'));
      $('#mapping-panel').hidden = false; $('#row-count').textContent = `${state.rawRows.length.toLocaleString('ko-KR')}행 감지 · 구분자 ${delimiter === '\t' ? '탭' : delimiter}`;
      $('#file-status').textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB · 브라우저에서만 처리`;
    }).catch((error) => { $('#file-status').textContent = error.message || 'CSV를 읽지 못했습니다.'; });
  }
  function analyze() {
    const mi = Number($('#map-merchant').value), ai = Number($('#map-amount').value);
    if ($('#map-merchant').value === '' || $('#map-amount').value === '') { $('#file-status').textContent = '가맹점명과 이용금액 열을 선택해 주세요.'; return; }
    const di = $('#map-date').value === '' ? -1 : Number($('#map-date').value), ei = $('#map-extra').value === '' ? -1 : Number($('#map-extra').value);
    const rows = state.rawRows.map((row) => ({ date: di >= 0 ? row[di] : '', merchant: row[mi], amount: row[ai], extra: ei >= 0 ? row[ei] : '' }));
    ingestRows(rows, 'CSV');
  }
  async function readImages() {
    const files = [...$('#statement-images').files];
    if (!files.length) { $('#image-status').textContent = '먼저 이용내역 캡처 이미지를 선택해 주세요.'; return; }
    if (files.length > 5 || files.some((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) { $('#image-status').textContent = '이미지는 장당 10MB 이하, 최대 5장까지 선택할 수 있습니다.'; return; }
    $('#read-images').disabled = true;
    try {
      $('#image-status').textContent = '브라우저용 한국어 문자 인식 엔진을 불러오는 중…';
      const tesseract = await loadOcrLibrary();
      if (!state.ocrWorker) state.ocrWorker = await tesseract.createWorker('kor', 1, { workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js', corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-lstm.wasm.js', langPath: 'https://tessdata.projectnaptha.com/4.0.0_best' });
      let text = '';
      for (let i = 0; i < files.length; i += 1) {
        $('#image-status').textContent = `${i + 1}/${files.length}장 문자를 읽는 중…`;
        const result = await state.ocrWorker.recognize(files[i]); text += `${i ? '\n' : ''}${result.data.text}`;
      }
      $('#ocr-text').value = text; $('#ocr-review').hidden = false; $('#image-status').textContent = '문자 인식 완료. 날짜·가맹점·금액을 확인하고 필요하면 위 텍스트를 수정해 주세요.';
    } catch (error) { $('#image-status').textContent = `이미지 읽기 실패: ${error.message || '잠시 후 다시 시도해 주세요.'}`; }
    finally { $('#read-images').disabled = false; }
  }
  // OCR numbers are not amounts unless currency/payment context identifies them.
  function parseImageText(text) {
    const rows = [];
    const datePattern = /(?:20\d{2}[./년 -]+\d{1,2}[./월 -]+\d{1,2}일?|\d{1,2}[./-]\d{1,2})(?!\d)/;
    const timePattern = /\b\d{1,2}:\d{2}(?::\d{2})?\b/g;
    const amountPattern = /(?:₩\s*(-?\d[\d,]*)|(-?\d[\d,]*)\s*원)/g;
    const totals = /합계|총액|누계|누적|이용한도|결제예정|청구금액|잔액|한도/;
    const metadata = /^(?:\[?Web\s*발신\]?|\[?웹\s*발신\]?|시간|일시|승인일|이용일|거래일|카드번호|승인번호|일시불|할부|본인|가족|취소|승인|결제|이용금액|승인금액|님)/i;
    function amountOf(line) {
      if (totals.test(line)) return null;
      const matches = [...line.matchAll(amountPattern)];
      // More than one payment amount needs correction, never choose one arbitrarily.
      if (matches.length !== 1) return null;
      return { amount: parseAmount(matches[0][1] || matches[0][2]), raw: matches[0][0] };
    }
    function merchantOf(line) {
      if (totals.test(line)) return '';
      let value = line.replace(datePattern, ' ').replace(timePattern, ' ').replace(amountPattern, ' ')
        .replace(/^(?:가맹점명?|이용처|거래처|상호명)\s*[:：]?\s*/, '')
        .replace(/(?:일시불|할부)/g, ' ').replace(/[|│·•:：]/g, ' ').trim();
      if (metadata.test(value) || /카드|승인|\*|님|\[|\]|누적/.test(value) || /^[\d\s./()-]+$/.test(value)) return '';
      return /[가-힣a-zA-Z]/.test(value) ? value.replace(/\s+/g, ' ') : '';
    }
    const lines = String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let block = [];
    function flush() {
      if (!block.length) return;
      const dates = block.map((line) => line.match(datePattern)?.[0]).filter(Boolean);
      const amounts = block.map(amountOf).filter(Boolean);
      const merchants = block.map(merchantOf).filter(Boolean);
      rows.push({ date: dates[0] || '', merchant: merchants.length === 1 ? merchants[0] : '',
        amount: amounts.length === 1 ? (block.some((line) => /취소|환불/.test(line)) ? -Math.abs(amounts[0].amount) : amounts[0].amount) : '', extra: block.join('\n'), discount: '' });
      block = [];
    }
    for (const line of lines) {
      const webHeader = /^\[?\s*(?:Web\s*발신|웹\s*발신)\s*\]?$/i.test(line);
      const approvalHeader = /(?:카드|신한|삼성|현대|롯데|국민|하나|우리|농협|BC).*(?:승인|취소)|(?:승인|취소).*(?:카드)/i.test(line);
      if (webHeader) { flush(); block.push(line); continue; }
      if (approvalHeader) {
        if (block.some((entry) => !/^\[?\s*(?:Web\s*발신|웹\s*발신)\s*\]?$/i.test(entry))) flush();
        block.push(line); continue;
      }
      if (block.length) { block.push(line); continue; }
      // Statement rows must contain a date, merchant and amount on the same line.
      const date = line.match(datePattern)?.[0];
      let payment = amountOf(line);
      let merchant = merchantOf(line);
      if (!payment && date && !totals.test(line)) {
        const remainder = line.replace(datePattern, ' ').replace(timePattern, ' ');
        const bare = remainder.match(/\s(-?\d[\d,]*)\s*$/);
        if (bare) { payment = { amount: parseAmount(bare[1]) }; merchant = merchantOf(remainder.slice(0, bare.index)); }
      }
      if (date && payment && merchant) rows.push({ date, merchant, amount: payment.amount, extra: line, discount: '' });
    }
    flush();
    return rows;
  }
  function extractImageRows() {
    const rows = parseImageText($('#ocr-text').value);
    if (!rows.length) { $('#image-status').textContent = '거래 후보를 찾지 못했습니다. 날짜·가맹점·결제금액이 포함된 문자를 확인하거나 CSV를 이용해 주세요.'; return; }
    markComparisonStale();
    ingestRows(rows, '캡처');
    const incomplete = rows.filter((row) => !row.merchant || !Number.isFinite(parseAmount(row.amount)) || parseAmount(row.amount) <= 0).length;
    $('#image-status').textContent = `${rows.length}건 거래 후보를 추출했습니다.${incomplete ? ` ${incomplete}건은 가맹점·금액 확인이 필요하며 실적에 합산하지 않습니다.` : ''} 원본과 대조해 주세요.`;
  }
  function bindCard(item, card) { item.requiresCardLink = true; item.cardMappingId = card.id; item.linkedProductId = card.productId; item.linkedIssuer = card.issuer; item.linkedLast4 = card.last4; item.cardLinkReason = ''; }
  function reclassify(item) { classify(item); }

  setupProducts();
  if (cardTools) cardTools.setup(() => { state.transactions.forEach((item) => classify(item)); if (state.transactions.length) { updateSummary(); renderRows(); } markComparisonStale(); });
  $('#load-csv').addEventListener('click', loadFile); $('#analyze').addEventListener('click', analyze);
  $('#read-images').addEventListener('click', readImages); $('#extract-images').addEventListener('click', extractImageRows);
  $('#export-csv').addEventListener('click', exportTransactions);
  $('#show-sample').addEventListener('click', (event) => {
    const preview = $('#sample-preview');
    if (preview.hidden) {
      renderSamplePreview(); preview.hidden = false;
      event.currentTarget.textContent = '샘플 결과 닫기'; event.currentTarget.setAttribute('aria-expanded', 'true');
    } else {
      preview.hidden = true;
      event.currentTarget.textContent = '샘플 결과 먼저 보기'; event.currentTarget.setAttribute('aria-expanded', 'false');
    }
  });
  $('#filter-rows').addEventListener('input', (event) => { state.query = event.target.value; state.page = 0; renderRows(); });
  $('#previous-page').addEventListener('click', () => { state.page -= 1; renderRows(); }); $('#next-page').addEventListener('click', () => { state.page += 1; renderRows(); });
  $('#clear-analysis').addEventListener('click', async () => {
    if (state.ocrWorker) { await state.ocrWorker.terminate(); state.ocrWorker = null; }
    if (cardTools) cardTools.clearSession();
    state.headers = []; state.rawRows = []; state.transactions = []; state.page = 0; state.query = '';
    $('#csv-file').value = ''; $('#statement-images').value = ''; $('#ocr-text').value = ''; $('#ocr-review').hidden = true; $('#filter-rows').value = '';
    $('#mapping-panel').hidden = true; $('#results').hidden = true; $('#file-status').textContent = '분석 데이터를 초기화했습니다. 파일은 서버로 전송되지 않습니다.';
    $('#image-status').textContent = '이미지 OCR을 시작할 때 한국어 인식 엔진을 불러옵니다.';
  });
  $('#transaction-rows').addEventListener('change', (event) => {
    const id = Number(event.target.dataset.id ?? event.target.dataset.card ?? event.target.dataset.status ?? event.target.dataset.note); const item = state.transactions[id]; if (!item) return;
    if (event.target.dataset.card !== undefined) {
      const card = cardTools.getMappings().find((c) => c.id === event.target.value);
      if (card) bindCard(item,card); else { item.cardMappingId = ''; item.requiresCardLink = true; item.cardLinkReason = '거래 카드가 선택되지 않았습니다.'; }
      classify(item); renderRows(); markComparisonStale();
    } else if (event.target.dataset.status !== undefined) {
      if (item.requiresCardLink && !item.productId) { classify(item); renderRows(); } else item.status = event.target.value;
    }
    else if (event.target.dataset.note !== undefined) item.note = event.target.value;
    else {
      const field = event.target.dataset.field;
      if (field === 'amount') { const amount = parseAmount(event.target.value); if (Number.isFinite(amount)) item.amount = amount; }
      else item[field] = event.target.value;
      reclassify(item); renderRows(); markComparisonStale();
    }
    updateSummary();
  });
  $('#transaction-rows').addEventListener('input', (event) => {
    if (event.target.dataset.note !== undefined) state.transactions[Number(event.target.dataset.note)].note = event.target.value;
    const field = event.target.dataset.field;
    if (field === 'amount') {
      const amount = parseAmount(event.target.value);
      if (Number.isFinite(amount)) { state.transactions[Number(event.target.dataset.id)].amount = amount; updateSummary(); markComparisonStale(); }
    }
  });
})();
