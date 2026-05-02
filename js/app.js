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
        { id: 'grooming',      name: 'Grooming',      emoji: '💈' },
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
    'grooming': '#e040fb', 'savings': '#34c759', 'other-expense': '#aeaeb2',
};

// ======================== STATE ========================
let state = {
    transactions: [],
    vasooli: [],
    currentView: 'dashboard',
    typeFilter: 'all',
    categoryFilter: 'all',
    searchQuery: '',
    editingId: null,
    analyticsMonth: new Date().getMonth(),
    analyticsYear: new Date().getFullYear(),
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

    // Splash
    splashScreen:         $('#splash-screen'),

    // Vasooli
    vasooliTotalLent:     $('#vasooli-total-lent'),
    vasooliTotalRecovered: $('#vasooli-total-recovered'),
    vasooliStillOwed:     $('#vasooli-still-owed'),
    vasooliPersons:       $('#vasooli-persons'),
    vasooliEmpty:         $('#vasooli-empty'),
    lendMoneyBtn:         $('#lend-money-btn'),
    lendModalOverlay:     $('#lend-modal-overlay'),
    lendModalClose:       $('#lend-modal-close'),
    lendModalCancel:      $('#lend-modal-cancel'),
    lendModalSave:        $('#lend-modal-save'),
    lendModalTitle:       $('#lend-modal-title'),
    lendPersonInput:      $('#lend-person-input'),
    lendAmountInput:      $('#lend-amount-input'),
    lendAmountLabel:      $('#lend-amount-label'),
    lendNoteInput:        $('#lend-note-input'),
    lendDateInput:        $('#lend-date-input'),
    personSuggestions:    $('#person-suggestions'),
    lendModeToggle:       $('#lend-mode-toggle'),
    lendIndividualPerson: $('#lend-individual-person'),
    splitPeopleSection:   $('#split-people-section'),
    splitPersonInput:     $('#split-person-input'),
    splitAddPerson:       $('#split-add-person'),
    splitChips:           $('#split-chips'),
    splitIncludeSelf:     $('#split-include-self'),
    splitPreview:         $('#split-preview'),
    splitPreviewHeader:   $('#split-preview-header'),
    splitPreviewList:     $('#split-preview-list'),
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

// ======================== SPLASH ========================
const _splashShownAt = Date.now();
function hideSplash() {
    const elapsed = Date.now() - _splashShownAt;
    const minDuration = 900; // ms — let the animation breathe
    const delay = Math.max(0, minDuration - elapsed);
    setTimeout(() => {
        if (!DOM.splashScreen) return;
        DOM.splashScreen.style.pointerEvents = 'none';
        DOM.splashScreen.classList.add('hidden');
    }, delay);
}

// Google Sign-In
async function signInWithGoogle() {
    if (!firebaseReady) {
        showToast('Firebase not configured yet', '⚠️');
        return;
    }
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithPopup(provider);
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') {
            console.error('Sign-in error:', e);
            showToast('Sign-in failed. Try again.', '❌');
        }
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
        // Signed in — DON'T wipe localStorage yet!
        // Keep it as a safety backup until Firestore confirms data is loaded.
        localStorage.setItem(STORAGE_KEY + '_user_ever_logged_in', '1');

        DOM.loginOverlay.style.pointerEvents = 'none';
        DOM.loginOverlay.classList.add('hidden');

        DOM.userSection.style.display = 'block';
        DOM.guestSection.style.display = 'none';
        DOM.userAvatar.src = user.photoURL || '';
        DOM.userName.textContent = user.displayName || user.email || 'User';

        // Hide splash and start real-time sync
        hideSplash();
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
        hideSplash();
    }
}

function startRealtimeSync(uid) {
    if (!db) {
        // Firebase DB not available — fall back to local data
        loadFromLocalStorage();
        renderAll();
        return;
    }
    if (unsubscribeSnapshot) unsubscribeSnapshot();

    // Check if the current local data is purely untouched demo data
    const isDemoData = localStorage.getItem(STORAGE_KEY + '_is_demo') === 'true';

    // ── Backup current local data before sync ──
    // If Firestore has nothing (or fails), we can fall back to this.
    const localBackup = {
        transactions: localStorage.getItem(STORAGE_KEY),
        vasooli: localStorage.getItem(STORAGE_KEY + '_vasooli'),
    };

    let txnsSynced = false;
    let vasooliSynced = false;

    // Listen for transactions
    const unsubTxns = db.collection('users').doc(uid)
        .collection('transactions')
        .onSnapshot((snapshot) => {
            const firestoreData = snapshot.docs.map(doc => doc.data());

            // If Firestore returned data, use it
            if (firestoreData.length > 0) {
                state.transactions = firestoreData;
            } else if (!txnsSynced && localBackup.transactions) {
                if (isDemoData) {
                    // It's a new account and we only have untouched demo data locally. Wipe it.
                    state.transactions = [];
                } else {
                    // First sync returned empty — keep local data alive
                    try {
                        const parsed = JSON.parse(localBackup.transactions);
                        if (parsed.length > 0) {
                            state.transactions = parsed;
                            // Push local data UP to Firestore so it's not lost
                            _pushTransactionsToFirestore(uid, parsed);
                        }
                    } catch(e) { /* ignore parse errors */ }
                }
            }

            txnsSynced = true;
            saveToLocalStorage();
            renderAll();
        }, (error) => {
            console.error('Firestore transactions sync error:', error);
            showToast('Cloud sync failed — using local data', '⚠️');
            // Restore from local backup
            if (localBackup.transactions) {
                try { state.transactions = JSON.parse(localBackup.transactions); } catch(e) {}
            }
            renderAll();
        });

    // Listen for vasooli
    const unsubVasooli = db.collection('users').doc(uid)
        .collection('vasooli')
        .onSnapshot((snapshot) => {
            const firestoreData = snapshot.docs.map(doc => doc.data());

            if (firestoreData.length > 0) {
                state.vasooli = firestoreData;
            } else if (!vasooliSynced && localBackup.vasooli) {
                if (isDemoData) {
                    state.vasooli = [];
                } else {
                    try {
                        const parsed = JSON.parse(localBackup.vasooli);
                        if (parsed.length > 0) {
                            state.vasooli = parsed;
                            _pushVasooliToFirestore(uid, parsed);
                        }
                    } catch(e) {}
                }
            }

            vasooliSynced = true;
            saveToLocalStorage();
            renderAll();
        }, (error) => {
            console.error('Vasooli sync error:', error);
            if (localBackup.vasooli) {
                try { state.vasooli = JSON.parse(localBackup.vasooli); } catch(e) {}
            }
            renderAll();
        });

    unsubscribeSnapshot = () => {
        unsubTxns();
        unsubVasooli();
    };
}

// ── Push local data to Firestore (recovery helper) ──
async function _pushTransactionsToFirestore(uid, transactions) {
    if (!db || !uid || !transactions.length) return;
    try {
        const batch = db.batch();
        const ref = db.collection('users').doc(uid).collection('transactions');
        transactions.forEach(txn => {
            batch.set(ref.doc(txn.id), txn);
        });
        await batch.commit();
        console.log(`✅ Pushed ${transactions.length} transactions to Firestore`);
    } catch(e) {
        console.warn('Failed to push transactions to Firestore:', e);
    }
}

