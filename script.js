/**
 * Executive Precision Calculator
 * Vanilla JavaScript Implementation
 * Features: Arithmetic (+, -, *, /), percentage, sign negate, real-time preview,
 * keyboard support, history log, theme toggle, copy to clipboard, and sound feedback.
 */

class Calculator {
  constructor() {
    // Calculator internal state
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.lastResult = null;
    this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');
    this.soundEnabled = localStorage.getItem('calc_sound') !== 'false';
    this.audioCtx = null;

    // DOM Elements
    this.primaryDisplay = document.getElementById('primaryDisplay');
    this.equationDisplay = document.getElementById('equationDisplay');
    this.previewDisplay = document.getElementById('previewDisplay');
    this.clearLabel = document.getElementById('clearLabel');
    this.copyBtn = document.getElementById('copyBtn');
    this.copyTooltip = document.getElementById('copyTooltip');
    this.historyPanel = document.getElementById('historyPanel');
    this.historyToggle = document.getElementById('historyToggle');
    this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
    this.historyList = document.getElementById('historyList');
    this.historyEmpty = document.getElementById('historyEmpty');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.historyCount = document.getElementById('historyCount');
    this.themeToggle = document.getElementById('themeToggle');
    this.sunIcon = document.getElementById('sunIcon');
    this.moonIcon = document.getElementById('moonIcon');
    this.soundToggle = document.getElementById('soundToggle');
    this.soundOnIcon = document.getElementById('soundOnIcon');
    this.soundOffIcon = document.getElementById('soundOffIcon');

    this.init();
  }

  init() {
    this.bindEvents();
    this.initTheme();
    this.updateSoundIcons();
    this.updateHistoryUI();
    this.updateDisplay();
  }

