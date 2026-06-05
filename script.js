// script.js with optional JIT (compile-and-cache) support and Matrix math.

const screen = document.getElementById('screen');
const keys = document.querySelectorAll('.btn');

const jitToggle = document.getElementById('jitToggle');
const clearJitBtn = document.getElementById('clearJit');
const jitCacheSizeEl = document.getElementById('jitCacheSize');

// Matrix UI elements
const matrixSizeEl = document.getElementById('matrixSize');
const matrixAEl = document.getElementById('matrixA');
const matrixBEl = document.getElementById('matrixB');
const matrixResultEl = document.getElementById('matrixResult');

const matAddBtn = document.getElementById('matAdd');
const matMulBtn = document.getElementById('matMul');
const matTABtn = document.getElementById('matTA');
const matTBBtn = document.getElementById('matTB');
const matDetABtn = document.getElementById('matDetA');
const matDetBBtn = document.getElementById('matDetB');
const matInvABtn = document.getElementById('matInvA');
const matInvBBtn = document.getElementById('matInvB');
const matClearBtn = document.getElementById('matClear');

// Simple Map-based cache for compiled expressions
const jitCache = new Map();

function updateCacheSize(){ if(jitCacheSizeEl) jitCacheSizeEl.textContent = jitCache.size; }

function appendToScreen(value){
  const last = screen.value.slice(-1);
  const operators = ['+','-','*','/','.'];

  if(operators.includes(value)){
    if(screen.value === '' && value !== '-') return;
    if(operators.includes(last) && !(value === '-' && last === '(')){
      screen.value = screen.value.slice(0,-1) + value;
      return;
    }
  }

  screen.value += value;
}

function clearAll(){ screen.value = ''; }
function backspace(){ screen.value = screen.value.slice(0,-1); }

function compileExpression(expr){
  const sanitized = expr.replace(/×/g,'*').replace(/÷/g,'/');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${sanitized})`);
}

function safeEvaluate(expr){
  if(!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid characters');

  const key = expr.trim();
  if(jitToggle && jitToggle.checked){
    if(jitCache.has(key)){
      const fn = jitCache.get(key);
      return fn();
    }else{
      const fn = compileExpression(key);
      jitCache.set(key, fn);
      updateCacheSize();
      return fn();
    }
  }else{
    const sanitized = key.replace(/×/g,'*').replace(/÷/g,'/');
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${sanitized})`)();
  }
}

function calculate(){
  const expr = screen.value.trim();
  if(expr === '') return;
  try{
    const result = safeEvaluate(expr);
    screen.value = String(result);
  }catch(e){
    screen.value = 'Error';
    setTimeout(()=>{ if(screen.value === 'Error') screen.value = ''; }, 900);
  }
}

// Click handlers for calculator keys
keys.forEach(key=>{
  key.addEventListener('click', ()=>{
    const val = key.dataset.value;
    const action = key.dataset.action;

    if(action === 'clear'){ clearAll(); return; }
    if(action === 'backspace'){ backspace(); return; }
    if(action === 'calculate'){ calculate(); return; }
    if(val !== undefined) appendToScreen(val);
  });
});

// Keyboard support
window.addEventListener('keydown', (e)=>{
  const key = e.key;
  if(key === 'Enter'){ e.preventDefault(); calculate(); return; }
  if(key === 'Backspace'){ e.preventDefault(); backspace(); return; }
  if(key === 'Escape'){ e.preventDefault(); clearAll(); return; }

  if(/^[0-9+\-*/().]$/.test(key)){
    e.preventDefault();
    appendToScreen(key);
  }
});

// JIT control handlers
if(clearJitBtn){
  clearJitBtn.addEventListener('click', ()=>{
    jitCache.clear();
    updateCacheSize();
  });
}
if(jitToggle){
  jitToggle.addEventListener('change', ()=>{
    if(!jitToggle.checked){
      jitCache.clear();
      updateCacheSize();
    }
  });
}

// ---------------- Matrix UI & Logic ----------------

function renderMatrixGrid(container, size, prefix){
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  for(let r=0; r<size; r++){
    for(let c=0; c<size; c++){
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.dataset.row = r;
      input.dataset.col = c;
      input.id = `${prefix}-${r}-${c}`;
      input.placeholder = '0';
      container.appendChild(input);
    }
  }
}

function readMatrix(container, size){
  const matrix = [];
  for(let r=0; r<size; r++){
    const row = [];
    for(let c=0; c<size; c++){
      const input = container.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      const v = (input && input.value.trim() !== '') ? Number(input.value) : 0;
      if(Number.isNaN(v)) throw new Error(`Invalid number at ${r+1},${c+
