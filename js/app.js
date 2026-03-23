/* ============================================================
   BudgetFlow — Application Logic
   State management, CRUD, Chart.js, localStorage
   ============================================================ */

// ======================== CATEGORIES ========================
const CATEGORIES = {
    income: [
        { id: 'salary',       name: 'Salary',      emoji: '💼' },
        { id: 'freelance',    name: 'Freelance',    emoji: '💻' },
        { id: 'investments',  name: 'Investments',  emoji: '📈' },
        { id: 'gifts',        name: 'Gifts',        emoji: '🎁' },
        { id: 'refund',       name: 'Refund',       emoji: '🔄' },
        { id: 'other-income', name: 'Other',        emoji: '💰' },
    ],
    expense: [
        { id: 'food',          name: 'Food',          emoji: '🍕' },
        { id: 'groceries',     name: 'Groceries',     emoji: '🛒' },
        { id: 'rent',          name: 'Rent',          emoji: '🏠' },
        { id: 'transport',     name: 'Transport',     emoji: '🚗' },
        { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
        { id: 'shopping',      name: 'Shopping',      emoji: '🛍️' },
        { id: 'health',        name: 'Health',        emoji: '💊' },
        { id: 'education',     name: 'Education',     emoji: '📚' },
        { id: 'subscriptions', name: 'Subscriptions', emoji: '📱' },
        { id: 'utilities',     name: 'Utilities',     emoji: '⚡' },
        { id: 'smoking',       name: 'Smoking',       emoji: '🚬' },
        { id: 'alcohol',       name: 'Alcohol',       emoji: '🍺' },
        { id: 'savings',       name: 'Savings',       emoji: '🏦' },
        { id: 'other-expense', name: 'Other',         emoji: '📦' },
    ],
};

// Category color palette for charts
const CATEGORY_COLORS = {
    'salary': '#0a84ff', 'freelance': '#5e5ce6', 'investments': '#30d158',
    'gifts': '#ff9f0a', 'refund': '#64d2ff', 'other-income': '#98989d',
    'food': '#ff6b6b', 'groceries': '#30d158', 'rent': '#5e5ce6',
    'transport': '#0a84ff', 'entertainment': '#ff375f', 'shopping': '#bf5af2',
    'health': '#ff453a', 'education': '#64d2ff', 'subscriptions': '#ff9f0a',
    'utilities': '#ffd60a', 'smoking': '#8e8e93', 'alcohol': '#ff9500',
    'savings': '#34c759', 'other-expense': '#aeaeb2',
};

// ======================== STATE ========================
let state = {
    transactions: [],
    currentView: 'dashboard',
    typeFilter: 'all',
    categoryFilter: 'all',
    searchQuery: '',
    editingId: null,
};

// Chart instances
let spendingChart = null;
let trendChart = null;
let categoryBarChart = null;

// ======================== DOM CACHE ========================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
    // Views
    dashboardView:   $('#dashboard-view'),
    transactionsView: $('#transactions-view'),
    analyticsView:    $('#analytics-view'),

    // Stats
    totalBalance:   $('#total-balance'),
    monthlyIncome:  $('#monthly-income'),
    monthlyExpenses: $('#monthly-expenses'),

    // Dashboard
    recentTransactions: $('#recent-transactions'),
    recentEmpty:        $('#recent-empty'),
    insightsContent:    $('#insights-content'),

    // Charts
    spendingChart:      $('#spending-chart'),
    spendingChartEmpty: $('#spending-chart-empty'),
    spendingCenterLabel: $('#spending-center-label'),
    trendChart:         $('#trend-chart'),
    trendChartEmpty:    $('#trend-chart-empty'),
    categoryBarChart:   $('#category-bar-chart'),
    categoryChartEmpty: $('#category-chart-empty'),

    // Transactions view
    searchInput:        $('#search-input'),
    typeFilter:         $('#type-filter'),
    categoryFilterSel:  $('#category-filter'),
    transactionsFullList: $('#transactions-full-list'),
    transactionsEmpty:  $('#transactions-empty'),

    // Analytics
    topCategories:  $('#top-categories'),
    avgDaily:       $('#avg-daily'),
    largestExpense: $('#largest-expense'),
    totalTxns:      $('#total-transactions'),
    savingsRate:    $('#savings-rate'),

    // Modals
    modalOverlay:     $('#modal-overlay'),
    modalClose:       $('#modal-close'),
    modalCancel:      $('#modal-cancel'),
    modalSave:        $('#modal-save'),
    typeToggle:       $('#type-toggle'),
    amountInput:      $('#amount-input'),
    categoryPicker:   $('#category-picker'),
    dateInput:        $('#date-input'),
    noteInput:        $('#note-input'),

    editModalOverlay: $('#edit-modal-overlay'),
    editModalClose:   $('#edit-modal-close'),
    editSaveBtn:      $('#edit-save-btn'),
    editDeleteBtn:    $('#edit-delete-btn'),
    editTypeToggle:   $('#edit-type-toggle'),
    editAmountInput:  $('#edit-amount-input'),
    editCategoryPicker: $('#edit-category-picker'),
    editDateInput:    $('#edit-date-input'),
    editNoteInput:    $('#edit-note-input'),

    // Nav
    addTransactionBtn: $('#add-transaction-btn'),
    mobileAddBtn:      $('#mobile-add-btn'),
    pageTitle:         $('#page-title'),
    pageSubtitle:      $('#page-subtitle'),
    menuToggle:        $('#menu-toggle'),
    sidebar:           $('#sidebar'),

    // Toast
    toastContainer: $('#toast-container'),

    // Auth
    loginOverlay:   $('#login-overlay'),
    googleSigninBtn: $('#google-signin-btn'),
    skipSigninBtn:  $('#skip-signin-btn'),
    userSection:    $('#user-section'),
    guestSection:   $('#guest-section'),
    userAvatar:     $('#user-avatar'),
    userName:       $('#user-name'),
    signoutBtn:     $('#signout-btn'),
    signinSmallBtn: $('#signin-small-btn'),
    appContainer:   $('#app-container'),
};

