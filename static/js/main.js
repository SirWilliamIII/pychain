// ============================================
// PYCHAIN - MAIN.JS
// Robin Hood meets Crypto Bro
// ============================================

// ============================================
// CONFETTI - Because we're crypto bros
// ============================================

function celebrateMining() {
  // Gold/amber confetti burst - you earned coins!
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#f59e0b', '#fbbf24', '#d97706', '#fcd34d', '#92400e']
  };

  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 1.2,
    shapes: ['circle', 'square']
  });

  confetti({
    ...defaults,
    particleCount: 30,
    scalar: 0.75,
    shapes: ['circle']
  });
}

function celebrateTransaction() {
  // Money colors - green and purple rain
  const end = Date.now() + 500;
  const colors = ['#22c55e', '#6366f1', '#a855f7', '#4ade80'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="${isError ? 'text-red-400' : 'text-green-400'} text-lg">
        ${isError ? '✗' : '✓'}
      </span>
      <span class="text-white">${message}</span>
    </div>
  `;
  toast.className = `toast fixed bottom-6 right-6 px-5 py-3 rounded-xl transform transition-transform duration-300 z-50 ${
    isError ? "bg-red-500/20 border border-red-500/30" : "bg-green-500/20 border border-green-500/30"
  }`;
  toast.style.transform = "translateY(0)";
  setTimeout(() => {
    toast.style.transform = "translateY(200%)";
  }, 3000);
}

// ============================================
// BALANCE
// ============================================

async function updateBalance() {
  try {
    const response = await fetch("/balance");
    const data = await response.json();
    const balanceElement = document.getElementById("balance");
    const hintElement = document.getElementById("zeroBalanceHint");

    // Animate the balance number
    animateValue(balanceElement, parseFloat(balanceElement.textContent) || 0, data.balance, 500);

    // Show/hide zero balance hint
    if (data.balance === 0) {
      hintElement.classList.remove("hidden");
    } else {
      hintElement.classList.add("hidden");
    }
  } catch (error) {
    showToast("Failed to fetch balance", true);
  }
}

// Animate number changes
function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeOut;
    element.textContent = current.toFixed(2);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
}

// ============================================
// TRANSACTIONS
// ============================================

async function updateTransactions() {
  try {
    const response = await fetch("/transactions");
    const transactions = await response.json();
    const transactionsList = document.getElementById("transactionsList");
    const pendingCount = document.getElementById("pendingCount");

    pendingCount.textContent = `(${transactions.length})`;

    if (transactions.length === 0) {
      transactionsList.innerHTML = '<p class="text-zinc-600 text-sm">No pending transactions</p>';
      return;
    }

    transactionsList.innerHTML = transactions
      .map(tx => `
        <div class="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
          <div class="pending-dot flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-zinc-400 truncate">${tx.sender}</span>
              <span class="text-zinc-600">→</span>
              <span class="text-white truncate">${tx.recipient}</span>
            </div>
          </div>
          <div class="text-amber-400 font-semibold text-sm">
            ${tx.amount} coins
          </div>
        </div>
      `)
      .join("");
  } catch (error) {
    showToast("Failed to fetch transactions", true);
  }
}

// ============================================
// BLOCKCHAIN VISUALIZATION
// ============================================

let currentChainLength = 0;

async function updateBlockchain() {
  try {
    const response = await fetch("/chain");
    const chain = await response.json();

    const isNewBlock = chain.length > currentChainLength && currentChainLength > 0;
    const newBlockIndex = isNewBlock ? chain.length - 1 : -1;
    currentChainLength = chain.length;

    // Update block count
    document.getElementById("blockCount").textContent = `(${chain.length} block${chain.length !== 1 ? 's' : ''})`;

    renderBlockchain(chain, newBlockIndex);
  } catch (error) {
    showToast("Failed to fetch blockchain", true);
  }
}

function renderBlockchain(chain, highlightIndex = -1) {
  const blockchainList = document.getElementById("blockchainList");
  blockchainList.innerHTML = "";

  chain.forEach((block, index) => {
    const isGenesis = index === 0;
    const isLast = index === chain.length - 1;

    const blockCard = createBlockCard(block, isGenesis);
    blockCard.style.animationDelay = `${index * 0.08}s`;
    blockchainList.appendChild(blockCard);

    if (!isLast) {
      const chainLink = createChainLink(index);
      chainLink.style.animationDelay = `${index * 0.08 + 0.04}s`;
      blockchainList.appendChild(chainLink);
    }
  });

  if (highlightIndex >= 0) {
    setTimeout(() => highlightNewBlock(highlightIndex), highlightIndex * 80 + 200);
  }

  initScrollButtons();
  setTimeout(scrollToLatestBlock, chain.length * 80 + 300);
}

function createBlockCard(block, isGenesis) {
  const card = document.createElement("div");
  card.className = `block-card flex-shrink-0 w-64 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
    isGenesis
      ? "bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-500/30 hover:border-amber-400/50"
      : "bg-elevated border border-white/5 hover:border-indigo-500/30"
  }`;
  card.setAttribute("data-block-index", block.index);

  const txCount = block.transactions.length;

  card.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        ${isGenesis
          ? '<span class="text-amber-400 text-lg">★</span>'
          : `<span class="text-zinc-500 text-xs font-mono">#${block.index}</span>`
        }
        <span class="${isGenesis ? 'text-amber-400' : 'text-white'} font-semibold text-sm">
          ${isGenesis ? 'Genesis' : `Block ${block.index}`}
        </span>
      </div>
      <div class="w-2 h-2 rounded-full ${isGenesis ? 'bg-amber-400' : 'bg-green-400'}"></div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-zinc-600 text-xs">Hash</span>
        <code class="text-cyan-400 font-mono text-xs">${block.hash.slice(0, 12)}...</code>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-zinc-600 text-xs">Proof</span>
        <span class="${isGenesis ? 'text-amber-400' : 'text-indigo-400'} text-xs font-medium">${block.proof.toLocaleString()}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-zinc-600 text-xs">Transactions</span>
        <span class="text-zinc-400 text-xs">${txCount}</span>
      </div>
    </div>

    <button class="view-block-btn mt-3 w-full py-2 text-xs font-medium rounded-lg transition-colors ${
      isGenesis
        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
        : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
    }" data-block-index="${block.index}">
      Inspect Block
    </button>
  `;

  // Add event listener
  card.querySelector('.view-block-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const idx = e.target.getAttribute('data-block-index');
    document.getElementById('blockSelector').value = idx;
    showBlockDetails(idx);
    document.getElementById('blockSelector').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  return card;
}

function createChainLink(index) {
  const link = document.createElement("div");
  link.className = "chain-link flex-shrink-0 w-12 flex items-center justify-center";

  link.innerHTML = `
    <div class="relative w-full flex items-center justify-center">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50"></div>
      </div>
      <div class="relative w-5 h-5 rounded-full bg-void border border-indigo-500/50 flex items-center justify-center">
        <svg class="w-2.5 h-2.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </div>
    </div>
  `;

  return link;
}

function highlightNewBlock(index) {
  const blockCard = document.querySelector(`[data-block-index="${index}"]`);
  if (blockCard) {
    blockCard.classList.add("new-block-highlight");
    setTimeout(() => blockCard.classList.remove("new-block-highlight"), 2500);
  }
}

function initScrollButtons() {
  const scrollContainer = document.getElementById("blockchainScroll");
  const scrollLeftBtn = document.getElementById("scrollLeft");
  const scrollRightBtn = document.getElementById("scrollRight");

  if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

  function updateScrollButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const maxScroll = scrollWidth - clientWidth;

    scrollLeftBtn.classList.toggle("opacity-0", scrollLeft <= 20);
    scrollLeftBtn.classList.toggle("pointer-events-none", scrollLeft <= 20);
    scrollRightBtn.classList.toggle("opacity-0", scrollLeft >= maxScroll - 20);
    scrollRightBtn.classList.toggle("pointer-events-none", scrollLeft >= maxScroll - 20);
  }

  const scrollAmount = 300;
  scrollLeftBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" }));
  scrollRightBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" }));
  scrollContainer.addEventListener("scroll", updateScrollButtons);
  setTimeout(updateScrollButtons, 100);
}

function scrollToLatestBlock() {
  const scrollContainer = document.getElementById("blockchainScroll");
  if (scrollContainer) {
    scrollContainer.scrollTo({ left: scrollContainer.scrollWidth, behavior: "smooth" });
  }
}

// ============================================
// BLOCK INSPECTOR (Terminal Style)
// ============================================

async function updateBlockSelector() {
  try {
    const response = await fetch("/chain");
    const chain = await response.json();
    const selector = document.getElementById("blockSelector");

    selector.innerHTML = '<option value="">-- select block --</option>';
    chain.forEach((block) => {
      const option = document.createElement("option");
      option.value = block.index;
      option.textContent = `Block #${block.index}${block.index === 0 ? ' (Genesis)' : ''}`;
      selector.appendChild(option);
    });
  } catch (error) {
    showToast("Failed to load blocks", true);
  }
}

