// The farm plan and the model, rebuilt in the page from a row's own
// figures — the same rules lib/model.ts uses, so the page renders exactly
// the plan board.json carries. These functions sit outside the IIFE so a
// test can run them in Node against board.json and prove they agree.
// Constants match MODEL in lib/model.ts.
function capitalForRow(r) {
  if (r.tvl_usd >= 5000000000) return 250;
  if (r.tvl_usd >= 1000000000) return 150;
  if (r.tvl_usd >= 100000000) return 100;
  return 50;
}
function holdDaysForRow(r) {
  if (r.age_days === null) return 30;
  if (r.age_days < 180) return 60;
  if (r.age_days < 365) return 45;
  return 30;
}
function actionForRow(r, capital, chain) {
  var c = (r.category || '').toLowerCase();
  var name = r.name;
  if (c.indexOf('lend') >= 0 || c.indexOf('cdp') >= 0 || c.indexOf('collateral') >= 0) return 'Supply $' + capital + ' of USDC to ' + name + ' on ' + chain + ' and keep the position open.';
  if (c.indexOf('dex') >= 0) return 'Provide $' + capital + ' of liquidity to ' + name + '\'s main pool on ' + chain + ' and keep the position open.';
  if (c.indexOf('yield aggregator') >= 0) return 'Deposit $' + capital + ' of USDC into a ' + name + ' vault on ' + chain + ' and keep the shares.';
  if (c.indexOf('yield') >= 0 || c.indexOf('leveraged farm') >= 0 || c.indexOf('farm') >= 0) return 'Deposit $' + capital + ' of USDC into ' + name + '\'s highest-yield pool on ' + chain + ' and keep the position open.';
  if (c.indexOf('bridge') >= 0) return 'Bridge $' + capital + ' of USDC to ' + chain + ' through ' + name + ' and use the bridged funds in its app.';
  if (c.indexOf('staking') >= 0 || c.indexOf('restak') >= 0) return 'Stake $' + capital + ' of the chain\'s staking asset through ' + name + ' and keep the receipt.';
  if (c.indexOf('perpetual') >= 0 || c.indexOf('derivative') >= 0 || c.indexOf('options') >= 0) return 'Deposit $' + capital + ' of USDC as margin on ' + name + ' and open one small hedge.';
  if (c.indexOf('prediction') >= 0) return 'Fund $' + capital + ' and place one market position on ' + name + '.';
  if (c.indexOf('curator') >= 0 || c.indexOf('allocator') >= 0 || c.indexOf('manager') >= 0) return 'Deposit $' + capital + ' into a ' + name + ' vault on ' + chain + ' and keep the shares.';
  if (c.indexOf('stable') >= 0) return 'Mint or deposit $' + capital + ' of the stable asset through ' + name + ' on ' + chain + '.';
  if (c.indexOf('rwa') >= 0) return 'Mint $' + capital + ' of the protocol\'s yield asset on ' + chain + ' and hold it.';
  if (c.indexOf('insurance') >= 0) return 'Buy $' + capital + ' of cover from ' + name + ' on ' + chain + ' and keep the policy.';
  if (c.indexOf('basis') >= 0) return 'Deposit $' + capital + ' of USDC into ' + name + '\'s basis vault on ' + chain + ' and keep the shares.';
  if (c.indexOf('payment') >= 0) return 'Pay $' + capital + ' through ' + name + ' on ' + chain + ' and keep the receipt.';
  if (c.indexOf('chain') >= 0) return 'Use $' + capital + ' of assets in ' + name + ' on ' + chain + ' and keep the position open.';
  return 'Deposit $' + capital + ' of USDC into ' + name + ' on ' + chain + ' and keep the position open.';
}
function weeklyActionForRow(r) {
  var c = (r.category || '').toLowerCase();
  if (c.indexOf('lend') >= 0 || c.indexOf('cdp') >= 0 || c.indexOf('collateral') >= 0) return 'Make one qualifying action each week, such as a supply, a borrow or a repayment.';
  if (c.indexOf('dex') >= 0) return 'Make one qualifying action each week, such as a swap, adding liquidity or a vote.';
  if (c.indexOf('yield') >= 0 || c.indexOf('curator') >= 0 || c.indexOf('allocator') >= 0 || c.indexOf('manager') >= 0 || c.indexOf('basis') >= 0) return 'Make one qualifying action each week, such as a deposit, a rebalance or a claim of vault rewards.';
  if (c.indexOf('perpetual') >= 0 || c.indexOf('derivative') >= 0 || c.indexOf('options') >= 0 || c.indexOf('prediction') >= 0) return 'Make one qualifying action each week, such as one small trade or one market position.';
  if (c.indexOf('rwa') >= 0) return 'Make one qualifying action each week, such as a mint, a hold check or a reinvestment of yield.';
  if (c.indexOf('bridge') >= 0) return 'Make one qualifying action each week, such as one bridge transfer or one use of the bridged funds.';
  return 'Make one qualifying action each week, such as a deposit, a swap or a vote.';
}
function farmStepsForRow(r) {
  var chain = r.chains.length > 0 ? r.chains[0] : 'its main chain';
  var capital = capitalForRow(r);
  var hold = holdDaysForRow(r);
  var steps = [
    ['Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline.', 'under $3 of gas for the first transaction', '5 minutes'],
    [actionForRow(r, capital, chain), '$' + capital + ' of capital and about $' + (capital >= 150 ? 8 : 4) + ' of gas', '15 minutes to set up'],
    [weeklyActionForRow(r), 'about $2 of gas a week', '10 minutes a week'],
    ['Hold the position for at least ' + hold + ' days so the activity is counted in more than one snapshot.', 'the $' + capital + ' stays in the position', hold + ' days'],
    ['Before you withdraw, open the protocol\'s own points or rewards page from its own site and claim only from the link it publishes, never from a message, a post or a direct message.', 'no fee to check, and never pay to claim', '10 minutes'],
    ['Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.', 'nothing but the log', '5 minutes'],
  ];
  return steps.map(function (s) {
    var t = s[0] + ' Cost: ' + s[1] + '. Time: ' + s[2] + '.';
    if (t.length > 600) t = t.slice(0, 596) + '...';
    if (t.length < 20) t = t + ' Hold the position and check the protocol\'s own page.';
    return t;
  });
}
// The model's multipliers for one row, from its own figures and the
// comparables table.
function modelForRow(r, comparables, overallMedian) {
  var comp = null;
  comparables.forEach(function (c) { if (c.category === (r.category || 'Other')) comp = c; });
  var multiple = comp ? comp.multiple : overallMedian;
  var categoryN = comp ? comp.live_n : 0;
  var categoryMedian = comp ? comp.category_median : null;
  var growthPct = Math.min(100, Math.max(-50, r.change_7d === null ? 0 : r.change_7d));
  var growthMult = 1 + (growthPct / 100) * 0.40;
  var age = r.age_days === null ? 365 : r.age_days;
  var maturityMult = 0.55 + Math.min(age, 1095) / 1095 * 0.45;
  var chainMult = 1 + Math.min(Math.max(r.chains.length - 1, 0), 5) * 0.02;
  var recomputed = Math.max(1, Math.round(r.tvl_usd * multiple * growthMult * maturityMult * chainMult));
  return { multiple: multiple, categoryN: categoryN, categoryMedian: categoryMedian, growthMult: growthMult, maturityMult: maturityMult, chainMult: chainMult, recomputed: recomputed };
}