// ======================== FIREBASE ========================
let db = null;
let unsubscribeSnapshot = null;
let firebaseReady = false;

function initFirebase() {
    // Check if Firebase config is set
    if (typeof FIREBASE_CONFIG === 'undefined' ||
        !FIREBASE_CONFIG.apiKey ||
        FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
        console.warn('Firebase not configured — using localStorage only');
        return false;
    }
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        firebaseReady = true;
        return true;
    } catch (e) {
        console.warn('Firebase init failed:', e);
        return false;
    }
}

// Google Sign-In
async function signInWithGoogle() {
    if (!firebaseReady) {
        showToast('Firebase not configured yet', '⚠️');
        return;
    }
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithRedirect(provider);
    } catch (e) {
        console.error('Sign-in error:', e);
        alert("Firebase Error: " + e.message);
        showToast('Sign-in failed. Try again.', '❌');
    }
}

async function signOut() {
    if (!firebaseReady) return;
    try {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        await firebase.auth().signOut();
        showToast('Signed out', '👋');
    } catch (e) {
        console.error('Sign-out error:', e);
    }
}

function onAuthStateChanged(user) {
    if (user) {
        // Signed in
        DOM.loginOverlay.classList.add('hidden');
        DOM.userSection.style.display = 'block';
        DOM.guestSection.style.display = 'none';
        DOM.userAvatar.src = user.photoURL || '';
        DOM.userName.textContent = user.displayName || user.email || 'User';

        // Start real-time sync
        startRealtimeSync(user.uid);
    } else {
        // Signed out / guest
        DOM.userSection.style.display = 'none';
        DOM.guestSection.style.display = 'block';

        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }

        // Load from localStorage
        loadFromLocalStorage();
        renderAll();
    }
}

function startRealtimeSync(uid) {
    if (!db) return;
    if (unsubscribeSnapshot) unsubscribeSnapshot();

    unsubscribeSnapshot = db.collection('users').doc(uid)
        .collection('transactions')
        .onSnapshot((snapshot) => {
            state.transactions = snapshot.docs.map(doc => doc.data());
            saveToLocalStorage(); // cache locally
            renderAll();
        }, (error) => {
            console.error('Firestore sync error:', error);
            // Fallback to localStorage
            loadFromLocalStorage();
            renderAll();
        });
}

// ======================== DATA PERSISTENCE ========================
const STORAGE_KEY = 'budgetflow_transactions';

function saveData() {
    saveToLocalStorage();
    saveToFirestore();
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
    } catch (e) {
        console.warn('Storage error:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            state.transactions = JSON.parse(data);
        }
    } catch (e) {
        console.warn('Load error:', e);
        state.transactions = [];
    }
}