  /* ================= Theme Management ================= */
  initTheme() {
    const savedTheme = localStorage.getItem('calc_theme') || 
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);
    if (theme === 'dark') {
      this.sunIcon.classList.remove('hidden');
      this.moonIcon.classList.add('hidden');
    } else {
      this.sunIcon.classList.add('hidden');
      this.moonIcon.classList.remove('hidden');
    }
  }

  toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'dark';
    this.setTheme(current === 'dark' ? 'light' : 'dark');
    this.playTone(480, 0.05);
  }

  /* ================= Web Audio Click Tone ================= */
  playTone(freq = 600, duration = 0.03) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('calc_sound', this.soundEnabled);
    this.updateSoundIcons();
    if (this.soundEnabled) this.playTone(700, 0.06);
  }

  updateSoundIcons() {
    if (this.soundEnabled) {
      this.soundOnIcon.classList.remove('hidden');
      this.soundOffIcon.classList.add('hidden');
    } else {
      this.soundOnIcon.classList.add('hidden');
      this.soundOffIcon.classList.remove('hidden');
    }
  }

  /* ================= Event Binding ================= */
  bindEvents() {
    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Sound toggle
    this.soundToggle.addEventListener('click', () => this.toggleSound());

    // History panel toggles
    this.historyToggle.addEventListener('click', () => this.openHistory());
    this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // Copy to clipboard
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());

    // Keypad clicks via event delegation
    const keypad = document.querySelector('.keypad-grid');
    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.key');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      this.handleAction(action, value, btn);
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /* ================= Action Dispatcher ================= */
  handleAction(action, value, btnElement = null) {
    if (btnElement) {
      btnElement.classList.add('keyboard-active');
      setTimeout(() => btnElement.classList.remove('keyboard-active'), 120);
    }

    switch (action) {
      case 'digit':
        this.appendDigit(value);
        this.playTone(550);
        break;
      case 'decimal':
        this.appendDecimal();
        this.playTone(580);
        break;
      case 'operator':
        this.chooseOperation(value);
        this.playTone(680);
        break;
      case 'equals':
        this.compute();
        this.playTone(760, 0.08);
        break;
      case 'clear':
        this.clear();
        this.playTone(400);
        break;
      case 'backspace':
        this.backspace();
        this.playTone(460);
        break;
      case 'negate':
        this.negate();
        this.playTone(600);
        break;
      case 'percentage':
        this.percentage();
        this.playTone(640);
        break;
    }

    this.updateActiveOperatorStyle();
    this.updateDisplay();
    this.updateRealtimePreview();
  }

  /* ================= Keyboard Handler ================= */
  handleKeyboard(e) {
    // Ignore keys if typing in an input
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    let targetKeyId = null;

    if (e.key >= '0' && e.key <= '9') {
      targetKeyId = `key${e.key}`;
      this.handleAction('digit', e.key, document.getElementById(targetKeyId));
    } else if (e.key === '.') {
      targetKeyId = 'keyDecimal';
      this.handleAction('decimal', null, document.getElementById(targetKeyId));
    } else if (e.key === '+' || e.key === '-') {
      const op = e.key === '+' ? '+' : '−';
      targetKeyId = e.key === '+' ? 'keyAdd' : 'keySubtract';
      this.handleAction('operator', op, document.getElementById(targetKeyId));
    } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
      targetKeyId = 'keyMultiply';
      this.handleAction('operator', '×', document.getElementById(targetKeyId));
    } else if (e.key === '/') {
      e.preventDefault(); // Prevent browser quick search
      targetKeyId = 'keyDivide';
      this.handleAction('operator', '÷', document.getElementById(targetKeyId));
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      targetKeyId = 'keyEquals';
      this.handleAction('equals', null, document.getElementById(targetKeyId));
    } else if (e.key === 'Backspace') {
      targetKeyId = 'keyBackspace';
      this.handleAction('backspace', null, document.getElementById(targetKeyId));
    } else if (e.key === 'Escape') {
      targetKeyId = 'keyClear';
      this.handleAction('clear', null, document.getElementById(targetKeyId));
    } else if (e.key === '%') {
      targetKeyId = 'keyPercent';
      this.handleAction('percentage', null, document.getElementById(targetKeyId));
    }
  }

  /* ================= Calculation Operations ================= */
  appendDigit(digit) {
    if (this.currentOperand === 'Cannot divide by 0') {
      this.clear();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    if (this.currentOperand === '0') {
      this.currentOperand = digit;
    } else {
      // Limit to 15 digits to avoid unmanageable overflow
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15) return;
      this.currentOperand += digit;
    }

    this.clearLabel.textContent = 'C';
  }

  appendDecimal() {
    if (this.currentOperand === 'Cannot divide by 0') {
      this.clear();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
    }

    if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
      this.clearLabel.textContent = 'C';
    }
  }

  chooseOperation(operator) {
    if (this.currentOperand === 'Cannot divide by 0') return;

    if (this.operation && !this.shouldResetScreen) {
      this.compute(false);
    }

    this.operation = operator;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.clearLabel.textContent = 'C';
  }

  compute(isFinal = true) {
    if (!this.operation || this.previousOperand === '' || this.currentOperand === '') {
      return;
    }

    const prev = parseFloat(this.previousOperand);
    const curr = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(curr)) return;

    let result;
    switch (this.operation) {
      case '+':
        result = prev + curr;
        break;
      case '−':
        result = prev - curr;
        break;
      case '×':
        result = prev * curr;
        break;
      case '÷':
        if (curr === 0) {
          this.currentOperand = 'Cannot divide by 0';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          this.clearLabel.textContent = 'AC';
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }

    // Precise rounding to eliminate IEEE-754 floating point precision errors
    result = this.formatPrecision(result);

    const equationText = `${this.formatDisplayNumber(prev)} ${this.operation} ${this.formatDisplayNumber(curr)}`;

    if (isFinal) {
      this.addHistory(equationText, this.formatDisplayNumber(result));
      this.previousOperand = '';
      this.operation = undefined;
      this.currentOperand = result.toString();
      this.shouldResetScreen = true;
      this.clearLabel.textContent = 'AC';
    } else {
      this.currentOperand = result.toString();
      this.previousOperand = result.toString();
    }
  }

  formatPrecision(num) {
    if (Number.isInteger(num)) return num;
    // Round to max 10 decimal places to eliminate floating point residue
    const factor = Math.pow(10, 10);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  negate() {
    if (this.currentOperand === '0' || this.currentOperand === 'Cannot divide by 0') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.substring(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  percentage() {
    if (this.currentOperand === 'Cannot divide by 0') return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    if (this.previousOperand && this.operation) {
      const prev = parseFloat(this.previousOperand);
      // E.g., 200 + 10% => 10% of 200 is 20
      const percentVal = (prev * current) / 100;
      this.currentOperand = this.formatPrecision(percentVal).toString();
    } else {
      // Standalone 50% => 0.5
      this.currentOperand = this.formatPrecision(current / 100).toString();
    }
  }

  clear() {
    if (this.clearLabel.textContent === 'C' && this.currentOperand !== '0') {
      // Clear current operand first
      this.currentOperand = '0';
      this.clearLabel.textContent = 'AC';
    } else {
      // Reset full calculator
      this.currentOperand = '0';
      this.previousOperand = '';
      this.operation = undefined;
      this.shouldResetScreen = false;
      this.clearLabel.textContent = 'AC';
    }
  }

  backspace() {
    if (this.currentOperand === 'Cannot divide by 0' || this.shouldResetScreen) {
      this.clear();
      return;
    }

    if (this.currentOperand.length <= 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
      this.clearLabel.textContent = 'AC';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  /* ================= Real-time Result Preview ================= */
  updateRealtimePreview() {
    if (this.operation && this.previousOperand !== '' && !this.shouldResetScreen) {
      const prev = parseFloat(this.previousOperand);
      const curr = parseFloat(this.currentOperand);

      if (!isNaN(prev) && !isNaN(curr)) {
        if (this.operation === '÷' && curr === 0) {
          this.previewDisplay.textContent = '= Error';
          return;
        }

        let res;
        switch (this.operation) {
          case '+': res = prev + curr; break;
          case '−': res = prev - curr; break;
          case '×': res = prev * curr; break;
          case '÷': res = prev / curr; break;
        }

        if (res !== undefined) {
          this.previewDisplay.textContent = `= ${this.formatDisplayNumber(this.formatPrecision(res))}`;
          return;
        }
      }
    }
    this.previewDisplay.textContent = '';
  }

  /* ================= Display Formatting & Dynamic Scaling ================= */
  formatDisplayNumber(number) {
    if (number === undefined || number === null || number === '') return '';
    if (number === 'Cannot divide by 0') return number;

    const stringNumber = number.toString();
    const isNegative = stringNumber.startsWith('-');
    const cleanNumber = isNegative ? stringNumber.substring(1) : stringNumber;

    const [integerPart, decimalPart] = cleanNumber.split('.');

    const formattedInt = isNaN(parseFloat(integerPart)) 
      ? integerPart 
      : parseFloat(integerPart).toLocaleString('en-US');

    let output = isNegative ? `-${formattedInt}` : formattedInt;

    if (decimalPart !== undefined) {
      output += `.${decimalPart}`;
    }

    return output;
  }

  updateDisplay() {
    const formatted = this.formatDisplayNumber(this.currentOperand);
    this.primaryDisplay.textContent = formatted || '0';

    // Auto-scale font size depending on number length
    const len = formatted.length;
    this.primaryDisplay.classList.remove('text-md', 'text-sm', 'text-xs');
    if (len > 14) {
      this.primaryDisplay.classList.add('text-xs');
    } else if (len > 10) {
      this.primaryDisplay.classList.add('text-sm');
    } else if (len > 7) {
      this.primaryDisplay.classList.add('text-md');
    }

    if (this.operation && this.previousOperand !== '') {
      this.equationDisplay.textContent = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.equationDisplay.textContent = '';
    }
  }

  updateActiveOperatorStyle() {
    const opButtons = document.querySelectorAll('.key-operator');
    opButtons.forEach(btn => {
      if (this.operation && btn.dataset.value === this.operation && this.shouldResetScreen) {
        btn.classList.add('active-op');
      } else {
        btn.classList.remove('active-op');
      }
    });
  }

  /* ================= Clipboard Copy ================= */
  copyToClipboard() {
    const val = this.currentOperand;
    if (!val || val === 'Cannot divide by 0') return;

    navigator.clipboard.writeText(val).then(() => {
      this.copyTooltip.classList.add('show');
      this.playTone(850, 0.05);
      setTimeout(() => {
        this.copyTooltip.classList.remove('show');
      }, 1500);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.copyTooltip.classList.add('show');
      setTimeout(() => this.copyTooltip.classList.remove('show'), 1500);
    });
  }

  /* ================= History Management ================= */
  addHistory(equation, result) {
    const item = { equation, result, timestamp: Date.now() };
    this.history.unshift(item);
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(this.history));
    this.updateHistoryUI();
  }

  updateHistoryUI() {
    this.historyList.innerHTML = '';
    const count = this.history.length;

    if (count > 0) {
      this.historyCount.textContent = count;
      this.historyCount.classList.remove('hidden');
      this.clearHistoryBtn.disabled = false;

      this.history.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item';
        itemEl.innerHTML = `
          <div class="history-expr">${item.equation} =</div>
          <div class="history-res">${item.result}</div>
        `;
        itemEl.addEventListener('click', () => {
          // Restore result to current display
          const raw = item.result.replace(/,/g, '');
          this.currentOperand = raw;
          this.shouldResetScreen = true;
          this.updateDisplay();
          this.closeHistory();
          this.playTone(650);
        });
        this.historyList.appendChild(itemEl);
      });
    } else {
      this.historyCount.classList.add('hidden');
      this.clearHistoryBtn.disabled = true;
      this.historyList.appendChild(this.historyEmpty);
    }
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.updateHistoryUI();
    this.playTone(400);
  }

  openHistory() {
    this.historyPanel.classList.remove('hidden');
    this.playTone(520);
  }

  closeHistory() {
    this.historyPanel.classList.add('hidden');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new Calculator();
});
