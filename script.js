/**
 * Flashcard Study App
 * Based on Figma design specifications
 */

// ============================================
// AI API Service
// ============================================
const API_BASE = '/api';

const aiService = {
    /**
     * Check if the API is available and has an API key configured
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE}/health`);
            return await response.json();
        } catch (error) {
            console.error('API health check failed:', error);
            return { status: 'error', hasApiKey: false };
        }
    },

    /**
     * Send a chat message to GPT
     */
    async chat(messages, model = 'gpt-4o-mini') {
        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, model })
            });
            return await response.json();
        } catch (error) {
            console.error('Chat API error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Generate flashcards from text content
     */
    async generateFlashcards(text, count = 10) {
        try {
            const response = await fetch(`${API_BASE}/generate-flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, count })
            });
            return await response.json();
        } catch (error) {
            console.error('Generate flashcards error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get an explanation for a flashcard concept
     */
    async explain(term, definition, question = null) {
        try {
            const response = await fetch(`${API_BASE}/explain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ term, definition, question })
            });
            return await response.json();
        } catch (error) {
            console.error('Explain API error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Generate a quiz question for a flashcard
     */
    async generateQuiz(term, definition) {
        try {
            const response = await fetch(`${API_BASE}/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ term, definition })
            });
            return await response.json();
        } catch (error) {
            console.error('Quiz API error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Group flashcards into logical categories using AI
     */
    async groupFlashcards(flashcards) {
        console.log('🤖 Calling AI to group', flashcards.length, 'flashcards...');
        try {
            const response = await fetch(`${API_BASE}/group-flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flashcards })
            });
            const result = await response.json();
            console.log('🤖 Group flashcards API response:', result);
            return result;
        } catch (error) {
            console.error('❌ Group flashcards error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Generate a description for a flashcard set
     */
    async generateDescription(title, flashcards) {
        try {
            const response = await fetch(`${API_BASE}/generate-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, flashcards })
            });
            return await response.json();
        } catch (error) {
            console.error('Generate description error:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// Flashcard Data
// ============================================
const flashcards = [
    {
        term: "Isomers",
        definition: "Two compounds with the same chemical formula but different structures"
    },
    {
        term: "Covalent Bond",
        definition: "A bond formed by the sharing of electrons between atoms"
    },
    {
        term: "Polar Covalent Bond",
        definition: "When electrons are shared unequally between two atoms"
    },
    {
        term: "Nonpolar Covalent Bond",
        definition: "When electrons are shared equally between two atoms"
    },
    {
        term: "Hydroxyl Group",
        definition: "The functional group -OH, found in alcohols"
    },
    {
        term: "Carboxyl Group",
        definition: "The functional group -COOH, found in organic acids"
    },
    {
        term: "Amino Group",
        definition: "The functional group -NH₂, found in amino acids"
    },
    {
        term: "Sulfhydryl Group",
        definition: "The functional group -SH, found in some amino acids"
    },
    {
        term: "Phosphate Group",
        definition: "The functional group -PO₄, important in ATP and DNA"
    },
    {
        term: "Carbonyl Group",
        definition: "The functional group C=O, found in aldehydes and ketones"
    },
    {
        term: "Electronegativity",
        definition: "The measure of an atom's ability to attract electrons in a bond"
    },
    {
        term: "Amphipathic",
        definition: "A molecule that has both hydrophilic and hydrophobic regions"
    },
    {
        term: "Hydrophilic",
        definition: "Molecules that dissolve readily in water (water-loving)"
    },
    {
        term: "Hydrophobic",
        definition: "Molecules that do not dissolve in water (water-fearing)"
    },
    {
        term: "Hydrogen Bond",
        definition: "A weak bond between a hydrogen atom and an electronegative atom"
    },
    {
        term: "Van der Waals Forces",
        definition: "Weak attractions between nonpolar molecules"
    },
    {
        term: "Ionic Bond",
        definition: "A bond formed by the transfer of electrons between atoms"
    },
    {
        term: "Enantiomers",
        definition: "Isomers that are mirror images of each other"
    },
    {
        term: "Geometric Isomers",
        definition: "Isomers that differ in the arrangement of atoms around a double bond (cis-trans)"
    },
    {
        term: "Structural Isomers",
        definition: "Isomers that differ in the covalent arrangement of atoms"
    },
    {
        term: "Dipole",
        definition: "The partial negative or positive charge on atoms in a polar molecule"
    },
    {
        term: "Hydrogen Bonding in Water",
        definition: "The unique properties of water result from its polar nature and hydrogen bonding"
    }
];

// ============================================
// Application State
// ============================================
const state = {
    currentIndex: 0,
    isFlipped: false,
    starredCards: new Set(),
    showingTerm: true, // true = showing term (front), false = showing definition (back)
    hasEngagedWithStudy: false // Track if user has engaged with study experience
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    flashcard: document.getElementById('flashcard'),
    cardFront: document.getElementById('card-front'),
    cardBack: document.getElementById('card-back'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    starBtn: document.getElementById('star-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    // Import modal elements
    menuBtn: document.querySelector('.menu-btn'),
    importModalOverlay: document.getElementById('import-modal-overlay'),
    importCloseBtn: document.getElementById('import-close-btn'),
    importTitleInput: document.getElementById('import-title'),
    importTextarea: document.getElementById('import-textarea'),
    importSubmitBtn: document.getElementById('import-submit-btn'),
    variantSelector: document.getElementById('variant-selector'),
    // Page elements to update
    setTitle: document.querySelector('.set-title'),
    topicsContainer: document.querySelector('.topics-container')
};

// ============================================
// Core Functions
// ============================================

/**
 * Initialize the application
 */
function init() {
    loadDesignVariant();
    loadSavedContent();
    updateCard(false); // Don't auto-expand on initial load
    attachEventListeners();
    loadSavedState();
    initPanelResize();
    initTableListToolbar();
    initStudyModeScreen();
    initCreateSetScreen();
}

/**
 * Update the flashcard display
 * @param {boolean} autoExpand - Whether to auto-expand the TOC section (default: true)
 */
function updateCard(autoExpand = true) {
    const card = flashcards[state.currentIndex];
    
    // Update card content
    elements.cardFront.textContent = card.term;
    elements.cardBack.textContent = card.definition;
    
    // Update star button state
    updateStarButton();
    
    // Reset flip state
    if (state.isFlipped) {
        elements.flashcard.classList.remove('flipped');
        state.isFlipped = false;
    }
    
    // Trigger animation
    animateCardChange();
    
    // Sync sidebar highlight with current card
    updateActiveTocItem(autoExpand);
}

/**
 * Navigate to the previous card
 */
function prevCard() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
    } else {
        // Loop to end
        state.currentIndex = flashcards.length - 1;
    }
    updateCard();
}

/**
 * Navigate to the next card
 */
function nextCard() {
    if (state.currentIndex < flashcards.length - 1) {
        state.currentIndex++;
    } else {
        // Loop to beginning
        state.currentIndex = 0;
    }
    updateCard();
}

/**
 * Flip the flashcard
 */
function flipCard() {
    elements.flashcard.classList.toggle('flipped');
    state.isFlipped = !state.isFlipped;
}

/**
 * Toggle star/favorite on current card
 */
function toggleStar() {
    const index = state.currentIndex;
    
    if (state.starredCards.has(index)) {
        state.starredCards.delete(index);
    } else {
        state.starredCards.add(index);
    }
    
    updateStarButton();
    saveState();
}

/**
 * Update the star button visual state
 */
function updateStarButton() {
    const icon = elements.starBtn.querySelector('.material-symbols-rounded');
    if (state.starredCards.has(state.currentIndex)) {
        elements.starBtn.classList.add('starred');
        if (icon) icon.classList.add('filled');
    } else {
        elements.starBtn.classList.remove('starred');
        if (icon) icon.classList.remove('filled');
    }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    document.body.classList.toggle('fullscreen-mode');
    
    if (document.body.classList.contains('fullscreen-mode')) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

/**
 * Handle tab button clicks
 */
function handleTabClick(event) {
    const button = event.currentTarget;
    const tab = button.dataset.tab;
    
    // Update active state
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Handle tab-specific logic
    console.log(`Switched to ${tab} tab`);
    
    // You could implement different views here
    switch(tab) {
        case 'flashcards':
            // Default view
            break;
        case 'learn':
            // Learn mode
            break;
        case 'games':
            // Games mode
            break;
        case 'test':
            // Test mode
            break;
    }
}

/**
 * Animate card change
 */
function animateCardChange() {
    elements.flashcard.style.animation = 'none';
    elements.flashcard.offsetHeight; // Trigger reflow
    elements.flashcard.style.animation = 'fadeIn 0.4s ease';
}

// ============================================
// Keyboard Navigation
// ============================================

function handleKeydown(event) {
    // Don't capture keyboard shortcuts when typing in input fields or textareas
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' || 
                     activeElement.tagName === 'TEXTAREA' || 
                     activeElement.isContentEditable;
    
    if (isTyping) {
        return; // Let the input handle the keypress normally
    }
    
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            prevCard();
            break;
        case 'ArrowRight':
            event.preventDefault();
            nextCard();
            break;
        case ' ':
        case 'Enter':
            event.preventDefault();
            flipCard();
            break;
        case 's':
        case 'S':
            toggleStar();
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
        case 'Escape':
            if (document.body.classList.contains('fullscreen-mode')) {
                document.body.classList.remove('fullscreen-mode');
            }
            break;
    }
}

// ============================================
// Touch/Swipe Support
// ============================================

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            nextCard();
        } else {
            prevCard();
        }
    }
    // Vertical swipe (optional: could be used to flip)
    else if (Math.abs(diffY) > swipeThreshold) {
        flipCard();
    }
}

// ============================================
// State Persistence
// ============================================

function saveState() {
    const stateToSave = {
        starredCards: Array.from(state.starredCards),
        currentIndex: state.currentIndex,
        hasEngagedWithStudy: state.hasEngagedWithStudy
    };
    localStorage.setItem('flashcardState', JSON.stringify(stateToSave));
}

function loadSavedState() {
    const saved = localStorage.getItem('flashcardState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.starredCards = new Set(parsed.starredCards || []);
            state.hasEngagedWithStudy = parsed.hasEngagedWithStudy || false;
            // Optionally restore position
            // state.currentIndex = parsed.currentIndex || 0;
            updateStarButton();
        } catch (e) {
            console.error('Error loading saved state:', e);
        }
    }
    
    // Load viewed cards for progress display
    const savedViewed = localStorage.getItem('studyModeViewed');
    if (savedViewed) {
        studyModeState.viewedCards = new Set(JSON.parse(savedViewed));
    }
    
    // Update sidebar progress view based on engagement
    updateSidebarProgressView();
}

/**
 * Save imported content to localStorage
 */
function saveContent(title, cards, grouping, description) {
    const content = {
        title: title,
        flashcards: cards,
        grouping: grouping,
        description: description,
        savedAt: new Date().toISOString()
    };
    console.log('💾 Saving content to localStorage:', {
        title,
        cardCount: cards.length,
        hasGrouping: !!grouping,
        grouping: grouping
    });
    localStorage.setItem('flashcardContent', JSON.stringify(content));
}

/**
 * Load saved content from localStorage
 */
function loadSavedContent() {
    // Check for content version - clear old format cache
    const cacheVersion = localStorage.getItem('flashcardCacheVersion');
    if (cacheVersion !== '2') {
        localStorage.removeItem('flashcardContent');
        localStorage.removeItem('flashcardState');
        localStorage.setItem('flashcardCacheVersion', '2');
        console.log('Cleared old cache format');
        return;
    }
    
    const saved = localStorage.getItem('flashcardContent');
    console.log('📂 Loading saved content from localStorage...');
    
    if (saved) {
        try {
            const content = JSON.parse(saved);
            console.log('📂 Parsed content:', {
                title: content.title,
                cardCount: content.flashcards?.length,
                hasGrouping: !!content.grouping,
                groupCount: content.grouping?.groups?.length,
                groups: content.grouping?.groups?.map(g => g.title)
            });
            
            if (content.flashcards && content.flashcards.length > 0) {
                // Restore flashcards
                flashcards.length = 0;
                flashcards.push(...content.flashcards);
                
                // Restore title
                if (content.title) {
                    elements.setTitle.textContent = content.title;
                }
                
                // Restore description
                if (content.description) {
                    updateAboutDescription(content.description);
                }
                
                // Restore grouping or fallback to simple list
                if (content.grouping && content.grouping.groups && content.grouping.groups.length > 0) {
                    console.log('✅ Loading grouped topics list with', content.grouping.groups.length, 'groups');
                    updateGroupedTopicsList(content.flashcards, content.grouping.groups);
                } else {
                    console.log('⚠️ No grouping found, using simple topics list');
                    updateTopicsList(content.flashcards);
                }
                
                console.log(`Loaded ${content.flashcards.length} cached flashcards`);
                
                // Update 3-panel view if active
                if (document.body.classList.contains('option-b')) {
                    updatePanelTermsList();
                    updatePanelTitle();
                }
                
                // Update Journey view if active
                if (document.body.classList.contains('option-c')) {
                    updateJourneyView();
                }
            }
        } catch (e) {
            console.error('Error loading saved content:', e);
        }
    } else {
        console.log('📂 No saved content found in localStorage');
    }
}

// ============================================
// Event Listeners
// ============================================

function attachEventListeners() {
    // Navigation
    elements.prevBtn.addEventListener('click', prevCard);
    elements.nextBtn.addEventListener('click', nextCard);
    
    // Flashcard flip
    elements.flashcard.addEventListener('click', flipCard);
    
    // Star button
    elements.starBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleStar();
    });
    
    // Fullscreen
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Tab navigation
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });
    
    // Keyboard
    document.addEventListener('keydown', handleKeydown);
    
    // Touch/swipe
    elements.flashcard.addEventListener('touchstart', handleTouchStart, { passive: true });
    elements.flashcard.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Fullscreen change handler
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.body.classList.remove('fullscreen-mode');
        }
    });
    
    document.addEventListener('webkitfullscreenchange', () => {
        if (!document.webkitFullscreenElement) {
            document.body.classList.remove('fullscreen-mode');
        }
    });
    
    // Import modal event listeners
    elements.menuBtn.addEventListener('click', openImportModal);
    elements.importCloseBtn.addEventListener('click', closeImportModal);
    elements.importModalOverlay.addEventListener('click', (event) => {
        if (event.target === elements.importModalOverlay) {
            closeImportModal();
        }
    });
    elements.importSubmitBtn.addEventListener('click', importFlashcards);
    
    // Reset study progress button
    const resetProgressBtn = document.getElementById('debug-reset-progress-btn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', resetStudyProgress);
    }
    
    // Close import modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.importModalOverlay.classList.contains('active')) {
            closeImportModal();
        }
    });
    
    // Variant selector buttons
    elements.variantSelector?.querySelectorAll('.variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const variant = btn.dataset.variant;
            setDesignVariant(variant);
        });
    });
    
    // Sort and Filter buttons
    const sortBtn = document.getElementById('sort-btn');
    const filterBtn = document.getElementById('filter-btn');
    
    if (sortBtn) {
        sortBtn.addEventListener('click', () => toggleSortMenu(sortBtn));
    }
    
    if (filterBtn) {
        filterBtn.addEventListener('click', () => toggleFilterMenu(filterBtn));
    }
}

// ============================================
// Import Modal Functions
// ============================================

/**
 * Open the import modal
 */
function openImportModal() {
    elements.importModalOverlay.classList.add('active');
    document.body.classList.add('modal-open');
    elements.importTitleInput.value = '';
    elements.importTextarea.value = '';
    elements.importTitleInput.focus();
    updateVariantButtonStates();
}

// ============================================
// Design Variant Functions
// ============================================

const VARIANTS = ['option-a', 'option-b', 'option-c', 'option-d'];

/**
 * Set the design variant
 */
function setDesignVariant(variant) {
    // Remove all variant classes
    VARIANTS.forEach(v => document.body.classList.remove(v));
    
    // Add the selected variant class
    document.body.classList.add(variant);
    
    // Save to localStorage
    localStorage.setItem('designVariant', variant);
    
    // Update button states
    updateVariantButtonStates();
    
    // Update views based on variant
    if (variant === 'option-a') {
        // Refresh the sidebar topics list with groupings if available
        refreshTopicsList();
    }
    
    // If switching to 3-panel, populate the panel terms list and initialize features
    if (variant === 'option-b') {
        updatePanelTermsList();
        updatePanelTitle();
        initPanelStudyMode();
        initDiscoveryPanel();
    }
    
    // If switching to Journey, populate the journey view
    if (variant === 'option-c') {
        updateJourneyView();
    }
    
    // If switching to Table, initialize the table view
    if (variant === 'option-d') {
        initTableView();
    }
    
    console.log(`Design variant set to: ${variant}`);
}

/**
 * Refresh the sidebar topics list with groupings from localStorage
 */
function refreshTopicsList() {
    const saved = localStorage.getItem('flashcardContent');
    if (saved) {
        try {
            const content = JSON.parse(saved);
            if (content.grouping && content.grouping.groups && content.grouping.groups.length > 0) {
                console.log('🔄 Refreshing topics with', content.grouping.groups.length, 'groups');
                updateGroupedTopicsList(flashcards, content.grouping.groups);
            } else {
                console.log('🔄 Refreshing topics without groups');
                updateTopicsList(flashcards);
            }
        } catch (e) {
            console.error('Error refreshing topics:', e);
            updateTopicsList(flashcards);
        }
    } else {
        updateTopicsList(flashcards);
    }
}

/**
 * Update the 3-panel terms list
 */
function updatePanelTermsList() {
    const panelTermsList = document.getElementById('panel-terms-list');
    if (!panelTermsList) return;
    
    panelTermsList.innerHTML = '';
    
    flashcards.forEach((card, index) => {
        const row = document.createElement('div');
        row.className = 'panel-term-row';
        row.dataset.index = index;
        
        const audioBtn = document.createElement('button');
        audioBtn.className = 'panel-term-audio';
        audioBtn.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playTermAudio(card.term, card.definition, audioBtn);
        });
        
        const content = document.createElement('div');
        content.className = 'panel-term-content';
        
        const term = document.createElement('div');
        term.className = 'panel-term-term';
        term.textContent = card.term;
        
        const definition = document.createElement('div');
        definition.className = 'panel-term-definition';
        definition.textContent = card.definition;
        
        content.appendChild(term);
        content.appendChild(definition);
        
        const starBtn = document.createElement('button');
        starBtn.className = 'panel-term-star';
        if (state.starredCards.has(index)) {
            starBtn.classList.add('starred');
        }
        starBtn.innerHTML = `<span class="material-symbols-rounded ${state.starredCards.has(index) ? 'filled' : ''}">star</span>`;
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.starredCards.has(index)) {
                state.starredCards.delete(index);
                starBtn.classList.remove('starred');
                starBtn.innerHTML = '<span class="material-symbols-rounded">star</span>';
            } else {
                state.starredCards.add(index);
                starBtn.classList.add('starred');
                starBtn.innerHTML = '<span class="material-symbols-rounded filled">star</span>';
            }
            saveState();
        });
        row.appendChild(audioBtn);
        row.appendChild(content);
        row.appendChild(starBtn);
        
        panelTermsList.appendChild(row);
    });
    
    // Update term count
    const termCount = document.getElementById('panel-term-count');
    if (termCount) {
        termCount.innerHTML = `<span class="material-symbols-rounded">stacks</span> ${flashcards.length} terms`;
    }
}

/**
 * Update the 3-panel title
 */
function updatePanelTitle() {
    const panelTitle = document.getElementById('panel-set-title');
    if (panelTitle && elements.setTitle) {
        panelTitle.textContent = elements.setTitle.textContent;
    }
}

// ============================================
// 3-Panel Study Experience Functions
// ============================================

/**
 * Initialize 3-panel study mode handlers
 */
function initPanelStudyMode() {
    // Study action cards click handlers - now use new study mode screen
    document.querySelectorAll('.study-action-card[data-mode]').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            openStudyModeScreen(mode);
        });
    });
    
    // Study button in main panel - now use new study mode screen
    const studyBtn = document.getElementById('panel-study-btn');
    if (studyBtn) {
        studyBtn.addEventListener('click', () => openStudyModeScreen('flashcards'));
    }
    
    // Panel Sort and Filter buttons
    const panelSortBtn = document.getElementById('panel-sort-btn');
    const panelFilterBtn = document.getElementById('panel-filter-btn');
    
    if (panelSortBtn) {
        panelSortBtn.addEventListener('click', () => togglePanelSortMenu(panelSortBtn));
    }
    
    if (panelFilterBtn) {
        panelFilterBtn.addEventListener('click', () => togglePanelFilterMenu(panelFilterBtn));
    }
}

/**
 * Toggle sort dropdown menu for panel
 */
function togglePanelSortMenu(btn) {
    removeDropdownMenus();
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        const sortOptions = [
            { id: 'original', label: 'Original order', icon: 'format_list_numbered' },
            { id: 'alphabetical', label: 'A → Z', icon: 'sort_by_alpha' },
            { id: 'alphabetical-reverse', label: 'Z → A', icon: 'sort_by_alpha' }
        ];
        
        const menu = createDropdownMenu(sortOptions, sortFilterState.sortBy, (option) => {
            sortFilterState.sortBy = option;
            applyPanelSortFilter();
            btn.classList.remove('active');
            removeDropdownMenus();
        });
        
        positionDropdown(menu, btn);
        document.body.appendChild(menu);
    }
}

/**
 * Toggle filter dropdown menu for panel
 */
function togglePanelFilterMenu(btn) {
    removeDropdownMenus();
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        const menu = createDropdownMenu([
            { id: 'all', label: 'All terms', icon: 'list' },
            { id: 'starred', label: 'Starred only', icon: 'star' },
            { id: 'unstarred', label: 'Not starred', icon: 'star_outline' }
        ], sortFilterState.filterBy, (option) => {
            sortFilterState.filterBy = option;
            applyPanelSortFilter();
            btn.classList.remove('active');
            removeDropdownMenus();
        });
        
        positionDropdown(menu, btn);
        document.body.appendChild(menu);
    }
}

/**
 * Apply sort and filter to the panel terms list
 */
function applyPanelSortFilter() {
    let cards = [...flashcards];
    let filteredIndices = cards.map((_, i) => i);
    
    // Apply filter
    if (sortFilterState.filterBy === 'starred') {
        filteredIndices = filteredIndices.filter(i => state.starredCards.has(i));
    } else if (sortFilterState.filterBy === 'unstarred') {
        filteredIndices = filteredIndices.filter(i => !state.starredCards.has(i));
    }
    
    // Apply sort
    if (sortFilterState.sortBy === 'alphabetical') {
        filteredIndices.sort((a, b) => cards[a].term.localeCompare(cards[b].term));
    } else if (sortFilterState.sortBy === 'alphabetical-reverse') {
        filteredIndices.sort((a, b) => cards[b].term.localeCompare(cards[a].term));
    }
    // 'original' sort keeps default order
    
    // Update the panel terms list
    updateFilteredPanelTermsList(cards, filteredIndices);
}

/**
 * Update panel terms list with filtered/sorted cards
 */
function updateFilteredPanelTermsList(cards, indices) {
    const container = document.getElementById('panel-terms-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (indices.length === 0) {
        container.innerHTML = `
            <div class="panel-empty-state">
                <span class="material-symbols-rounded">filter_list_off</span>
                <p>No terms match your filter</p>
            </div>
        `;
        return;
    }
    
    indices.forEach(index => {
        const card = cards[index];
        const row = document.createElement('div');
        row.className = 'panel-term-row';
        row.dataset.index = index;
        
        const audioBtn = document.createElement('button');
        audioBtn.className = 'panel-term-audio';
        audioBtn.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playTermAudio(card.term, card.definition);
        });
        
        const content = document.createElement('div');
        content.className = 'panel-term-content';
        content.innerHTML = `
            <span class="panel-term-word">${card.term}</span>
            <span class="panel-term-def">${card.definition}</span>
        `;
        
        const starBtn = document.createElement('button');
        starBtn.className = 'panel-term-star';
        if (state.starredCards.has(index)) {
            starBtn.classList.add('starred');
        }
        starBtn.innerHTML = `<span class="material-symbols-rounded ${state.starredCards.has(index) ? 'filled' : ''}">star</span>`;
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.starredCards.has(index)) {
                state.starredCards.delete(index);
                starBtn.classList.remove('starred');
                starBtn.innerHTML = '<span class="material-symbols-rounded">star</span>';
            } else {
                state.starredCards.add(index);
                starBtn.classList.add('starred');
                starBtn.innerHTML = '<span class="material-symbols-rounded filled">star</span>';
            }
            saveState();
        });
        
        row.appendChild(audioBtn);
        row.appendChild(content);
        row.appendChild(starBtn);
        container.appendChild(row);
    });
}

/**
 * Create a panel term row element
 */
function createPanelTermRow(card, index) {
    const row = document.createElement('div');
    row.className = 'panel-term-row';
    row.dataset.index = index;
    
    const audioBtn = document.createElement('button');
    audioBtn.className = 'panel-term-audio';
    audioBtn.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
    audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTermAudio(card.term, card.definition);
    });
    
    const content = document.createElement('div');
    content.className = 'panel-term-content';
    content.innerHTML = `
        <span class="panel-term-word">${card.term}</span>
        <span class="panel-term-def">${card.definition}</span>
    `;
    
    const starBtn = document.createElement('button');
    starBtn.className = 'panel-term-star';
    if (state.starredCards.has(index)) {
        starBtn.classList.add('starred');
    }
    starBtn.innerHTML = `<span class="material-symbols-rounded ${state.starredCards.has(index) ? 'filled' : ''}">star</span>`;
    starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.starredCards.has(index)) {
            state.starredCards.delete(index);
            starBtn.classList.remove('starred');
            starBtn.innerHTML = '<span class="material-symbols-rounded">star</span>';
        } else {
            state.starredCards.add(index);
            starBtn.classList.add('starred');
            starBtn.innerHTML = '<span class="material-symbols-rounded filled">star</span>';
        }
        saveState();
    });
    
    row.appendChild(audioBtn);
    row.appendChild(content);
    row.appendChild(starBtn);
    
    return row;
}

// DEPRECATED: Old study panel functions removed - now using full-screen study mode

// ============================================
// 3-Panel Discovery Functions
// ============================================

/**
 * Initialize discovery panel with AI-generated related sets
 */
async function initDiscoveryPanel() {
    const refreshBtn = document.getElementById('discovery-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRelatedSets);
    }
    
    // Load related sets on init
    loadRelatedSets();
}

/**
 * Load related study sets from AI
 */
async function loadRelatedSets() {
    const discoveryList = document.getElementById('discovery-list');
    const refreshBtn = document.getElementById('discovery-refresh-btn');
    const tabsContainer = document.getElementById('discovery-tabs');
    
    if (!discoveryList) return;
    
    // Show loading state
    refreshBtn?.classList.add('loading');
    discoveryList.innerHTML = `
        <div class="discovery-loading">
            <div class="discovery-loading-spinner"></div>
            <span>Finding related sets...</span>
        </div>
    `;
    
    // Get current set info
    const currentTitle = elements.setTitle?.textContent || 'Study Set';
    const sampleTerms = flashcards.slice(0, 5).map(c => c.term).join(', ');
    
    try {
        const response = await aiService.chat([
            {
                role: 'system',
                content: `You generate realistic study set recommendations. Return ONLY a JSON object with this structure:
{
  "categories": ["Category1", "Category2", "Category3"],
  "sets": [
    {
      "title": "Set Title",
      "category": "Category1",
      "terms": 25,
      "author": "username123",
      "rating": 4.8,
      "studiers": 156,
      "isVerified": true
    }
  ]
}
Generate 6-8 related study sets based on the topic. Make them realistic with varied authors, ratings (4.0-5.0), and studier counts (10-500). Include 2-4 category tags.`
            },
            {
                role: 'user',
                content: `Generate related study sets for: "${currentTitle}". Sample terms: ${sampleTerms}`
            }
        ]);
        
        refreshBtn?.classList.remove('loading');
        
        if (response.success && response.message?.content) {
            let data;
            try {
                const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
                data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
                console.error('Failed to parse related sets:', e);
                data = null;
            }
            
            if (data && data.sets) {
                renderDiscoveryTabs(data.categories || ['All']);
                renderDiscoverySets(data.sets);
            } else {
                renderFallbackSets();
            }
        } else {
            renderFallbackSets();
        }
    } catch (error) {
        console.error('Error loading related sets:', error);
        refreshBtn?.classList.remove('loading');
        renderFallbackSets();
    }
}

/**
 * Render discovery category tabs
 */
function renderDiscoveryTabs(categories) {
    const tabsContainer = document.getElementById('discovery-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = `<button class="discovery-tab active" data-filter="all">All</button>`;
    
    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = 'discovery-tab';
        tab.dataset.filter = category.toLowerCase();
        tab.textContent = category;
        tab.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.discovery-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterDiscoverySets(category.toLowerCase());
        });
        tabsContainer.appendChild(tab);
    });
}

/**
 * Filter discovery sets by category
 */
function filterDiscoverySets(filter) {
    const cards = document.querySelectorAll('.discovery-card');
    cards.forEach(card => {
        if (filter === 'all' || card.dataset.category?.toLowerCase() === filter) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Render discovery sets
 */
function renderDiscoverySets(sets) {
    const discoveryList = document.getElementById('discovery-list');
    if (!discoveryList) return;
    
    discoveryList.innerHTML = '';
    
    const iconTypes = ['biology', 'chemistry', 'psychology', 'anatomy', 'default'];
    
    sets.forEach((set, index) => {
        const iconType = iconTypes[index % iconTypes.length];
        const card = document.createElement('div');
        card.className = 'discovery-card';
        card.dataset.category = set.category?.toLowerCase() || 'all';
        
        card.innerHTML = `
            <div class="discovery-card-header">
                <div class="discovery-icon ${iconType}">
                    <span class="material-symbols-rounded">style</span>
                </div>
                <div class="discovery-info">
                    <span class="discovery-card-title">${set.title}</span>
                    <span class="discovery-card-author">
                        <span class="material-symbols-rounded">person</span>
                        ${set.author}
                        ${set.isVerified ? '<span class="material-symbols-rounded" style="color: #3B82F6; font-size: 14px;">verified</span>' : ''}
                    </span>
                </div>
            </div>
            <div class="discovery-card-meta">
                <span class="discovery-meta-item">
                    <span class="material-symbols-rounded filled">star</span>
                    ${set.rating?.toFixed(1) || '4.5'}
                </span>
                <span class="discovery-meta-item">
                    <span class="material-symbols-rounded">stacks</span>
                    ${set.terms} terms
                </span>
                ${set.isVerified ? '<span class="discovery-meta-badge">Verified</span>' : ''}
            </div>
            <div class="discovery-card-footer">
                <span class="discovery-studiers">
                    <span class="material-symbols-rounded">group</span>
                    ${set.studiers} studying now
                </span>
                <button class="discovery-preview-btn">Preview</button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.discovery-preview-btn')) {
                document.querySelectorAll('.discovery-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            }
        });
        
        discoveryList.appendChild(card);
    });
}

/**
 * Render fallback sets if AI fails
 */
function renderFallbackSets() {
    const fallbackSets = [
        { title: 'Biology 101 - Cell Structure', category: 'Biology', terms: 45, author: 'biostudent', rating: 4.7, studiers: 234, isVerified: true },
        { title: 'Chemistry Fundamentals', category: 'Chemistry', terms: 62, author: 'chemwhiz', rating: 4.9, studiers: 189, isVerified: true },
        { title: 'Anatomy: Human Body Systems', category: 'Anatomy', terms: 78, author: 'medprep', rating: 4.6, studiers: 156, isVerified: false },
        { title: 'Organic Chemistry Reactions', category: 'Chemistry', terms: 35, author: 'ochem_master', rating: 4.8, studiers: 298, isVerified: true },
        { title: 'Microbiology Basics', category: 'Biology', terms: 52, author: 'microbio101', rating: 4.5, studiers: 87, isVerified: false },
        { title: 'Biochemistry Pathways', category: 'Biology', terms: 41, author: 'biochemstudent', rating: 4.4, studiers: 123, isVerified: false }
    ];
    
    renderDiscoveryTabs(['Biology', 'Chemistry', 'Anatomy']);
    renderDiscoverySets(fallbackSets);
}

/**
 * Update the Journey view (Option C)
 */
function updateJourneyView() {
    updateJourneyTitle();
    updateJourneyTermsList();
    updateJourneyMap();
}

/**
 * Update Journey title
 */
function updateJourneyTitle() {
    const journeyTitle = document.getElementById('journey-set-title');
    if (journeyTitle && elements.setTitle) {
        journeyTitle.textContent = elements.setTitle.textContent;
    }
}

/**
 * Update Journey terms list - flat list of all terms (no grouping)
 */
function updateJourneyTermsList() {
    const termsList = document.getElementById('journey-terms-list');
    if (!termsList) return;
    
    termsList.innerHTML = '';
    
    // Create a flat list of all terms
    flashcards.forEach((card, index) => {
            const row = document.createElement('div');
            row.className = 'journey-term-row';
        row.dataset.index = index;
        
        // Make row clickable to navigate to that card
        row.addEventListener('click', () => {
            state.currentIndex = index;
            updateCard();
            // Update active state
            termsList.querySelectorAll('.journey-term-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
        });
        
            row.innerHTML = `
                <div class="journey-term-text">${card.term}</div>
                <div class="journey-term-def">${card.definition}</div>
            `;
        
        // Mark first item as active
        if (index === state.currentIndex) {
            row.classList.add('active');
        }
        
        termsList.appendChild(row);
    });
}

/**
 * Update Journey map with nodes
 */
function updateJourneyMap() {
    const journeyMap = document.getElementById('journey-map');
    if (!journeyMap) return;
    
    journeyMap.innerHTML = '';
    
    // Try to get saved grouping
    const saved = localStorage.getItem('flashcardContent');
    let groups = null;
    
    if (saved) {
        try {
            const content = JSON.parse(saved);
            if (content.grouping && content.grouping.groups && Array.isArray(content.grouping.groups)) {
                groups = content.grouping.groups;
                console.log('Journey map: Found', groups.length, 'groups:', groups.map(g => g.title));
            }
        } catch (e) {
            console.error('Error loading groups:', e);
        }
    }
    
    // Build the nodes to render - use group titles if available
    const nodesToRender = groups && groups.length > 0 
        ? groups.map(g => g.title || 'Untitled Section') 
        : ['All Terms'];
    
    console.log('Journey map: Rendering nodes:', nodesToRender);
    
    nodesToRender.forEach((title, index) => {
        const node = document.createElement('div');
        // First node is active, rest are locked
        const nodeState = index === 0 ? 'active' : 'locked';
        
        node.className = `journey-node ${nodeState}`;
        node.dataset.groupIndex = index;
        node.style.cursor = 'pointer';
        
        const nodeMain = document.createElement('div');
        nodeMain.className = 'journey-node-main';
        
        // 3D node container
        const node3d = document.createElement('div');
        node3d.className = 'journey-node-3d';
        
        // START label for first node
        if (index === 0) {
            const startLabel = document.createElement('div');
            startLabel.className = 'journey-start-label';
            startLabel.textContent = 'Start here';
            node3d.appendChild(startLabel);
        }
        
        // Progress ring (for active node)
        if (nodeState === 'active') {
            const progressRing = document.createElement('div');
            progressRing.className = 'journey-node-progress-ring';
            node3d.appendChild(progressRing);
        }
        
        // The main sphere with star icon
        const sphere = document.createElement('div');
        sphere.className = 'journey-node-sphere';
        sphere.innerHTML = '<span class="material-symbols-rounded">star</span>';
        node3d.appendChild(sphere);
        
        // Shadow ellipse
        const shadow = document.createElement('div');
        shadow.className = 'journey-node-shadow';
        node3d.appendChild(shadow);
        
        nodeMain.appendChild(node3d);
        node.appendChild(nodeMain);
        
        // Label with the group title - positioned to the right
        const label = document.createElement('div');
        label.className = 'journey-node-label';
        label.textContent = title;
        node.appendChild(label);
        
        // Click handler to open study mode with this group selected
        node.addEventListener('click', () => {
            openStudyModeScreenWithGroup(index);
        });
        
        journeyMap.appendChild(node);
    });
}

/**
 * Load the saved design variant
 */
function loadDesignVariant() {
    const saved = localStorage.getItem('designVariant');
    const variant = saved && VARIANTS.includes(saved) ? saved : 'option-a';
    setDesignVariant(variant);
}

/**
 * Update variant button active states
 */
function updateVariantButtonStates() {
    const currentVariant = localStorage.getItem('designVariant') || 'option-a';
    const buttons = elements.variantSelector?.querySelectorAll('.variant-btn');
    
    buttons?.forEach(btn => {
        const btnVariant = btn.dataset.variant;
        btn.classList.toggle('active', btnVariant === currentVariant);
    });
}

// ============================================
// Panel Resize Functions
// ============================================

/**
 * Initialize panel resize handles
 */
function initPanelResize() {
    const handles = document.querySelectorAll('.panel-resize-handle');
    const discoveryPanel = document.querySelector('.panel-discovery');
    const studyPlanPanel = document.querySelector('.panel-study-plan');
    
    if (!handles.length) return;
    
    // Load saved sizes
    const savedDiscoveryWidth = localStorage.getItem('panelDiscoveryWidth');
    const savedStudyPlanWidth = localStorage.getItem('panelStudyPlanWidth');
    
    if (savedDiscoveryWidth && discoveryPanel) {
        discoveryPanel.style.width = savedDiscoveryWidth;
        discoveryPanel.style.minWidth = '180px';
    }
    
    if (savedStudyPlanWidth && studyPlanPanel) {
        studyPlanPanel.style.width = savedStudyPlanWidth;
        studyPlanPanel.style.minWidth = '150px';
    }
    
    handles.forEach(handle => {
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let targetPanel = null;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            handle.classList.add('dragging');
            document.body.classList.add('resizing');
            
            const resizeType = handle.dataset.resize;
            
            if (resizeType === 'left') {
                targetPanel = discoveryPanel;
            } else if (resizeType === 'right') {
                targetPanel = studyPlanPanel;
            }
            
            if (targetPanel) {
                startWidth = targetPanel.offsetWidth;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !targetPanel) return;
            
            const resizeType = handle.dataset.resize;
            let delta = e.clientX - startX;
            
            // For right panel, invert the delta
            if (resizeType === 'right') {
                delta = -delta;
            }
            
            let newWidth = startWidth + delta;
            
            // Set min/max constraints
            const minWidth = resizeType === 'left' ? 180 : 150;
            const maxWidth = resizeType === 'left' ? 450 : 350;
            
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            
            targetPanel.style.width = newWidth + 'px';
            targetPanel.style.minWidth = minWidth + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('dragging');
                document.body.classList.remove('resizing');
                
                // Save sizes to localStorage
                if (discoveryPanel) {
                    localStorage.setItem('panelDiscoveryWidth', discoveryPanel.style.width);
                }
                if (studyPlanPanel) {
                    localStorage.setItem('panelStudyPlanWidth', studyPlanPanel.style.width);
                }
                
                targetPanel = null;
            }
        });
    });
}