async function saveToFirestore() {
    if (!firebaseReady) return;
    const user = firebase.auth().currentUser;
    if (!user || !db) return;

    try {
        const batch = db.batch();
        const txnsRef = db.collection('users').doc(user.uid).collection('transactions');

        // Get current Firestore docs
        const snapshot = await txnsRef.get();
        const firestoreIds = new Set(snapshot.docs.map(d => d.id));
        const localIds = new Set(state.transactions.map(t => t.id));

        // Delete removed transactions
        snapshot.docs.forEach(doc => {
            if (!localIds.has(doc.id)) {
                batch.delete(doc.ref);
            }
        });

        // Add/update transactions
        state.transactions.forEach(txn => {
            batch.set(txnsRef.doc(txn.id), txn);
        });

        await batch.commit();
    } catch (e) {
        console.warn('Firestore save error:', e);
    }
}

function loadData() {
    loadFromLocalStorage();
}

// ======================== UTILITIES ========================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return '₹' + Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

function formatBalance(amount) {
    const formatted = formatCurrency(amount);
    if (amount < 0) return '−' + formatted;
    return formatted;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = (today - target) / (1000 * 60 * 60 * 24);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return date.toLocaleDateString('en-IN', { weekday: 'long' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatDateGroupKey(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = (today - target) / (1000 * 60 * 60 * 24);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return date.toLocaleDateString('en-IN', { weekday: 'long' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCategoryInfo(categoryId) {
    const all = [...CATEGORIES.income, ...CATEGORIES.expense];
    return all.find(c => c.id === categoryId) || { id: categoryId, name: categoryId, emoji: '📦' };
}

function getCurrentMonth() {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
}

function isCurrentMonth(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const cm = getCurrentMonth();
    return d.getFullYear() === cm.year && d.getMonth() === cm.month;
}

function getMonthlyTotals() {
    let income = 0, expense = 0;
    state.transactions.forEach(t => {
        if (isCurrentMonth(t.date)) {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        }
    });
    return { income, expense, balance: income - expense };
}

function getAllTimeTotals() {
    let income = 0, expense = 0;
    state.transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
}

// ======================== TOAST NOTIFICATIONS ========================
function showToast(message, icon = '✅') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2800);
}

// ======================== ANIMATED COUNTER ========================
function animateValue(element, start, end, duration = 600, useBalance = false) {
    if (start === end) {
        element.textContent = useBalance ? formatBalance(end) : formatCurrency(end);
        return;
    }
    const range = end - start;
    const startTime = performance.now();
    const fmt = useBalance ? formatBalance : formatCurrency;

    function update(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + range * eased);
        element.textContent = fmt(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// ======================== NAVIGATION ========================
const VIEW_META = {
    dashboard:    { title: 'Dashboard',    subtitle: "Here's your financial overview" },
    transactions: { title: 'Transactions', subtitle: 'Your complete transaction history' },
    analytics:    { title: 'Analytics',    subtitle: 'Insights into your spending habits' },
};

function switchView(viewName) {
    if (state.currentView === viewName) return;
    state.currentView = viewName;

    // Update active states
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    $$('.mobile-nav-item[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));

    // Switch views
    $$('.view').forEach(v => v.classList.remove('active'));
    $(`#${viewName}-view`).classList.add('active');

    // Update topbar
    const meta = VIEW_META[viewName];
    DOM.pageTitle.textContent = meta.title;
    DOM.pageSubtitle.textContent = meta.subtitle;

    // Close sidebar on mobile
    DOM.sidebar.classList.remove('open');
    const backdrop = $('.sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');

    // Render view-specific content
    if (viewName === 'analytics') renderAnalytics();
    if (viewName === 'transactions') renderTransactionsView();
}

// ======================== MODAL ========================
let addModalType = 'expense';
let addModalCategory = null;

function openAddModal() {
    addModalType = 'expense';
    addModalCategory = null;

    // Reset form
    DOM.amountInput.value = '';
    DOM.noteInput.value = '';
    DOM.dateInput.value = new Date().toISOString().split('T')[0];

    // Reset toggle
    DOM.typeToggle.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === 'expense');
    });
    DOM.typeToggle.querySelector('.toggle-indicator').classList.remove('right');

    renderCategoryPicker(DOM.categoryPicker, 'expense', null);
    DOM.modalOverlay.classList.add('active');
    setTimeout(() => DOM.amountInput.focus(), 350);
}

function closeAddModal() {
    DOM.modalOverlay.classList.remove('active');
}

function openEditModal(txnId) {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;

    state.editingId = txnId;

    // Populate form
    DOM.editAmountInput.value = txn.amount;
    DOM.editNoteInput.value = txn.note || '';
    DOM.editDateInput.value = txn.date;

    // Set toggle
    const editToggle = DOM.editTypeToggle;
    editToggle.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === txn.type);
    });
    editToggle.querySelector('.toggle-indicator').classList.toggle('right', txn.type === 'income');

    renderCategoryPicker(DOM.editCategoryPicker, txn.type, txn.category);
    DOM.editModalOverlay.classList.add('active');
}

function closeEditModal() {
    DOM.editModalOverlay.classList.remove('active');
    state.editingId = null;
}

function renderCategoryPicker(container, type, selectedId) {
    const cats = CATEGORIES[type] || CATEGORIES.expense;
    container.innerHTML = cats.map(c => `
        <button class="category-chip ${c.id === selectedId ? 'active' : ''}" data-category="${c.id}" type="button">
            <span class="chip-emoji">${c.emoji}</span>
            <span class="chip-label">${c.name}</span>
        </button>
    `).join('');
}

// Event delegation for category pickers — survives DOM re-renders
function initCategoryPickerDelegation(container) {
    container.addEventListener('click', (e) => {
        const chip = e.target.closest('.category-chip');
        if (!chip) return;
        container.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
    });
}

// ======================== CRUD ========================
function addTransaction() {
    const amount = parseFloat(DOM.amountInput.value);
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', '⚠️');
        DOM.amountInput.focus();
        return;
    }

    const activeChip = DOM.categoryPicker.querySelector('.category-chip.active');
    if (!activeChip) {
        showToast('Please select a category', '⚠️');
        return;
    }

    const txn = {
        id: generateId(),
        type: addModalType,
        amount: amount,
        category: activeChip.dataset.category,
        date: DOM.dateInput.value || new Date().toISOString().split('T')[0],
        note: DOM.noteInput.value.trim(),
        createdAt: Date.now(),
    };

    state.transactions.unshift(txn);
    saveData();
    closeAddModal();
    renderAll();
    showToast('Transaction added!', '✨');
}