async function showBlockDetails(blockIndex) {
  const terminalContent = document.getElementById("terminalContent");
  const powSection = document.getElementById("powSection");
  const blockDataSection = document.getElementById("blockDataSection");
  const hashSection = document.getElementById("hashSection");

  // Show loading state
  terminalContent.innerHTML = `
    <p class="text-zinc-500">
      <span class="text-green-500">$</span> inspecting block ${blockIndex}...
    </p>
  `;

  try {
    const [hashResponse, attemptsResponse] = await Promise.all([
      fetch(`/block/${blockIndex}/hash`),
      fetch(`/block/${blockIndex}/pow-attempts`),
    ]);

    const details = await hashResponse.json();
    const attempts = await attemptsResponse.json();

    // Update terminal content
    terminalContent.innerHTML = `
      <p class="text-zinc-400">
        <span class="text-green-500">$</span> inspect <span class="text-cyan-400">--block ${blockIndex}</span>
      </p>
      <p class="text-green-400 mt-1">Block ${blockIndex} loaded successfully.</p>
    `;

    // Show PoW section
    powSection.classList.remove("hidden");
    const powAttempts = document.getElementById("powAttempts");
    powAttempts.innerHTML = attempts
      .map((attempt, i) => {
        const hashPrefix = attempt.hash.slice(0, 2);
        const hashRest = attempt.hash.slice(2, 20);
        const isValid = attempt.valid;

        return `
          <div class="flex items-center gap-3 py-1 ${isValid ? 'text-green-400' : 'text-zinc-600'}">
            <span class="w-8 text-right text-zinc-700">[${String(i).padStart(2, '0')}]</span>
            <span class="font-mono">
              <span class="${isValid ? 'text-green-400' : 'text-red-400/50'}">${hashPrefix}</span>${hashRest}...
            </span>
            <span class="${isValid ? 'text-green-400 font-semibold' : 'text-zinc-700'}">
              ${isValid ? '✓ VALID' : '✗'}
            </span>
          </div>
        `;
      })
      .join("");

    // Show block data
    blockDataSection.classList.remove("hidden");
    document.getElementById("blockData").textContent = JSON.stringify(JSON.parse(details.input), null, 2);

    // Show hash
    hashSection.classList.remove("hidden");
    document.getElementById("blockHash").textContent = details.hash;

  } catch (error) {
    terminalContent.innerHTML = `
      <p class="text-red-400">
        <span class="text-red-500">$</span> Error: Failed to load block details
      </p>
    `;
  }
}