/**
 * Close the import modal
 */
function closeImportModal() {
    elements.importModalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
}

/**
 * Reset study progress
 */
function resetStudyProgress() {
    // Clear study mode viewed cards
    localStorage.removeItem('studyModeViewed');
    studyModeState.viewedCards = new Set();
    
    // Clear starred cards
    localStorage.removeItem('starredCards');
    state.starredCards = new Set();
    
    // Reset engagement state
    state.hasEngagedWithStudy = false;
    saveState();
    
    // Update sidebar progress view
    updateSidebarProgressView();
    
    // Update UI if study mode is open
    if (document.getElementById('study-mode-screen')?.classList.contains('active')) {
        updateStudyModeProgress();
        updateStudyModeTermsList();
        updateStudyModeCard();
    }
    
    // Refresh topics list (will show non-progress view)
    refreshTopicsList();
    
    // Show confirmation
    alert('Study progress has been reset.');
}

/**
 * Parse Quizlet content and import flashcards
 * Supports tab-separated format: Question\tAnswer
 */
async function importFlashcards() {
    const title = elements.importTitleInput.value.trim();
    const content = elements.importTextarea.value.trim();
    
    if (!content) {
        alert('Please paste some flashcard content first.');
        return;
    }
    
    // Parse the content - each line is a card, tab separates term from definition
    const lines = content.split('\n');
    const newCards = [];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // Skip empty lines
        
        // Try tab separator (Quizlet export format)
        let parts = trimmedLine.split('\t');
        
        if (parts.length >= 2) {
            const term = parts[0].trim();
            // Join remaining parts in case definition contained tabs
            const definition = parts.slice(1).join('\t').trim();
            
            if (term && definition) {
                newCards.push({
                    term: term,
                    definition: definition
                });
            }
        }
    }
    
    if (newCards.length === 0) {
        alert('Could not parse any flashcards from the content.\n\nMake sure each line has a question and answer separated by a tab character.');
        return;
    }
    
    // Replace the flashcards array content
    flashcards.length = 0; // Clear existing cards
    flashcards.push(...newCards); // Add new cards
    
    // Reset state
    state.currentIndex = 0;
    state.isFlipped = false;
    state.starredCards.clear();
    
    // Update the set title
    if (title) {
        elements.setTitle.textContent = title;
    } else {
        elements.setTitle.textContent = 'Imported Set';
    }
    
    // Update the flashcard display
    updateCard();
    
    // Close the modal
    closeImportModal();
    
    // Show loading state in TOC
    showTocLoading();
    
    console.log(`Imported ${newCards.length} flashcards. Grouping with AI...`);
    
    // Use AI to group the flashcards and generate description in parallel
    const setTitle = title || 'Imported Set';
    
    let savedGrouping = null;
    let savedDescription = null;
    
    try {
        // Run both AI calls in parallel
        console.log('🤖 Starting AI calls for grouping and description...');
        const [groupResult, descriptionResult] = await Promise.all([
            aiService.groupFlashcards(newCards),
            aiService.generateDescription(setTitle, newCards)
        ]);
        
        // Handle grouping result
        console.log('📦 AI grouping response:', JSON.stringify(groupResult, null, 2));
        if (groupResult.success && groupResult.grouping && groupResult.grouping.groups) {
            console.log('✅ AI grouped into', groupResult.grouping.groups.length, 'categories:', groupResult.grouping.groups.map(g => g.title));
            updateGroupedTopicsList(newCards, groupResult.grouping.groups);
            savedGrouping = groupResult.grouping;
        } else {
            console.warn('⚠️ AI grouping failed or no groups returned:', {
                success: groupResult.success,
                hasGrouping: !!groupResult.grouping,
                hasGroups: groupResult.grouping ? !!groupResult.grouping.groups : false,
                error: groupResult.error,
                fullResult: groupResult
            });
            updateTopicsList(newCards);
        }
        
        // Handle description result
        if (descriptionResult.success && descriptionResult.description) {
            updateAboutDescription(descriptionResult.description);
            savedDescription = descriptionResult.description;
            console.log('AI description generated!');
        } else {
            savedDescription = 'A study set with ' + newCards.length + ' terms to help you learn and review key concepts.';
            updateAboutDescription(savedDescription);
        }
    } catch (error) {
        console.error('Error with AI processing:', error);
        updateTopicsList(newCards);
        savedDescription = 'A study set with ' + newCards.length + ' terms to help you learn and review key concepts.';
        updateAboutDescription(savedDescription);
    }
    
    // Save content to localStorage for persistence
    saveContent(setTitle, newCards, savedGrouping, savedDescription);
    
    // Update 3-panel view if active
    if (document.body.classList.contains('option-b')) {
        updatePanelTermsList();
        updatePanelTitle();
    }
    
    // Update Journey view if active
    if (document.body.classList.contains('option-c')) {
        updateJourneyView();
    }
    
    // Update Table view if active
    if (document.body.classList.contains('option-d')) {
        initTableView();
    }
}