function updateTransaction() {
    const idx = state.transactions.findIndex(t => t.id === state.editingId);
    if (idx === -1) return;

    const amount = parseFloat(DOM.editAmountInput.value);
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', '⚠️');
        return;
    }

    const activeChip = DOM.editCategoryPicker.querySelector('.category-chip.active');
    if (!activeChip) {
        showToast('Please select a category', '⚠️');
        return;
    }

    const editToggle = DOM.editTypeToggle;
    const activeType = editToggle.querySelector('.toggle-btn.active').dataset.type;

    state.transactions[idx] = {
        ...state.transactions[idx],
        type: activeType,
        amount: amount,
        category: activeChip.dataset.category,
        date: DOM.editDateInput.value,
        note: DOM.editNoteInput.value.trim(),
    };

    saveData();
    closeEditModal();
    renderAll();
    showToast('Transaction updated!', '✏️');
}

function deleteTransaction() {
    state.transactions = state.transactions.filter(t => t.id !== state.editingId);
    saveData();
    closeEditModal();
    renderAll();
    showToast('Transaction deleted', '🗑️');
}

// ======================== RENDER ========================
function renderAll() {
    renderStats();
    renderRecentTransactions();
    renderSpendingChart();
    renderInsights();
    populateCategoryFilter();
    if (state.currentView === 'transactions') renderTransactionsView();
    if (state.currentView === 'analytics') renderAnalytics();
}

// Stats
function renderStats() {
    const totals = getAllTimeTotals();
    const monthly = getMonthlyTotals();

    animateValue(DOM.totalBalance, parseCurrencyValue(DOM.totalBalance.textContent), totals.balance, 600, true);
    animateValue(DOM.monthlyIncome, parseCurrencyValue(DOM.monthlyIncome.textContent), monthly.income);
    animateValue(DOM.monthlyExpenses, parseCurrencyValue(DOM.monthlyExpenses.textContent), monthly.expense);

    // Color the balance based on positive/negative
    DOM.totalBalance.style.color = totals.balance < 0 ? 'var(--red)' : '';
}

function parseCurrencyValue(str) {
    const cleaned = str.replace(/[₹,\s]/g, '');
    // Handle the unicode minus sign (−) used in formatBalance
    const normalized = cleaned.replace(/−/g, '-');
    return parseInt(normalized) || 0;
}