async function _pushVasooliToFirestore(uid, vasooli) {
    if (!db || !uid || !vasooli.length) return;
    try {
        const batch = db.batch();
        const ref = db.collection('users').doc(uid).collection('vasooli');
        vasooli.forEach(v => {
            batch.set(ref.doc(v.id), v);
        });
        await batch.commit();
        console.log(`✅ Pushed ${vasooli.length} vasooli entries to Firestore`);
    } catch(e) {
        console.warn('Failed to push vasooli to Firestore:', e);
    }
}

// ======================== DATA PERSISTENCE ========================
const STORAGE_KEY = 'budgetflow_transactions';
const LAST_DATE_KEY = 'budgetflow_last_date';

// ── Date memory helpers ──
function saveLastDate(dateStr) {
    if (dateStr) localStorage.setItem(LAST_DATE_KEY, dateStr);
}
function getLastDate() {
    return localStorage.getItem(LAST_DATE_KEY) || new Date().toISOString().split('T')[0];
}

function saveData() {
    saveToLocalStorage();
    saveToFirestore();
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
        localStorage.setItem(STORAGE_KEY + '_vasooli', JSON.stringify(state.vasooli));
        
        // If the user or app saves data normally, it is no longer untouched demo data
        localStorage.removeItem(STORAGE_KEY + '_is_demo');
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
        const vasooliData = localStorage.getItem(STORAGE_KEY + '_vasooli');
        if (vasooliData) {
            state.vasooli = JSON.parse(vasooliData);
        }
        // Auto-seed with demo data only if no one has ever logged in on this device
        const hasEverLoggedIn = localStorage.getItem(STORAGE_KEY + '_user_ever_logged_in');
        if (state.transactions.length === 0 && state.vasooli.length === 0 && !hasEverLoggedIn) {
            seedDemoData();
        }
    } catch (e) {
        console.warn('Load error:', e);
        state.transactions = [];
        state.vasooli = [];
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

    // Save vasooli
    try {
        const batch2 = db.batch();
        const vasRef = db.collection('users').doc(user.uid).collection('vasooli');

        const vasSnap = await vasRef.get();
        const vasFireIds = new Set(vasSnap.docs.map(d => d.id));
        const vasLocalIds = new Set(state.vasooli.map(v => v.id));

        vasSnap.docs.forEach(doc => {
            if (!vasLocalIds.has(doc.id)) {
                batch2.delete(doc.ref);
            }
        });

        state.vasooli.forEach(v => {
            batch2.set(vasRef.doc(v.id), v);
        });

        await batch2.commit();
    } catch (e) {
        console.warn('Vasooli Firestore save error:', e);
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
    // Subtract unsettled vasooli from balance
    const unsettledVasooli = state.vasooli
        .filter(v => !v.settled)
        .reduce((sum, v) => sum + v.amount, 0);
    return { income, expense, balance: income - expense - unsettledVasooli };
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
    vasooli:      { title: 'Vasooli',      subtitle: 'Track money you\'ve lent to people' },
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
    if (viewName === 'vasooli') renderVasooli();
}

// ======================== MODAL ========================
let addModalType = 'expense';
let addModalCategory = null;

function openAddModal() {
    addModalType = 'expense';
    addModalCategory = null;

    // Reset form — restore last-used date
    DOM.amountInput.value = '';
    DOM.noteInput.value = '';
    DOM.dateInput.value = getLastDate();

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

    // Integration bridge — notify HabitForge of smoking/alcohol transactions
    notifyHabitForgeBridge(txn);
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
    if (state.currentView === 'vasooli') renderVasooli();
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
    // Update month picker label
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const label = document.getElementById('analytics-month-label');
    if (label) label.textContent = `${monthNames[state.analyticsMonth]} ${state.analyticsYear}`;

    // Disable next button if on current month
    const now = new Date();
    const nextBtn = document.getElementById('analytics-next-month');
    if (nextBtn) {
        const isCurrentMonth = state.analyticsYear === now.getFullYear() && state.analyticsMonth === now.getMonth();
        nextBtn.disabled = isCurrentMonth;
        nextBtn.style.opacity = isCurrentMonth ? '0.3' : '1';
    }

    renderTrendChart();
    renderFinanceCalendar();
    renderCategoryBarChart();
    renderTopCategories();
    renderSummaryStats();
}

function changeAnalyticsMonth(delta) {
    let m = state.analyticsMonth + delta;
    let y = state.analyticsYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    // Don't go past current month
    const now = new Date();
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return;
    state.analyticsMonth = m;
    state.analyticsYear = y;
    renderAnalytics();
}

function isSelectedMonth(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getFullYear() === state.analyticsYear && d.getMonth() === state.analyticsMonth;
}

function getSelectedMonthTotals() {
    let income = 0, expense = 0;
    state.transactions.forEach(t => {
        if (isSelectedMonth(t.date)) {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        }
    });
    return { income, expense, balance: income - expense };
}

function renderTrendChart() {
    const year = state.analyticsYear;
    const month = state.analyticsMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const labels = [];
    const expenseData = [];
    const incomeData = [];

    for (let day = 1; day <= daysInMonth; day++) {
        labels.push(day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        expenseData.push(
            state.transactions.filter(t => t.type === 'expense' && t.date === dateStr).reduce((s, t) => s + t.amount, 0)
        );
        incomeData.push(
            state.transactions.filter(t => t.type === 'income' && t.date === dateStr).reduce((s, t) => s + t.amount, 0)
        );
    }

    const hasData = [...incomeData, ...expenseData].some(v => v > 0);
    DOM.trendChartEmpty.classList.toggle('hidden', hasData);

    if (!hasData) {
        if (trendChart) { trendChart.destroy(); trendChart = null; }
        return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(DOM.trendChart, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: isDark ? '#ff453a' : '#ff3b30',
                    backgroundColor: isDark ? 'rgba(255, 69, 58, 0.08)' : 'rgba(255, 59, 48, 0.08)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: isDark ? '#ff453a' : '#ff3b30',
                    pointBorderColor: isDark ? '#1c1c1e' : '#ffffff',
                    pointBorderWidth: 2,
                    borderWidth: 2.5,
                },
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: isDark ? '#30d158' : '#34c759',
                    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.08)' : 'rgba(52, 199, 89, 0.08)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: isDark ? '#30d158' : '#34c759',
                    pointBorderColor: isDark ? '#1c1c1e' : '#ffffff',
                    pointBorderWidth: 2,
                    borderWidth: 2.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
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
                        title: (items) => `Day ${items[0].label}`,
                        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Inter', size: 10, weight: '500' },
                        color: isDark ? '#636366' : '#aeaeb2',
                        maxTicksLimit: 10,
                        callback: (val, idx) => (idx + 1) % 5 === 0 || idx === 0 ? idx + 1 : '',
                    },
                },
                y: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { family: 'Inter', size: 11 },
                        color: isDark ? '#636366' : '#aeaeb2',
                        callback: (v) => v >= 1000 ? '₹' + (v / 1000).toFixed(0) + 'k' : '₹' + v,
                    },
                    border: { display: false },
                    beginAtZero: true,
                },
            },
            animation: { duration: 800, easing: 'easeOutQuart' },
        },
    });
}