/**
 * Update the about description in the metadata module
 */
function updateAboutDescription(description) {
    // Update Variant A about description
    const aboutDesc = document.getElementById('about-description');
    if (aboutDesc) {
        aboutDesc.textContent = description;
    }
    
    // Update Option D (Table) about description
    const tableAboutText = document.getElementById('table-about-text');
    if (tableAboutText) {
        tableAboutText.textContent = description;
    }
}

/**
 * Update the sidebar to show progress view when engaged
 */
function updateSidebarProgressView() {
    const setMeta = document.getElementById('sidebar-set-meta');
    const progressView = document.getElementById('sidebar-progress-view');
    
    if (!setMeta || !progressView) return;
    
    if (state.hasEngagedWithStudy) {
        // Hide metadata, show progress
        setMeta.style.display = 'none';
        progressView.style.display = 'block';
        
        // Calculate overall progress
        updateSidebarProgress();
    } else {
        // Show metadata, hide progress
        setMeta.style.display = 'flex';
        progressView.style.display = 'none';
    }
}

/**
 * Update the sidebar progress bar
 */
function updateSidebarProgress() {
    const fillEl = document.getElementById('sidebar-progress-fill');
    const textEl = document.getElementById('sidebar-progress-text');
    
    if (!fillEl || !textEl) return;
    
    // Get viewed cards from studyModeState
    const total = flashcards.length;
    const viewed = studyModeState.viewedCards ? studyModeState.viewedCards.size : 0;
    const percent = total > 0 ? Math.round((viewed / total) * 100) : 0;
    
    fillEl.style.width = `${percent}%`;
    textEl.textContent = `${percent}% complete`;
}