// Recent Transactions
function renderRecentTransactions() {
    const sorted = [...state.transactions].sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        return dateComp !== 0 ? dateComp : b.createdAt - a.createdAt;
    });
    const recent = sorted.slice(0, 5);

    if (recent.length === 0) {
        DOM.recentTransactions.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💸</span>
                <p>No transactions yet</p>
                <span class="empty-hint">Tap + to add your first one</span>
            </div>`;
        return;
    }

    DOM.recentTransactions.innerHTML = recent.map(t => createTransactionItemHTML(t)).join('');
}

function createTransactionItemHTML(t) {
    const cat = getCategoryInfo(t.category);
    const prefix = t.type === 'income' ? '+' : '−';
    const noteText = t.note ? t.note : formatDate(t.date);

    return `
        <div class="transaction-item entering" data-id="${t.id}" onclick="openEditModal('${t.id}')">
            <div class="txn-emoji">${cat.emoji}</div>
            <div class="txn-details">
                <div class="txn-category">${cat.name}</div>
                <div class="txn-note">${noteText}</div>
            </div>
            <div class="txn-meta">
                <div class="txn-amount ${t.type}">${prefix}${formatCurrency(t.amount)}</div>
                <div class="txn-date">${formatDate(t.date)}</div>
            </div>
        </div>`;
}

// Spending Chart (Donut)
function renderSpendingChart() {
    const monthlyExpenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));

    if (monthlyExpenses.length === 0) {
        DOM.spendingChartEmpty.classList.remove('hidden');
        DOM.spendingCenterLabel.innerHTML = '';
        if (spendingChart) { spendingChart.destroy(); spendingChart = null; }
        return;
    }

    DOM.spendingChartEmpty.classList.add('hidden');

    // Aggregate by category
    const categoryTotals = {};
    monthlyExpenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const labels = sortedCats.map(([id]) => getCategoryInfo(id).name);
    const data = sortedCats.map(([, v]) => v);
    const colors = sortedCats.map(([id]) => CATEGORY_COLORS[id] || '#98989d');
    const totalExpense = data.reduce((s, v) => s + v, 0);

    DOM.spendingCenterLabel.innerHTML = `
        <span class="center-amount">${formatCurrency(totalExpense)}</span>
        <span class="center-label">This Month</span>
    `;

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (spendingChart) spendingChart.destroy();
    spendingChart = new Chart(DOM.spendingChart, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
                borderWidth: 2,
                borderRadius: 4,
                spacing: 3,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.95)',
                    titleColor: isDark ? '#f5f5f7' : '#1d1d1f',
                    bodyColor: isDark ? '#98989d' : '#6e6e73',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'Inter' },
                    callbacks: {
                        label: (ctx) => ` ${formatCurrency(ctx.raw)} (${Math.round(ctx.raw / totalExpense * 100)}%)`,
                    },
                },
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: 'easeOutQuart',
            },
        },
    });
}

// ======================== TRANSACTIONS VIEW ========================
function renderTransactionsView() {
    let filtered = [...state.transactions];

    // Type filter
    if (state.typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === state.typeFilter);
    }

    // Category filter
    if (state.categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === state.categoryFilter);
    }

    // Search
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(t => {
            const cat = getCategoryInfo(t.category);
            return cat.name.toLowerCase().includes(q) ||
                   (t.note && t.note.toLowerCase().includes(q)) ||
                   t.amount.toString().includes(q);
        });
    }

    // Sort
    filtered.sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        return dateComp !== 0 ? dateComp : b.createdAt - a.createdAt;
    });

    if (filtered.length === 0) {
        DOM.transactionsFullList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>No transactions found</p>
            </div>`;
        return;
    }

    // Group by date
    const groups = {};
    filtered.forEach(t => {
        const key = t.date;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    let html = '';
    for (const [dateKey, txns] of Object.entries(groups)) {
        html += `<div class="date-group">
            <div class="date-header">${formatDateGroupKey(dateKey)}</div>
            ${txns.map(t => createTransactionItemHTML(t)).join('')}
        </div>`;
    }

    DOM.transactionsFullList.innerHTML = html;
}

function populateCategoryFilter() {
    const usedCategories = new Set(state.transactions.map(t => t.category));
    let options = '<option value="all">All Categories</option>';

    const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
    allCats.forEach(c => {
        if (usedCategories.has(c.id)) {
            options += `<option value="${c.id}">${c.emoji} ${c.name}</option>`;
        }
    });

    DOM.categoryFilterSel.innerHTML = options;
    DOM.categoryFilterSel.value = state.categoryFilter;
}

// ======================== ANALYTICS VIEW ========================
function renderAnalytics() {
    renderTrendChart();
    renderCategoryBarChart();
    renderTopCategories();
    renderSummaryStats();
}

function renderTrendChart() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-IN', { month: 'short' }) });
    }

    const incomeData = months.map(m =>
        state.transactions
            .filter(t => t.type === 'income' && new Date(t.date + 'T00:00:00').getFullYear() === m.year && new Date(t.date + 'T00:00:00').getMonth() === m.month)
            .reduce((s, t) => s + t.amount, 0)
    );
    const expenseData = months.map(m =>
        state.transactions
            .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00').getFullYear() === m.year && new Date(t.date + 'T00:00:00').getMonth() === m.month)
            .reduce((s, t) => s + t.amount, 0)
    );

    const hasData = [...incomeData, ...expenseData].some(v => v > 0);
    DOM.trendChartEmpty.classList.toggle('hidden', hasData);

    if (!hasData) {
        if (trendChart) { trendChart.destroy(); trendChart = null; }
        return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(DOM.trendChart, {
        type: 'bar',
        data: {
            labels: months.map(m => m.label),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.7)' : 'rgba(52, 199, 89, 0.7)',
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: isDark ? 'rgba(255, 69, 58, 0.7)' : 'rgba(255, 59, 48, 0.7)',
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 8,
                        padding: 16,
                        font: { family: 'Inter', size: 12, weight: '500' },
                        color: isDark ? '#98989d' : '#6e6e73',
                    },
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.95)',
                    titleColor: isDark ? '#f5f5f7' : '#1d1d1f',
                    bodyColor: isDark ? '#98989d' : '#6e6e73',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'Inter' },
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Inter', size: 12, weight: '500' },
                        color: isDark ? '#636366' : '#aeaeb2',
                    },
                },
                y: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { family: 'Inter', size: 11 },
                        color: isDark ? '#636366' : '#aeaeb2',
                        callback: (v) => formatCurrency(v),
                    },
                    border: { display: false },
                },
            },
            animation: { duration: 800, easing: 'easeOutQuart' },
        },
    });
}