// ======================== FINANCE CALENDAR ========================
function renderFinanceCalendar() {
    const container = document.getElementById('finance-calendar-grid');
    if (!container) return;

    const year = state.analyticsYear;
    const month = state.analyticsMonth;
    const now = new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    const today = isCurrentMonth ? now.getDate() : -1;

    // Get daily totals
    const dailyTotals = {};
    state.transactions.forEach(t => {
        if (t.type !== 'expense') return;
        const d = new Date(t.date + 'T00:00:00');
        if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
        }
    });

    let html = '';

    // Day-of-week headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(d => {
        html += `<div class="fc-header-cell">${d}</div>`;
    });

    // Empty cells for padding before day 1
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="fc-cell fc-empty"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const amount = dailyTotals[day] || 0;
        let colorClass = 'fc-none';
        if (amount > 0 && amount < 300) colorClass = 'fc-green';
        else if (amount >= 300 && amount <= 500) colorClass = 'fc-yellow';
        else if (amount > 500) colorClass = 'fc-red';

        const isToday = day === today ? ' fc-today' : '';
        const isFuture = day > today ? ' fc-future' : '';
        const amountLabel = amount > 0 ? `<span class="fc-amount">₹${amount >= 1000 ? (amount / 1000).toFixed(1) + 'k' : amount}</span>` : '';

        html += `<div class="fc-cell ${colorClass}${isToday}${isFuture}"><span class="fc-day">${day}</span>${amountLabel}</div>`;
    }

    container.innerHTML = html;

    // Update month total stats
    const monthExpenseTotal = Object.values(dailyTotals).reduce((s, v) => s + v, 0);
    const daysWithSpending = Object.keys(dailyTotals).length;
    const avgDaily = daysWithSpending > 0 ? Math.round(monthExpenseTotal / daysWithSpending) : 0;
    const el = document.getElementById('fc-month-summary');
    if (el) {
        el.innerHTML = `<span>Total: <strong>₹${monthExpenseTotal.toLocaleString('en-IN')}</strong></span><span>Avg/day: <strong>₹${avgDaily.toLocaleString('en-IN')}</strong></span><span>Active days: <strong>${daysWithSpending}</strong></span>`;
    }
}