/**
 * Calculate progress for a specific group
 */
function getGroupProgress(cardIndices) {
    if (!studyModeState.viewedCards || cardIndices.length === 0) return 0;
    
    let viewed = 0;
    cardIndices.forEach(index => {
        if (studyModeState.viewedCards.has(index)) {
            viewed++;
        }
    });
    
    return Math.round((viewed / cardIndices.length) * 100);
}

/**
 * Check if a card is known (viewed)
 */
function isCardKnown(cardIndex) {
    return studyModeState.viewedCards && studyModeState.viewedCards.has(cardIndex);
}

/**
 * Show loading state in the TOC while AI is grouping
 */
function showTocLoading() {
    elements.topicsContainer.innerHTML = `
        <div class="toc-loading">
            <div class="toc-loading-spinner"></div>
            <span>Organizing with AI...</span>
        </div>
    `;
}

/**
 * Update the sidebar topics list with imported cards (fallback without AI grouping)
 */
function updateTopicsList(cards) {
    // Clear existing topics
    elements.topicsContainer.innerHTML = '';
    
    const isProgressView = state.hasEngagedWithStudy;
    
    // Create a single topic section with all the terms
    const topicSection = document.createElement('div');
    topicSection.className = 'topic-section';
    if (isProgressView) {
        topicSection.classList.add('progress-view');
    }
    
    // Create header
    const topicHeader = document.createElement('div');
    topicHeader.className = 'topic-header';
    topicHeader.addEventListener('click', () => {
        topicSection.classList.toggle('collapsed');
    });
    
    // Add progress ring if in progress view
    if (isProgressView) {
        const allIndices = cards.map((_, i) => i);
        const progressPercent = getGroupProgress(allIndices);
        const progressRing = createProgressRing(progressPercent, 24);
        topicHeader.appendChild(progressRing);
    }
    
    const topicTitle = document.createElement('h2');
    topicTitle.className = 'topic-title';
    topicTitle.textContent = `All Cards (${cards.length})`;
    
    const toggleIcon = document.createElement('div');
    toggleIcon.className = 'topic-toggle';
    toggleIcon.innerHTML = `<span class="material-symbols-rounded">expand_more</span>`;
    
    topicHeader.appendChild(topicTitle);
    topicHeader.appendChild(toggleIcon);
    topicSection.appendChild(topicHeader);
    
    // Create cards container
    const topicCards = document.createElement('div');
    topicCards.className = 'topic-cards';
    
    // Add each card
    cards.forEach((card, index) => {
        const termCard = createTermCard(card, index, isProgressView);
        topicCards.appendChild(termCard);
    });
    
    topicSection.appendChild(topicCards);
    elements.topicsContainer.appendChild(topicSection);
    
    // Set the first item as active
    updateActiveTocItem();
    
    // Update sidebar progress
    if (isProgressView) {
        updateSidebarProgress();
    }
}

/**
 * Update the active state in the TOC list
 */
function updateActiveTocItem(autoExpand = false) {
    const termCards = elements.topicsContainer?.querySelectorAll('.term-card[data-index]');
    if (!termCards || !termCards.length) return;
    
    // Remove active class from all items
    termCards.forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to current item
    const activeItem = elements.topicsContainer.querySelector(`.term-card[data-index="${state.currentIndex}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        
        // Expand parent section if collapsed (only if autoExpand is true)
        if (autoExpand) {
            const parentSection = activeItem.closest('.topic-section');
            if (parentSection && parentSection.classList.contains('collapsed')) {
                // Collapse all sections first
                elements.topicsContainer.querySelectorAll('.topic-section').forEach(section => {
                    section.classList.add('collapsed');
                });
                // Expand the parent section
                parentSection.classList.remove('collapsed');
            }
            
            // Scroll active item into view smoothly
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Also update Journey view if active
    if (document.body.classList.contains('option-c')) {
        const journeyTerms = document.querySelectorAll('.journey-term-row');
        journeyTerms.forEach(row => {
            row.classList.toggle('active', parseInt(row.dataset.index) === state.currentIndex);
        });
        
        const activeJourneyItem = document.querySelector(`.journey-term-row[data-index="${state.currentIndex}"]`);
        if (activeJourneyItem) {
            activeJourneyItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

/**
 * Update the sidebar with AI-grouped categories (accordion style with term cards)
 */
function updateGroupedTopicsList(cards, groups) {
    // Clear existing topics
    elements.topicsContainer.innerHTML = '';
    
    const isProgressView = state.hasEngagedWithStudy;
    
    groups.forEach((group, groupIndex) => {
        const topicSection = document.createElement('div');
        topicSection.className = 'topic-section collapsed';
        if (isProgressView) {
            topicSection.classList.add('progress-view');
        }
        // All sections collapsed by default
        
        // Create clickable header with title and toggle icon
        const topicHeader = document.createElement('div');
        topicHeader.className = 'topic-header';
        topicHeader.addEventListener('click', () => {
            const isCurrentlyCollapsed = topicSection.classList.contains('collapsed');
            
            // Collapse all sections first
            elements.topicsContainer.querySelectorAll('.topic-section').forEach(section => {
                section.classList.add('collapsed');
            });
            
            // If this section was collapsed, expand it
            if (isCurrentlyCollapsed) {
                topicSection.classList.remove('collapsed');
            }
        });
        
        // Add progress ring if in progress view
        if (isProgressView) {
            const progressPercent = getGroupProgress(group.cardIndices);
            const progressRing = createProgressRing(progressPercent, 24);
            topicHeader.appendChild(progressRing);
        }
        
        const topicTitle = document.createElement('h2');
        topicTitle.className = 'topic-title';
        topicTitle.textContent = group.title;
        
        const toggleIcon = document.createElement('div');
        toggleIcon.className = 'topic-toggle';
        toggleIcon.innerHTML = `<span class="material-symbols-rounded">expand_more</span>`;
        
        topicHeader.appendChild(topicTitle);
        topicHeader.appendChild(toggleIcon);
        topicSection.appendChild(topicHeader);
        
        // Create cards container
        const topicCards = document.createElement('div');
        topicCards.className = 'topic-cards';
        
        // Add each card in this group
        group.cardIndices.forEach(cardIndex => {
            if (cardIndex >= 0 && cardIndex < cards.length) {
                const card = cards[cardIndex];
                const termCard = createTermCard(card, cardIndex, isProgressView);
                topicCards.appendChild(termCard);
            }
        });
        
        topicSection.appendChild(topicCards);
        elements.topicsContainer.appendChild(topicSection);
    });
    
    // Set the first item as active
    updateActiveTocItem();
    
    // Update sidebar progress
    if (isProgressView) {
        updateSidebarProgress();
    }
}

/**
 * Create a progress ring SVG element
 */
function createProgressRing(percent, size = 24) {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
    const container = document.createElement('div');
    container.className = 'sidebar-progress-ring';
    container.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle 
                class="progress-ring-bg" 
                cx="${size/2}" 
                cy="${size/2}" 
                r="${radius}" 
                fill="none" 
                stroke-width="${strokeWidth}"
            />
            <circle 
                class="progress-ring-fill" 
                cx="${size/2}" 
                cy="${size/2}" 
                r="${radius}" 
                fill="none" 
                stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 ${size/2} ${size/2})"
            />
        </svg>
    `;
    
    return container;
}

/**
 * Create a term card element with audio and star buttons
 * @param {Object} card - The flashcard data
 * @param {number} cardIndex - Index of the card
 * @param {boolean} isProgressView - Whether to show progress status
 */
function createTermCard(card, cardIndex, isProgressView = false) {
    const termCard = document.createElement('div');
    termCard.className = 'term-card';
    if (isProgressView) {
        termCard.classList.add('progress-view');
    }
    termCard.dataset.index = cardIndex;
    
    // Progress status icon (shown in progress view)
    if (isProgressView) {
        const isKnown = isCardKnown(cardIndex);
        const statusIcon = document.createElement('div');
        statusIcon.className = `term-status-icon ${isKnown ? 'known' : 'learning'}`;
        statusIcon.innerHTML = `<span class="material-symbols-rounded">${isKnown ? 'check_circle' : 'remove'}</span>`;
        termCard.appendChild(statusIcon);
    } else {
        // Audio button (only in non-progress view)
        const audioBtn = document.createElement('button');
        audioBtn.className = 'term-audio-btn';
        audioBtn.setAttribute('aria-label', 'Play audio');
        audioBtn.innerHTML = `<span class="material-symbols-rounded">volume_up</span>`;
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playTermAudio(card.term, card.definition, audioBtn);
        });
        termCard.appendChild(audioBtn);
    }
    
    // Content (term + definition)
    const content = document.createElement('div');
    content.className = 'term-content';
    content.addEventListener('click', (e) => {
        e.stopPropagation();
        state.currentIndex = cardIndex;
        updateCard();
        updateActiveTocItem(true);
    });
    
    const termTitle = document.createElement('div');
    termTitle.className = 'term-title';
    termTitle.textContent = card.term.length > 60 ? card.term.substring(0, 57) + '...' : card.term;
    
    const termDefinition = document.createElement('div');
    termDefinition.className = 'term-definition';
    termDefinition.textContent = card.definition;
    
    content.appendChild(termTitle);
    content.appendChild(termDefinition);
    termCard.appendChild(content);
    
    // Star button
    const starBtn = document.createElement('button');
    starBtn.className = 'term-star-btn';
    if (state.starredCards.has(cardIndex)) {
        starBtn.classList.add('starred');
    }
    starBtn.setAttribute('aria-label', 'Star term');
    updateTermStarIcon(starBtn, state.starredCards.has(cardIndex));
    starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTermStar(cardIndex, starBtn);
    });
    termCard.appendChild(starBtn);
    
    return termCard;
}