function renderCategoryBarChart() {
    const expenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));

    if (expenses.length === 0) {
        DOM.categoryChartEmpty.classList.remove('hidden');
        if (categoryBarChart) { categoryBarChart.destroy(); categoryBarChart = null; }
        return;
    }
    DOM.categoryChartEmpty.classList.add('hidden');

    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const labels = sorted.map(([id]) => getCategoryInfo(id).emoji + ' ' + getCategoryInfo(id).name);
    const data = sorted.map(([, v]) => v);
    const colors = sorted.map(([id]) => CATEGORY_COLORS[id] || '#98989d');

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (categoryBarChart) categoryBarChart.destroy();
    categoryBarChart = new Chart(DOM.categoryBarChart, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.map(c => c + 'cc'),
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
            }],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.95)',
                    titleColor: isDark ? '#f5f5f7' : '#1d1d1f',
                    bodyColor: isDark ? '#98989d' : '#6e6e73',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'Inter' },
                    callbacks: {
                        label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { family: 'Inter', size: 11 },
                        color: isDark ? '#636366' : '#aeaeb2',
                        callback: (v) => formatCurrency(v),
                    },
                    border: { display: false },
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Inter', size: 12, weight: '500' },
                        color: isDark ? '#98989d' : '#6e6e73',
                    },
                },
            },
            animation: { duration: 800, easing: 'easeOutQuart' },
        },
    });
}

function renderTopCategories() {
    const expenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));

    if (expenses.length === 0) {
        DOM.topCategories.innerHTML = '<div class="empty-state-small"><p>No expense data yet</p></div>';
        return;
    }

    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxVal = sorted[0][1];

    DOM.topCategories.innerHTML = sorted.map(([id, amount]) => {
        const cat = getCategoryInfo(id);
        const pct = (amount / maxVal * 100).toFixed(0);
        const color = CATEGORY_COLORS[id] || '#98989d';
        return `
            <div class="top-category-item">
                <span class="top-cat-emoji">${cat.emoji}</span>
                <div class="top-cat-info">
                    <span class="top-cat-name">${cat.name}</span>
                    <div class="top-cat-bar-track">
                        <div class="top-cat-bar-fill" style="width: ${pct}%; background: ${color}"></div>
                    </div>
                </div>
                <span class="top-cat-amount">${formatCurrency(amount)}</span>
            </div>`;
    }).join('');
}