document.getElementById("blockSelector").addEventListener("change", (e) => {
  const selectedIndex = e.target.value;
  if (selectedIndex !== "") {
    showBlockDetails(selectedIndex);
  } else {
    // Reset terminal
    document.getElementById("terminalContent").innerHTML = `
      <p class="text-zinc-600">
        <span class="text-green-500">$</span> select a block to inspect...
      </p>
    `;
    document.getElementById("powSection").classList.add("hidden");
    document.getElementById("blockDataSection").classList.add("hidden");
    document.getElementById("hashSection").classList.add("hidden");
  }
});

// ============================================
// MINING
// ============================================

let isMining = false;

function showMiningOverlay() {
  const overlay = document.getElementById("miningOverlay");
  const hashesDiv = document.getElementById("miningHashes");
  overlay.classList.remove("hidden");

  // Animate fake hashes
  let hashInterval = setInterval(() => {
    const fakeHash = Array.from({ length: 64 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    const line = document.createElement("p");
    line.textContent = `0x${fakeHash}`;
    line.className = "text-zinc-700 animate-pulse";
    hashesDiv.appendChild(line);
    if (hashesDiv.children.length > 5) {
      hashesDiv.removeChild(hashesDiv.firstChild);
    }
  }, 100);

  return () => {
    clearInterval(hashInterval);
    overlay.classList.add("hidden");
    hashesDiv.innerHTML = "";
  };
}

document.getElementById("mineButton").addEventListener("click", async () => {
  if (isMining) return;

  const mineButton = document.getElementById("mineButton");
  isMining = true;

  // Update button
  mineButton.classList.add("mining");
  mineButton.textContent = "Mining...";
  mineButton.disabled = true;

  // Show overlay
  const hideOverlay = showMiningOverlay();

  try {
    const response = await fetch("/mine", { method: "POST" });
    const data = await response.json();

    if (response.ok) {
      showToast("Block mined successfully! +10 coins");
      celebrateMining();
      updateBlockchain();
      updateTransactions();
      updateBalance();
      updateBlockSelector();
    } else {
      showToast(data.message, true);
    }
  } catch (error) {
    showToast("Mining failed", true);
  } finally {
    isMining = false;
    mineButton.classList.remove("mining");
    mineButton.textContent = "Start Mining";
    mineButton.disabled = false;
    hideOverlay();
  }
});

// ============================================
// SEND TRANSACTION
// ============================================

document.getElementById("transactionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const recipient = document.getElementById("recipient").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const response = await fetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount }),
    });
    const data = await response.json();

    if (response.ok) {
      showToast(`Sent ${amount} coins to ${recipient}`);
      celebrateTransaction();
      document.getElementById("transactionForm").reset();
      updateTransactions();
      updateBalance();
    } else {
      showToast(data.message, true);
    }
  } catch (error) {
    showToast("Failed to create transaction", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send";
  }
});

// ============================================
// INITIALIZATION
// ============================================

// Initial load
updateBalance();
updateTransactions();
updateBlockchain();
updateBlockSelector();

// Auto-refresh every 10 seconds
setInterval(() => {
  updateBalance();
  updateTransactions();
  updateBlockchain();
  updateBlockSelector();
}, 10000);