// The page. No network: every row, number and farm step comes from
// window.RADAR, the dataset main.ts wrote beside this page. The farm plan is
// rendered from the row's own figures with the functions above, so the page,
// board.json and dossier.json agree. State lives in the URL hash, so a
// filtered view and a detail view are reproducible: #tab=board|live|method,
// #q, #category, #chain, #watchlist=1, #sort, #p=<slug>.
(function () {
  'use strict';
  var R = window.RADAR;
  if (!R || !R.rows) {
    document.getElementById('board').textContent = 'No radar data.';
    return;
  }
  // Expand data.js's short keys into the row shape the page uses, and derive
  // rank, watchlist membership and confidence from the dataset itself.
  (function normalize() {
    var watchSet = {};
    R.watchlist.forEach(function (s) { watchSet[s] = true; });
    var compByCat = {};
    R.comparables.forEach(function (c) { compByCat[c.category] = c; });
    R.rows = R.rows.map(function (r, i) {
      var comp = compByCat[r.c || 'Other'];
      var n = comp ? comp.live_n : 0;
      var conf = (n < 3 || r.a === null) ? 'low' : (r.g === null ? 'medium' : 'high');
      return {
        rank: i + 1, slug: r.s, name: r.n, category: r.c, chains: r.h,
        tvl_usd: r.t, change_7d: r.g, age_days: r.a,
        on_watchlist: !!watchSet[r.s], confidence: conf, implied_value_usd: r.v,
      };
    });
    R.live = R.live.map(function (p) {
      return { slug: p.s, name: p.n, category: p.c, chains: p.h, tvl_usd: p.t, mcap_usd: p.m, change_7d: p.g };
    });
  })();
  var root = document.getElementById('board');

  function money(n) {
    if (n === null || n === undefined) return '—';
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function pct(n) {
    if (n === null || n === undefined) return '—';
    var s = (n > 0 ? '+' : '') + n.toFixed(2) + '%';
    return n > 0 ? '<span class="pos">' + s + '</span>' : n < 0 ? '<span class="neg">' + s + '</span>' : s;
  }
  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function chainsShort(chains) {
    if (!chains || chains.length === 0) return '—';
    return esc(chains.slice(0, 2).join(', ')) + (chains.length > 2 ? ' +' + (chains.length - 2) : '');
  }
  function confBadge(c) {
    return c === 'low'
      ? '<span class="badge low">low confidence</span>'
      : c === 'medium'
        ? '<span class="badge medium">medium confidence</span>'
        : '<span class="badge high">high confidence</span>';
  }
  function parseHash() {
    var h = {};
    location.hash.slice(1).split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) h[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return h;
  }
  function setHash(h) {
    var parts = [];
    Object.keys(h).forEach(function (k) { if (h[k]) parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(h[k])); });
    history.replaceState(null, '', '#' + parts.join('&'));
  }
  function state() {
    var h = parseHash();
    return {
      tab: h.tab || 'board', q: (h.q || '').toLowerCase(),
      category: h.category || '', chain: h.chain || '',
      watchlist: h.watchlist === '1', sort: h.sort || 'implied',
      dir: h.dir || 'desc', p: h.p || '',
    };
  }

  function hero() {
    var top = R.rows[0];
    return '<header class="hero"><h1>Token Launch Radar</h1>'
      + '<p>Which protocols with no token yet would be worth the most if they launched one — ranked from a sealed snapshot of every protocol DefiLlama tracks, by an implied value computed from that snapshot alone.</p>'
      + '<p class="sub">Snapshot ' + esc(R.as_of) + ' · ' + esc(R.source) + ' · floor $' + R.floor_usd.toLocaleString('en-US') + ' TVL · model ' + esc(R.model_version) + ' · overall comparable ' + R.overall_median.toFixed(3) + '× FDV/TVL</p>'
      + '<div class="stats">'
      + '<div class="stat"><b>' + R.board_size + '</b><span>protocols ranked</span></div>'
      + '<div class="stat"><b>' + R.watchlist_size + ' / ' + R.watchlist_size + '</b><span>watchlist covered</span></div>'
      + '<div class="stat"><b>' + R.early_size + '</b><span>early finds below the floor</span></div>'
      + '<div class="stat"><b>' + money(top.implied_value_usd) + '</b><span>top implied value — ' + esc(top.name) + '</span></div>'
      + '</div></header>';
  }
  function tabs(s) {
    function t(name, label) {
      return '<button data-tab="' + name + '" aria-pressed="' + (s.tab === name) + '">' + label + '</button>';
    }
    return '<div class="tabs">' + t('board', 'Board') + t('live', 'Live tokens (' + R.live_size + ')') + t('method', 'Method') + '</div>';
  }

  function filteredRows(s) {
    var rows = R.rows.filter(function (r) {
      if (s.watchlist && !r.on_watchlist) return false;
      if (s.category && r.category !== s.category) return false;
      if (s.chain && r.chains.indexOf(s.chain) < 0) return false;
      if (s.q) {
        var hay = (r.name + ' ' + r.slug + ' ' + (r.category || '') + ' ' + r.chains.join(' ')).toLowerCase();
        if (hay.indexOf(s.q) < 0) return false;
      }
      return true;
    });
    var key = { implied: 'implied_value_usd', tvl: 'tvl_usd', growth: 'change_7d', age: 'age_days', name: 'name' }[s.sort] || 'implied_value_usd';
    rows.sort(function (a, b) {
      var av = a[key], bv = b[key];
      if (av === null || av === undefined) av = -Infinity;
      if (bv === null || bv === undefined) bv = -Infinity;
      var d = (typeof av === 'string' ? (av < bv ? -1 : av > bv ? 1 : 0) : av - bv);
      return s.dir === 'desc' ? -d : d;
    });
    return rows;
  }

  function boardView(s) {
    var cats = [];
    R.rows.forEach(function (r) { if (r.category && cats.indexOf(r.category) < 0) cats.push(r.category); });
    cats.sort();
    var chains = [];
    R.rows.forEach(function (r) { r.chains.forEach(function (c) { if (chains.indexOf(c) < 0) chains.push(c); }); });
    chains.sort();
    var rows = filteredRows(s);
    var multByCat = {};
    R.comparables.forEach(function (c) { multByCat[c.category] = c.multiple; });
    var html = '<div class="wrap">' + tabs(s)
      + '<div class="controls">'
      + '<input type="search" id="q" placeholder="Search name, slug, category, chain…" value="' + esc(s.q) + '">'
      + '<select id="category"><option value="">All categories</option>'
      + cats.map(function (c) { return '<option' + (s.category === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('')
      + '</select>'
      + '<select id="chain"><option value="">All chains</option>'
      + chains.map(function (c) { return '<option' + (s.chain === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('')
      + '</select>'
      + '<select id="sort">'
      + [['implied', 'Sort: implied value'], ['tvl', 'Sort: TVL'], ['growth', 'Sort: 7d change'], ['age', 'Sort: age'], ['name', 'Sort: name']]
        .map(function (o) { return '<option value="' + o[0] + '"' + (s.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('')
      + '</select>'
      + '<label><input type="checkbox" id="watchlist"' + (s.watchlist ? ' checked' : '') + '> Watchlist only</label>'
      + '</div>'
      + '<p class="note">Showing ' + rows.length + ' of ' + R.board_size + ' ranked protocols. Click a row for its detail view and farm plan. “Watchlist” is the snapshot’s own list of protocols at or above the $50M floor; “Early” is a pre-token protocol the list leaves out, ranked on its own record.</p>'
      + '<table><thead><tr><th>#</th><th>Protocol</th><th>Category</th><th class="hide-s">Chains</th><th class="num">TVL</th><th class="num">7d</th><th class="num hide-s">Age</th><th class="num">Implied value</th><th class="num hide-s">Multiple</th></tr></thead><tbody>'
      + rows.map(function (r) {
        return '<tr data-slug="' + esc(r.slug) + '"' + (s.p === r.slug ? ' class="selected"' : '') + '>'
          + '<td>' + r.rank + '</td>'
          + '<td><b>' + esc(r.name) + '</b>'
          + (r.on_watchlist ? '<span class="badge watch">Watchlist</span>' : '<span class="badge early">Early</span>')
          + confBadge(r.confidence)
          + '<div class="sub2">' + esc(r.slug) + '</div></td>'
          + '<td>' + esc(r.category || '—') + '</td>'
          + '<td class="hide-s">' + chainsShort(r.chains) + '</td>'
          + '<td class="num">' + money(r.tvl_usd) + '</td>'
          + '<td class="num">' + pct(r.change_7d) + '</td>'
          + '<td class="num hide-s">' + (r.age_days === null ? '—' : r.age_days + 'd') + '</td>'
          + '<td class="num"><b>' + money(r.implied_value_usd) + '</b></td>'
          + '<td class="num hide-s">' + (multByCat[r.category || 'Other'] || R.overall_median).toFixed(3) + '×</td></tr>';
      }).join('')
      + '</tbody></table>'
      + detailView(s)
      + '<footer>Implied value is a model claim from the sealed snapshot, not a prediction of a launch or a price. “Records no token” means the snapshot entry carries no market cap, no CoinGecko id and no symbol — it is not proof the protocol has none.</footer>'
      + '</div>';
    return html;
  }

  function detailView(s) {
    var r = null;
    R.rows.forEach(function (row) { if (row.slug === s.p) r = row; });
    if (!r) return '';
    var m = modelForRow(r, R.comparables, R.overall_median);
    var ageText = r.age_days === null ? 'unknown — the model uses 365 days' : r.age_days + ' days';
    return '<section class="detail" id="detail"><h2>#' + r.rank + ' ' + esc(r.name) + '</h2>'
      + '<div class="meta">' + esc(r.slug) + ' · ' + esc(r.category || '—') + ' · ' + esc(r.chains.join(', ') || '—')
      + (r.on_watchlist ? ' · <span class="badge watch">Watchlist</span>' : ' · <span class="badge early">Early — not on the snapshot’s watchlist</span>')
      + ' ' + confBadge(r.confidence) + '</div>'
      + '<h3>Implied value</h3>'
      + '<div class="math"><b>' + money(r.implied_value_usd) + '</b><br>'
      + money(r.tvl_usd) + ' TVL × ' + m.multiple.toFixed(3) + '× multiple × ' + m.growthMult.toFixed(2) + ' growth × ' + m.maturityMult.toFixed(2) + ' maturity × ' + m.chainMult.toFixed(2) + ' chains'
      + ' = ' + money(m.recomputed) + ' <span class="dim">(' + (m.recomputed === r.implied_value_usd ? 'recomputed from the snapshot figures — matches' : 'recomputed ' + money(m.recomputed)) + ')</span><br>'
      + '<span class="dim">Multiple: category median ' + (m.categoryMedian === null ? '—' : m.categoryMedian.toFixed(3) + '×') + ' from ' + m.categoryN + ' live comparables, shrunk toward the overall median ' + R.overall_median.toFixed(3) + '×. Age: ' + ageText + '. 7d change: ' + (r.change_7d === null ? 'not reported' : r.change_7d.toFixed(2) + '%') + '.</span></div>'
      + (r.confidence === 'low'
        ? '<div class="warn">Low confidence: ' + (m.categoryN < 3 ? 'its category has fewer than 3 live tokens in the snapshot, so the multiple is the all-category median, not its own. ' : '')
          + (r.age_days === null ? 'Its listing date is not in the snapshot, so maturity uses 365 days. ' : '')
          + 'Treat this implied value as the least certain on the board.</div>' : '')
      + (!r.on_watchlist
        ? '<div class="warn">Not on the watchlist: the snapshot carries no parent-protocol field, so this row is ranked on its own record. It may be a child or a version of a protocol that already has a token — its launch is less certain than a watchlist row’s.</div>' : '')
      + '<h3>Farm plan</h3><ol class="farm">'
      + farmStepsForRow(r).map(function (step) { return '<li>' + esc(step) + '</li>'; }).join('')
      + '</ol>'
      + '<p class="note">This plan farms the protocol’s own usage. It does not claim the protocol runs a points program or an airdrop — the snapshot carries no such flag — and it never asks you to pay to claim or to follow a link from a message.</p>'
      + '</section>';
  }

  function liveView(s) {
    return '<div class="wrap">' + tabs(s)
      + '<p class="note">Protocols that already have a token, shown by the market’s own value — market cap, not an implied value. They are here so the board’s comparables can be checked, and so a pre-token row is never confused with a live one.</p>'
      + '<table><thead><tr><th>Protocol</th><th>Category</th><th class="hide-s">Chains</th><th class="num">TVL</th><th class="num">Market cap</th><th class="num">FDV/TVL</th><th class="num">7d</th></tr></thead><tbody>'
      + R.live.map(function (p) {
        var ratio = p.mcap_usd && p.tvl_usd ? p.mcap_usd / p.tvl_usd : null;
        return '<tr><td><b>' + esc(p.name) + '</b><div class="sub2">' + esc(p.slug) + '</div></td>'
          + '<td>' + esc(p.category || '—') + '</td><td class="hide-s">' + chainsShort(p.chains) + '</td>'
          + '<td class="num">' + money(p.tvl_usd) + '</td><td class="num">' + money(p.mcap_usd) + '</td>'
          + '<td class="num">' + (ratio === null ? '—' : ratio.toFixed(3) + '×') + '</td><td class="num">' + pct(p.change_7d) + '</td></tr>';
      }).join('')
      + '</tbody></table></div>';
  }

  function methodView(s) {
    var m = R.model;
    return '<div class="wrap">' + tabs(s)
      + '<section class="method"><h2>How the ranking is made</h2>'
      + '<p>Every number on this page comes from one sealed snapshot: <b>' + esc(R.source) + '</b>, as of ' + esc(R.as_of) + ', ' + R.board_size + ' protocols ranked from ' + R.rows.length + ' pre-token records. No price, no revenue and no name is brought in from outside it.</p>'
      + '<p><code>implied = TVL × multiple × growth × maturity × chains</code></p>'
      + '<ul>'
      + '<li><b>Multiple.</b> The median FDV/TVL of the live-token protocols in the same category, in this snapshot, with ratios above ' + m.ratio_max + '× dropped as residual-TVL data errors. When a category has fewer than ' + m.min_category_n + ' live comparables, the all-category median ' + R.overall_median.toFixed(3) + '× is used instead. The result is shrunk toward the overall median with a prior of ' + m.shrinkage_prior + ' and clamped to [' + m.multiple_min + ', ' + m.multiple_max + '].</li>'
      + '<li><b>Growth.</b> The 7-day TVL change, clamped to [' + m.growth_floor + ', ' + m.growth_cap + ']%, weighted ' + m.growth_weight + ': <code>1 + (growth / 100) × ' + m.growth_weight + '</code>.</li>'
      + '<li><b>Maturity.</b> Days since listing, capped at ' + m.maturity_days + ': <code>' + m.maturity_floor + ' + min(age, ' + m.maturity_days + ') / ' + m.maturity_days + ' × ' + m.maturity_range + '</code>. Unknown age counts as ' + m.unknown_age_days + ' days.</li>'
      + '<li><b>Chains.</b> <code>1 + min(chains − 1, 5) × ' + m.chain_bonus + '</code> — at most a 10% uplift for being on more chains.</li>'
      + '</ul>'
      + '<p>Excluded from ranking: exchanges, bridges, liquid-staking and restaking receipts, versioned pools, and wrapped or staked products — the same rule the snapshot’s own watchlist uses, applied to the whole snapshot. A protocol is “pre-token” when its snapshot entry records no market cap, no CoinGecko id and no symbol.</p>'
      + '<h2>Comparables by category</h2>'
      + '<table><thead><tr><th>Category</th><th class="num">Live comparables</th><th class="num">Category median</th><th class="num">Multiple used</th></tr></thead><tbody>'
      + R.comparables.map(function (c) {
        return '<tr><td>' + esc(c.category) + '</td><td class="num">' + c.live_n + '</td>'
          + '<td class="num">' + (c.category_median === null ? '—' : c.category_median.toFixed(3) + '×') + '</td>'
          + '<td class="num">' + c.multiple.toFixed(3) + '×</td></tr>';
      }).join('')
      + '</tbody></table>'
      + '<p class="note">Categories with fewer than ' + m.min_category_n + ' live comparables fall back to the overall median ' + R.overall_median.toFixed(3) + '× — that is why Risk Curators and Onchain Capital Allocator, the two biggest categories on the board, are marked low confidence at the top.</p>'
      + '</section></div>';
  }

  function render() {
    var s = state();
    root.innerHTML = hero() + (s.tab === 'live' ? liveView(s) : s.tab === 'method' ? methodView(s) : boardView(s));
    root.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { var h = parseHash(); h.tab = b.getAttribute('data-tab'); delete h.p; setHash(h); render(); });
    });
    var q = document.getElementById('q');
    if (q) q.addEventListener('input', function () { var h = parseHash(); h.q = q.value; setHash(h); render(); });
    var cat = document.getElementById('category');
    if (cat) cat.addEventListener('change', function () { var h = parseHash(); h.category = cat.value; setHash(h); render(); });
    var ch = document.getElementById('chain');
    if (ch) ch.addEventListener('change', function () { var h = parseHash(); h.chain = ch.value; setHash(h); render(); });
    var so = document.getElementById('sort');
    if (so) so.addEventListener('change', function () { var h = parseHash(); h.sort = so.value; setHash(h); render(); });
    var wl = document.getElementById('watchlist');
    if (wl) wl.addEventListener('change', function () { var h = parseHash(); h.watchlist = wl.checked ? '1' : ''; setHash(h); render(); });
    root.querySelectorAll('tbody tr[data-slug]').forEach(function (tr) {
      tr.addEventListener('click', function () {
        var h = parseHash(); h.p = tr.getAttribute('data-slug'); setHash(h); render();
        var d = document.getElementById('detail');
        if (d) d.scrollIntoView();
      });
    });
    if (s.p) {
      var d = document.getElementById('detail');
      if (d) d.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', render);
  render();
})();