function renderSummaryStats() {
    const monthly = getMonthlyTotals();
    const monthlyExpenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));
    const monthlyAll = state.transactions.filter(t => isCurrentMonth(t.date));

    // Avg daily spending
    const now = new Date();
    const dayOfMonth = now.getDate();
    const avgDaily = monthlyExpenses.length > 0 ? Math.round(monthly.expense / dayOfMonth) : 0;
    DOM.avgDaily.textContent = formatCurrency(avgDaily);

    // Largest expense
    if (monthlyExpenses.length > 0) {
        const largest = monthlyExpenses.reduce((max, t) => t.amount > max.amount ? t : max);
        const cat = getCategoryInfo(largest.category);
        DOM.largestExpense.textContent = `${cat.emoji} ${formatCurrency(largest.amount)}`;
    } else {
        DOM.largestExpense.textContent = '—';
    }

    // Total transactions
    DOM.totalTxns.textContent = monthlyAll.length;

    // Savings rate
    if (monthly.income > 0) {
        const rate = Math.round(((monthly.income - monthly.expense) / monthly.income) * 100);
        DOM.savingsRate.textContent = rate + '%';
        DOM.savingsRate.style.color = rate >= 0 ? 'var(--green)' : 'var(--red)';
    } else {
        DOM.savingsRate.textContent = '0%';
    }
}

// ======================== INSIGHTS ========================
function renderInsights() {
    const monthly = getMonthlyTotals();
    const monthlyExpenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));

    if (state.transactions.length < 2) {
        DOM.insightsContent.innerHTML = '<p class="insight-placeholder">Add some transactions to unlock insights!</p>';
        return;
    }

    const insights = [];

    // Savings rate
    if (monthly.income > 0) {
        const rate = Math.round(((monthly.income - monthly.expense) / monthly.income) * 100);
        if (rate >= 30) {
            insights.push({ icon: '🏆', text: `Amazing! You're saving ${rate}% of your income this month.` });
        } else if (rate >= 10) {
            insights.push({ icon: '👍', text: `You're saving ${rate}% of your income. Keep it up!` });
        } else if (rate >= 0) {
            insights.push({ icon: '⚡', text: `Your savings rate is ${rate}%. Try to aim for at least 20%.` });
        } else {
            insights.push({ icon: '🚨', text: `You're overspending by ${Math.abs(rate)}% this month!` });
        }
    }

    // Top category
    if (monthlyExpenses.length > 0) {
        const categoryTotals = {};
        monthlyExpenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        const top = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        const cat = getCategoryInfo(top[0]);
        const pct = Math.round((top[1] / monthly.expense) * 100);
        insights.push({ icon: cat.emoji, text: `${cat.name} is your biggest expense (${pct}% of spending).` });
    }

    // Smoking/alcohol warning
    const smokingExpense = monthlyExpenses.filter(t => t.category === 'smoking').reduce((s, t) => s + t.amount, 0);
    const alcoholExpense = monthlyExpenses.filter(t => t.category === 'alcohol').reduce((s, t) => s + t.amount, 0);
    if (smokingExpense > 0) {
        insights.push({ icon: '🚬', text: `You've spent ${formatCurrency(smokingExpense)} on smoking this month. Consider cutting back!` });
    }
    if (alcoholExpense > 0) {
        insights.push({ icon: '🍺', text: `${formatCurrency(alcoholExpense)} spent on alcohol this month.` });
    }

    // Transaction count
    const txnCount = state.transactions.filter(t => isCurrentMonth(t.date)).length;
    if (txnCount > 20) {
        insights.push({ icon: '📊', text: `${txnCount} transactions logged this month. You're on top of it!` });
    }

    if (insights.length === 0) {
        insights.push({ icon: '💡', text: 'Keep tracking to get more personalized insights!' });
    }

    DOM.insightsContent.innerHTML = insights.map(i => `
        <div class="insight-item">
            <span class="insight-icon">${i.icon}</span>
            <span>${i.text}</span>
        </div>
    `).join('');
}

// ======================== SEGMENTED CONTROL ========================
function initSegmentedControl(container, callback) {
    const btns = container.querySelectorAll('.segment-btn');
    const indicator = container.querySelector('.segment-indicator');

    function updateIndicator(activeBtn) {
        const rect = activeBtn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const paddingOffset = 3; // matches CSS padding
        indicator.style.width = rect.width + 'px';
        indicator.style.transform = `translateX(${rect.left - containerRect.left - paddingOffset}px)`;
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateIndicator(btn);
            callback(btn.dataset.filter);
        });
    });

    // Init position
    const activeBtn = container.querySelector('.segment-btn.active');
    if (activeBtn) {
        // Delay to ensure layout is ready
        requestAnimationFrame(() => updateIndicator(activeBtn));
    }
}