/**
 * Update the star icon for a term
 */
function updateTermStarIcon(btn, isStarred) {
    btn.innerHTML = `<span class="material-symbols-rounded ${isStarred ? 'filled' : ''}">star</span>`;
}

/**
 * Toggle star for a specific term
 */
function toggleTermStar(cardIndex, btn) {
    if (state.starredCards.has(cardIndex)) {
        state.starredCards.delete(cardIndex);
        btn.classList.remove('starred');
    } else {
        state.starredCards.add(cardIndex);
        btn.classList.add('starred');
    }
    updateTermStarIcon(btn, state.starredCards.has(cardIndex));
    
    // Update the main star button if this is the current card
    if (cardIndex === state.currentIndex) {
        updateStarButton();
    }
    
    saveState();
}

/**
 * Play text-to-speech for a term and definition
 */
function playTermAudio(term, definition, btn) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create utterance
    const text = `${term}. ${definition}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Add visual feedback
    btn.classList.add('playing');
    
    utterance.onend = () => {
        btn.classList.remove('playing');
    };
    
    utterance.onerror = () => {
        btn.classList.remove('playing');
    };
    
    // Speak
    speechSynthesis.speak(utterance);
}

// ============================================
// Table View (Option D) Functions
// ============================================

const tableState = {
    selectedIndices: new Set(),
    viewMode: 'flat', // 'flat' or 'grouped'
    searchQuery: '',
    collapsedGroups: new Set()
};

/**
 * Initialize Table view
 */
function initTableView() {
    updateTableTitle();
    updateTableTermCount();
    renderTable();
    attachTableEventListeners();
}

/**
 * Update Table title
 */
function updateTableTitle() {
    const tableTitle = document.getElementById('table-set-title');
    if (tableTitle && elements.setTitle) {
        tableTitle.textContent = elements.setTitle.textContent;
    }
}

/**
 * Update Table term count
 */
function updateTableTermCount() {
    const termCount = document.getElementById('table-term-count');
    if (termCount) {
        termCount.innerHTML = `<span class="material-symbols-rounded">stacks</span> ${flashcards.length} terms`;
    }
}

/**
 * Render the table based on current view mode
 */
function renderTable() {
    // Try new list container first, fall back to old table-content
    const tableTermsList = document.getElementById('table-terms-list');
    const tableContent = document.getElementById('table-content');
    
    if (tableTermsList) {
        // New list-style layout
        renderTableTermsList(tableTermsList);
        return;
    }
    
    if (!tableContent) return;
    
    const filteredCards = getFilteredCards();
    
    if (tableState.viewMode === 'grouped') {
        renderGroupedTable(tableContent, filteredCards);
    } else {
        renderFlatTable(tableContent, filteredCards);
    }
    
    updateSelectAllCheckbox();
}

// Track selected items in table list
const tableListState = {
    selectedItems: new Set(),
    searchQuery: ''
};

/**
 * Render terms in the new list-style layout for Option D
 */
function renderTableTermsList(container) {
    container.innerHTML = '';
    
    const filteredCards = getFilteredCards();
    
    filteredCards.forEach(card => {
        const row = document.createElement('div');
        row.className = 'table-term-row';
        row.dataset.index = card.originalIndex;
        
        if (tableListState.selectedItems.has(card.originalIndex)) {
            row.classList.add('selected');
        }
        
        // Checkbox
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'table-term-checkbox';
        const checkbox = document.createElement('label');
        checkbox.className = 'table-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" ${tableListState.selectedItems.has(card.originalIndex) ? 'checked' : ''}>
            <span class="custom-checkbox"></span>
        `;
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        checkbox.querySelector('input').addEventListener('change', (e) => {
            toggleTableListSelection(card.originalIndex, e.target.checked);
        });
        checkboxWrapper.appendChild(checkbox);
        
        // Audio button
        const audioBtn = document.createElement('button');
        audioBtn.className = 'table-term-audio';
        audioBtn.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playTermAudio(card.term, card.definition);
        });
        
        // Content
        const content = document.createElement('div');
        content.className = 'table-term-content';
        content.innerHTML = `
            <span class="table-term-word">${card.term}</span>
            <span class="table-term-def">${card.definition}</span>
        `;
        
        // Star button
        const starBtn = document.createElement('button');
        starBtn.className = 'table-term-star';
        if (state.starredCards.has(card.originalIndex)) {
            starBtn.classList.add('starred');
        }
        starBtn.innerHTML = `<span class="material-symbols-rounded ${state.starredCards.has(card.originalIndex) ? 'filled' : ''}">star</span>`;
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.starredCards.has(card.originalIndex)) {
                state.starredCards.delete(card.originalIndex);
                starBtn.classList.remove('starred');
                starBtn.querySelector('.material-symbols-rounded').classList.remove('filled');
            } else {
                state.starredCards.add(card.originalIndex);
                starBtn.classList.add('starred');
                starBtn.querySelector('.material-symbols-rounded').classList.add('filled');
            }
        });
        
        // Click row to toggle selection
        row.addEventListener('click', () => {
            const input = checkbox.querySelector('input');
            input.checked = !input.checked;
            toggleTableListSelection(card.originalIndex, input.checked);
        });
        
        row.appendChild(checkboxWrapper);
        row.appendChild(audioBtn);
        row.appendChild(content);
        row.appendChild(starBtn);
        container.appendChild(row);
    });
    
    updateTableListActionBar();
}

/**
 * Toggle selection of an item in the table list
 */
function toggleTableListSelection(index, selected) {
    if (selected) {
        tableListState.selectedItems.add(index);
    } else {
        tableListState.selectedItems.delete(index);
    }
    
    // Update row visual state
    const row = document.querySelector(`.table-term-row[data-index="${index}"]`);
    if (row) {
        row.classList.toggle('selected', selected);
    }
    
    // Update select all checkbox
    updateTableListSelectAll();
    updateTableListActionBar();
}

/**
 * Update select all checkbox state
 */
function updateTableListSelectAll() {
    const selectAllCheckbox = document.getElementById('table-list-select-all');
    if (!selectAllCheckbox) return;
    
    const totalItems = flashcards.length;
    const selectedCount = tableListState.selectedItems.size;
    
    selectAllCheckbox.checked = selectedCount === totalItems && totalItems > 0;
    selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalItems;
}

/**
 * Update action bar visibility based on selection
 */
function updateTableListActionBar() {
    const actionBar = document.getElementById('table-action-bar');
    const selectionCount = document.getElementById('selection-count');
    
    if (actionBar) {
        if (tableListState.selectedItems.size > 0) {
            actionBar.classList.add('visible');
            if (selectionCount) {
                selectionCount.textContent = `${tableListState.selectedItems.size} selected`;
            }
        } else {
            actionBar.classList.remove('visible');
        }
    }
}

/**
 * Initialize table list toolbar handlers
 */
function initTableListToolbar() {
    // Select all
    const selectAllCheckbox = document.getElementById('table-list-select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const rows = document.querySelectorAll('.table-term-row');
            rows.forEach(row => {
                const index = parseInt(row.dataset.index);
                const checkbox = row.querySelector('.table-checkbox input');
                if (e.target.checked) {
                    tableListState.selectedItems.add(index);
                    row.classList.add('selected');
                    if (checkbox) checkbox.checked = true;
                } else {
                    tableListState.selectedItems.delete(index);
                    row.classList.remove('selected');
                    if (checkbox) checkbox.checked = false;
                }
            });
            updateTableListActionBar();
        });
    }
    
    // Expandable Search
    const searchToggle = document.getElementById('search-toggle-btn');
    const searchClose = document.getElementById('search-close-btn');
    const expandableSearch = document.getElementById('expandable-search');
    const searchInput = document.getElementById('table-list-search');
    
    if (searchToggle && expandableSearch) {
        searchToggle.addEventListener('click', () => {
            expandableSearch.classList.add('expanded');
            if (searchInput) searchInput.focus();
        });
    }
    
    if (searchClose && expandableSearch) {
        searchClose.addEventListener('click', () => {
            expandableSearch.classList.remove('expanded');
            if (searchInput) {
                searchInput.value = '';
                tableState.searchQuery = '';
                renderTable();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            tableState.searchQuery = e.target.value;
            renderTable();
        });
    }
    
    // Clear selection on action bar close
    const clearBtn = document.getElementById('action-bar-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            tableListState.selectedItems.clear();
            renderTable();
        });
    }
    
    // Filter pills
    const filterPills = document.querySelectorAll('.rail-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            // Filter logic would go here
        });
    });
    
    // Populate recommendations
    populateRailRecommendations();
}

/**
 * Populate rail recommendations (similar sets)
 */
function populateRailRecommendations() {
    const container = document.getElementById('rail-recommendations');
    if (!container) return;
    
    // Sample recommendations (reusing logic from Variant B)
    const recommendations = [
        { title: 'Biology 110 - Cell Structure', terms: 45, studiers: 128 },
        { title: 'Organic Chemistry Basics', terms: 62, studiers: 89 },
        { title: 'Biochemistry Exam Prep', terms: 38, studiers: 156 },
        { title: 'Molecular Biology Review', terms: 54, studiers: 72 }
    ];
    
    container.innerHTML = recommendations.map(rec => `
        <div class="rail-rec-card">
            <span class="rail-rec-title">${rec.title}</span>
            <div class="rail-rec-meta">
                <span class="rail-rec-meta-item">
                    <span class="material-symbols-rounded">stacks</span>
                    ${rec.terms} terms
                </span>
                <span class="rail-rec-meta-item">
                    <span class="material-symbols-rounded">group</span>
                    ${rec.studiers} studiers
                </span>
            </div>
        </div>
    `).join('');
}

/**
 * Get filtered cards based on search query
 */
function getFilteredCards() {
    if (!tableState.searchQuery) {
        return flashcards.map((card, index) => ({ ...card, originalIndex: index }));
    }
    
    const query = tableState.searchQuery.toLowerCase();
    return flashcards
        .map((card, index) => ({ ...card, originalIndex: index }))
        .filter(card => 
            card.term.toLowerCase().includes(query) || 
            card.definition.toLowerCase().includes(query)
        );
}

/**
 * Render flat table view - Excel style
 */