function renderCategoryBarChart() {
    const expenses = state.transactions.filter(t => t.type === 'expense' && isSelectedMonth(t.date));

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
    const expenses = state.transactions.filter(t => t.type === 'expense' && isSelectedMonth(t.date));

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
    const monthly = getSelectedMonthTotals();
    const monthlyExpenses = state.transactions.filter(t => t.type === 'expense' && isSelectedMonth(t.date));
    const monthlyAll = state.transactions.filter(t => isSelectedMonth(t.date));

    // Avg daily spending
    const now = new Date();
    const isCurrentMonth = state.analyticsYear === now.getFullYear() && state.analyticsMonth === now.getMonth();
    const daysInMonth = new Date(state.analyticsYear, state.analyticsMonth + 1, 0).getDate();
    const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;
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
    const allTime = getAllTimeTotals();
    const monthlyExpenses = state.transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date));
    const allExpenses = state.transactions.filter(t => t.type === 'expense');

    if (state.transactions.length < 2) {
        DOM.insightsContent.innerHTML = '<p class="insight-placeholder">Add some transactions to unlock insights!</p>';
        return;
    }

    const insights = [];
    const now = new Date();
    const dayOfMonth = now.getDate();

    // ─────────────────────────────────────────────
    // 1. SAVINGS RATE — with aggressive messaging
    // ─────────────────────────────────────────────
    if (monthly.income > 0) {
        const rate = Math.round(((monthly.income - monthly.expense) / monthly.income) * 100);
        if (rate >= 30) {
            insights.push({ icon: '🏆', text: `You're saving ${rate}% of your income. Strong discipline — keep this up!`, severity: 'good' });
        } else if (rate >= 10) {
            insights.push({ icon: '⚡', text: `Only saving ${rate}% of your income. That's barely above survival mode. Aim for 30%+.`, severity: 'warn' });
        } else if (rate >= 0) {
            insights.push({ icon: '🔥', text: `Savings rate: ${rate}%. You're one unexpected expense away from a financial crisis. Seriously cut back.`, severity: 'danger' });
        } else {
            insights.push({ icon: '💀', text: `You're OVERSPENDING by ${Math.abs(rate)}% this month! You're literally bleeding money. STOP unnecessary spending NOW.`, severity: 'critical' });
        }
    }

    // ─────────────────────────────────────────────
    // 2. WEEKLY BURN RATE & COUNTDOWN TO ₹0
    // ─────────────────────────────────────────────
    if (monthlyExpenses.length > 0 && dayOfMonth >= 3) {
        const dailyBurn = Math.round(monthly.expense / dayOfMonth);
        const weeklyBurn = dailyBurn * 7;
        const balance = allTime.balance;

        insights.push({ icon: '📉', text: `You're burning ₹${weeklyBurn.toLocaleString('en-IN')} per week (₹${dailyBurn.toLocaleString('en-IN')}/day). That's ₹${(dailyBurn * 365).toLocaleString('en-IN')} per year at this pace.`, severity: 'warn' });

        if (balance > 0 && dailyBurn > 0) {
            const daysLeft = Math.floor(balance / dailyBurn);
            const weeksLeft = Math.floor(daysLeft / 7);
            const monthsLeft = (daysLeft / 30).toFixed(1);

            if (daysLeft < 30) {
                insights.push({ icon: '🚨', text: `⏰ AT THIS RATE, YOUR BALANCE HITS ₹0 IN ${daysLeft} DAYS! That's less than a month. You need to drastically cut spending or you're broke.`, severity: 'critical' });
            } else if (daysLeft < 90) {
                insights.push({ icon: '⏳', text: `Your balance will be COMPLETELY GONE in ${monthsLeft} months (${weeksLeft} weeks). Without new income, you're heading for a financial wall.`, severity: 'danger' });
            } else {
                insights.push({ icon: '⏳', text: `At current pace, your savings last ${monthsLeft} months. Could be longer if you spend smarter.`, severity: 'warn' });
            }
        } else if (balance <= 0) {
            insights.push({ icon: '💀', text: `Your balance is NEGATIVE. You are in DEBT territory. Every rupee you spend now is digging a deeper hole.`, severity: 'critical' });
        }

        // Projected monthly expense vs income
        if (monthly.income > 0) {
            const projectedMonthlyExpense = Math.round(dailyBurn * 30);
            if (projectedMonthlyExpense > monthly.income) {
                const deficit = projectedMonthlyExpense - monthly.income;
                insights.push({ icon: '🕳️', text: `Projected expenses: ₹${projectedMonthlyExpense.toLocaleString('en-IN')} — that's ₹${deficit.toLocaleString('en-IN')} MORE than your income. You'll end this month in the red.`, severity: 'danger' });
            }
        }
    }

    // ─────────────────────────────────────────────
    // 3. 🚬💀 VICE TRACKER — Smoking (FEAR MODE)
    // ─────────────────────────────────────────────
    const smokingExpense = monthlyExpenses.filter(t => t.category === 'smoking').reduce((s, t) => s + t.amount, 0);
    const smokingAllTime = allExpenses.filter(t => t.category === 'smoking').reduce((s, t) => s + t.amount, 0);

    if (smokingExpense > 0) {
        const yearlyProjection = Math.round(smokingExpense * 12);
        const fiveYearProjection = yearlyProjection * 5;
        const tenYearProjection = yearlyProjection * 10;

        insights.push({ icon: '🚬', text: `₹${smokingExpense.toLocaleString('en-IN')} burnt on cigarettes this month. That's ₹${yearlyProjection.toLocaleString('en-IN')}/year — literally turning your money into smoke and ash.`, severity: 'critical' });
        insights.push({ icon: '💀', text: `In 5 years, you'll have BURNT ₹${fiveYearProjection.toLocaleString('en-IN')} on cigarettes. That's a car. In 10 years: ₹${tenYearProjection.toLocaleString('en-IN')} — a house down payment. Gone. Into your lungs.`, severity: 'critical' });
        insights.push({ icon: '🏥', text: `Every cigarette takes 11 minutes off your life. At this spending rate, you're not just losing money — you're buying cancer, lung disease, and a shorter life. Your future self is begging you to stop.`, severity: 'critical' });
    }
    if (smokingAllTime > 0 && smokingExpense === 0) {
        insights.push({ icon: '🚬', text: `You've spent ₹${smokingAllTime.toLocaleString('en-IN')} total on smoking. Good news: nothing this month. Don't start again — that money is gone forever.`, severity: 'warn' });
    }

    // ─────────────────────────────────────────────
    // 4. 🍺💀 VICE TRACKER — Alcohol (FEAR MODE)
    // ─────────────────────────────────────────────
    const alcoholExpense = monthlyExpenses.filter(t => t.category === 'alcohol').reduce((s, t) => s + t.amount, 0);
    const alcoholAllTime = allExpenses.filter(t => t.category === 'alcohol').reduce((s, t) => s + t.amount, 0);

    if (alcoholExpense > 0) {
        const yearlyProjection = Math.round(alcoholExpense * 12);
        const fiveYearProjection = yearlyProjection * 5;

        insights.push({ icon: '🍺', text: `₹${alcoholExpense.toLocaleString('en-IN')} wasted on alcohol this month. That's ₹${yearlyProjection.toLocaleString('en-IN')}/year — enough for a premium vacation you'll actually remember.`, severity: 'critical' });
        insights.push({ icon: '🧠', text: `Alcohol kills brain cells, damages your liver, and wrecks your sleep. You've spent ₹${fiveYearProjection.toLocaleString('en-IN')} projected over 5 years — for what? Hangovers and regret. Invest that money instead.`, severity: 'critical' });
    }
    if (alcoholAllTime > 0 && alcoholExpense === 0) {
        insights.push({ icon: '🍺', text: `₹${alcoholAllTime.toLocaleString('en-IN')} total spent on alcohol historically. Stay clean this month — your wallet and liver thank you.`, severity: 'warn' });
    }

    // Combined vice total
    if (smokingExpense > 0 && alcoholExpense > 0) {
        const viceTotal = smokingExpense + alcoholExpense;
        const vicePct = monthly.expense > 0 ? Math.round((viceTotal / monthly.expense) * 100) : 0;
        insights.push({ icon: '☠️', text: `COMBINED VICE DAMAGE: ₹${viceTotal.toLocaleString('en-IN')} this month (${vicePct}% of all spending). Imagine investing that instead — in 10 years that's over ₹${(viceTotal * 12 * 10).toLocaleString('en-IN')} you chose to destroy.`, severity: 'critical' });
    }

    // ─────────────────────────────────────────────
    // 5. OVERSPENDING ALERTS (non-vice categories)
    // ─────────────────────────────────────────────
    if (monthlyExpenses.length > 0 && monthly.income > 0) {
        const categoryTotals = {};
        monthlyExpenses.forEach(t => {
            if (t.category !== 'smoking' && t.category !== 'alcohol') {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            }
        });

        const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        // Flag categories eating more than 25% of income
        sortedCats.forEach(([catId, amount]) => {
            const pct = Math.round((amount / monthly.income) * 100);
            const cat = getCategoryInfo(catId);

            if (catId === 'rent') return; // Rent is essential, skip

            if (pct >= 25) {
                insights.push({ icon: '🔴', text: `${cat.emoji} ${cat.name} is eating ${pct}% of your income (₹${amount.toLocaleString('en-IN')}). This is DANGEROUS — find ways to cut this down immediately.`, severity: 'danger' });
            } else if (pct >= 15) {
                insights.push({ icon: '🟠', text: `${cat.emoji} ${cat.name}: ₹${amount.toLocaleString('en-IN')} (${pct}% of income). That's a lot — can you reduce this by even 20%?`, severity: 'warn' });
            }
        });

        // Top spending category insight
        if (sortedCats.length > 0) {
            const [topCatId, topAmount] = sortedCats[0];
            const topCat = getCategoryInfo(topCatId);
            const topPct = Math.round((topAmount / monthly.expense) * 100);
            insights.push({ icon: topCat.emoji, text: `${topCat.name} is your #1 expense: ${topPct}% of total spending. Ask yourself — is every rupee spent here truly necessary?`, severity: 'warn' });
        }
    }

    // ─────────────────────────────────────────────
    // 6. SPENDING TREND — this week vs last week
    // ─────────────────────────────────────────────
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const thisWeekSpend = state.transactions.filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date + 'T00:00:00');
        return d >= startOfThisWeek && d <= today;
    }).reduce((s, t) => s + t.amount, 0);

    const lastWeekSpend = state.transactions.filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date + 'T00:00:00');
        return d >= startOfLastWeek && d < startOfThisWeek;
    }).reduce((s, t) => s + t.amount, 0);

    if (lastWeekSpend > 0 && thisWeekSpend > 0) {
        const changePct = Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100);
        if (changePct > 30) {
            insights.push({ icon: '📈', text: `This week's spending is UP ${changePct}% vs last week (₹${thisWeekSpend.toLocaleString('en-IN')} vs ₹${lastWeekSpend.toLocaleString('en-IN')}). You're spending MORE, not less. Reverse this now.`, severity: 'danger' });
        } else if (changePct > 0) {
            insights.push({ icon: '📊', text: `Spending is up ${changePct}% from last week. Small increases add up — stay alert.`, severity: 'warn' });
        } else if (changePct < -10) {
            insights.push({ icon: '✅', text: `Spending is down ${Math.abs(changePct)}% from last week. Good job — keep the discipline going!`, severity: 'good' });
        }
    }

    // ─────────────────────────────────────────────
    // 7. MOTIVATIONAL FEAR — general
    // ─────────────────────────────────────────────
    const txnCount = state.transactions.filter(t => isCurrentMonth(t.date)).length;
    if (txnCount > 30) {
        insights.push({ icon: '⚠️', text: `${txnCount} transactions this month — that's more than 1/day. Each transaction is money leaving your pocket. Fewer transactions = more savings.`, severity: 'warn' });
    }

    if (monthly.expense > 0 && monthly.income > 0 && monthly.expense > monthly.income * 0.9) {
        const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - dayOfMonth;
        if (daysLeft > 5) {
            insights.push({ icon: '🔥', text: `You've already used ${Math.round((monthly.expense / monthly.income) * 100)}% of your income with ${daysLeft} days still left. You're about to overshoot. FREEZE non-essential spending.`, severity: 'critical' });
        }
    }

    // Fallback
    if (insights.length === 0) {
        insights.push({ icon: '💡', text: 'Keep tracking to unlock aggressive insights that protect your money!', severity: 'info' });
    }

    // Render with severity-based styling
    DOM.insightsContent.innerHTML = insights.map(i => `
        <div class="insight-item insight-${i.severity || 'info'}">
            <span class="insight-icon">${i.icon}</span>
            <span>${i.text}</span>
        </div>
    `).join('');
}