// ======================== TYPE TOGGLE ========================
function initTypeToggle(toggleContainer, pickerContainer, onTypeChange) {
    const btns = toggleContainer.querySelectorAll('.toggle-btn');
    const indicator = toggleContainer.querySelector('.toggle-indicator');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            indicator.classList.toggle('right', btn.dataset.type === 'income');
            const type = btn.dataset.type;
            renderCategoryPicker(pickerContainer, type, null);
            // listeners handled by event delegation
            if (onTypeChange) onTypeChange(type);
        });
    });
}

// initCategoryChipListeners removed — replaced by event delegation via initCategoryPickerDelegation

// ======================== EVENT LISTENERS ========================
function initEventListeners() {
    // Navigation — Sidebar
    $$('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Navigation — Mobile
    $$('.mobile-nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // "View All" links
    $$('.link-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Add Transaction buttons
    DOM.addTransactionBtn.addEventListener('click', openAddModal);
    DOM.mobileAddBtn.addEventListener('click', openAddModal);

    // Add Modal
    DOM.modalClose.addEventListener('click', closeAddModal);
    DOM.modalCancel.addEventListener('click', closeAddModal);
    DOM.modalSave.addEventListener('click', addTransaction);
    DOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.modalOverlay) closeAddModal();
    });

    // Type Toggle — Add Modal
    initTypeToggle(DOM.typeToggle, DOM.categoryPicker, (type) => {
        addModalType = type;
        addModalCategory = null;
    });

    // Edit Modal
    DOM.editModalClose.addEventListener('click', closeEditModal);
    DOM.editSaveBtn.addEventListener('click', updateTransaction);
    DOM.editDeleteBtn.addEventListener('click', deleteTransaction);
    DOM.editModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.editModalOverlay) closeEditModal();
    });

    // Type Toggle — Edit Modal
    initTypeToggle(DOM.editTypeToggle, DOM.editCategoryPicker);

    // Search
    DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderTransactionsView();
    });

    // Type Filter (Segmented Control)
    initSegmentedControl(DOM.typeFilter, (filter) => {
        state.typeFilter = filter;
        renderTransactionsView();
    });

    // Category Filter
    DOM.categoryFilterSel.addEventListener('change', (e) => {
        state.categoryFilter = e.target.value;
        renderTransactionsView();
    });

    // Mobile menu toggle
    DOM.menuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
        let backdrop = document.querySelector('.sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', () => {
                DOM.sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }
        backdrop.classList.toggle('active', DOM.sidebar.classList.contains('open'));
    });

    // Keyboard shortcut: Escape to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (DOM.modalOverlay.classList.contains('active')) closeAddModal();
            if (DOM.editModalOverlay.classList.contains('active')) closeEditModal();
        }
    });

    // Theme changes — re-render charts
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        renderSpendingChart();
        if (state.currentView === 'analytics') renderAnalytics();
    });
}

// ======================== INIT ========================
function init() {
    // Init Firebase (returns false if not configured)
    const hasFirebase = initFirebase();

    // Load cached data first (for fast render)
    loadData();
    renderAll();
    initEventListeners();
    initCategoryPickerDelegation(DOM.categoryPicker);
    initCategoryPickerDelegation(DOM.editCategoryPicker);

    // Set default date
    DOM.dateInput.value = new Date().toISOString().split('T')[0];

    // Auth event listeners
    DOM.googleSigninBtn.addEventListener('click', signInWithGoogle);
    DOM.skipSigninBtn.addEventListener('click', () => {
        DOM.loginOverlay.classList.add('hidden');
    });
    DOM.signoutBtn.addEventListener('click', signOut);
    DOM.signinSmallBtn.addEventListener('click', signInWithGoogle);

    if (hasFirebase) {
        // Catch any redirect errors
        firebase.auth().getRedirectResult().catch(e => {
            console.error('Redirect result error:', e);
            alert("Firebase Redirect Error: " + e.message);
        });
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(onAuthStateChanged);
    } else {
        // No Firebase — hide login overlay, use localStorage
        DOM.loginOverlay.classList.add('hidden');
        DOM.guestSection.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);