function renderFlatTable(container, cards) {
    container.innerHTML = `
        <table class="terms-table">
            <thead>
                <tr>
                    <th class="col-checkbox">
                        <label class="table-checkbox">
                            <input type="checkbox" id="table-select-all-checkbox">
                            <span class="custom-checkbox"></span>
                        </label>
                    </th>
                    <th class="col-term">Term</th>
                    <th class="col-definition">Definition</th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
    `;
    
    const tbody = document.getElementById('table-body');
    
    cards.forEach(card => {
        const row = createTableRow(card, card.originalIndex);
        tbody.appendChild(row);
    });
    
    // Re-attach select all handler
    const selectAllCheckbox = document.getElementById('table-select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
}

/**
 * Render grouped table view - Excel style
 */
function renderGroupedTable(container, cards) {
    // Get grouping from localStorage
    const saved = localStorage.getItem('flashcardContent');
    let groups = null;
    
    if (saved) {
        try {
            const content = JSON.parse(saved);
            if (content.grouping && content.grouping.groups && content.grouping.groups.length > 0) {
                groups = content.grouping.groups;
            }
        } catch (e) {
            console.error('Error loading groups for table:', e);
        }
    }
    
    if (!groups) {
        // Fallback to flat view if no groups
        renderFlatTable(container, cards);
        return;
    }
    
    container.innerHTML = `
        <table class="terms-table">
            <thead>
                <tr>
                    <th class="col-checkbox">
                        <label class="table-checkbox">
                            <input type="checkbox" id="table-select-all-checkbox">
                            <span class="custom-checkbox"></span>
                        </label>
                    </th>
                    <th class="col-term">Term</th>
                    <th class="col-definition">Definition</th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
    `;
    
    const tbody = document.getElementById('table-body');
    
    groups.forEach((group, groupIndex) => {
        // Group header row
        const isCollapsed = tableState.collapsedGroups.has(groupIndex);
        const groupRow = document.createElement('tr');
        groupRow.className = 'group-header-row';
        groupRow.innerHTML = `
            <td colspan="3">
                <div class="group-header ${isCollapsed ? 'collapsed' : ''}" data-group="${groupIndex}">
                    <span class="material-symbols-rounded">expand_more</span>
                    <span>${group.title}</span>
                    <span class="group-count">${group.cardIndices.length} terms</span>
                </div>
            </td>
        `;
        groupRow.querySelector('.group-header').addEventListener('click', () => {
            toggleGroup(groupIndex);
        });
        tbody.appendChild(groupRow);
        
        // Group items
        if (!isCollapsed) {
            group.cardIndices.forEach(cardIndex => {
                if (cardIndex >= 0 && cardIndex < flashcards.length) {
                    const card = { ...flashcards[cardIndex], originalIndex: cardIndex };
                    // Check if card matches search filter
                    if (!tableState.searchQuery || 
                        card.term.toLowerCase().includes(tableState.searchQuery.toLowerCase()) ||
                        card.definition.toLowerCase().includes(tableState.searchQuery.toLowerCase())) {
                        const row = createTableRow(card, cardIndex);
                        tbody.appendChild(row);
                    }
                }
            });
        }
    });
    
    // Re-attach select all handler
    const selectAllCheckbox = document.getElementById('table-select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
}

/**
 * Create a table row for a card - Excel style
 */
function createTableRow(card, index) {
    const isSelected = tableState.selectedIndices.has(index);
    
    const row = document.createElement('tr');
    row.className = isSelected ? 'selected' : '';
    row.dataset.index = index;
    
    row.innerHTML = `
        <td class="checkbox-cell">
            <label class="table-checkbox">
                <input type="checkbox" ${isSelected ? 'checked' : ''} data-index="${index}">
                <span class="custom-checkbox"></span>
            </label>
        </td>
        <td class="term-cell">${escapeHtml(card.term)}</td>
        <td class="definition-cell">${escapeHtml(card.definition)}</td>
    `;
    
    // Checkbox change handler
    const checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        toggleRowSelection(index);
    });
    
    // Row click to select
    row.addEventListener('click', (e) => {
        if (e.target.closest('.table-checkbox')) return;
        toggleRowSelection(index);
    });
    
    return row;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Toggle row selection
 */
function toggleRowSelection(index) {
    if (tableState.selectedIndices.has(index)) {
        tableState.selectedIndices.delete(index);
    } else {
        tableState.selectedIndices.add(index);
    }
    
    updateRowSelectionUI(index);
    updateActionBar();
    updateSelectAllCheckbox();
}

/**
 * Update row selection UI
 */
function updateRowSelectionUI(index) {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
        const isSelected = tableState.selectedIndices.has(index);
        row.classList.toggle('selected', isSelected);
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = isSelected;
    }
}

/**
 * Update the action bar visibility
 */
function updateActionBar() {
    const actionBar = document.getElementById('table-action-bar');
    const tableLayout = document.querySelector('.table-layout');
    const selectionCount = document.getElementById('selection-count');
    
    if (tableState.selectedIndices.size > 0) {
        actionBar.classList.add('visible');
        tableLayout.classList.add('has-selection');
        selectionCount.textContent = `${tableState.selectedIndices.size} selected`;
    } else {
        actionBar.classList.remove('visible');
        tableLayout.classList.remove('has-selection');
    }
}

/**
 * Update select all checkbox state
 */
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('table-select-all-checkbox');
    if (!selectAllCheckbox) return;
    
    const totalCards = flashcards.length;
    const selectedCount = tableState.selectedIndices.size;
    
    selectAllCheckbox.checked = selectedCount === totalCards && totalCards > 0;
    selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCards;
}

/**
 * Toggle all selections
 */
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('table-select-all-checkbox');
    
    if (selectAllCheckbox.checked) {
        // Select all
        flashcards.forEach((_, index) => {
            tableState.selectedIndices.add(index);
        });
    } else {
        // Deselect all
        tableState.selectedIndices.clear();
    }
    
    renderTable();
    updateActionBar();
}

/**
 * Clear all selections
 */
function clearAllSelections() {
    tableState.selectedIndices.clear();
    renderTable();
    updateActionBar();
}

/**
 * Toggle group collapse
 */
function toggleGroup(groupIndex) {
    if (tableState.collapsedGroups.has(groupIndex)) {
        tableState.collapsedGroups.delete(groupIndex);
    } else {
        tableState.collapsedGroups.add(groupIndex);
    }
    renderTable();
}

/**
 * Handle row action button clicks
 */
function handleRowAction(action, index, btn) {
    switch (action) {
        case 'audio':
            const card = flashcards[index];
            playTermAudio(card.term, card.definition, btn);
            break;
        case 'edit':
            console.log('Edit card:', index);
            // TODO: Implement edit functionality
            break;
        case 'star':
            if (state.starredCards.has(index)) {
                state.starredCards.delete(index);
                btn.classList.remove('starred');
                btn.querySelector('.material-symbols-rounded').classList.remove('filled');
            } else {
                state.starredCards.add(index);
                btn.classList.add('starred');
                btn.querySelector('.material-symbols-rounded').classList.add('filled');
            }
            saveState();
            break;
    }
}

/**
 * Set table view mode (flat or grouped)
 */
function setTableViewMode(mode) {
    tableState.viewMode = mode;
    
    // Update toggle buttons
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    renderTable();
}

/**
 * Handle table search
 */
function handleTableSearch(query) {
    tableState.searchQuery = query;
    renderTable();
}

/**
 * Attach event listeners for Table view
 */
function attachTableEventListeners() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('table-select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
    
    // Clear selection button
    const clearBtn = document.getElementById('action-bar-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllSelections);
    }
    
    // Search input
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleTableSearch(e.target.value);
        });
    }
    
    // View mode toggle
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTableViewMode(btn.dataset.mode);
        });
    });
    
    // Segmented control (old layout)
    document.querySelectorAll('#table-segmented-control .segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#table-segmented-control .segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // TODO: Implement view switching (flashcards, learn, games, test)
            console.log('Switched to view:', btn.dataset.view);
        });
    });
    
    // New mode control (new layout)
    document.querySelectorAll('#table-mode-control .table-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#table-mode-control .table-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            console.log('Switched to mode:', mode);
            // TODO: Implement study mode views (flashcards, learn, test)
        });
    });
}

// ============================================
// Sort & Filter Functions
// ============================================

const sortFilterState = {
    sortBy: 'original', // 'original', 'alphabetical', 'alphabetical-reverse'
    filterBy: 'all' // 'all', 'starred', 'unstarred'
};

/**
 * Toggle sort dropdown menu
 */
function toggleSortMenu(btn) {
    // Remove any existing menus
    removeDropdownMenus();
    
    // Toggle active state
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        const menu = createDropdownMenu([
            { id: 'original', label: 'Original order', icon: 'format_list_numbered' },
            { id: 'alphabetical', label: 'A → Z', icon: 'sort_by_alpha' },
            { id: 'alphabetical-reverse', label: 'Z → A', icon: 'sort_by_alpha' }
        ], sortFilterState.sortBy, (option) => {
            sortFilterState.sortBy = option;
            applySortFilter();
            btn.classList.remove('active');
            removeDropdownMenus();
        });
        
        positionDropdown(menu, btn);
        document.body.appendChild(menu);
    }
}

/**
 * Toggle filter dropdown menu
 */
function toggleFilterMenu(btn) {
    // Remove any existing menus
    removeDropdownMenus();
    
    // Toggle active state
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        const menu = createDropdownMenu([
            { id: 'all', label: 'All terms', icon: 'list' },
            { id: 'starred', label: 'Starred only', icon: 'star' },
            { id: 'unstarred', label: 'Not starred', icon: 'star_outline' }
        ], sortFilterState.filterBy, (option) => {
            sortFilterState.filterBy = option;
            applySortFilter();
            btn.classList.remove('active');
            removeDropdownMenus();
        });
        
        positionDropdown(menu, btn);
        document.body.appendChild(menu);
    }
}

/**
 * Create a dropdown menu
 */
function createDropdownMenu(options, activeOption, onSelect) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    
    options.forEach(option => {
        const item = document.createElement('button');
        item.className = 'dropdown-item' + (option.id === activeOption ? ' active' : '');
        item.innerHTML = `
            <span class="material-symbols-rounded">${option.icon}</span>
            <span>${option.label}</span>
            ${option.id === activeOption ? '<span class="material-symbols-rounded check">check</span>' : ''}
        `;
        item.addEventListener('click', () => onSelect(option.id));
        menu.appendChild(item);
    });
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 0);
    
    return menu;
}

/**
 * Handle outside click to close dropdown
 */
function handleOutsideClick(e) {
    if (!e.target.closest('.dropdown-menu') && !e.target.closest('.toc-control-btn')) {
        removeDropdownMenus();
        document.querySelectorAll('.toc-control-btn').forEach(btn => btn.classList.remove('active'));
        document.removeEventListener('click', handleOutsideClick);
    }
}

/**
 * Remove all dropdown menus
 */
function removeDropdownMenus() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove());
}

/**
 * Position dropdown below button
 */
function positionDropdown(menu, btn) {
    const rect = btn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.zIndex = '1000';
}

/**
 * Apply sort and filter to the topics list
 */
function applySortFilter() {
    const saved = localStorage.getItem('flashcardContent');
    if (!saved) return;
    
    try {
        const content = JSON.parse(saved);
        let cards = [...content.flashcards];
        
        // Apply filter
        let filteredIndices = cards.map((_, i) => i);
        
        if (sortFilterState.filterBy === 'starred') {
            filteredIndices = filteredIndices.filter(i => state.starredCards.has(i));
        } else if (sortFilterState.filterBy === 'unstarred') {
            filteredIndices = filteredIndices.filter(i => !state.starredCards.has(i));
        }
        
        // Apply sort
        if (sortFilterState.sortBy === 'alphabetical') {
            filteredIndices.sort((a, b) => cards[a].term.localeCompare(cards[b].term));
        } else if (sortFilterState.sortBy === 'alphabetical-reverse') {
            filteredIndices.sort((a, b) => cards[b].term.localeCompare(cards[a].term));
        }
        
        // Rebuild the topics list with sorted/filtered cards
        updateFilteredTopicsList(cards, filteredIndices);
        
    } catch (e) {
        console.error('Error applying sort/filter:', e);
    }
}

/**
 * Update topics list with filtered/sorted cards
 */
function updateFilteredTopicsList(cards, indices) {
    elements.topicsContainer.innerHTML = '';
    
    if (indices.length === 0) {
        elements.topicsContainer.innerHTML = `
            <div class="toc-empty">
                <span class="material-symbols-rounded">filter_list_off</span>
                <p>No terms match your filter</p>
            </div>
        `;
        return;
    }
    
    const topicSection = document.createElement('div');
    topicSection.className = 'topic-section';
    
    // Create header
    const topicHeader = document.createElement('div');
    topicHeader.className = 'topic-header';
    topicHeader.addEventListener('click', () => {
        topicSection.classList.toggle('collapsed');
    });
    
    const filterLabel = sortFilterState.filterBy === 'starred' ? 'Starred' : 
                        sortFilterState.filterBy === 'unstarred' ? 'Not Starred' : 'All';
    const sortLabel = sortFilterState.sortBy === 'alphabetical' ? '(A-Z)' :
                      sortFilterState.sortBy === 'alphabetical-reverse' ? '(Z-A)' : '';
    
    const topicTitle = document.createElement('h2');
    topicTitle.className = 'topic-title';
    topicTitle.textContent = `${filterLabel} Terms ${sortLabel} (${indices.length})`;
    
    const toggleIcon = document.createElement('div');
    toggleIcon.className = 'topic-toggle';
    toggleIcon.innerHTML = `<span class="material-symbols-rounded">expand_more</span>`;
    
    topicHeader.appendChild(topicTitle);
    topicHeader.appendChild(toggleIcon);
    topicSection.appendChild(topicHeader);
    
    // Create cards container
    const topicCards = document.createElement('div');
    topicCards.className = 'topic-cards';
    
    // Add each card
    indices.forEach(cardIndex => {
        const card = cards[cardIndex];
        const termCard = createTermCard(card, cardIndex);
        topicCards.appendChild(termCard);
    });
    
    topicSection.appendChild(topicCards);
    elements.topicsContainer.appendChild(topicSection);
    
    // Update active item
    updateActiveTocItem();
}

// ============================================
// Debug Helper - Check localStorage data
// ============================================
window.debugFlashcards = function() {
    const saved = localStorage.getItem('flashcardContent');
    if (saved) {
        const content = JSON.parse(saved);
        console.log('=== FLASHCARD DATA DEBUG ===');
        console.log('Title:', content.title);
        console.log('Card count:', content.flashcards?.length);
        console.log('Has grouping:', !!content.grouping);
        console.log('Group count:', content.grouping?.groups?.length);
        console.log('Groups:', content.grouping?.groups?.map(g => ({ title: g.title, cardCount: g.cardIndices?.length })));
        console.log('Full grouping object:', content.grouping);
        console.log('============================');
        return content;
    } else {
        console.log('No flashcard data in localStorage');
        return null;
    }
};

// ============================================
// Study Mode Screen
// ============================================

const studyModeState = {
    currentIndex: 0,
    isFlipped: false,
    cards: [],
    allCards: [], // All flashcards
    viewedCards: new Set(),
    starredCards: new Set(),
    currentMode: 'flashcards',
    selectedGroups: new Set(), // Set of selected group indices, empty means "all"
    groups: [] // AI-generated groups
};

