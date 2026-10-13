(() => {
  'use strict';
  const STORAGE_KEY = 'cardpilot.card-links.v1';
  const products = window.CARDPILOT_RULES.products;
  const $ = (id) => document.querySelector(id);
  const clean = (v) => String(v || '').toLowerCase().replace(/[\s()（）-]/g, '');
  const family = (issuer) => issuer.replace(/\s*\(BC 회원사\)/, '');
  const families = [...new Set(products.map((p) => family(p.issuer)))];
  const aliases = {
    'BC 바로카드': ['bc바로', '비씨바로', '바로카드'], 'KB국민카드': ['kb국민', '국민카드', 'kb카드'],
    '현대카드': ['현대카드', '현대'], '삼성카드': ['삼성카드', '삼성'], '롯데카드': ['롯데카드', '롯데'],
    '우리카드': ['우리카드', '우리'], '신한카드': ['신한카드', '신한'], '하나카드': ['하나카드', '하나'],
    'NH농협카드': ['nh농협', '농협카드', '농협'], 'IBK기업은행': ['ibk기업', '기업은행', '기업카드'],
    'SC제일은행': ['sc제일', '제일은행'], 'iM뱅크': ['im뱅크', 'dgb대구', '대구은행'],
    'BNK부산은행': ['bnk부산', '부산은행'], 'BNK경남은행': ['bnk경남', '경남은행'],
    'Sh수협은행': ['sh수협', '수협은행', '수협카드'], '광주은행': ['광주은행', '광주카드']
  };
  let mappings = [], profiles = {}, editingId = '', changeHandler = () => {}, storageNotice = '';
  function validMapping(card) {
    const product = products.find((p) => p.id === card?.productId);
    return Boolean(product && typeof card.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(card.id)
      && families.includes(card.issuer) && family(product.issuer) === card.issuer && /^\d{4}$/.test(card.last4));
  }
  function loadMappings(storage) {
    try {
      const saved = JSON.parse((storage || window.localStorage).getItem(STORAGE_KEY) || '{"version":1,"cards":[]}');
      if (saved.version !== 1 || !Array.isArray(saved.cards) || saved.cards.length > 100 || saved.cards.some((c) => !validMapping(c)) || new Set(saved.cards.map((c) => c.id)).size !== saved.cards.length) throw Error();
      return saved.cards.map(({ id, issuer, last4, productId }) => ({ id, issuer, last4, productId }));
    } catch (_) { storageNotice = '저장한 카드 연결을 읽지 못했습니다. 확인 후 다시 등록해 주세요.'; return []; }
  }
  function saveMappings(cards, storage) {
    if (cards.length > 100 || cards.some((c) => !validMapping(c))) throw Error('카드사·끝 4자리·상품을 확인해 주세요. 전체 카드번호는 입력하지 마세요.');
    const keys = cards.map((c) => `${c.issuer}|${c.last4}`);
    if (new Set(keys).size !== keys.length || new Set(cards.map((c) => c.id)).size !== cards.length) throw Error('같은 카드사와 끝 4자리 연결이 이미 있습니다. 기존 연결을 수정하거나 다른 식별 가능한 카드만 등록하세요.');
    // Only these four fields are persisted; financial amounts and OCR text stay in memory.
    const safe = cards.map(({ id, issuer, last4, productId }) => ({ id, issuer, last4, productId }));
    try { (storage || window.localStorage).setItem(STORAGE_KEY, JSON.stringify({ version: 1, cards: safe })); }
    catch (_) { throw Error('이 브라우저에 저장하지 못했습니다. 저장 권한을 확인해 주세요.'); }
    return safe;
  }
  function detectCardIdentity(text) {
    const headers = String(text || '').split(/\r?\n/).filter((line) => /승인|취소|카드번호|끝자리/.test(line));
    const header = headers.join('\n');
    // Never interpret a complete card number or a time/date as the last four digits.
    if (/(?:\d[ -]?){12,19}/.test(header)) return { issuer: '', last4: '', reason: '전체 카드번호를 가리고 끝 4자리만 남겨 주세요.' };
    const identified = families.filter((name) => (aliases[name] || [name]).some((alias) => clean(header).includes(clean(alias))));
    const endings = new Set();
    for (const pattern of [/\*{2,}\s*(\d{4})(?!\d)/g, /(?:끝자리|끝4자리|카드번호)\s*[:：]?\s*(\d{4})(?!\d)/g, /(?:카드|신한|삼성|현대|롯데|국민|하나|우리|농협|바로|비씨|BC|KB|은행|뱅크|기업)\s*[([]?\s*(\d{4})(?!\d)/gi]) {
      for (const match of header.matchAll(pattern)) endings.add(match[1]);
    }
    if (identified.length !== 1) return { issuer: '', last4: '', reason: '카드사가 없거나 모호합니다. 카드 연결을 직접 확인해 주세요.' };
    if (endings.size !== 1) return { issuer: identified[0], last4: '', reason: '끝 4자리가 없거나 모호합니다. 카드 연결을 직접 확인해 주세요.' };
    return { issuer: identified[0], last4: [...endings][0], reason: '' };
  }
  function resolveIdentity(identity, cards = mappings) {
    if (!identity?.issuer || !identity.last4) return { card: null, reason: identity?.reason || '카드 연결 확인 필요' };
    const matches = cards.filter((c) => validMapping(c) && c.issuer === identity.issuer && c.last4 === identity.last4);
    if (matches.length !== 1) return { card: null, reason: matches.length ? '중복 카드 연결: 상품을 확정할 수 없습니다.' : '등록되지 않은 카드입니다. 카드사·끝 4자리·상품을 확인해 주세요.' };
    return { card: matches[0], reason: '' };
  }
  function previousMonth(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return '';
    const [year, value] = month.split('-').map(Number);
    if (year < 2000 || year > 2100) return '';
    return value === 1 ? `${year - 1}-12` : `${year}-${String(value - 1).padStart(2, '0')}`;
  }
  function number(value, max = 1e12, integer = true) {
    if (!/^\d+(?:\.\d+)?$/.test(String(value ?? '').trim())) return NaN;
    const n = Number(value); return Number.isFinite(n) && n <= max && (!integer || Number.isSafeInteger(n)) ? n : NaN;
  }
  function comparePurchase(purchase, cards, conditions) {
    const amount = number(purchase.amount, 1e9);
    const prevMonth = previousMonth(purchase.month);
    if (!purchase.merchant?.trim() || purchase.merchant.length > 100 || !prevMonth || !Number.isFinite(amount) || amount <= 0) return { error: '결제금액은 1~1,000,000,000원 정수로, 사용처와 결제 월을 정확히 입력해 주세요.', rows: [], winners: [] };
    const rows = cards.map((card) => {
      const c = conditions[card.id]; const result = { card, benefit: null, status: 'unknown', reason: '조건 확인 필요 / 추천 산정 불가: 이 카드의 할인 조건을 입력해 주세요.' };
      if (!c) return result;
      const rate = number(c.rate, 100, false), minimum = number(c.minimum), spend = number(c.previousSpend);
      const cap = c.capMode === 'none' ? Infinity : number(c.cap), used = c.capMode === 'none' ? 0 : number(c.used);
      if (!c.confirmed || !c.previousConfirmed || c.previousMonth !== prevMonth || !c.scope?.trim()
          || !Number.isFinite(rate) || !Number.isFinite(minimum) || !Number.isFinite(spend)
          || !['limited','none'].includes(c.capMode) || (c.capMode === 'limited' && (!Number.isFinite(cap) || cap <= 0 || !Number.isFinite(used) || used > cap))) {
        result.reason = `조건 확인 필요 / 추천 산정 불가: ${prevMonth} 확정 실적, 혜택 적용 조건, 할인률·한도·이미 사용한 혜택을 확인해 주세요.`; return result;
      }
      const targets = c.scope.split(',').map(clean).filter(Boolean);
      if (!targets.includes('*') && !targets.includes(clean(purchase.merchant))) return { ...result, status: 'calculated', benefit: 0, reason: '입력한 혜택 대상 사용처와 일치하지 않습니다.' };
      if (spend < minimum) return { ...result, status: 'calculated', benefit: 0, reason: `${prevMonth} 확정 실적 ${spend.toLocaleString('ko-KR')}원이 입력한 요구 실적 ${minimum.toLocaleString('ko-KR')}원에 미달합니다.` };
      const benefit = Math.floor(Math.min(amount * rate / 100, Math.max(0, cap - used)));
      return { ...result, status: 'calculated', benefit, reason: `사용자 확인 ${rate}% 정률 할인 · ${prevMonth} 실적 조건 충족 · ${cap === Infinity ? '한도 없음으로 입력' : `남은 혜택 한도 ${(cap - used).toLocaleString('ko-KR')}원 반영`}. 최종 적용·반올림은 카드사와 다를 수 있습니다.` };
    });
    const calculated = rows.filter((r) => r.benefit !== null);
    const best = Math.max(0, ...calculated.map((r) => r.benefit));
    return { error: '', rows, winners: best > 0 ? calculated.filter((r) => r.benefit === best).map((r) => r.card.id) : [], incomplete: calculated.length !== rows.length };
  }
  function invalidate() { if ($('#purchase-results')) $('#purchase-results').hidden = true; if ($('#purchase-status')) $('#purchase-status').textContent = '입력이나 카드 연결이 바뀌면 다시 비교해 주세요.'; }
  function cardLabel(card) { const p = products.find((p) => p.id === card.productId); return `${card.issuer} · 끝 ${card.last4} · ${p?.name || '상품 확인 필요'}`; }
  function options(select, cards, empty) {
    select.replaceChildren(); const none = document.createElement('option'); none.value = ''; none.textContent = empty; select.append(none);
    cards.forEach(({ value, label }) => { const o = document.createElement('option'); o.value = value; o.textContent = label; select.append(o); });
  }
  function renderWallet() {
    const list = $('#wallet-list'); list.replaceChildren();
    mappings.forEach((card) => { const li = document.createElement('li'); const name = document.createElement('span'); name.textContent = cardLabel(card); li.append(name);
      for (const [action,label] of [['edit','수정'],['remove','연결 해제']]) { const button = document.createElement('button'); button.type = 'button'; button.className = 'btn secondary'; button.dataset.walletAction = action; button.dataset.walletId = card.id; button.textContent = label; li.append(button); } list.append(li); });
    const previous = $('#benefit-card').value;
    options($('#benefit-card'), mappings.map((c) => ({ value: c.id, label: cardLabel(c) })), '보유 카드를 선택하세요');
    if (mappings.some((c) => c.id === previous)) $('#benefit-card').value = previous;
    $('#wallet-empty').hidden = mappings.length > 0;
    window.CARDPILOT_BC?.refreshCards();
  }
  function fillWalletProducts(selected) {
    options($('#wallet-product'), products.filter((p) => family(p.issuer) === $('#wallet-issuer').value).map((p) => ({ value: p.id, label: p.name })), '상품을 직접 선택하세요');
    if (selected) $('#wallet-product').value = selected;
  }
  function resetWalletForm() { editingId = ''; $('#wallet-last4').value = ''; $('#wallet-product').value = ''; $('#wallet-save').textContent = '카드 연결 저장'; }
  function replaceMappings(next) {
    mappings = saveMappings(next);
    profiles = Object.fromEntries(Object.entries(profiles).filter(([id]) => mappings.some((c) => c.id === id)));
    invalidate(); renderWallet(); changeHandler();
  }
  const fields = ['rate','minimum','previousSpend','previousMonth','scope','capMode','cap','used'];
  function readProfile() { const c = Object.fromEntries(fields.map((f) => [f, $(`#benefit-${f}`).value])); c.confirmed = $('#benefit-confirmed').checked; c.previousConfirmed = $('#benefit-previousConfirmed').checked; return c; }
  function fillProfile() { const c = profiles[$('#benefit-card').value] || {}; fields.forEach((f) => { $(`#benefit-${f}`).value = c[f] || ''; }); $('#benefit-confirmed').checked = Boolean(c.confirmed); $('#benefit-previousConfirmed').checked = Boolean(c.previousConfirmed); $('#benefit-cap').disabled = c.capMode === 'none'; $('#benefit-used').disabled = c.capMode === 'none'; }
  function setup(onChange) {
    changeHandler = onChange; mappings = loadMappings();
    options($('#wallet-issuer'), families.map((issuer) => ({ value: issuer, label: issuer })), '카드사를 선택하세요');
    renderWallet(); fillWalletProducts();
    if(window.CARDPILOT_BC)window.CARDPILOT_BC.setup({getCards:()=>mappings,invalidate});
    $('#wallet-status').textContent = storageNotice || '이 브라우저에 카드사·끝 4자리·상품 연결만 저장합니다. 공유 기기에서는 해제해 주세요.';
    $('#wallet-issuer').addEventListener('change', () => fillWalletProducts());
    $('#wallet-form').addEventListener('submit', (e) => { e.preventDefault(); try {
      const card = { id: editingId || window.crypto.randomUUID(), issuer: $('#wallet-issuer').value, last4: $('#wallet-last4').value.trim(), productId: $('#wallet-product').value };
      const next = mappings.filter((c) => c.id !== editingId); next.push(card);
      replaceMappings(next); delete profiles[card.id]; resetWalletForm(); fillProfile();
      $('#wallet-status').textContent = '카드 연결을 저장했습니다. 이미 불명확하게 불러온 거래는 자동으로 연결하지 않습니다. 거래 표에서 직접 확인하거나 다시 추출해 주세요.';
    } catch (error) { $('#wallet-status').textContent = error.message; } });
    $('#wallet-cancel').addEventListener('click', resetWalletForm);
    $('#wallet-list').addEventListener('click', (e) => { const b = e.target.closest('[data-wallet-action]'); if (!b) return; const c = mappings.find((c) => c.id === b.dataset.walletId); if (!c) return;
      if (b.dataset.walletAction === 'edit') { editingId = c.id; $('#wallet-issuer').value = c.issuer; fillWalletProducts(c.productId); $('#wallet-last4').value = c.last4; $('#wallet-save').textContent = '연결 수정 저장'; $('#wallet-last4').focus(); }
      else { try { replaceMappings(mappings.filter((card) => card.id !== c.id)); resetWalletForm(); fillProfile(); $('#wallet-status').textContent = '연결을 해제했습니다. 해당 연결의 기존 거래도 확인 필요로 보류합니다.'; } catch (error) { $('#wallet-status').textContent = error.message; } }
    });
    $('#wallet-clear').addEventListener('click', () => { try { replaceMappings([]); resetWalletForm(); fillProfile(); $('#wallet-status').textContent = '저장한 카드 연결을 모두 해제했습니다.'; } catch (error) { $('#wallet-status').textContent = error.message; } });
    $('#benefit-card').addEventListener('change', fillProfile);
    $('#benefit-capMode').addEventListener('change', () => { const none = $('#benefit-capMode').value === 'none'; $('#benefit-cap').disabled = none; $('#benefit-used').disabled = none; });
    $('#benefit-form').addEventListener('input', invalidate);
    $('#purchase-form').addEventListener('input', invalidate);
    $('#benefit-form').addEventListener('submit', (e) => { e.preventDefault(); const id = $('#benefit-card').value; if (!id) { $('#benefit-status').textContent = '보유 카드를 먼저 선택하세요.'; return; } profiles[id] = readProfile(); invalidate(); $('#benefit-status').textContent = '사용자 확인 조건을 이번 화면에 보관했습니다. 비교 버튼을 누르면 누락·잘못된 값을 검사합니다. 새로고침하면 조건과 실적은 사라집니다.'; });
    const now = new Date(); $('#purchase-month').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
    $('#purchase-form').addEventListener('submit', (e) => { e.preventDefault(); const purchase={amount:$('#purchase-amount').value,merchant:$('#purchase-merchant').value,month:$('#purchase-month').value,category:$('#purchase-category').value,channel:$('#purchase-channel').value,provider:$('#purchase-provider').value,time:$('#purchase-time').value,categoryConfirmed:$('#purchase-category-confirmed').checked};
      const official=$('#purchase-mode').value==='official';
      const result=official?(window.CARDPILOT_BC?window.CARDPILOT_BC.compare(purchase,mappings):{error:'자동 혜택 조건을 불러오지 못했습니다. 확인 필요로 보류합니다.',rows:[],winners:[]}):comparePurchase(purchase,mappings,profiles);
      if (result.error || !mappings.length) { $('#purchase-status').textContent = result.error || '보유 카드를 연결해 주세요. 추천 산정 불가.'; $('#purchase-results').hidden = true; return; }
      const names = result.winners.map((id) => cardLabel(mappings.find((c) => c.id === id)));
      $('#purchase-title').textContent = names.length ? `${result.incomplete ? '조건 확인 필요 · 계산 가능한 카드 중 ' : '입력 조건 기준 예상 혜택 비교: '}${names.join(' / ')}${names.length > 1 ? ' (동률)' : ''}` : '조건 확인 필요 / 추천 산정 불가: 확인된 양의 혜택이 없습니다.';
      if(result.official){
        const groups=Object.entries(result.winnersByUnit).filter(([,ids])=>ids.length).map(([unit,ids])=>unit+': '+ids.map((id)=>cardLabel(mappings.find((c)=>c.id===id))).join(' / ')+(ids.length>1?' (동률)':''));
        $('#purchase-title').textContent=groups.length?(result.incomplete?'조건 확인 필요 · 확인된 범위의 단위별 비교: ':'공식 조건 기반 단위별 예상 비교: ')+groups.join(' · '):'조건 확인 필요 / 추천 산정 불가: 계산 가능한 양의 혜택이 없습니다.';
      }
      const body = $('#purchase-rows'); body.replaceChildren(); result.rows.forEach((row) => { const tr = document.createElement('tr'); [cardLabel(row.card), row.benefit === null ? '산정 불가' : `${row.benefit.toLocaleString('ko-KR')}${row.unit||'원'} 예상`, row.reason].forEach((text) => { const td = document.createElement('td'); td.textContent = text; tr.append(td); }); if(row.source){const link=document.createElement('a');link.href=row.source;link.target='_blank';link.rel='noopener';link.textContent=' 공식 근거 ('+row.version+')';tr.lastChild.append(link);} body.append(tr); });
      $('#purchase-status').textContent = result.incomplete ? '정보가 부족한 카드가 있어 전체 보유 카드의 추천은 산정할 수 없습니다. 표에서 누락 조건을 확인하세요.' : '사용자가 확인한 정률 할인 조건만 비교했습니다. 카드사의 최종 혜택이나 최적 카드를 보장하지 않습니다.';
      if(result.official)$('#purchase-status').textContent=(result.incomplete?'누락·미지원 조건이 있는 카드의 자동 추천은 보류합니다. ':'')+'확인한 공식 조건만 적용했습니다. 포인트·마일·원화 간 순위는 매기지 않으며 개인별 실제 정산과 다를 수 있습니다.';
      $('#purchase-results').hidden = false;
    });
    window.addEventListener('storage', (e) => { if (e.key !== STORAGE_KEY && e.key !== null) return; mappings = loadMappings(); profiles = {}; resetWalletForm(); renderWallet(); fillProfile(); invalidate(); changeHandler(); $('#wallet-status').textContent = '다른 화면에서 카드 연결이 바뀌었습니다. 거래와 조건을 확인해 주세요.'; });
  }
  window.CARDPILOT_TOOLS = { family, validMapping, loadMappings, saveMappings, detectCardIdentity, resolveIdentity, previousMonth, comparePurchase, setup, cardLabel, getMappings: () => mappings, invalidate, clearSession: () => { profiles = {}; fillProfile(); window.CARDPILOT_BC?.clearSession(); invalidate(); } };
})();
