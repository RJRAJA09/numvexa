/* ═══════════════════════════════════════════════
   CalcMitra – script.js
   All calculators, navigation, dark mode
═══════════════════════════════════════════════ */

'use strict';

/* ─── Dark Mode ─── */
const savedTheme = localStorage.getItem('calcmitra-theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('toggleIcon');
    if (icon) icon.textContent = '☀️';
  });
}

function toggleDark() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('calcmitra-theme', isDark ? 'light' : 'dark');
  document.getElementById('toggleIcon').textContent = isDark ? '🌙' : '☀️';
}

/* ─── Page Navigation ─── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name) || document.getElementById('page-home');
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToCalcs() {
  showPage('home');
  setTimeout(() => {
    document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

/* ─── Mobile Menu ─── */
function toggleMobileMenu() {
  document.getElementById('main-nav').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('main-nav').classList.remove('open');
}

/* ─── Search Filter ─── */
function filterCalcs() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const cards = document.querySelectorAll('.calc-card');
  let visible = 0;
  cards.forEach(card => {
    const tags = card.getAttribute('data-tags') || '';
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const match = !q || tags.includes(q) || title.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
}

// Keyboard shortcut ⌘K / Ctrl+K
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showPage('home');
    setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
  }
  if (e.key === 'Escape') closeModal();
});

/* ─── Contact form ─── */
function submitContact(e) {
  e.preventDefault();
  document.getElementById('contactSuccess').style.display = 'block';
  e.target.reset();
}