/**
 * Open the Study Mode screen
 */
function openStudyModeScreen(mode = 'flashcards') {
    openStudyModeScreenWithGroup('all', mode);
}

/**
 * Open the Study Mode screen with a specific group pre-selected
 */
function openStudyModeScreenWithGroup(groupIndex = 'all', mode = 'flashcards') {
    const screen = document.getElementById('study-mode-screen');
    if (!screen) return;
    
    // Load all flashcards
    studyModeState.allCards = [...flashcards];
    studyModeState.currentIndex = 0;
    studyModeState.isFlipped = false;
    studyModeState.currentMode = mode;
    
    // Load groups from localStorage
    loadStudyModeGroups();
    
    // Set the selected groups
    studyModeState.selectedGroups = new Set();
    if (groupIndex !== 'all' && typeof groupIndex === 'number') {
        studyModeState.selectedGroups.add(groupIndex);
    }
    // If 'all' or no specific group, selectedGroups stays empty (meaning all)
    
    // Filter cards based on selected groups
    updateStudyModeCards();
    
    // Load starred cards from main state
    studyModeState.starredCards = new Set(state.starredCards || []);
    
    // Load viewed cards from localStorage
    const savedViewed = localStorage.getItem('studyModeViewed');
    if (savedViewed) {
        studyModeState.viewedCards = new Set(JSON.parse(savedViewed));
    } else {
        studyModeState.viewedCards = new Set();
    }
    
    screen.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mark user as engaged with study experience
    if (!state.hasEngagedWithStudy) {
        state.hasEngagedWithStudy = true;
        saveState();
        updateSidebarProgressView();
        refreshTopicsList(); // Refresh to show progress view
    }
    
    // Update UI
    updateStudyModeTitle();
    populateGroupDropdown();
    updateGroupDropdownSelection();
    updateStudyModeTermsList();
    updateStudyModeCard();
    updateStudyModeProgress();
    updateStudyModeTabs();
}

/**
 * Update the cards array based on selected groups
 */
function updateStudyModeCards() {
    if (studyModeState.selectedGroups.size === 0) {
        // No specific groups selected = all cards
        studyModeState.cards = [...studyModeState.allCards];
        studyModeState.cardIndexMap = studyModeState.allCards.map((_, i) => i);
    } else {
        // Combine cards from all selected groups
        const selectedIndices = new Set();
        studyModeState.selectedGroups.forEach(groupIndex => {
            const group = studyModeState.groups[groupIndex];
            if (group && group.cardIndices) {
                group.cardIndices.forEach(idx => selectedIndices.add(idx));
            }
        });
        
        // Convert to sorted array and map cards
        const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
        studyModeState.cards = sortedIndices.map(idx => studyModeState.allCards[idx]).filter(Boolean);
        studyModeState.cardIndexMap = sortedIndices;
    }
}

/**
 * Load AI-generated groups from localStorage
 */
function loadStudyModeGroups() {
    studyModeState.groups = [];
    
    try {
        const savedContent = localStorage.getItem('flashcardContent');
        if (savedContent) {
            const content = JSON.parse(savedContent);
            if (content.grouping && content.grouping.groups && Array.isArray(content.grouping.groups)) {
                studyModeState.groups = content.grouping.groups;
                console.log('📚 Study Mode: Loaded', studyModeState.groups.length, 'groups');
            }
        }
    } catch (e) {
        console.error('Error loading groups for study mode:', e);
    }
}

/**
 * Populate the group selection dropdown
 */
function populateGroupDropdown() {
    const listEl = document.getElementById('study-mode-group-list');
    const allCountEl = document.getElementById('study-mode-all-count');
    const allCheckbox = document.getElementById('study-mode-group-all');
    
    if (!listEl) return;
    
    // Update "All Terms" count
    if (allCountEl) {
        allCountEl.textContent = studyModeState.allCards.length;
    }
    
    // Setup "All" checkbox handler
    if (allCheckbox) {
        allCheckbox.checked = studyModeState.selectedGroups.size === 0;
        allCheckbox.addEventListener('change', () => {
            if (allCheckbox.checked) {
                // Select all - clear specific selections
                studyModeState.selectedGroups.clear();
            } else {
                // If unchecking "All" and no groups selected, keep it checked
                if (studyModeState.selectedGroups.size === 0) {
                    allCheckbox.checked = true;
                    return;
                }
            }
            updateStudyModeAfterGroupChange();
        });
    }
    
    // Clear and populate group list
    listEl.innerHTML = '';
    
    if (studyModeState.groups.length === 0) {
        listEl.innerHTML = `
            <div class="study-mode-group-dropdown-empty">
                <span class="material-symbols-rounded">info</span>
                <span>No concept groups available</span>
            </div>
        `;
        return;
    }
    
    studyModeState.groups.forEach((group, index) => {
        const cardCount = group.cardIndices ? group.cardIndices.length : 0;
        const isSelected = studyModeState.selectedGroups.has(index);
        const itemEl = document.createElement('div');
        itemEl.className = 'study-mode-group-dropdown-item';
        itemEl.dataset.group = index;
        
        // Use sentence case for group title
        const groupTitle = group.title || 'Untitled group';
        
        itemEl.innerHTML = `
            <label class="study-mode-group-checkbox">
                <input type="checkbox" data-group-index="${index}" ${isSelected ? 'checked' : ''}>
                <span class="study-mode-checkbox-mark"></span>
            </label>
            <span class="study-mode-group-name">${groupTitle}</span>
            <span class="study-mode-group-count">${cardCount}</span>
        `;
        
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleStudyGroup(index, checkbox.checked);
        });
        
        // Allow clicking the row to toggle checkbox
        itemEl.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                checkbox.checked = !checkbox.checked;
                toggleStudyGroup(index, checkbox.checked);
            }
        });
        
        listEl.appendChild(itemEl);
    });
}

/**
 * Toggle a group selection
 */
function toggleStudyGroup(groupIndex, isSelected) {
    if (isSelected) {
        // When selecting a specific group, it means we're no longer in "All terms" mode
        // The selectedGroups set having items means specific groups are selected
        studyModeState.selectedGroups.add(groupIndex);
    } else {
        studyModeState.selectedGroups.delete(groupIndex);
        // If no groups are selected after unchecking, revert to "All terms"
        // (This is handled by the empty set meaning "all")
    }
    
    updateStudyModeAfterGroupChange();
}

/**
 * Update study mode after group selection change
 */
function updateStudyModeAfterGroupChange() {
    studyModeState.currentIndex = 0;
    
    // Update cards based on new selection
    updateStudyModeCards();
    
    // Update UI
    updateGroupDropdownSelection();
    updateStudyModeTitle();
    updateStudyModeTermsList();
    updateStudyModeCard();
    updateStudyModeProgress();
}

/**
 * Update dropdown selection state
 */
function updateGroupDropdownSelection() {
    const allCheckbox = document.getElementById('study-mode-group-all');
    const groupList = document.getElementById('study-mode-group-list');
    
    if (!groupList) return;
    
    // "All terms" is selected only when no specific groups are selected
    const isAllSelected = studyModeState.selectedGroups.size === 0;
    
    // Update "All" checkbox - no indeterminate state, just checked or unchecked
    if (allCheckbox) {
        allCheckbox.checked = isAllSelected;
        allCheckbox.indeterminate = false;
    }
    
    // Update individual group checkboxes
    groupList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const groupIndex = parseInt(checkbox.dataset.groupIndex);
        if (!isNaN(groupIndex)) {
            checkbox.checked = studyModeState.selectedGroups.has(groupIndex);
        }
    });
}

/**
 * Toggle group dropdown visibility
 */
function toggleGroupDropdown(forceState) {
    const dropdown = document.getElementById('study-mode-group-dropdown');
    const btn = document.getElementById('study-mode-group-dropdown-btn');
    
    if (!dropdown || !btn) return;
    
    const isOpen = forceState !== undefined ? forceState : !dropdown.classList.contains('open');
    
    dropdown.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
}

/**
 * Close the Study Mode screen
 */
function closeStudyModeScreen() {
    const screen = document.getElementById('study-mode-screen');
    if (screen) {
        screen.classList.remove('active');
        document.body.style.overflow = '';
        
        // Save viewed cards
        localStorage.setItem('studyModeViewed', JSON.stringify([...studyModeState.viewedCards]));
        
        // Refresh sidebar to show updated progress
        if (state.hasEngagedWithStudy) {
            refreshTopicsList();
            updateSidebarProgress();
        }
    }
}

/**
 * Update the study mode title
 */
function updateStudyModeTitle() {
    const titleEl = document.getElementById('study-mode-title');
    if (!titleEl) return;
    
    const selectedCount = studyModeState.selectedGroups.size;
    
    if (selectedCount === 0) {
        // All terms selected
        titleEl.textContent = 'All terms';
    } else if (selectedCount === 1) {
        // Single group selected - show its title in sentence case
        const groupIndex = Array.from(studyModeState.selectedGroups)[0];
        const group = studyModeState.groups[groupIndex];
        titleEl.textContent = group?.title || 'Untitled group';
    } else {
        // Multiple groups selected
        titleEl.textContent = `${selectedCount} groups selected`;
    }
}

/**
 * Update the terms list in study mode sidebar
 */