// ======================== VASOOLI ========================
function renderVasooli() {
    // Guard: bail out if vasooli elements don't exist in HTML yet
    if (!DOM.vasooliTotalLent) return;

    const entries = state.vasooli;
    const totalLent = entries.reduce((s, v) => s + v.amount, 0);
    const totalRecovered = entries.filter(v => v.settled).reduce((s, v) => s + v.amount, 0);
    const stillOwed = totalLent - totalRecovered;

    DOM.vasooliTotalLent.textContent = formatCurrency(totalLent);
    DOM.vasooliTotalRecovered.textContent = formatCurrency(totalRecovered);
    DOM.vasooliStillOwed.textContent = formatCurrency(stillOwed);

    // Group by person
    const personMap = {};
    entries.forEach(v => {
        const name = v.person.trim();
        if (!personMap[name]) personMap[name] = [];
        personMap[name].push(v);
    });

    const persons = Object.keys(personMap);

    if (persons.length === 0) {
        DOM.vasooliEmpty.style.display = 'block';
        DOM.vasooliPersons.innerHTML = '';
        return;
    }

    DOM.vasooliEmpty.style.display = 'none';

    // Sort: people who still owe first, then alphabetically
    persons.sort((a, b) => {
        const aOwed = personMap[a].filter(v => !v.settled).reduce((s, v) => s + v.amount, 0);
        const bOwed = personMap[b].filter(v => !v.settled).reduce((s, v) => s + v.amount, 0);
        if (aOwed > 0 && bOwed === 0) return -1;
        if (aOwed === 0 && bOwed > 0) return 1;
        return a.localeCompare(b);
    });

    DOM.vasooliPersons.innerHTML = persons.map(name => {
        const items = personMap[name].sort((a, b) => new Date(b.date) - new Date(a.date));
        const unsettled = items.filter(v => !v.settled).reduce((s, v) => s + v.amount, 0);
        const allSettled = unsettled === 0;
        const initial = name.charAt(0).toUpperCase();
        const count = items.length;
        const unsettledCount = items.filter(v => !v.settled).length;

        const entriesHTML = items.map(v => `
            <div class="vasooli-entry ${v.settled ? 'settled' : ''}" data-vasooli-id="${v.id}">
                <div class="vasooli-entry-left">
                    <span class="vasooli-entry-note">${v.note || 'No reason specified'}</span>
                    <span class="vasooli-entry-date">${formatDate(v.date)}</span>
                </div>
                <div class="vasooli-entry-right">
                    <span class="vasooli-entry-amount">${formatCurrency(v.amount)}</span>
                    ${v.settled
                        ? `<span class="vasooli-settled-badge">Settled ✅</span>`
                        : `<button class="vasooli-settle-btn" data-settle-id="${v.id}">Settle</button>`
                    }
                    <button class="vasooli-delete-btn" aria-label="Delete entry" title="Delete" data-delete-id="${v.id}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');

        return `
            <div class="vasooli-person-card glass-card" data-person="${name}">
                <div class="vasooli-person-header">
                    <div class="vasooli-person-left">
                        <div class="vasooli-person-avatar">${initial}</div>
                        <div class="vasooli-person-info">
                            <span class="vasooli-person-name">${name}</span>
                            <span class="vasooli-person-count">${unsettledCount > 0 ? unsettledCount + ' pending' : 'All settled'} · ${count} total</span>
                        </div>
                    </div>
                    <div class="vasooli-person-right">
                        <span class="vasooli-person-amount ${allSettled ? 'all-settled' : ''}">${allSettled ? '✅' : formatCurrency(unsettled)}</span>
                        <span class="vasooli-person-chevron">▼</span>
                    </div>
                </div>
                <div class="vasooli-entries">${entriesHTML}</div>
            </div>
        `;
    }).join('');

    // Update person autocomplete suggestions
    updatePersonSuggestions();
}

function updatePersonSuggestions() {
    // Keep the native datalist in sync (hidden, used as fallback)
    const uniqueNames = [...new Set(state.vasooli.map(v => v.person.trim()))].sort();
    if (DOM.personSuggestions) {
        DOM.personSuggestions.innerHTML = uniqueNames.map(n => `<option value="${n}">`).join('');
    }

    // Build / refresh the custom rich dropdown
    let dropdown = document.getElementById('person-autocomplete-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'person-autocomplete-dropdown';
        dropdown.className = 'person-autocomplete-dropdown';
        dropdown.setAttribute('role', 'listbox');
        // Insert after the input's parent form-group
        DOM.lendPersonInput?.parentElement?.style && (DOM.lendPersonInput.parentElement.style.position = 'relative');
        DOM.lendPersonInput?.insertAdjacentElement('afterend', dropdown);
    }

    // Store names on dropdown for filtering
    dropdown._allNames = uniqueNames;

    function showDropdown(filter) {
        const filtered = filter
            ? uniqueNames.filter(n => n.toLowerCase().includes(filter.toLowerCase()))
            : uniqueNames;
        if (filtered.length === 0) { dropdown.style.display = 'none'; return; }
        dropdown.innerHTML = filtered.map(name => {
            const initial = name.charAt(0).toUpperCase();
            return `
                <div class="pac-item" role="option" data-name="${name}">
                    <div class="pac-avatar">${initial}</div>
                    <div class="pac-info">
                        <span class="pac-name">${name}</span>
                        <span class="pac-sub">${state.vasooli.filter(v => v.person.trim() === name && !v.settled).reduce((s, v) => s + v.amount, 0) > 0
                            ? '₹' + state.vasooli.filter(v => v.person.trim() === name && !v.settled).reduce((s, v) => s + v.amount, 0).toLocaleString('en-IN') + ' pending'
                            : 'All settled'}</span>
                    </div>
                </div>`;
        }).join('');
        dropdown.style.display = 'block';
    }

    // Attach events once (guard with a flag)
    if (!DOM.lendPersonInput?._autocompleteReady) {
        DOM.lendPersonInput._autocompleteReady = true;

        DOM.lendPersonInput.addEventListener('focus', () => {
            if (dropdown._allNames?.length) showDropdown(DOM.lendPersonInput.value.trim());
        });
        DOM.lendPersonInput.addEventListener('input', () => {
            showDropdown(DOM.lendPersonInput.value.trim());
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#lend-individual-person') && !e.target.closest('#person-autocomplete-dropdown')) {
                dropdown.style.display = 'none';
            }
        });
        dropdown.addEventListener('mousedown', (e) => {
            const item = e.target.closest('.pac-item');
            if (!item) return;
            e.preventDefault();
            DOM.lendPersonInput.value = item.dataset.name;
            dropdown.style.display = 'none';
            DOM.lendPersonInput.dispatchEvent(new Event('input'));
        });
    }

    // Reset visibility
    dropdown.style.display = 'none';
}

// ── Split state ──
let lendMode = 'individual'; // 'individual' or 'split'
let splitPeople = [];        // names of people to split with

function setLendMode(mode) {
    lendMode = mode;
    // Toggle active button
    DOM.lendModeToggle?.querySelectorAll('.lend-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    // Move indicator
    const indicator = DOM.lendModeToggle?.querySelector('.lend-mode-indicator');
    if (indicator) indicator.style.transform = mode === 'split' ? 'translateX(100%)' : 'translateX(0)';

    const isSplit = mode === 'split';

    // Show/hide sections
    if (DOM.lendIndividualPerson) DOM.lendIndividualPerson.style.display = isSplit ? 'none' : '';
    if (DOM.splitPeopleSection)   DOM.splitPeopleSection.style.display   = isSplit ? '' : 'none';
    if (DOM.lendAmountLabel)      DOM.lendAmountLabel.textContent        = isSplit ? 'Total Bill Amount' : 'Amount';
    if (DOM.lendModalSave)        DOM.lendModalSave.textContent          = isSplit ? 'Split & Lend' : 'Lend';
    if (DOM.lendModalTitle)       DOM.lendModalTitle.textContent         = isSplit ? 'Split Bill' : 'Lend Money';

    updateSplitPreview();
}

function addSplitPerson(name) {
    name = name.trim();
    if (!name) return;
    if (splitPeople.some(n => n.toLowerCase() === name.toLowerCase())) {
        showToast(`${name} is already added`, '⚠️');
        return;
    }
    splitPeople.push(name);
    renderSplitChips();
    updateSplitPreview();
    if (DOM.splitPersonInput) { DOM.splitPersonInput.value = ''; DOM.splitPersonInput.focus(); }
}

function removeSplitPerson(name) {
    splitPeople = splitPeople.filter(n => n !== name);
    renderSplitChips();
    updateSplitPreview();
}

function renderSplitChips() {
    if (!DOM.splitChips) return;
    DOM.splitChips.innerHTML = splitPeople.map(name => `
        <span class="split-chip">
            ${name}
            <button class="split-chip-remove" data-name="${name}" aria-label="Remove">×</button>
        </span>
    `).join('');
}

function updateSplitPreview() {
    if (!DOM.splitPreview) return;
    const amount = parseFloat(DOM.lendAmountInput?.value) || 0;
    if (lendMode !== 'split' || splitPeople.length === 0 || amount <= 0) {
        DOM.splitPreview.style.display = 'none';
        return;
    }

    const includeSelf = DOM.splitIncludeSelf?.checked ?? true;
    const totalHeads = splitPeople.length + (includeSelf ? 1 : 0);
    const perPerson = Math.round(amount / totalHeads);

    DOM.splitPreview.style.display = '';
    DOM.splitPreviewHeader.innerHTML = `<strong>Split: ${totalHeads} people → ₹${perPerson.toLocaleString('en-IN')} each</strong>`;
    DOM.splitPreviewList.innerHTML = splitPeople.map(name =>
        `<div class="split-preview-item"><span>${name}</span><span>₹${perPerson.toLocaleString('en-IN')}</span></div>`
    ).join('') + (includeSelf
        ? `<div class="split-preview-item split-self"><span>You (already paid ✓)</span><span>₹${perPerson.toLocaleString('en-IN')}</span></div>`
        : '');
}

function openLendModal() {
    // Reset form
    DOM.lendPersonInput.value = '';
    DOM.lendAmountInput.value = '';
    DOM.lendNoteInput.value = '';
    DOM.lendDateInput.value = getLastDate();
    splitPeople = [];
    renderSplitChips();
    setLendMode('individual');
    if (DOM.splitIncludeSelf) DOM.splitIncludeSelf.checked = true;
    updatePersonSuggestions();
    DOM.lendModalOverlay.classList.add('active');
    setTimeout(() => DOM.lendPersonInput.focus(), 350);
}

function closeLendModal() {
    DOM.lendModalOverlay.classList.remove('active');
}

function addVasooliEntry() {
    const amount = parseFloat(DOM.lendAmountInput.value);
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', '⚠️');
        DOM.lendAmountInput.focus();
        return;
    }

    const note = DOM.lendNoteInput.value.trim();
    const date = DOM.lendDateInput.value || new Date().toISOString().split('T')[0];

    if (lendMode === 'split') {
        // ── Split Mode ──
        if (splitPeople.length === 0) {
            showToast('Add at least one person to split with', '⚠️');
            DOM.splitPersonInput?.focus();
            return;
        }
        const includeSelf = DOM.splitIncludeSelf?.checked ?? true;
        const totalHeads = splitPeople.length + (includeSelf ? 1 : 0);
        const perPerson = Math.round(amount / totalHeads);
        const splitNote = note ? `[Split] ${note}` : '[Split]';

        splitPeople.forEach(person => {
            state.vasooli.unshift({
                id: generateId(),
                person,
                amount: perPerson,
                note: splitNote,
                date,
                settled: false,
                createdAt: Date.now(),
            });
        });

        saveData();
        closeLendModal();
        renderAll();
        showToast(`₹${amount.toLocaleString('en-IN')} split between ${totalHeads} people`, '✂️');

    } else {
        // ── Individual Mode (original behavior) ──
        const person = DOM.lendPersonInput.value.trim();
        if (!person) {
            showToast('Enter the person name', '⚠️');
            DOM.lendPersonInput.focus();
            return;
        }

        state.vasooli.unshift({
            id: generateId(),
            person,
            amount,
            note,
            date,
            settled: false,
            createdAt: Date.now(),
        });

        saveData();
        closeLendModal();
        renderAll();
        showToast(`₹${amount.toLocaleString('en-IN')} lent to ${person}`, '💸');
    }
}

function settleVasooli(id) {
    const entry = state.vasooli.find(v => v.id === id);
    if (!entry || entry.settled) return;
    entry.settled = true;
    saveData();
    renderAll();
    showToast(`₹${entry.amount.toLocaleString('en-IN')} recovered from ${entry.person}`, '✅');
}

function deleteVasooli(id) {
    const entryEl = DOM.vasooliPersons?.querySelector(`[data-vasooli-id="${id}"]`);
    if (entryEl) {
        // Animate out first, then remove from state
        entryEl.classList.add('vasooli-entry-exit');
        setTimeout(() => {
            state.vasooli = state.vasooli.filter(v => v.id !== id);
            saveData();
            renderAll();
            showToast('Entry deleted', '🗑️');
        }, 320);
    } else {
        state.vasooli = state.vasooli.filter(v => v.id !== id);
        saveData();
        renderAll();
        showToast('Entry deleted', '🗑️');
    }
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
    // Remember date when user changes it in the Add modal
    DOM.dateInput.addEventListener('change', (e) => saveLastDate(e.target.value));
    // Remember date when user changes it in the Lend modal
    DOM.lendDateInput?.addEventListener('change', (e) => saveLastDate(e.target.value));
    // Navigation — Sidebar
    $$('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Navigation — Mobile
    $$('.mobile-nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Analytics month picker
    document.getElementById('analytics-prev-month')?.addEventListener('click', () => changeAnalyticsMonth(-1));
    document.getElementById('analytics-next-month')?.addEventListener('click', () => changeAnalyticsMonth(1));

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
            if (DOM.lendModalOverlay.classList.contains('active')) closeLendModal();
        }
    });

    // Theme changes — re-render charts
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        renderSpendingChart();
        if (state.currentView === 'analytics') renderAnalytics();
    });

    // ======================== VASOOLI EVENTS ========================
    // Lend Money button
    DOM.lendMoneyBtn?.addEventListener('click', openLendModal);

    // Lend Modal controls
    DOM.lendModalClose?.addEventListener('click', closeLendModal);
    DOM.lendModalCancel?.addEventListener('click', closeLendModal);
    DOM.lendModalSave?.addEventListener('click', addVasooliEntry);
    DOM.lendModalOverlay?.addEventListener('click', (e) => {
        if (e.target === DOM.lendModalOverlay) closeLendModal();
    });

    // ── Split Bill controls ──
    // Mode toggle
    DOM.lendModeToggle?.querySelectorAll('.lend-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setLendMode(btn.dataset.mode));
    });

    // Add person button
    DOM.splitAddPerson?.addEventListener('click', () => {
        addSplitPerson(DOM.splitPersonInput?.value || '');
    });

    // Enter key on person input
    DOM.splitPersonInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSplitPerson(DOM.splitPersonInput.value);
        }
    });

    // Remove chip (event delegation)
    DOM.splitChips?.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.split-chip-remove');
        if (removeBtn) removeSplitPerson(removeBtn.dataset.name);
    });

    // Live preview updates when amount changes
    DOM.lendAmountInput?.addEventListener('input', updateSplitPreview);

    // Include self checkbox
    DOM.splitIncludeSelf?.addEventListener('change', updateSplitPreview);

    // Settle buttons + Person card expand (event delegation)
    DOM.vasooliPersons?.addEventListener('click', (e) => {
        // Settle button
        const settleBtn = e.target.closest('.vasooli-settle-btn');
        if (settleBtn) {
            settleVasooli(settleBtn.dataset.settleId);
            return;
        }

        // Delete button
        const deleteBtn = e.target.closest('.vasooli-delete-btn');
        if (deleteBtn) {
            deleteVasooli(deleteBtn.dataset.deleteId);
            return;
        }

        // Person header → expand/collapse
        const header = e.target.closest('.vasooli-person-header');
        if (header) {
            const card = header.closest('.vasooli-person-card');
            card.classList.toggle('expanded');
        }
    });
}

// ======================== DEMO SEED DATA ========================
function seedDemoData() {
    const T = (id, type, amount, category, date, note) => ({
        id, type, amount, category, date, note: note || '', createdAt: new Date(date).getTime()
    });

    state.transactions = [
        // ── JANUARY 2026 ────────────────────────────────────────
        T('t01', 'income',  45000, 'salary',        '2026-01-01', 'January Salary'),
        T('t02', 'expense', 15000, 'rent',           '2026-01-02', 'January Rent'),
        T('t03', 'expense',  3200, 'groceries',      '2026-01-05', 'BigBazaar'),
        T('t04', 'expense',  1800, 'transport',      '2026-01-07', 'Ola / Petrol'),
        T('t05', 'expense',   650, 'food',           '2026-01-09', 'Dinner with friends'),
        T('t06', 'expense',   199, 'subscriptions',  '2026-01-10', 'Netflix'),
        T('t07', 'expense',   149, 'subscriptions',  '2026-01-10', 'Spotify'),
        T('t08', 'expense',  2400, 'shopping',       '2026-01-12', 'Clothes — Myntra'),
        T('t09', 'income',   8000, 'freelance',      '2026-01-15', 'Logo design project'),
        T('t10', 'expense',   800, 'health',         '2026-01-16', 'Pharmacy'),
        T('t11', 'expense',  1200, 'food',           '2026-01-18', 'Zomato orders'),
        T('t12', 'expense',   500, 'entertainment',  '2026-01-20', 'Movie — PVR'),
        T('t13', 'expense',  3000, 'utilities',      '2026-01-22', 'Electricity & Water bill'),
        T('t14', 'expense',   350, 'smoking',        '2026-01-24', 'Cigarettes'),
        T('t15', 'expense',  5000, 'savings',        '2026-01-28', 'SIP — Mutual Fund'),
        T('t16', 'expense',   900, 'food',           '2026-01-30', 'Swiggy'),

        // ── FEBRUARY 2026 ───────────────────────────────────────
        T('t17', 'income',  45000, 'salary',         '2026-02-01', 'February Salary'),
        T('t18', 'expense', 15000, 'rent',            '2026-02-02', 'February Rent'),
        T('t19', 'expense',  2800, 'groceries',       '2026-02-04', 'Reliance Fresh'),
        T('t20', 'expense',  1500, 'transport',       '2026-02-06', 'Metro Card Recharge'),
        T('t21', 'expense',   480, 'food',            '2026-02-08', 'Chai & Snacks'),
        T('t22', 'expense',   199, 'subscriptions',   '2026-02-10', 'Netflix'),
        T('t23', 'income',  12000, 'freelance',       '2026-02-12', 'Website development'),
        T('t24', 'expense',  4500, 'shopping',        '2026-02-14', "Valentine's Day gifts"),
        T('t25', 'expense',  1800, 'health',          '2026-02-15', 'Doctor visit'),
        T('t26', 'expense',  2200, 'food',            '2026-02-17', 'Groceries + dining out'),
        T('t27', 'expense',   800, 'entertainment',   '2026-02-20', 'Amazon Prime'),
        T('t28', 'expense',  2500, 'utilities',       '2026-02-22', 'Phone bill + Internet'),
        T('t29', 'expense',   350, 'smoking',         '2026-02-24', 'Cigarettes'),
        T('t30', 'expense',  5000, 'savings',         '2026-02-28', 'SIP — Mutual Fund'),
        T('t31', 'income',   2500, 'refund',          '2026-02-26', 'Amazon return refund'),
        T('t32', 'expense',  6000, 'education',       '2026-02-27', 'Online course — Udemy'),

        // ── MARCH 2026 ──────────────────────────────────────────
        T('t33', 'income',  45000, 'salary',          '2026-03-01', 'March Salary'),
        T('t34', 'expense', 15000, 'rent',             '2026-03-02', 'March Rent'),
        T('t35', 'expense',  3500, 'groceries',        '2026-03-04', 'D-Mart'),
        T('t36', 'expense',  1600, 'transport',        '2026-03-06', 'Cab & Petrol'),
        T('t37', 'expense',   800, 'food',             '2026-03-08', 'Birthday dinner'),
        T('t38', 'expense',   199, 'subscriptions',    '2026-03-10', 'Netflix'),
        T('t39', 'expense',   149, 'subscriptions',    '2026-03-10', 'Spotify'),
        T('t40', 'income',   5000, 'gifts',            '2026-03-12', 'Gift from parents'),
        T('t41', 'expense',  3800, 'shopping',         '2026-03-14', 'Flipkart sale haul'),
        T('t42', 'expense',   600, 'health',           '2026-03-16', 'Gym supplement'),
        T('t43', 'expense',  1900, 'food',             '2026-03-17', 'Zomato + Swiggy'),
        T('t44', 'expense',  1200, 'entertainment',    '2026-03-19', 'Concert tickets'),
        T('t45', 'expense',  2800, 'utilities',        '2026-03-21', 'Electricity + Gas'),
        T('t46', 'expense',   700, 'smoking',          '2026-03-22', 'Cigarettes'),
        T('t47', 'expense',  5000, 'savings',          '2026-03-23', 'SIP — Mutual Fund'),
        T('t48', 'expense',  1100, 'food',             '2026-03-24', 'Team lunch'),
    ];

    state.vasooli = [
        {
            id: 'v01', person: 'Rahul', amount: 3000,
            note: 'Emergency hospital bill', date: '2026-01-08',
            settled: true, createdAt: new Date('2026-01-08').getTime()
        },
        {
            id: 'v02', person: 'Priya', amount: 1500,
            note: 'Shared vacation expenses', date: '2026-01-20',
            settled: false, createdAt: new Date('2026-01-20').getTime()
        },
        {
            id: 'v03', person: 'Rahul', amount: 800,
            note: 'Lunch tab — office party', date: '2026-02-14',
            settled: false, createdAt: new Date('2026-02-14').getTime()
        },
        {
            id: 'v04', person: 'Arjun', amount: 5000,
            note: 'Bike repair loan', date: '2026-02-22',
            settled: true, createdAt: new Date('2026-02-22').getTime()
        },
        {
            id: 'v05', person: 'Priya', amount: 2000,
            note: 'Shopping trip contribution', date: '2026-03-10',
            settled: false, createdAt: new Date('2026-03-10').getTime()
        },
        {
            id: 'v06', person: 'Karthik', amount: 4500,
            note: 'College trip advance', date: '2026-03-18',
            settled: false, createdAt: new Date('2026-03-18').getTime()
        },
    ];

    saveToLocalStorage();
    
    // Mark this session data specifically as demo data
    localStorage.setItem(STORAGE_KEY + '_is_demo', 'true');
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
        DOM.loginOverlay.style.pointerEvents = 'none';
        DOM.loginOverlay.classList.add('hidden');
        hideSplash();
    });
    DOM.signoutBtn.addEventListener('click', signOut);
    DOM.signinSmallBtn.addEventListener('click', signInWithGoogle);

    if (hasFirebase) {
        // Catch any redirect errors
        firebase.auth().getRedirectResult().catch(e => {
            console.error('Redirect result error:', e);
        });
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(onAuthStateChanged);
    } else {
        // No Firebase — hide login overlay, use localStorage
        DOM.loginOverlay.classList.add('hidden');
        DOM.guestSection.style.display = 'none';
        hideSplash();
    }

    // Add ambient mouse tracking for glow effect
    document.addEventListener('mousemove', (e) => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
        if (!document.body.classList.contains('mouse-moving')) {
            document.body.classList.add('mouse-moving');
        }
    });
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('mouse-moving');
    });
}

// ======================== SIDEBAR CALCULATOR ========================
function initCalculator() {
    const calcDisplay = document.getElementById('calc-display');
    const calcExpression = document.getElementById('calc-expression');
    const calcGrid = document.querySelector('.calc-grid');
    if (!calcDisplay || !calcGrid) return; // not present (mobile)

    let currentInput = '0';
    let expression = '';
    let operator = null;
    let previousValue = null;
    let shouldResetInput = false;

    function updateDisplay() {
        // Auto-shrink font for long numbers
        const len = currentInput.length;
        if (len > 12) calcDisplay.style.fontSize = '14px';
        else if (len > 9) calcDisplay.style.fontSize = '17px';
        else calcDisplay.style.fontSize = '22px';
        calcDisplay.textContent = currentInput;
        calcExpression.textContent = expression;
    }

    function formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) return 'Error';
        // Limit decimals
        const str = parseFloat(num.toFixed(10)).toString();
        return str.length > 15 ? parseFloat(num).toExponential(4) : str;
    }

    function calculate(a, op, b) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b !== 0 ? a / b : NaN;
            default: return b;
        }
    }

    const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

    calcGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.calc-btn');
        if (!btn) return;
        const val = btn.dataset.calc;

        // Number keys
        if (/^[0-9]$/.test(val)) {
            if (shouldResetInput || currentInput === '0') {
                currentInput = val;
                shouldResetInput = false;
            } else {
                if (currentInput.length >= 15) return;
                currentInput += val;
            }
            updateDisplay();
            return;
        }

        // Decimal
        if (val === '.') {
            if (shouldResetInput) { currentInput = '0.'; shouldResetInput = false; }
            else if (!currentInput.includes('.')) currentInput += '.';
            updateDisplay();
            return;
        }

        // Clear
        if (val === 'clear') {
            currentInput = '0';
            expression = '';
            operator = null;
            previousValue = null;
            shouldResetInput = false;
            updateDisplay();
            return;
        }

        // Backspace
        if (val === 'backspace') {
            if (shouldResetInput) return;
            currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
            updateDisplay();
            return;
        }

        // Percent
        if (val === 'percent') {
            const num = parseFloat(currentInput);
            if (!isNaN(num)) {
                currentInput = formatNumber(num / 100);
                updateDisplay();
            }
            return;
        }

        // Operators
        if (['+', '-', '*', '/'].includes(val)) {
            const current = parseFloat(currentInput);
            if (previousValue !== null && operator && !shouldResetInput) {
                const result = calculate(previousValue, operator, current);
                previousValue = result;
                currentInput = formatNumber(result);
            } else {
                previousValue = current;
            }
            operator = val;
            expression = formatNumber(previousValue) + ' ' + (opSymbols[val] || val);
            shouldResetInput = true;
            updateDisplay();
            return;
        }

        // Equals
        if (val === '=') {
            if (operator && previousValue !== null) {
                const current = parseFloat(currentInput);
                const result = calculate(previousValue, operator, current);
                expression = formatNumber(previousValue) + ' ' + (opSymbols[operator] || operator) + ' ' + formatNumber(current) + ' =';
                currentInput = formatNumber(result);
                previousValue = null;
                operator = null;
                shouldResetInput = true;
                updateDisplay();
            }
            return;
        }
    });

    // Keyboard support when sidebar calc is visible
    document.addEventListener('keydown', (e) => {
        if (!calcDisplay.offsetParent) return; // hidden
        // Only capture if not inside an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key;
        if (/^[0-9.]$/.test(key)) {
            const btn = calcGrid.querySelector(`[data-calc="${key}"]`);
            if (btn) btn.click();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            const btn = calcGrid.querySelector(`[data-calc="${key}"]`);
            if (btn) btn.click();
        } else if (key === 'Enter' || key === '=') {
            const btn = calcGrid.querySelector('[data-calc="="]');
            if (btn) btn.click();
        } else if (key === 'Backspace') {
            const btn = calcGrid.querySelector('[data-calc="backspace"]');
            if (btn) btn.click();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            const btn = calcGrid.querySelector('[data-calc="clear"]');
            if (btn) btn.click();
        } else if (key === '%') {
            const btn = calcGrid.querySelector('[data-calc="percent"]');
            if (btn) btn.click();
        }
    });

    updateDisplay();
}

// ======================== HABITFORGE INTEGRATION BRIDGE ========================
const BRIDGE_CATEGORIES = ['smoking', 'alcohol'];

function notifyHabitForgeBridge(txn) {
    if (!txn || txn.type !== 'expense') return;
    if (!BRIDGE_CATEGORIES.includes(txn.category)) return;
    try {
        const bridgeEvent = {
            source: 'budgetflow',
            event: 'transaction_added',
            timestamp: Date.now(),
            data: {
                category: txn.category,
                amount: txn.amount,
                date: txn.date,
                note: txn.note || '',
            }
        };
        localStorage.setItem('antigravity_bridge', JSON.stringify(bridgeEvent));
    } catch (e) {
        console.warn('Bridge write error:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initCalculator();
});