/* ═══════════════ MODAL ═══════════════ */
function openCalc(name) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  const builders = { emi, gst, salary, age, sip, pf, hra, gratuity, tax };
  if (!builders[name]) return;
  body.innerHTML = builders[name]();
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
function closeCalc(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

/* ─── Utility ─── */
const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtN = n => Math.round(n).toLocaleString('en-IN');
const pct = (a, b) => ((a / b) * 100).toFixed(1) + '%';

function showResult(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('show'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.classList.remove('show'); }
}

function donut(principal, interest) {
  const total = principal + interest;
  const r = 70, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const principalArc = (principal / total) * circ;
  const interestArc  = (interest  / total) * circ;
  return `
    <div class="donut-wrap">
      <svg class="donut-svg" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="20"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="20"
          stroke-dasharray="${principalArc} ${circ}" stroke-dashoffset="0" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--red)" stroke-width="20"
          stroke-dasharray="${interestArc} ${circ}" stroke-dashoffset="${-principalArc}" stroke-linecap="round"/>
      </svg>
      <div class="donut-legend">
        <div class="donut-legend-item"><div class="donut-dot" style="background:var(--accent)"></div><span>Principal (${pct(principal,total)})</span></div>
        <div class="donut-legend-item"><div class="donut-dot" style="background:var(--red)"></div><span>Interest (${pct(interest,total)})</span></div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════
   1. EMI CALCULATOR
══════════════════════════════════════ */
function emi() {
  return `
    <h2>🏦 EMI Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Loan Amount (₹)</label>
        <input type="number" id="emiP" placeholder="e.g. 1000000" min="1" />
        <span class="error-msg" id="emiErr"></span>
      </div>
      <div class="form-group">
        <label>Annual Interest Rate (%)</label>
        <input type="number" id="emiR" placeholder="e.g. 8.5" min="0.1" step="0.1" />
      </div>
      <div class="form-group">
        <label>Tenure</label>
        <div style="display:flex;gap:0.5rem">
          <input type="number" id="emiT" placeholder="e.g. 20" min="1" style="flex:1" />
          <select id="emiTUnit" style="width:110px">
            <option value="years">Years</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>
      <button class="calc-btn" onclick="calcEMI()">Calculate EMI</button>
    </div>
    <div class="result-panel" id="emiResult">
      <h3>Results</h3>
      <div class="result-grid">
        <div class="result-item">
          <span class="result-label">Monthly EMI</span>
          <span class="result-value" id="rEMI">—</span>
        </div>
        <div class="result-item">
          <span class="result-label">Total Interest</span>
          <span class="result-value red" id="rInt">—</span>
        </div>
        <div class="result-item">
          <span class="result-label">Total Payment</span>
          <span class="result-value amber" id="rTotal">—</span>
        </div>
        <div class="result-item">
          <span class="result-label">Loan Amount</span>
          <span class="result-value green" id="rPrin">—</span>
        </div>
      </div>
      <div id="emiDonut"></div>
      <div class="formula-box">
        <p><strong>Formula:</strong> EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ – 1]</p>
        <p id="emiSteps"></p>
      </div>
    </div>`;
}

function calcEMI() {
  clearError('emiErr');
  const P = parseFloat(document.getElementById('emiP').value);
  const annualR = parseFloat(document.getElementById('emiR').value);
  const tVal = parseFloat(document.getElementById('emiT').value);
  const tUnit = document.getElementById('emiTUnit').value;

  if (!P || P <= 0) return showError('emiErr', 'Enter a valid loan amount.');
  if (!annualR || annualR <= 0) return showError('emiErr', 'Enter a valid interest rate.');
  if (!tVal || tVal <= 0) return showError('emiErr', 'Enter a valid tenure.');

  const n = tUnit === 'years' ? tVal * 12 : tVal;
  const r = annualR / 12 / 100;
  const emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emiVal * n;
  const totalInterest = totalPayment - P;

  document.getElementById('rEMI').textContent = fmt(emiVal);
  document.getElementById('rInt').textContent = fmt(totalInterest);
  document.getElementById('rTotal').textContent = fmt(totalPayment);
  document.getElementById('rPrin').textContent = fmt(P);
  document.getElementById('emiDonut').innerHTML = donut(P, totalInterest);
  document.getElementById('emiSteps').innerHTML =
    `P = ${fmt(P)}, r = ${annualR}/12/100 = ${r.toFixed(6)}, n = ${n} months<br>` +
    `EMI = [${fmt(P)} × ${r.toFixed(6)} × (1+${r.toFixed(6)})^${n}] / [(1+${r.toFixed(6)})^${n} – 1]<br>` +
    `EMI = <strong>${fmt(emiVal)}</strong>`;
  showResult('emiResult');
}

/* ══════════════════════════════════════
   2. GST CALCULATOR
══════════════════════════════════════ */
function gst() {
  return `
    <h2>🧾 GST Calculator</h2>
    <div class="toggle-row">
      <button class="toggle-btn active" id="gstAddBtn" onclick="setGSTMode('add')">➕ Add GST</button>
      <button class="toggle-btn" id="gstRemBtn" onclick="setGSTMode('remove')">➖ Remove GST</button>
    </div>
    <div class="calc-form">
      <div class="form-group">
        <label id="gstAmtLabel">Original Amount (₹) – before GST</label>
        <input type="number" id="gstAmt" placeholder="e.g. 10000" min="1" />
        <span class="error-msg" id="gstErr"></span>
      </div>
      <div class="form-group">
        <label>GST Rate</label>
        <select id="gstRate">
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18" selected>18%</option>
          <option value="28">28%</option>
        </select>
      </div>
      <button class="calc-btn" onclick="calcGST()">Calculate</button>
    </div>
    <div class="result-panel" id="gstResult">
      <h3>Results</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label" id="rGLabel1">Base Amount</span><span class="result-value green" id="rGBase">—</span></div>
        <div class="result-item"><span class="result-label">GST Amount</span><span class="result-value red" id="rGTax">—</span></div>
        <div class="result-item"><span class="result-label" id="rGLabel2">Total (incl. GST)</span><span class="result-value" id="rGTotal">—</span></div>
        <div class="result-item"><span class="result-label">CGST</span><span class="result-value amber" id="rCGST">—</span></div>
        <div class="result-item"><span class="result-label">SGST</span><span class="result-value amber" id="rSGST">—</span></div>
      </div>
      <div class="formula-box" id="gstFormula"></div>
    </div>`;
}

let gstMode = 'add';
function setGSTMode(mode) {
  gstMode = mode;
  document.getElementById('gstAddBtn').classList.toggle('active', mode === 'add');
  document.getElementById('gstRemBtn').classList.toggle('active', mode === 'remove');
  document.getElementById('gstAmtLabel').textContent =
    mode === 'add' ? 'Original Amount (₹) – before GST' : 'GST-Inclusive Amount (₹)';
  document.getElementById('gstResult').classList.remove('show');
}

function calcGST() {
  clearError('gstErr');
  const amt = parseFloat(document.getElementById('gstAmt').value);
  const rate = parseFloat(document.getElementById('gstRate').value);
  if (!amt || amt <= 0) return showError('gstErr', 'Enter a valid amount.');

  let base, gstAmt, total;
  if (gstMode === 'add') {
    base = amt;
    gstAmt = (amt * rate) / 100;
    total = amt + gstAmt;
  } else {
    total = amt;
    base = amt / (1 + rate / 100);
    gstAmt = total - base;
  }
  const half = gstAmt / 2;

  document.getElementById('rGBase').textContent = fmt(base);
  document.getElementById('rGTax').textContent = fmt(gstAmt);
  document.getElementById('rGTotal').textContent = fmt(total);
  document.getElementById('rCGST').textContent = fmt(half);
  document.getElementById('rSGST').textContent = fmt(half);
  document.getElementById('rGLabel1').textContent = gstMode === 'add' ? 'Base Amount' : 'Base (excl. GST)';
  document.getElementById('rGLabel2').textContent = gstMode === 'add' ? 'Total (incl. GST)' : 'Original Price';

  const formula = gstMode === 'add'
    ? `GST Amount = ${fmt(base)} × ${rate}% = <strong>${fmt(gstAmt)}</strong><br>Total = ${fmt(base)} + ${fmt(gstAmt)} = <strong>${fmt(total)}</strong>`
    : `Base = ${fmt(total)} ÷ (1 + ${rate}/100) = <strong>${fmt(base)}</strong><br>GST = ${fmt(total)} – ${fmt(base)} = <strong>${fmt(gstAmt)}</strong>`;
  document.getElementById('gstFormula').innerHTML = `<p>${formula}</p><p>CGST = SGST = GST/2 = <strong>${fmt(half)}</strong></p>`;
  showResult('gstResult');
}

/* ══════════════════════════════════════
   3. SALARY CALCULATOR
══════════════════════════════════════ */
function salary() {
  return `
    <h2>💼 Salary Calculator (CTC → In-Hand)</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Annual CTC (₹)</label>
        <input type="number" id="sCtc" placeholder="e.g. 1200000" min="1" />
        <span class="error-msg" id="salErr"></span>
      </div>
      <div class="form-group">
        <label>Basic Salary (% of CTC)</label>
        <input type="number" id="sBasicPct" placeholder="40 to 50 typically" value="40" min="1" max="100" />
      </div>
      <div class="form-group">
        <label>HRA (% of Basic)</label>
        <input type="number" id="sHraPct" placeholder="50 for metro, 40 for others" value="50" min="0" max="100" />
      </div>
      <div class="form-group">
        <label>Monthly Professional Tax (₹)</label>
        <input type="number" id="sPT" placeholder="e.g. 200" value="200" min="0" />
      </div>
      <div class="form-group">
        <label>Additional Annual Deductions (₹) — other than PF & PT</label>
        <input type="number" id="sOtherDed" placeholder="e.g. 0" value="0" min="0" />
      </div>
      <button class="calc-btn" onclick="calcSalary()">Calculate</button>
    </div>
    <div class="result-panel" id="salResult">
      <h3>Results</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Monthly In-Hand</span><span class="result-value green" id="rInHand">—</span></div>
        <div class="result-item"><span class="result-label">Monthly Gross</span><span class="result-value" id="rGross">—</span></div>
        <div class="result-item"><span class="result-label">Employee PF/month</span><span class="result-value red" id="rPFDed">—</span></div>
        <div class="result-item"><span class="result-label">Prof. Tax/month</span><span class="result-value red" id="rPTDed">—</span></div>
        <div class="result-item"><span class="result-label">Annual Basic</span><span class="result-value amber" id="rBasic">—</span></div>
        <div class="result-item"><span class="result-label">Annual HRA</span><span class="result-value amber" id="rHRA">—</span></div>
      </div>
      <div class="formula-box" id="salFormula"></div>
    </div>`;
}

function calcSalary() {
  clearError('salErr');
  const ctc = parseFloat(document.getElementById('sCtc').value);
  const basicPct = parseFloat(document.getElementById('sBasicPct').value) || 40;
  const hraPct = parseFloat(document.getElementById('sHraPct').value) || 50;
  const pt = parseFloat(document.getElementById('sPT').value) || 0;
  const otherDed = parseFloat(document.getElementById('sOtherDed').value) || 0;
  if (!ctc || ctc <= 0) return showError('salErr', 'Enter a valid CTC.');

  const annBasic = ctc * basicPct / 100;
  const annHRA = annBasic * hraPct / 100;
  const empPF = Math.min(annBasic * 0.12, 21600); // capped at ₹1800/mo
  const employerPF = empPF;
  const annGross = ctc - employerPF;
  const annDeductions = empPF + (pt * 12) + otherDed;
  const annInHand = annGross - annDeductions + employerPF - empPF;
  // Simpler: inHand = CTC - employerPF - empPF - PT*12 - otherDed + employerPF
  const netAnnual = ctc - empPF - (pt * 12) - otherDed - employerPF;
  const monthlyInHand = netAnnual / 12;
  const monthlyGross = annGross / 12;

  document.getElementById('rInHand').textContent = fmt(monthlyInHand);
  document.getElementById('rGross').textContent = fmt(monthlyGross);
  document.getElementById('rPFDed').textContent = fmt(empPF / 12);
  document.getElementById('rPTDed').textContent = fmt(pt);
  document.getElementById('rBasic').textContent = fmt(annBasic);
  document.getElementById('rHRA').textContent = fmt(annHRA);
  document.getElementById('salFormula').innerHTML = `
    <p><strong>Annual CTC:</strong> ${fmt(ctc)}</p>
    <p>Basic = ${basicPct}% × CTC = <strong>${fmt(annBasic)}</strong></p>
    <p>HRA = ${hraPct}% × Basic = <strong>${fmt(annHRA)}</strong></p>
    <p>Employee PF = 12% × Basic (max ₹21,600/yr) = <strong>${fmt(empPF)}</strong></p>
    <p>Monthly In-Hand = (CTC – Employer PF – Employee PF – PT×12 – Other) / 12 = <strong>${fmt(monthlyInHand)}</strong></p>`;
  showResult('salResult');
}

/* ══════════════════════════════════════
   4. AGE CALCULATOR
══════════════════════════════════════ */
function age() {
  const today = new Date().toISOString().split('T')[0];
  return `
    <h2>🎂 Age Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" id="ageDOB" max="${today}" />
        <span class="error-msg" id="ageErr"></span>
      </div>
      <div class="form-group">
        <label>Calculate Age As Of</label>
        <input type="date" id="ageRef" value="${today}" max="${today}" />
      </div>
      <button class="calc-btn" onclick="calcAge()">Calculate Age</button>
    </div>
    <div class="result-panel" id="ageResult">
      <h3>Your Exact Age</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Years</span><span class="result-value" id="rAgeY">—</span></div>
        <div class="result-item"><span class="result-label">Months</span><span class="result-value" id="rAgeM">—</span></div>
        <div class="result-item"><span class="result-label">Days</span><span class="result-value" id="rAgeD">—</span></div>
        <div class="result-item"><span class="result-label">Total Days Lived</span><span class="result-value green" id="rAgeTD">—</span></div>
        <div class="result-item"><span class="result-label">Next Birthday</span><span class="result-value amber" id="rAgeNB">—</span></div>
      </div>
    </div>`;
}

function calcAge() {
  clearError('ageErr');
  const dob = new Date(document.getElementById('ageDOB').value);
  const ref = new Date(document.getElementById('ageRef').value);
  if (!document.getElementById('ageDOB').value) return showError('ageErr', 'Please enter date of birth.');
  if (dob > ref) return showError('ageErr', 'Date of birth cannot be in the future.');

  let years = ref.getFullYear() - dob.getFullYear();
  let months = ref.getMonth() - dob.getMonth();
  let days = ref.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prev = new Date(ref.getFullYear(), ref.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const totalDays = Math.floor((ref - dob) / 86400000);
  const nextBday = new Date(ref.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= ref) nextBday.setFullYear(nextBday.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBday - ref) / 86400000);

  document.getElementById('rAgeY').textContent = years;
  document.getElementById('rAgeM').textContent = months;
  document.getElementById('rAgeD').textContent = days;
  document.getElementById('rAgeTD').textContent = fmtN(totalDays);
  document.getElementById('rAgeNB').textContent = daysToNext === 0 ? '🎉 Today!' : `${daysToNext} days`;
  showResult('ageResult');
}

/* ══════════════════════════════════════
   5. SIP CALCULATOR
══════════════════════════════════════ */
function sip() {
  return `
    <h2>📈 SIP Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Monthly Investment (₹)</label>
        <input type="number" id="sipM" placeholder="e.g. 5000" min="100" />
        <span class="error-msg" id="sipErr"></span>
      </div>
      <div class="form-group">
        <label>Expected Annual Return (%)</label>
        <input type="number" id="sipR" placeholder="e.g. 12" min="1" max="50" step="0.1" value="12" />
      </div>
      <div class="form-group">
        <label>Investment Duration (Years)</label>
        <input type="number" id="sipY" placeholder="e.g. 10" min="1" max="50" />
      </div>
      <button class="calc-btn" onclick="calcSIP()">Calculate</button>
    </div>
    <div class="result-panel" id="sipResult">
      <h3>SIP Projection</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Total Invested</span><span class="result-value" id="rSIPInv">—</span></div>
        <div class="result-item"><span class="result-label">Wealth Gained</span><span class="result-value green" id="rSIPWG">—</span></div>
        <div class="result-item"><span class="result-label">Final Value</span><span class="result-value amber" id="rSIPFV">—</span></div>
        <div class="result-item"><span class="result-label">Returns (XIRR~)</span><span class="result-value" id="rSIPX">—</span></div>
      </div>
      <div id="sipDonut"></div>
      <div class="formula-box" id="sipFormula"></div>
    </div>`;
}

function calcSIP() {
  clearError('sipErr');
  const m = parseFloat(document.getElementById('sipM').value);
  const annR = parseFloat(document.getElementById('sipR').value);
  const y = parseFloat(document.getElementById('sipY').value);
  if (!m || m < 100) return showError('sipErr', 'Minimum monthly investment is ₹100.');
  if (!annR || annR <= 0) return showError('sipErr', 'Enter a valid return rate.');
  if (!y || y < 1) return showError('sipErr', 'Enter investment duration (min 1 year).');

  const r = annR / 12 / 100;
  const n = y * 12;
  const fv = m * (Math.pow(1 + r, n) - 1) / r * (1 + r);
  const invested = m * n;
  const wg = fv - invested;

  document.getElementById('rSIPInv').textContent = fmt(invested);
  document.getElementById('rSIPWG').textContent = fmt(wg);
  document.getElementById('rSIPFV').textContent = fmt(fv);
  document.getElementById('rSIPX').textContent = annR.toFixed(1) + '% p.a.';
  document.getElementById('sipDonut').innerHTML = donut(invested, wg);
  document.getElementById('sipFormula').innerHTML = `
    <p><strong>Formula:</strong> FV = P × [(1+r)ⁿ – 1] / r × (1+r)</p>
    <p>Monthly: P = ${fmt(m)}, r = ${annR}%/12 = ${r.toFixed(5)}, n = ${n} months</p>
    <p>FV = ${fmt(m)} × [(1+${r.toFixed(5)})^${n} – 1] / ${r.toFixed(5)} × (1+${r.toFixed(5)})</p>
    <p>FV = <strong>${fmt(fv)}</strong></p>`;
  showResult('sipResult');
}

/* ══════════════════════════════════════
   6. PF CALCULATOR
══════════════════════════════════════ */
function pf() {
  return `
    <h2>🏛️ PF / EPF Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Monthly Basic Salary (₹)</label>
        <input type="number" id="pfBasic" placeholder="e.g. 25000" min="1" />
        <span class="error-msg" id="pfErr"></span>
      </div>
      <div class="form-group">
        <label>Employee Contribution (%)</label>
        <input type="number" id="pfEmpPct" value="12" min="12" max="100" />
      </div>
      <div class="form-group">
        <label>Employer Contribution to EPF (%)</label>
        <input type="number" id="pfErPct" value="3.67" step="0.01" min="0" max="12" />
      </div>
      <div class="form-group">
        <label>Years of Service</label>
        <input type="number" id="pfYears" placeholder="e.g. 10" min="1" max="40" />
      </div>
      <div class="form-group">
        <label>EPF Interest Rate (% p.a.)</label>
        <input type="number" id="pfIntR" value="8.25" step="0.01" min="1" />
      </div>
      <button class="calc-btn" onclick="calcPF()">Calculate</button>
    </div>
    <div class="result-panel" id="pfResult">
      <h3>EPF Estimation</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Monthly Employee PF</span><span class="result-value" id="rPFEmp">—</span></div>
        <div class="result-item"><span class="result-label">Monthly Employer EPF</span><span class="result-value" id="rPFEr">—</span></div>
        <div class="result-item"><span class="result-label">Total Monthly PF</span><span class="result-value amber" id="rPFTotal">—</span></div>
        <div class="result-item"><span class="result-label">Corpus at Retirement</span><span class="result-value green" id="rPFCorpus">—</span></div>
        <div class="result-item"><span class="result-label">Total Contributed</span><span class="result-value" id="rPFContrib">—</span></div>
        <div class="result-item"><span class="result-label">Interest Earned</span><span class="result-value red" id="rPFInterest">—</span></div>
      </div>
      <div class="formula-box" id="pfFormula"></div>
    </div>`;
}

function calcPF() {
  clearError('pfErr');
  const basic = parseFloat(document.getElementById('pfBasic').value);
  const empPct = parseFloat(document.getElementById('pfEmpPct').value) || 12;
  const erPct = parseFloat(document.getElementById('pfErPct').value) || 3.67;
  const years = parseFloat(document.getElementById('pfYears').value);
  const intR = parseFloat(document.getElementById('pfIntR').value) || 8.25;
  if (!basic || basic <= 0) return showError('pfErr', 'Enter a valid basic salary.');
  if (!years || years < 1) return showError('pfErr', 'Enter years of service.');

  const empM = (basic * empPct) / 100;
  const erM  = (basic * erPct) / 100;
  const totalM = empM + erM;
  const n = years * 12;
  const r = intR / 12 / 100;
  const corpus = totalM * (Math.pow(1 + r, n) - 1) / r * (1 + r);
  const totalContrib = totalM * n;
  const interestEarned = corpus - totalContrib;

  document.getElementById('rPFEmp').textContent = fmt(empM);
  document.getElementById('rPFEr').textContent = fmt(erM);
  document.getElementById('rPFTotal').textContent = fmt(totalM);
  document.getElementById('rPFCorpus').textContent = fmt(corpus);
  document.getElementById('rPFContrib').textContent = fmt(totalContrib);
  document.getElementById('rPFInterest').textContent = fmt(interestEarned);
  document.getElementById('pfFormula').innerHTML = `
    <p><strong>Employee PF</strong> = ${empPct}% × Basic = ${fmt(empM)}/month</p>
    <p><strong>Employer EPF</strong> = ${erPct}% × Basic = ${fmt(erM)}/month (rest goes to EPS)</p>
    <p><strong>Corpus</strong> = Monthly PF × [(1+r)ⁿ–1]/r × (1+r) at ${intR}% p.a. for ${years} years</p>
    <p>Corpus = <strong>${fmt(corpus)}</strong></p>`;
  showResult('pfResult');
}

/* ══════════════════════════════════════
   7. HRA CALCULATOR
══════════════════════════════════════ */
function hra() {
  return `
    <h2>🏠 HRA Exemption Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Annual Basic Salary (₹)</label>
        <input type="number" id="hBasic" placeholder="e.g. 480000" min="1" />
        <span class="error-msg" id="hraErr"></span>
      </div>
      <div class="form-group">
        <label>Annual HRA Received (₹)</label>
        <input type="number" id="hHRA" placeholder="e.g. 240000" min="1" />
      </div>
      <div class="form-group">
        <label>Annual Rent Paid (₹)</label>
        <input type="number" id="hRent" placeholder="e.g. 216000" min="1" />
      </div>
      <div class="form-group">
        <label>City Type</label>
        <select id="hCity">
          <option value="metro">Metro (Delhi, Mumbai, Kolkata, Chennai) – 50%</option>
          <option value="nonmetro">Non-Metro – 40%</option>
        </select>
      </div>
      <button class="calc-btn" onclick="calcHRA()">Calculate</button>
    </div>
    <div class="result-panel" id="hraResult">
      <h3>HRA Exemption Breakdown</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Condition A: Actual HRA</span><span class="result-value" id="rHRA_A">—</span></div>
        <div class="result-item"><span class="result-label">Condition B: 50/40% of Basic</span><span class="result-value" id="rHRA_B">—</span></div>
        <div class="result-item"><span class="result-label">Condition C: Rent – 10% Basic</span><span class="result-value" id="rHRA_C">—</span></div>
        <div class="result-item"><span class="result-label">HRA Exemption (Minimum)</span><span class="result-value green" id="rHRAExempt">—</span></div>
        <div class="result-item"><span class="result-label">Taxable HRA</span><span class="result-value red" id="rHRATax">—</span></div>
      </div>
      <div class="formula-box" id="hraFormula"></div>
    </div>`;
}

function calcHRA() {
  clearError('hraErr');
  const basic = parseFloat(document.getElementById('hBasic').value);
  const hraAmt = parseFloat(document.getElementById('hHRA').value);
  const rent = parseFloat(document.getElementById('hRent').value);
  const metro = document.getElementById('hCity').value === 'metro';
  if (!basic || !hraAmt || !rent) return showError('hraErr', 'Please fill all fields.');

  const A = hraAmt;
  const B = basic * (metro ? 0.5 : 0.4);
  const C = Math.max(0, rent - basic * 0.1);
  const exempt = Math.min(A, B, C);
  const taxable = hraAmt - exempt;

  document.getElementById('rHRA_A').textContent = fmt(A);
  document.getElementById('rHRA_B').textContent = fmt(B);
  document.getElementById('rHRA_C').textContent = fmt(C);
  document.getElementById('rHRAExempt').textContent = fmt(exempt);
  document.getElementById('rHRATax').textContent = fmt(taxable);
  document.getElementById('hraFormula').innerHTML = `
    <p><strong>HRA Exemption = Minimum of:</strong></p>
    <p>A. Actual HRA received = ${fmt(A)}</p>
    <p>B. ${metro ? '50' : '40'}% of Basic Salary = ${fmt(B)}</p>
    <p>C. Rent Paid (${fmt(rent)}) – 10% of Basic (${fmt(basic * 0.1)}) = ${fmt(C)}</p>
    <p>Exemption = min(A, B, C) = <strong>${fmt(exempt)}</strong></p>
    <p>Taxable HRA = ${fmt(hraAmt)} – ${fmt(exempt)} = <strong>${fmt(taxable)}</strong></p>`;
  showResult('hraResult');
}

/* ══════════════════════════════════════
   8. GRATUITY CALCULATOR
══════════════════════════════════════ */
function gratuity() {
  return `
    <h2>🎁 Gratuity Calculator</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Last Drawn Monthly Basic + DA (₹)</label>
        <input type="number" id="grBasic" placeholder="e.g. 50000" min="1" />
        <span class="error-msg" id="grErr"></span>
      </div>
      <div class="form-group">
        <label>Years of Service</label>
        <input type="number" id="grYears" placeholder="e.g. 8" min="5" step="0.5" />
      </div>
      <div class="form-group">
        <label>Organization Type</label>
        <select id="grType">
          <option value="act">Covered under Gratuity Act (≥10 employees)</option>
          <option value="nonact">Not covered (private formula)</option>
        </select>
      </div>
      <button class="calc-btn" onclick="calcGratuity()">Calculate</button>
    </div>
    <div class="result-panel" id="grResult">
      <h3>Gratuity Amount</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Gratuity Amount</span><span class="result-value green" id="rGrAmt">—</span></div>
        <div class="result-item"><span class="result-label">Years Rounded</span><span class="result-value" id="rGrYrs">—</span></div>
        <div class="result-item"><span class="result-label">Tax-Free Limit</span><span class="result-value amber" id="rGrLimit">—</span></div>
        <div class="result-item"><span class="result-label">Taxable Amount</span><span class="result-value red" id="rGrTax">—</span></div>
      </div>
      <div class="formula-box" id="grFormula"></div>
    </div>`;
}

function calcGratuity() {
  clearError('grErr');
  const basic = parseFloat(document.getElementById('grBasic').value);
  const years = parseFloat(document.getElementById('grYears').value);
  const type = document.getElementById('grType').value;
  if (!basic || basic <= 0) return showError('grErr', 'Enter a valid salary.');
  if (!years || years < 5) return showError('grErr', 'Minimum 5 years of service required.');

  let gratuityAmt, roundedYrs, formula;
  if (type === 'act') {
    roundedYrs = Math.floor(years);
    if (years % 1 >= 0.5) roundedYrs++;
    gratuityAmt = (basic * 15 * roundedYrs) / 26;
    formula = `Gratuity = (Basic+DA × 15 × Years) / 26<br>${fmt(basic)} × 15 × ${roundedYrs} / 26 = <strong>${fmt(gratuityAmt)}</strong>`;
  } else {
    roundedYrs = Math.floor(years);
    gratuityAmt = (basic * 15 * roundedYrs) / 30;
    formula = `Gratuity = (Basic+DA × 15 × Years) / 30<br>${fmt(basic)} × 15 × ${roundedYrs} / 30 = <strong>${fmt(gratuityAmt)}</strong>`;
  }

  const taxFreeLimit = 2000000; // ₹20 Lakhs
  const taxable = Math.max(0, gratuityAmt - taxFreeLimit);

  document.getElementById('rGrAmt').textContent = fmt(gratuityAmt);
  document.getElementById('rGrYrs').textContent = roundedYrs + ' years';
  document.getElementById('rGrLimit').textContent = fmt(taxFreeLimit);
  document.getElementById('rGrTax').textContent = fmt(taxable);
  document.getElementById('grFormula').innerHTML = `<p>${formula}</p><p>Tax-free up to ₹20 Lakhs. Taxable = <strong>${fmt(taxable)}</strong></p>`;
  showResult('grResult');
}

/* ══════════════════════════════════════
   9. INCOME TAX CALCULATOR (INDIA)
══════════════════════════════════════ */
function tax() {
  return `
    <h2>🇮🇳 Income Tax Calculator (FY 2024-25)</h2>
    <div class="calc-form">
      <div class="form-group">
        <label>Annual Taxable Income (₹)</label>
        <input type="number" id="txInc" placeholder="e.g. 1200000" min="0" />
        <span class="error-msg" id="txErr"></span>
      </div>
      <div class="form-group">
        <label>80C Deductions (₹) — Old Regime only</label>
        <input type="number" id="tx80C" placeholder="max ₹1,50,000" min="0" max="150000" value="150000" />
      </div>
      <div class="form-group">
        <label>80D – Medical Insurance (₹) — Old Regime only</label>
        <input type="number" id="tx80D" placeholder="max ₹25,000" min="0" max="25000" value="25000" />
      </div>
      <div class="form-group">
        <label>HRA Exemption (₹) — Old Regime only</label>
        <input type="number" id="txHRA" placeholder="from HRA Calculator" min="0" value="0" />
      </div>
      <div class="form-group">
        <label>Age Group</label>
        <select id="txAge">
          <option value="below60">Below 60</option>
          <option value="60to80">Senior Citizen (60–80)</option>
          <option value="above80">Super Senior (80+)</option>
        </select>
      </div>
      <button class="calc-btn" onclick="calcTax()">Compare Both Regimes</button>
    </div>
    <div class="result-panel" id="txResult">
      <h3>Tax Comparison</h3>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Old Regime Tax</span><span class="result-value red" id="rOldTax">—</span></div>
        <div class="result-item"><span class="result-label">New Regime Tax</span><span class="result-value red" id="rNewTax">—</span></div>
        <div class="result-item"><span class="result-label">Better Regime</span><span class="result-value green" id="rBetter">—</span></div>
        <div class="result-item"><span class="result-label">Tax Savings</span><span class="result-value amber" id="rSavings">—</span></div>
      </div>
      <div class="formula-box" id="txBreakdown"></div>
    </div>`;
}

function taxSlab(income, slabs) {
  let tax = 0;
  for (const [limit, rate] of slabs) {
    if (income <= 0) break;
    const taxable = limit === Infinity ? income : Math.min(income, limit);
    tax += taxable * rate;
    income -= taxable;
  }
  return tax;
}

function calcTax() {
  clearError('txErr');
  const grossIncome = parseFloat(document.getElementById('txInc').value);
  const ded80C = Math.min(parseFloat(document.getElementById('tx80C').value) || 0, 150000);
  const ded80D = Math.min(parseFloat(document.getElementById('tx80D').value) || 0, 25000);
  const hraEx  = parseFloat(document.getElementById('txHRA').value) || 0;
  const ageGrp = document.getElementById('txAge').value;
  if (isNaN(grossIncome) || grossIncome < 0) return showError('txErr', 'Enter a valid income.');

  // Standard deduction
  const stdDed = 50000;

  // ── OLD REGIME ──
  const oldDeductions = stdDed + ded80C + ded80D + hraEx;
  const oldTaxableIncome = Math.max(0, grossIncome - oldDeductions);
  let oldSlabs;
  if (ageGrp === 'above80') {
    oldSlabs = [[500000,0],[500000,0.2],[Infinity,0.3]];
  } else if (ageGrp === '60to80') {
    oldSlabs = [[300000,0],[200000,0.05],[500000,0.2],[Infinity,0.3]];
  } else {
    oldSlabs = [[250000,0],[250000,0.05],[500000,0.2],[Infinity,0.3]];
  }
  let oldTax = taxSlab(oldTaxableIncome, oldSlabs);
  // 87A rebate
  if (oldTaxableIncome <= 500000) oldTax = 0;
  // Surcharge + cess
  const oldSurcharge = oldTaxableIncome > 5000000 ? oldTax * 0.1 : 0;
  const oldCess = (oldTax + oldSurcharge) * 0.04;
  const oldFinal = oldTax + oldSurcharge + oldCess;

  // ── NEW REGIME (FY 2024-25) ──
  const newStdDed = 75000; // enhanced std deduction from Budget 2024
  const newTaxableIncome = Math.max(0, grossIncome - newStdDed);
  const newSlabs = [[300000,0],[400000,0.05],[300000,0.1],[300000,0.15],[300000,0.2],[Infinity,0.3]];
  let newTax = taxSlab(newTaxableIncome, newSlabs);
  // Rebate u/s 87A new regime – up to ₹7L
  if (newTaxableIncome <= 700000) newTax = 0;
  const newSurcharge = newTaxableIncome > 5000000 ? newTax * 0.1 : 0;
  const newCess = (newTax + newSurcharge) * 0.04;
  const newFinal = newTax + newSurcharge + newCess;

  const better = oldFinal <= newFinal ? 'Old Regime' : 'New Regime';
  const savings = Math.abs(oldFinal - newFinal);

  document.getElementById('rOldTax').textContent = fmt(oldFinal);
  document.getElementById('rNewTax').textContent = fmt(newFinal);
  document.getElementById('rBetter').textContent = better;
  document.getElementById('rSavings').textContent = fmt(savings);
  document.getElementById('txBreakdown').innerHTML = `
    <p><strong>OLD REGIME:</strong></p>
    <p>Gross – Standard Ded (₹50k) – 80C (${fmt(ded80C)}) – 80D (${fmt(ded80D)}) – HRA (${fmt(hraEx)}) = Taxable ${fmt(oldTaxableIncome)}</p>
    <p>Base Tax = ${fmt(oldTax)} | Surcharge = ${fmt(oldSurcharge)} | Cess 4% = ${fmt(oldCess)}</p>
    <p>Total Old Regime Tax = <strong>${fmt(oldFinal)}</strong></p>
    <p style="margin-top:0.6rem"><strong>NEW REGIME (Budget 2024):</strong></p>
    <p>Gross – Standard Ded (₹75k) = Taxable ${fmt(newTaxableIncome)}</p>
    <p>Slabs: 0–3L: 0%, 3–7L: 5%, 7–10L: 10%, 10–12L: 15%, 12–15L: 20%, 15L+: 30%</p>
    <p>Base Tax = ${fmt(newTax)} | Surcharge = ${fmt(newSurcharge)} | Cess 4% = ${fmt(newCess)}</p>
    <p>Total New Regime Tax = <strong>${fmt(newFinal)}</strong></p>
    <p style="margin-top:0.6rem;color:var(--green)">✅ <strong>${better}</strong> saves you <strong>${fmt(savings)}</strong></p>`;
  showResult('txResult');
}