function updateStudyModeTermsList() {
    const listEl = document.getElementById('study-mode-terms-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    // Get current filter
    const activeFilter = document.querySelector('.study-mode-filter-pill.active');
    const filter = activeFilter?.dataset.filter || 'all';
    
    studyModeState.cards.forEach((card, index) => {
        const originalIndex = getStudyModeOriginalIndex(index);
        const isKnown = studyModeState.viewedCards.has(originalIndex);
        const isStarred = studyModeState.starredCards.has(originalIndex);
        
        // Apply filter
        if (filter === 'know' && !isKnown) return;
        if (filter === 'learning' && isKnown) return;
        if (filter === 'starred' && !isStarred) return;
        
        const isActive = index === studyModeState.currentIndex;
        
        const itemEl = document.createElement('div');
        itemEl.className = `study-mode-term-item${isActive ? ' active' : ''}`;
        itemEl.dataset.index = index;
        
        itemEl.innerHTML = `
            <div class="study-mode-term-content">
                <div class="study-mode-term-text">${card.term}</div>
                <div class="study-mode-term-def">${card.definition}</div>
            </div>
            <div class="study-mode-term-status ${isKnown ? 'known' : 'unknown'}">
                <span class="material-symbols-rounded">${isKnown ? 'check_circle' : 'remove'}</span>
            </div>
        `;
        
        itemEl.addEventListener('click', () => {
            studyModeState.currentIndex = index;
            studyModeState.isFlipped = false;
            updateStudyModeCard();
            updateStudyModeTermsList();
        });
        
        listEl.appendChild(itemEl);
    });
    
    // Scroll active item into view
    const activeItem = listEl.querySelector('.study-mode-term-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Get the original card index for the current card
 */
function getStudyModeOriginalIndex(cardIndex) {
    if (studyModeState.cardIndexMap && studyModeState.cardIndexMap[cardIndex] !== undefined) {
        return studyModeState.cardIndexMap[cardIndex];
    }
    return cardIndex;
}

/**
 * Update the flashcard display in study mode
 */
function updateStudyModeCard() {
    const card = studyModeState.cards[studyModeState.currentIndex];
    if (!card) return;
    
    const frontEl = document.getElementById('study-mode-card-front');
    const backEl = document.getElementById('study-mode-card-back');
    const cardEl = document.getElementById('study-mode-card');
    const counterEl = document.getElementById('study-mode-counter');
    const starBtn = document.getElementById('study-mode-card-star');
    
    if (frontEl) frontEl.textContent = card.term;
    if (backEl) backEl.textContent = card.definition;
    if (counterEl) counterEl.textContent = `${studyModeState.currentIndex + 1}/${studyModeState.cards.length}`;
    
    // Reset flip state
    if (cardEl) {
        cardEl.classList.remove('flipped');
        studyModeState.isFlipped = false;
    }
    
    // Get original index for starred/viewed tracking
    const originalIndex = getStudyModeOriginalIndex(studyModeState.currentIndex);
    
    // Update star state
    if (starBtn) {
        const isStarred = studyModeState.starredCards.has(originalIndex);
        starBtn.classList.toggle('starred', isStarred);
        const icon = starBtn.querySelector('.material-symbols-rounded');
        if (icon) {
            icon.textContent = isStarred ? 'star' : 'star_border';
        }
    }
    
    // Mark as viewed (use original index)
    studyModeState.viewedCards.add(originalIndex);
    updateStudyModeProgress();
}

/**
 * Update the progress bar and text
 */
function updateStudyModeProgress() {
    const fillEl = document.getElementById('study-mode-progress-fill');
    const textEl = document.getElementById('study-mode-progress-text');
    
    const total = studyModeState.cards.length;
    
    // Count viewed cards for the current group
    let viewed = 0;
    for (let i = 0; i < total; i++) {
        const originalIndex = getStudyModeOriginalIndex(i);
        if (studyModeState.viewedCards.has(originalIndex)) {
            viewed++;
        }
    }
    
    const percent = total > 0 ? Math.round((viewed / total) * 100) : 0;
    
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (textEl) textEl.textContent = `${percent}% Complete`;
    
    // Also update sidebar progress
    updateSidebarProgress();
}

/**
 * Update the active mode tab
 */
function updateStudyModeTabs() {
    const tabs = document.querySelectorAll('.study-mode-tab');
    tabs.forEach(tab => {
        const mode = tab.dataset.mode;
        tab.classList.toggle('active', mode === studyModeState.currentMode);
    });
}

/**
 * Navigate to next card in study mode
 */
function studyModeNextCard() {
    if (studyModeState.currentIndex < studyModeState.cards.length - 1) {
        studyModeState.currentIndex++;
        updateStudyModeCard();
        updateStudyModeTermsList();
    }
}

/**
 * Navigate to previous card in study mode
 */
function studyModePrevCard() {
    if (studyModeState.currentIndex > 0) {
        studyModeState.currentIndex--;
        updateStudyModeCard();
        updateStudyModeTermsList();
    }
}

/**
 * Flip the card in study mode
 */
function studyModeFlipCard() {
    const cardEl = document.getElementById('study-mode-card');
    if (cardEl) {
        studyModeState.isFlipped = !studyModeState.isFlipped;
        cardEl.classList.toggle('flipped', studyModeState.isFlipped);
    }
}

/**
 * Toggle star on current card in study mode
 */
function studyModeToggleStar() {
    const originalIndex = getStudyModeOriginalIndex(studyModeState.currentIndex);
    
    if (studyModeState.starredCards.has(originalIndex)) {
        studyModeState.starredCards.delete(originalIndex);
    } else {
        studyModeState.starredCards.add(originalIndex);
    }
    
    // Sync with main state
    state.starredCards = [...studyModeState.starredCards];
    localStorage.setItem('starredCards', JSON.stringify(state.starredCards));
    
    // Update UI
    const starBtn = document.getElementById('study-mode-card-star');
    if (starBtn) {
        const isStarred = studyModeState.starredCards.has(originalIndex);
        starBtn.classList.toggle('starred', isStarred);
        const icon = starBtn.querySelector('.material-symbols-rounded');
        if (icon) {
            icon.textContent = isStarred ? 'star' : 'star_border';
        }
    }
    
    // Update terms list to reflect star changes
    updateStudyModeTermsList();
}

/**
 * Shuffle cards in study mode
 */
function studyModeShuffle() {
    // Fisher-Yates shuffle
    const cards = [...studyModeState.cards];
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    studyModeState.cards = cards;
    studyModeState.currentIndex = 0;
    updateStudyModeCard();
    updateStudyModeTermsList();
}

/**
 * Initialize Study Mode screen event listeners
 */
function initStudyModeScreen() {
    // Close button
    const closeBtn = document.getElementById('study-mode-close-btn');
    closeBtn?.addEventListener('click', closeStudyModeScreen);
    
    // Group dropdown toggle
    const dropdownBtn = document.getElementById('study-mode-group-dropdown-btn');
    dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGroupDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('study-mode-group-dropdown');
        const btn = document.getElementById('study-mode-group-dropdown-btn');
        if (dropdown?.classList.contains('open') && !dropdown.contains(e.target) && e.target !== btn) {
            toggleGroupDropdown(false);
        }
    });
    
    // Card flip
    const cardEl = document.getElementById('study-mode-card');
    cardEl?.addEventListener('click', (e) => {
        // Don't flip if clicking on audio or star buttons
        if (e.target.closest('.study-mode-card-audio') || e.target.closest('.study-mode-card-star')) {
            return;
        }
        studyModeFlipCard();
    });
    
    // Navigation
    const prevBtn = document.getElementById('study-mode-prev');
    const nextBtn = document.getElementById('study-mode-next');
    prevBtn?.addEventListener('click', studyModePrevCard);
    nextBtn?.addEventListener('click', studyModeNextCard);
    
    // Shuffle
    const shuffleBtn = document.getElementById('study-mode-shuffle');
    shuffleBtn?.addEventListener('click', studyModeShuffle);
    
    // Star
    const starBtn = document.getElementById('study-mode-card-star');
    starBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        studyModeToggleStar();
    });
    
    // Mode tabs
    const modeTabs = document.querySelectorAll('.study-mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            studyModeState.currentMode = tab.dataset.mode;
            updateStudyModeTabs();
        });
    });
    
    // Filter pills
    document.querySelectorAll('.study-mode-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.study-mode-filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            updateStudyModeTermsList();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const screen = document.getElementById('study-mode-screen');
        if (!screen?.classList.contains('active')) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                studyModePrevCard();
                break;
            case 'ArrowRight':
                studyModeNextCard();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                studyModeFlipCard();
                break;
            case 'Escape':
                closeStudyModeScreen();
                break;
            case 's':
                studyModeToggleStar();
                break;
        }
    });
    
    // Wire up Study buttons from all variants
    document.querySelectorAll('.study-btn, .sidebar-study-btn, .panel-study-btn, .journey-study-btn, .rail-study-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openStudyModeScreen('flashcards');
        });
    });
    
    // Wire up mode buttons from all variants
    document.querySelectorAll('.mode-btn, .panel-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = btn.dataset.mode || 'flashcards';
            openStudyModeScreen(mode);
        });
    });
    
    // Wire up study action cards (from Option B study plan)
    document.querySelectorAll('.study-action-card[data-mode]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = card.dataset.mode || 'flashcards';
            // Only open study mode for actual study modes
            if (['flashcards', 'learn', 'games', 'test'].includes(mode)) {
                openStudyModeScreen(mode);
            }
        });
    });
    
    // Wire up experience tabs (from Option C)
    document.querySelectorAll('.experience-tab-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = btn.dataset.mode || 'flashcards';
            openStudyModeScreen(mode);
        });
    });
    
    // Wire up table mode buttons (from Option D)
    document.querySelectorAll('.table-mode-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = btn.dataset.mode || 'flashcards';
            openStudyModeScreen(mode);
        });
    });
    
    // Wire up tab buttons (from Option A)
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = btn.dataset.tab || 'flashcards';
            openStudyModeScreen(mode);
        });
    });
}

// ============================================
// Create Set Screen
// ============================================

const createSetState = {
    cards: [
        { term: '', definition: '', image: null },
        { term: '', definition: '', image: null }
    ],
    title: '',
    description: '',
    suggestionsEnabled: true
};

/**
 * Open the Create Set screen
 */
function openCreateSetScreen() {
    const screen = document.getElementById('create-set-screen');
    if (screen) {
        // Pre-populate with current set data for remix
        const savedContent = localStorage.getItem('flashcardContent');
        if (savedContent) {
            const content = JSON.parse(savedContent);
            createSetState.title = content.title ? `${content.title} (Copy)` : '';
            createSetState.description = '';
            createSetState.cards = content.flashcards?.map(card => ({
                term: card.term || '',
                definition: card.definition || '',
                image: null
            })) || [
                { term: '', definition: '', image: null },
                { term: '', definition: '', image: null }
            ];
        }
        
        screen.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCreateSetCards();
        
        // Set title if available
        const titleInput = document.getElementById('create-set-title');
        if (titleInput && createSetState.title) {
            titleInput.value = createSetState.title;
        }
    }
}

/**
 * Close the Create Set screen
 */
function closeCreateSetScreen() {
    const screen = document.getElementById('create-set-screen');
    if (screen) {
        screen.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Render all cards in the Create Set screen
 */
function renderCreateSetCards() {
    const cardsList = document.getElementById('create-cards-list');
    if (!cardsList) return;
    
    cardsList.innerHTML = '';
    
    createSetState.cards.forEach((card, index) => {
        const cardEl = createCardElement(card, index);
        cardsList.appendChild(cardEl);
    });
    
    updateCharacterCount();
}

/**
 * Create a card element for the Create Set screen
 */
function createCardElement(card, index) {
    const cardEl = document.createElement('div');
    cardEl.className = 'create-card';
    cardEl.dataset.cardIndex = index;
    
    cardEl.innerHTML = `
        <div class="create-card-header">
            <span class="create-card-number">${index + 1}</span>
            <div class="create-card-actions">
                <button class="create-card-action-btn" aria-label="Reorder" data-action="reorder">
                    <span class="material-symbols-rounded">drag_indicator</span>
                </button>
                <button class="create-card-action-btn" aria-label="Delete" data-action="delete">
                    <span class="material-symbols-rounded">delete</span>
                </button>
            </div>
        </div>
        <div class="create-card-content">
            <div class="create-card-field">
                <input type="text" class="create-card-input" placeholder="Enter term" data-field="term" value="${escapeHtml(card.term)}">
                <span class="create-card-label">TERM</span>
            </div>
            <div class="create-card-field">
                <input type="text" class="create-card-input" placeholder="Enter definition" data-field="definition" value="${escapeHtml(card.definition)}">
                <span class="create-card-label">DEFINITION</span>
            </div>
            <div class="create-card-image" data-action="add-image">
                <span class="material-symbols-rounded">image</span>
                <span>Image</span>
            </div>
        </div>
    `;
    
    // Add event listeners
    const deleteBtn = cardEl.querySelector('[data-action="delete"]');
    deleteBtn?.addEventListener('click', () => deleteCreateCard(index));
    
    const termInput = cardEl.querySelector('[data-field="term"]');
    const defInput = cardEl.querySelector('[data-field="definition"]');
    
    termInput?.addEventListener('input', (e) => {
        createSetState.cards[index].term = e.target.value;
        updateCharacterCount();
        checkStartButtonState();
    });
    
    defInput?.addEventListener('input', (e) => {
        createSetState.cards[index].definition = e.target.value;
        updateCharacterCount();
        checkStartButtonState();
    });
    
    return cardEl;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

/**
 * Add a new card to the Create Set screen
 */
function addCreateCard() {
    createSetState.cards.push({ term: '', definition: '', image: null });
    renderCreateSetCards();
    
    // Scroll to the new card
    const cardsList = document.getElementById('create-cards-list');
    if (cardsList) {
        const lastCard = cardsList.lastElementChild;
        lastCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus the term input
        setTimeout(() => {
            const termInput = lastCard?.querySelector('[data-field="term"]');
            termInput?.focus();
        }, 300);
    }
}

/**
 * Delete a card from the Create Set screen
 */
function deleteCreateCard(index) {
    if (createSetState.cards.length <= 2) {
        // Don't allow fewer than 2 cards
        return;
    }
    
    createSetState.cards.splice(index, 1);
    renderCreateSetCards();
}

/**
 * Update the character count in Smart Assist
 */
function updateCharacterCount() {
    const countEl = document.querySelector('.smart-assist-count');
    if (!countEl) return;
    
    let totalChars = 0;
    createSetState.cards.forEach(card => {
        totalChars += (card.term?.length || 0) + (card.definition?.length || 0);
    });
    
    countEl.textContent = `${totalChars.toLocaleString()}/100,000`;
}

/**
 * Check if the Start button should be enabled
 */
function checkStartButtonState() {
    const startBtn = document.querySelector('.smart-assist-start-btn');
    if (!startBtn) return;
    
    const hasContent = createSetState.cards.some(card => 
        card.term?.trim() || card.definition?.trim()
    );
    
    startBtn.disabled = !hasContent;
}

/**
 * Save/Create the set
 */
function saveCreateSet() {
    const titleInput = document.getElementById('create-set-title');
    const descInput = document.getElementById('create-set-description');
    
    const title = titleInput?.value?.trim() || 'Untitled Set';
    const description = descInput?.value?.trim() || '';
    
    // Filter out empty cards
    const validCards = createSetState.cards.filter(card => 
        card.term?.trim() || card.definition?.trim()
    );
    
    if (validCards.length === 0) {
        alert('Please add at least one card with content.');
        return;
    }
    
    // Create the flashcard content
    const content = {
        title: title,
        description: description,
        flashcards: validCards.map(card => ({
            term: card.term?.trim() || '',
            definition: card.definition?.trim() || ''
        }))
    };
    
    // Save to localStorage
    localStorage.setItem('flashcardContent', JSON.stringify(content));
    
    // Clear any existing grouping (will be regenerated)
    localStorage.removeItem('flashcardGrouping');
    
    // Close the create screen and reload
    closeCreateSetScreen();
    
    // Reload to show the new set
    window.location.reload();
}

/**
 * Initialize Create Set screen event listeners
 */
function initCreateSetScreen() {
    // Back button
    const backBtn = document.getElementById('create-back-btn');
    backBtn?.addEventListener('click', closeCreateSetScreen);
    
    // Add card button
    const addCardBtn = document.getElementById('create-add-card-btn');
    addCardBtn?.addEventListener('click', addCreateCard);
    
    // Create/Save buttons
    const saveBtn = document.getElementById('create-save-btn');
    const practiceBtn = document.getElementById('create-practice-btn');
    
    saveBtn?.addEventListener('click', saveCreateSet);
    practiceBtn?.addEventListener('click', saveCreateSet);
    
    // Smart Assist close button
    const smartAssistClose = document.getElementById('smart-assist-close');
    smartAssistClose?.addEventListener('click', () => {
        const sidebar = document.getElementById('create-smart-assist');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
    });
    
    // Suggestions toggle
    const suggestionsToggle = document.getElementById('suggestions-toggle');
    suggestionsToggle?.addEventListener('change', (e) => {
        createSetState.suggestionsEnabled = e.target.checked;
    });
    
    // Title input
    const titleInput = document.getElementById('create-set-title');
    titleInput?.addEventListener('input', (e) => {
        createSetState.title = e.target.value;
    });
    
    // Description input
    const descInput = document.getElementById('create-set-description');
    descInput?.addEventListener('input', (e) => {
        createSetState.description = e.target.value;
    });
    
    // Wire up all Remix buttons to open Create Set screen
    document.querySelectorAll('.remix-btn, .panel-remix-btn, .sidebar-remix-btn, .journey-remix-btn, .rail-remix-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openCreateSetScreen();
        });
    });
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', init);
