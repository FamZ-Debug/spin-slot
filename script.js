/**
 * Pro Randomizer 2.0.1
 * Clean, Object-Oriented rewritten version.
 */

const DEFAULT_ITEMS = [];

const DEFAULT_SETTINGS = {
    spinDuration: 3.5,
    isGlowEnabled: false,
    glowColor: '#0074ff',
    pulseColor: '#ffffff',
    slotBgColor: '#000000',
    slotBgImage: null,
    isTextMode: false,
    spinAxis: 'y',
    animStyle: 'normal',
    fontSize: 4,
    fontColor: '#ffffff',
    isCensorEnabled: false,
    censorCount: 4,
    removeItemAfterSpin: false,
    isTextGlowEnabled: false,
    textGlowColor: '#0074ff',
    lang: 'en',
    currentPresetName: 'Custom'
};


class RandomizerApp {
    switchLanguage() {
        const langs = ['en', 'th', 'ru'];
        let currentIndex = langs.indexOf(this.settings.lang || 'en');
        let nextIndex = (currentIndex + 1) % langs.length;
        this.settings.lang = langs[nextIndex];
        
        this.applyLanguage();
        this.saveStorage();
    }
    constructor() {
        this.items = [...DEFAULT_ITEMS];
        this.drawnItems = [];
        this.presets = [];
        this.settings = { ...DEFAULT_SETTINGS };
        
        this.isSpinning = false;
        this.isDisplayMode = false;
        this.hasSpunOnce = false;
        this.uploadedImageBase64 = null;

        // Detect if we're on the Name Room page (no images)
        this.isNameRoom = window.location.pathname.includes('names.html');

        // Separate storage and sync domains for Name Room vs Main Room
        this.storageKey = this.isNameRoom ? 'prorandomizer_names_v2' : 'prorandomizer_v2';
        this.channelName = this.isNameRoom ? 'randomizer_names_sync_v2' : 'randomizer_sync_v2';
        this.displayModeKey = this.isNameRoom ? 'prorandomizer_names_display_mode' : 'prorandomizer_display_mode';

        // Sync Channel - now fully separated so they don't interfere with each other
        this.syncChannel = new BroadcastChannel(this.channelName);
        this.syncChannel.onmessage = (e) => this.handleSyncMessage(e.data);

        this.initDOM();
        this.loadStorage();
        this.bindEvents();
        
        // Initial check for display mode state
        if (this.isDisplayMode) {
            this.toggleDisplayMode(true, true); // true to avoid re-broadcasting during init
        }
        
        this.updateUI(true); // true = skip saving on initial load to avoid overwriting storage
    }

    initDOM() {
        // Core elements (Cross-page definitions)
        this.$availableList = document.getElementById('available-list') || document.getElementById('item-list-display');
        this.$drawnList = document.getElementById('drawn-list') || document.getElementById('history-list');
        this.$countRemaining = document.getElementById('count-remaining') || document.getElementById('items-count');
        this.$countDrawn = document.getElementById('count-drawn');
        
        // Spin Window
        this.$slotWindow = document.getElementById('slot-window');
        this.$slotReel = document.getElementById('slot-reel');
        this.$emptyState = document.getElementById('empty-state');
        this.$winnerReveal = document.getElementById('winner-reveal');
        this.$winnerText = document.getElementById('winner-text');
        this.$btnSpin = document.getElementById('btn-spin');
        
        // Settings elements
        this.$valDuration = document.getElementById('val-duration');
        this.$inputDuration = document.getElementById('input-duration');
        this.$inputGlowEnable = document.getElementById('input-glow-enable');
        this.$inputColorGlow = document.getElementById('input-color-glow');
        this.$inputColorPulse = document.getElementById('input-color-pulse');
        this.$inputColorBg = document.getElementById('input-color-bg');
        this.$inputTextMode = document.getElementById('input-text-mode');
        this.$inputTextGlowEnable = document.getElementById('input-text-glow-enable');
        this.$inputTextColorGlow = document.getElementById('input-text-color-glow');
        this.$inputBgImage = document.getElementById('input-bg-image');
        this.$btnClearBgImage = document.getElementById('btn-clear-bg-image');
        this.$bgPreviewContainer = document.getElementById('bg-preview-container');
        this.$bgPreviewImg = document.getElementById('bg-preview-img');
        
        // Manage Items
        this.$inputNewItem = document.getElementById('input-new-item');
        this.$inputItemImage = document.getElementById('input-item-image');
        this.$inputItemUrl = document.getElementById('input-item-url');
        this.$manageItemList = document.getElementById('manage-item-list');
        this.$searchInput = document.getElementById('input-search-items');
        
        // Presets (may not exist on display-only pages)
        this.$presetList = document.getElementById('preset-list');
        this.$inputPresetName = document.getElementById('input-preset-name');
        
        // Manage Multi (may not exist on display-only pages)
        this.$manageCount = document.getElementById('manage-count');
        this.$bulkSection = document.getElementById('bulk-add-section');
        this.$textareaBulk = document.getElementById('textarea-bulk');
        this.$inputImportCsv = document.getElementById('input-import-csv');
        this.$inputImportCsvSide = document.getElementById('input-import-csv-side');
        this.$inputImportData = document.getElementById('input-import-data');
        
        this.$btnCustomerView = document.getElementById('btn-customer-view');
        this.$btnExitDisplay = document.getElementById('btn-exit-display');
        this.$btnExpandRemaining = document.getElementById('btn-expand-remaining');
        this.$btnExpandHistory = document.getElementById('btn-expand-history');
        this.$modalFullList = document.getElementById('modal-full-list');
        this.$fullViewList = document.getElementById('full-view-list');
        this.$fullListTitle = document.getElementById('full-list-title');
        this.$inputSearchFull = document.getElementById('input-search-full');
        this.$mainGrid = document.querySelector('.main-grid');

        // Store App globally for initialization script in secondary pages
        window.app = this;
    }

    showLoader(text = 'Processing...') {
        this.hideLoader(); // Single instance
        const overlay = document.createElement('div');
        overlay.id = 'app-loader';
        overlay.className = 'loader-overlay';
        overlay.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">${text}</div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoader() {
        document.getElementById('app-loader')?.remove();
    }

    /* -------------------------------------------------------------
       STORAGE
    ------------------------------------------------------------- */
    loadStorage() {
        try {
            // Load data from the specific storage key (Main or Name Room)
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            if (data) {
                if (data.items) this.items = data.items;
                if (data.presets) this.presets = data.presets;
                if (data.settings) this.settings = { ...this.settings, ...data.settings };
                // ** BUG FIX: Restore drawnItems from storage (was missing!) **
                if (data.drawnItems) this.drawnItems = data.drawnItems;
            }
            // Load specific display mode state
            const storedDisplayMode = localStorage.getItem(this.displayModeKey) === 'true';
            this.isDisplayMode = storedDisplayMode;
        } catch(e) { console.error("Could not parse storage data", e); }

        // ** BUG FIX: Force isTextMode AFTER merging storage settings **
        // This ensures Name Room is always in text mode even if storage had isTextMode=false
        if (this.isNameRoom) {
            this.settings.isTextMode = true;
        }

        this.applySettingsToDOM();
    }

    saveStorage() {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            const data = {
                items: this.items,
                presets: this.presets,
                settings: this.settings,
                drawnItems: this.drawnItems
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.syncChannel.postMessage({ type: 'STATE_SYNC', state: data });
        }, 300);
    }

    applySettingsToDOM() {
        if (this.$inputColorBg) this.$inputColorBg.value = this.settings.slotBgColor;

        // Apply visual updates variables
        document.documentElement.style.setProperty('--glow-color', this.settings.isGlowEnabled ? this.settings.glowColor : 'transparent');
        document.documentElement.style.setProperty('--pulse-rgb', this.hexToRgb(this.settings.pulseColor));
        if (this.$slotWindow) this.$slotWindow.style.backgroundColor = this.settings.slotBgColor;
        if (this.settings.slotBgImage) {
            if (this.$slotWindow) this.$slotWindow.style.backgroundImage = `url(${this.settings.slotBgImage})`;
            if (this.$bgPreviewImg) this.$bgPreviewImg.src = this.settings.slotBgImage;
            if (this.$bgPreviewContainer) this.$bgPreviewContainer.classList.remove('hidden');
        } else {
            if (this.$slotWindow) this.$slotWindow.style.backgroundImage = 'none';
            if (this.$bgPreviewContainer) this.$bgPreviewContainer.classList.add('hidden');
        }

        if (this.$btnClearBgImage) {
            this.$btnClearBgImage.classList.toggle('hidden', !this.settings.slotBgImage);
        }

        // Update color picker visual feedback if needed (optional but nice)
        if (this.$inputColorGlow && this.$inputColorGlow.parentElement && this.$inputColorGlow.parentElement.classList.contains('picker-wrapper')) {
            this.$inputColorGlow.parentElement.style.backgroundColor = this.settings.glowColor;
        }
        if (this.$inputColorPulse && this.$inputColorPulse.parentElement && this.$inputColorPulse.parentElement.classList.contains('picker-wrapper')) {
            this.$inputColorPulse.parentElement.style.backgroundColor = this.settings.pulseColor;
        }
        if (this.$inputColorBg && this.$inputColorBg.parentElement && this.$inputColorBg.parentElement.classList.contains('picker-wrapper')) {
            this.$inputColorBg.parentElement.style.backgroundColor = this.settings.slotBgColor;
        }

        const animStyleEl = document.querySelector(`input[name="anim-style"][value="${this.settings.animStyle}"]`);
        if (animStyleEl) animStyleEl.checked = true;
        const spinAxisEl = document.querySelector(`input[name="spin-axis"][value="${this.settings.spinAxis}"]`);
        if (spinAxisEl) spinAxisEl.checked = true;
        if (this.$inputTextMode) this.$inputTextMode.checked = this.settings.isTextMode;

        // Font Size
        const fontSlider = document.getElementById('input-font-size');
        const fontVal = document.getElementById('val-font-size');
        if (fontSlider) fontSlider.value = this.settings.fontSize;
        if (fontVal) fontVal.textContent = this.settings.fontSize + 'rem';
        document.documentElement.style.setProperty('--slot-font-size', this.settings.fontSize + 'rem');
        
        // Font Color
        const fontColorIdx = document.getElementById('input-font-color');
        if (fontColorIdx) fontColorIdx.value = this.settings.fontColor || '#ffffff';
        if (fontColorIdx && fontColorIdx.parentElement && fontColorIdx.parentElement.classList.contains('picker-wrapper')) {
            fontColorIdx.parentElement.style.backgroundColor = this.settings.fontColor || '#ffffff';
        }
        document.documentElement.style.setProperty('--slot-font-color', this.settings.fontColor || '#ffffff');

        // Censor
        const censorCheck = document.getElementById('input-censor-enable');
        if (censorCheck) censorCheck.checked = this.settings.isCensorEnabled;
        
        const censorCountSlider = document.getElementById('input-censor-count');
        const censorCountVal = document.getElementById('val-censor-count');
        if (censorCountSlider) censorCountSlider.value = this.settings.censorCount || 4;
        if (censorCountVal) censorCountVal.textContent = this.settings.censorCount || 4;

        // Auto Remove after spin
        const removeCheck = document.getElementById('input-remove-winner');
        if (removeCheck) removeCheck.checked = this.settings.removeItemAfterSpin;

        // Text Glow
        if (this.$inputTextGlowEnable) this.$inputTextGlowEnable.checked = this.settings.isTextGlowEnabled;
        if (this.$inputTextColorGlow) {
            this.$inputTextColorGlow.value = this.settings.textGlowColor || '#0074ff';
            if (this.$inputTextColorGlow.parentElement?.classList.contains('picker-wrapper')) {
                this.$inputTextColorGlow.parentElement.style.backgroundColor = this.settings.textGlowColor || '#0074ff';
            }
        }
        
        const textShadow = this.settings.isTextGlowEnabled 
            ? `0 0 10px ${this.settings.textGlowColor}, 0 0 20px ${this.settings.textGlowColor}, 0 0 30px ${this.settings.textGlowColor}`
            : '0 0 20px rgba(255,255,255,0.4)';
        document.documentElement.style.setProperty('--text-glow-shadow', textShadow);

        this.applyLanguage();
    }

    applyLanguage() {
        const lang = this.settings.lang || 'en';
        if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[lang]) return;
        const dict = TRANSLATIONS[lang];
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                // If it's an input with placeholder
                if (el.tagName === 'INPUT' && el.placeholder) {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Update language button text
        const displayLang = document.querySelectorAll('#lang-display span');
        displayLang.forEach(span => {
            span.textContent = lang.toUpperCase();
        });

        // Update legacy language button text if still exists
        const btnLang = document.getElementById('btn-lang');
        if (btnLang) {
            const span = btnLang.querySelector('span');
            if (span) span.textContent = dict['lang-label'];
        }

        // Update spin button text if not spinning
        if (!this.isSpinning && this.$btnSpin) {
            const spinTextEl = this.$btnSpin.querySelector('.spin-text');
            if (spinTextEl) spinTextEl.textContent = dict['spin-now'];
        }
    }



    censorText(text) {
        if (!this.settings.isCensorEnabled) return text;
        const len = text.length;
        if (len <= 2) return '*'.repeat(len);
        
        const count = this.settings.censorCount || 4;
        const censorCount = Math.min(count, len - 2);
        const startKeep = Math.ceil((len - censorCount) / 2);
        const endKeep = len - startKeep - censorCount;
        return text.slice(0, startKeep) + '*'.repeat(censorCount) + text.slice(len - endKeep);
    }

    hexToRgb(hex) {
        let r = 255, g = 255, b = 255;
        if (typeof hex === 'string') {
            if (hex.length === 7 && hex[0] === '#') {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            } else if (hex.length === 4 && hex[0] === '#') {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            }
        }
        return `${r}, ${g}, ${b}`;
    }

    /* CSV Import Handler (Centralized) */
    handleCSVImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.showLoader('Reading CSV...');
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
            if (lines.length < 2) { 
                this.hideLoader();
                alert('CSV file is empty or has no data rows.'); 
                return; 
            }
            
            // Parse headers & rows
            const headers = this._parseCsvLine(lines[0]);
            const dataRows = lines.slice(1).map(l => this._parseCsvLine(l));
            const sampleRow = dataRows[0] || [];
            
            // Artificial delay to show loader (CSV is too fast)
            setTimeout(() => {
                this.hideLoader();
                
                // Store parsed data temporarily
                this._csvParseResult = { headers, dataRows };
                
                // Show Column Picker Modal
                const modal = document.getElementById('modal-csv-picker');
                if (!modal) {
                    // Fallback: no modal available, just import first column
                    const parsedItems = dataRows.map((row, i) => {
                        const newItem = { id: Date.now() + i, name: row[0] || 'Unknown' };
                        newItem.image = 'img/1.png';
                        return newItem;
                    });
                    this.items = parsedItems; // Replace, not append
                    this.settings.currentPresetName = 'CSV Import';
                    this.updateUI();
                    this.renderManageList();
                    e.target.value = ''; // Reset for same-file re-import
                    return;
                }
                
                // Build column checkboxes (existing logic continue...)
            const colList = document.getElementById('csv-columns-list');
            const previewInfo = document.getElementById('csv-preview-info');
            if (previewInfo) previewInfo.textContent = `Found ${dataRows.length} rows, ${headers.length} columns`;
            
            if (colList) {
                colList.innerHTML = '';
                
                // Filter row
                const filterDiv = document.createElement('div');
                filterDiv.style.cssText = 'background:rgba(255,255,255,0.04); border-radius:8px; padding:10px; margin-bottom:6px;';
                filterDiv.innerHTML = `
                    <label class="text-xs text-muted" style="display:block; margin-bottom:6px;"><i class="fa-solid fa-filter"></i> Filter Rows (Optional)</label>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <select id="csv-filter-col" class="styled-input" style="flex:1; font-size:0.75rem; padding:6px 8px;">
                            <option value="">-- No Filter --</option>
                            ${headers.map((h, i) => `<option value="${i}">${h}</option>`).join('')}
                        </select>
                        <span class="text-xs text-muted">=</span>
                        <select id="csv-filter-val" class="styled-input" style="flex:1; font-size:0.75rem; padding:6px 8px;" disabled>
                            <option value="">-- Select column first --</option>
                        </select>
                    </div>
                `;
                colList.appendChild(filterDiv);
                
                // Populate filter values when filter column changes
                const filterColSelect = filterDiv.querySelector('#csv-filter-col');
                const filterValSelect = filterDiv.querySelector('#csv-filter-val');
                filterColSelect.addEventListener('change', () => {
                    const colIdx = filterColSelect.value;
                    if (colIdx === '') {
                        filterValSelect.innerHTML = '<option value="">-- No Filter --</option>';
                        filterValSelect.disabled = true;
                        return;
                    }
                    const uniqueVals = [...new Set(dataRows.map(r => r[parseInt(colIdx)] || ''))].sort();
                    filterValSelect.innerHTML = '<option value="">-- All --</option>' + 
                        uniqueVals.map(v => `<option value="${v}">${v} (${dataRows.filter(r => (r[parseInt(colIdx)] || '') === v).length})</option>`).join('');
                    filterValSelect.disabled = false;
                });
                
                // Column selection header
                const selectHeader = document.createElement('div');
                selectHeader.innerHTML = `<label class="text-xs" style="font-weight:600; color:var(--accent-primary);"><i class="fa-solid fa-table-columns"></i> Select Column(s) to use as names</label>`;
                selectHeader.style.marginTop = '4px';
                colList.appendChild(selectHeader);
                
                headers.forEach((header, idx) => {
                    const div = document.createElement('label');
                    div.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(255,255,255,0.04); border-radius:8px; cursor:pointer; transition:all 0.2s;';
                    div.innerHTML = `
                        <input type="checkbox" class="csv-col-check" value="${idx}" style="accent-color:var(--accent-primary); width:16px; height:16px;">
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600; font-size:0.85rem;">${header}</div>
                            <div class="text-muted text-xs" style="opacity:0.6; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Example: ${sampleRow[idx] || '(empty)'}</div>
                        </div>
                    `;
                    div.addEventListener('mouseenter', () => div.style.background = 'rgba(255,255,255,0.08)');
                    div.addEventListener('mouseleave', () => div.style.background = 'rgba(255,255,255,0.04)');
                    colList.appendChild(div);
                });
            }
            modal.classList.add('active');
        }, 500); 
    };
    reader.readAsText(file, 'UTF-8');
}

    /* -------------------------------------------------------------
       UI UPDATES & RENDERING
    ------------------------------------------------------------- */
    updateUI(isSyncIncoming = false) {
        if (this.$countRemaining) this.$countRemaining.textContent = this.items.length;
        if (this.$countDrawn) this.$countDrawn.textContent = this.drawnItems.length;
        
        const presetLabel = document.getElementById('preset-display-label');
        if (presetLabel) presetLabel.textContent = `Preset: ${this.settings.currentPresetName || 'Custom'}`;

        if (this.$availableList) this.renderList(this.$availableList, this.items, false);
        if (this.$drawnList) this.renderList(this.$drawnList, [...this.drawnItems].reverse(), true);

        if (this.items.length === 0) {
            if (this.$btnSpin) {
                this.$btnSpin.disabled = true;
                const spinText = this.$btnSpin.querySelector('.spin-text');
                if (spinText) spinText.textContent = 'Empty';
            }
            if (this.$slotReel) this.$slotReel.innerHTML = '';
        } else {
            if (this.$btnSpin) {
                this.$btnSpin.disabled = false;
                const spinText = this.$btnSpin.querySelector('.spin-text');
                if (spinText) spinText.textContent = 'Spin Now!';
            }
            if(!this.isSpinning) this.renderIdleSlot();
        }
        
        // Only save if this update was triggered by local user action
        if (!isSyncIncoming) {
            this.saveStorage();
        }
    }

    /* CSV line parser (handles quoted fields with commas inside) */
    _parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"' && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        result.push(current.trim());
        return result;
    }

    renderList(container, itemsArray, isHistory) {
        container.innerHTML = '';
        const limit = 100;
        const toRender = itemsArray.slice(0, limit);
        
        toRender.forEach(item => {
            const li = document.createElement('li');
            if (this.settings.isTextMode) {
                li.innerHTML = `<span class="item-name text-truncate">${item.name}</span>`;
            } else {
                li.innerHTML = `
                    <img class="list-thumb" src="${item.image || ''}" onerror="this.src='img/1.png'">
                    <span class="item-name text-truncate">${item.name}</span>
                `;
            }
            container.appendChild(li);
        });

        if (itemsArray.length > limit) {
            const li = document.createElement('li');
            li.className = 'text-center text-xs text-muted py-2';
            li.style.justifyContent = 'center';
            li.textContent = `... and ${itemsArray.length - limit} more items`;
            container.appendChild(li);
        }
    }

    /* -------------------------------------------------------------
       MODALS & SETTINGS EVENTS
    ------------------------------------------------------------- */
    bindEvents() {
        // Spin Trigger
        this.$btnSpin?.addEventListener('click', () => this.spin());

        // Reset & History
        const btnReset = document.getElementById('btn-reset') || document.getElementById('btn-reset-history');
        btnReset?.addEventListener('click', () => {
             this.showConfirm("reset-everything", "reset-desc", () => {
                 // Return drawn items to the main pool
                 this.drawnItems.forEach(drawn => {
                     // Check if item still exists in items (in case of manual deletion)
                     const exists = this.items.some(it => it.id === drawn.id);
                     if (!exists) {
                         // Create a copy without the drawnAt property
                         const { drawnAt, ...rest } = drawn;
                         this.items.push(rest);
                     }
                 });

                 this.drawnItems = [];
                 this.hasSpunOnce = false;
                 if(this.$winnerText) this.$winnerText.textContent = 'Ready to Spin';
                 if(this.$slotReel) this.$slotReel.innerHTML = '';
                 this.renderManageList();
                 this.updateUI();
             });
        });

        document.getElementById('btn-export-history')?.addEventListener('click', () => {
            if (this.drawnItems.length === 0) {
                alert("Log is empty! No data to export.");
                return;
            }
            
            // 1. Collect all unique CSV headers from drawn items
            let allHeaders = ["Order", "Winner Name", "Draw Time"];
            const dynamicHeaders = new Set();
            
            this.drawnItems.forEach(item => {
                if (item.csvHeaders && Array.isArray(item.csvHeaders)) {
                    item.csvHeaders.forEach(h => dynamicHeaders.add(h));
                }
            });
            const dynamicHeaderList = Array.from(dynamicHeaders);
            const fullHeaderList = [...allHeaders, ...dynamicHeaderList];

            // 2. Build CSV rows
            let csv = "\uFEFF"; // BOM for Excel UTF-8 support
            
            // Header Row
            csv += fullHeaderList.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
            
            // Data Rows (newest first, matching UI order)
            [...this.drawnItems].reverse().forEach((item, index) => {
                const rowData = [];
                // Fixed columns
                rowData.push(index + 1);
                rowData.push(item.name);
                rowData.push(item.drawnAt || "");
                
                // Dynamic columns from original CSV data
                dynamicHeaderList.forEach(h => {
                    let val = "";
                    if (item.csvHeaders && item.csvRow) {
                        const hIdx = item.csvHeaders.indexOf(h);
                        if (hIdx !== -1) {
                            val = item.csvRow[hIdx] || "";
                        }
                    }
                    rowData.push(val);
                });
                
                csv += rowData.map(v => {
                    const s = String(v).replace(/"/g, '""');
                    return `"${s}"`;
                }).join(",") + "\n";
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `spin_log_complete_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });

        // Modals opening
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.renderManageList();
            this.renderPresetList();
            document.getElementById('modal-settings')?.classList.add('active');
        });
        document.getElementById('btn-add-quick')?.addEventListener('click', () => {
            document.getElementById('btn-settings').click();
            document.querySelector('[data-target="tab-items"]').click();
        });

        // Modals closing
        document.querySelectorAll('.modal-close, .modal-close-confirm').forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.closest('.modal-overlay').classList.remove('active');
            });
        });

        // Tabs logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.getAttribute('data-target')).classList.add('active');
            });
        });

        // Settings Listeners
        this.$inputDuration?.addEventListener('input', e => {
            if (this.settings) this.settings.spinDuration = e.target.value;
            if (this.$valDuration) this.$valDuration.textContent = e.target.value + 's';
            this.saveStorage();
        });
        
        const bindSettingInput = (el, prop, type = 'value', cb = null) => {
            if (!el) return;
            el.addEventListener('change', e => {
                this.settings[prop] = type === 'checked' ? e.target.checked : e.target.value;
                if (cb) cb();
                this.saveStorage();
            });
        }
        
        bindSettingInput(this.$inputGlowEnable, 'isGlowEnabled', 'checked', () => this.applySettingsToDOM());
        bindSettingInput(this.$inputColorGlow, 'glowColor', 'value', () => this.applySettingsToDOM());
        bindSettingInput(this.$inputColorPulse, 'pulseColor', 'value', () => this.applySettingsToDOM());
        bindSettingInput(this.$inputColorBg, 'slotBgColor', 'value', () => this.applySettingsToDOM());
        bindSettingInput(this.$inputTextMode, 'isTextMode', 'checked', () => { this.renderIdleSlot(); });

        // Background Image Support
        this.$inputBgImage?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                this.settings.slotBgImage = ev.target.result;
                this.applySettingsToDOM();
                this.saveStorage();
            };
            reader.readAsDataURL(file);
        });

        this.$btnClearBgImage?.addEventListener('click', () => {
            this.settings.slotBgImage = null;
            if (this.$inputBgImage) this.$inputBgImage.value = '';
            this.applySettingsToDOM();
            this.saveStorage();
        });

        document.querySelectorAll('input[name="spin-axis"]').forEach(r => {
            r.addEventListener('change', e => { 
                this.settings.spinAxis = e.target.value; 
                this.saveStorage(); 
                this.renderIdleSlot();
            });
        });
        document.querySelectorAll('input[name="anim-style"]').forEach(r => {
            r.addEventListener('change', e => { this.settings.animStyle = e.target.value; this.saveStorage(); });
        });

        // Font Size slider
        document.getElementById('input-font-size')?.addEventListener('input', (e) => {
            this.settings.fontSize = parseFloat(e.target.value);
            const fontVal = document.getElementById('val-font-size');
            if (fontVal) fontVal.textContent = this.settings.fontSize + 'rem';
            document.documentElement.style.setProperty('--slot-font-size', this.settings.fontSize + 'rem');
            this.saveStorage();
            if (!this.isSpinning) this.renderIdleSlot();
        });

        // Font Color
        document.getElementById('input-font-color')?.addEventListener('input', (e) => {
            this.settings.fontColor = e.target.value;
            if (e.target.parentElement && e.target.parentElement.classList.contains('picker-wrapper')) {
                e.target.parentElement.style.backgroundColor = e.target.value;
            }
            document.documentElement.style.setProperty('--slot-font-color', e.target.value);
            this.saveStorage();
            if (!this.isSpinning) this.renderIdleSlot();
        });

        // Censor toggle
        document.getElementById('input-censor-enable')?.addEventListener('change', (e) => {
            this.settings.isCensorEnabled = e.target.checked;
            this.saveStorage();
            if (!this.isSpinning) this.renderIdleSlot();
        });

        // Censor count slider
        document.getElementById('input-censor-count')?.addEventListener('input', (e) => {
            this.settings.censorCount = parseInt(e.target.value);
            const valEl = document.getElementById('val-censor-count');
            if (valEl) valEl.textContent = this.settings.censorCount;
            this.saveStorage();
            if (!this.isSpinning) this.renderIdleSlot();
        });

        // Auto Remove after spin
        document.getElementById('input-remove-winner')?.addEventListener('change', (e) => {
            this.settings.removeItemAfterSpin = e.target.checked;
            this.saveStorage();
        });

        this.$inputTextGlowEnable?.addEventListener('change', (e) => {
            this.settings.isTextGlowEnabled = e.target.checked;
            this.applySettingsToDOM();
            this.saveStorage();
        });

        this.$inputTextColorGlow?.addEventListener('input', (e) => {
            this.settings.textGlowColor = e.target.value;
            this.applySettingsToDOM();
            this.saveStorage();
        });

        // Restore Defaults
        document.getElementById('btn-settings-reset')?.addEventListener('click', () => {
            this.showConfirm("restore-defaults", "reset-desc", () => {
                this.settings = { ...DEFAULT_SETTINGS };
                this.applySettingsToDOM();
                this.saveStorage();
            }, 'warning', 'modal-settings');
        });
        // Add Item Image preview
        this.$inputItemImage?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                this.uploadedImageBase64 = ev.target.result;
                const prevImg = document.getElementById('preview-img');
                const prevName = document.getElementById('preview-name');
                const prevWrap = document.getElementById('image-preview-wrapper');
                if (prevImg) prevImg.src = this.uploadedImageBase64;
                if (prevName) prevName.textContent = file.name;
                if (prevWrap) prevWrap.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btn-clear-preview')?.addEventListener('click', () => {
            this.uploadedImageBase64 = null;
            if (this.$inputItemImage) this.$inputItemImage.value = '';
            document.getElementById('image-preview-wrapper')?.classList.add('hidden');
        });

        document.getElementById('btn-add-item')?.addEventListener('click', () => {
            const name = this.$inputNewItem?.value.trim();
            
            if (name) {
                const newItem = { id: Date.now(), name: name };
                
                if (!this.settings.isTextMode) {
                    const url = this.$inputItemUrl?.value.trim();
                    newItem.image = url || this.uploadedImageBase64 || 'img/1.png';
                    if (this.$inputItemUrl) this.$inputItemUrl.value = '';
                    document.getElementById('btn-clear-preview')?.click();
                } else {
                    newItem.image = 'img/1.png'; // fallback for storage
                }
                
                this.items.unshift(newItem);
                if (this.$inputNewItem) this.$inputNewItem.value = '';
                this.settings.currentPresetName = 'Custom';
                this.updateUI();
                this.renderManageList();
                
                // Keep focus on input for rapid entry
                this.$inputNewItem?.focus();
            }
        });

        this.$inputNewItem?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('btn-add-item')?.click();
            }
        });

        this.$searchInput?.addEventListener('input', () => this.renderManageList());

        // Manage Items Actions
        document.getElementById('btn-clear-all')?.addEventListener('click', () => {
            this.showConfirm("Clear All Items?", "This will remove all items from the current list.", () => {
                this.items = [];
                this.settings.currentPresetName = 'Empty';
                this.updateUI();
                this.renderManageList();
            }, 'danger', 'modal-settings');
        });

        document.getElementById('btn-bulk-add')?.addEventListener('click', () => {
            this.$bulkSection?.classList.toggle('hidden');
            if (this.$bulkSection && !this.$bulkSection.classList.contains('hidden')) {
                this.$textareaBulk?.focus();
            }
        });

        document.getElementById('btn-close-bulk')?.addEventListener('click', () => {
            this.$bulkSection?.classList.add('hidden');
        });

        document.getElementById('btn-process-bulk')?.addEventListener('click', () => {
            const raw = this.$textareaBulk?.value.trim();
            if (!raw) return;
            const names = raw.split('\n').map(n => n.trim()).filter(n => n !== '');
            if (names.length === 0) return;
            
            const newBulkItems = names.map((name, i) => {
                const newItem = { id: Date.now() + i, name: name };
                newItem.image = 'img/1.png';
                return newItem;
            });
            this.items = [...newBulkItems, ...this.items];
            
            if (this.$textareaBulk) this.$textareaBulk.value = '';
            this.$bulkSection?.classList.add('hidden');
            this.settings.currentPresetName = 'Custom';
            this.updateUI();
            this.renderManageList();
            document.getElementById('modal-settings')?.classList.remove('active');
        });

        // CSV Import via handleCSVImport is wired at the end of bindEvents
        
        // CSV Column Picker: Confirm
        document.getElementById('btn-csv-confirm')?.addEventListener('click', () => {
            const checks = document.querySelectorAll('.csv-col-check:checked');
            if (checks.length === 0) { alert('Please select at least one column.'); return; }
            if (!this._csvParseResult) { alert('No CSV data loaded. Please re-select your file.'); return; }

            const selectedCols = Array.from(checks).map(c => parseInt(c.value));
            const { headers, dataRows } = this._csvParseResult;
            
            // Apply filter
            const filterCol = document.getElementById('csv-filter-col')?.value;
            const filterVal = document.getElementById('csv-filter-val')?.value;
            let filteredRows = dataRows;
            if (filterCol !== '' && filterCol !== undefined && filterVal) {
                const fIdx = parseInt(filterCol);
                filteredRows = dataRows.filter(row => (row[fIdx] || '') === filterVal);
            }
            
            const newCsvItems = filteredRows.map((row, i) => {
                const nameParts = selectedCols.map(idx => row[idx] || '').filter(v => v !== '');
                const name = nameParts.join(' | ') || 'Unknown';
                const newItem = { 
                    id: Date.now() + i, 
                    name: name,
                    csvRow: row,
                    csvHeaders: headers
                };
                newItem.image = 'img/1.png';
                return newItem;
            });
            this.items = newCsvItems; // Replace, not append
            
            this.settings.currentPresetName = 'CSV Import';
            this.updateUI();
            this.renderManageList();
            this._csvParseResult = null;
            
            // Success reset inputs (Use members)
            if (this.$inputImportCsv) this.$inputImportCsv.value = '';
            if (this.$inputImportCsvSide) this.$inputImportCsvSide.value = '';

            document.getElementById('modal-csv-picker')?.classList.remove('active');
            document.getElementById('modal-settings')?.classList.remove('active');
        });
        
        // CSV Column Picker: Cancel
        document.getElementById('btn-csv-cancel')?.addEventListener('click', () => {
            this._csvParseResult = null;
            // Also reset inputs on cancel
            if (this.$inputImportCsv) this.$inputImportCsv.value = '';
            if (this.$inputImportCsvSide) this.$inputImportCsvSide.value = '';
            
            document.getElementById('modal-csv-picker')?.classList.remove('active');
        });

        // Preset Saving
        document.getElementById('btn-save-preset')?.addEventListener('click', () => {
            const name = this.$inputPresetName?.value.trim();
            if (!name) return;
            this.presets.push({
                id: Date.now(),
                name: name,
                items: JSON.parse(JSON.stringify(this.items))
            });
            this.settings.currentPresetName = name;
            if (this.$inputPresetName) this.$inputPresetName.value = '';
            this.renderPresetList();
            this.updateUI();
            this.saveStorage();
        });
        
        // Export & Import
        document.getElementById('btn-export-data')?.addEventListener('click', () => {
            const data = {
                version: "2.0",
                items: this.items,
                presets: this.presets,
                settings: this.settings
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `prorandomizer_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        });

        this.$inputImportData?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const text = ev.target.result;
                    if (!text || text.trim() === '') throw new Error('File is empty');
                    const data = JSON.parse(text);
                    if (!data || typeof data !== 'object') throw new Error('Not a valid JSON object');
                    if (!data.items && !data.presets) throw new Error('No items or presets found in file');
                    if (data.items) this.items = data.items;
                    if (data.presets) this.presets = data.presets;
                    if (data.settings) this.settings = { ...this.settings, ...data.settings };
                    this.drawnItems = data.drawnItems || [];
                    this.hasSpunOnce = false;
                    if (this.$winnerText) this.$winnerText.textContent = 'Ready to Spin';
                    if (this.$winnerReveal) this.$winnerReveal.classList.remove('hidden');
                    this.applySettingsToDOM();
                    this.updateUI();
                    this.renderPresetList();
                    this.renderManageList();
                    document.getElementById('modal-settings')?.classList.remove('active');
                    alert("Data imported successfully!");
                } catch(err) { alert("Import failed: " + err.message); }
            };
            reader.onerror = () => alert("Import failed: Could not read file");
            reader.readAsText(file);
        });

        const resetValue = e => { e.target.value = ''; };
        this.$inputImportCsv?.addEventListener('click', resetValue);
        this.$inputImportCsvSide?.addEventListener('click', resetValue);
        this.$inputImportData?.addEventListener('click', resetValue);

        this.$inputImportCsv?.addEventListener('change', e => this.handleCSVImport(e));
        this.$inputImportCsvSide?.addEventListener('change', e => this.handleCSVImport(e));

        // Dropdown Toggle (Multiple)
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close others
                    document.querySelectorAll('.dropdown.show').forEach(d => {
                        if (d !== dropdown) d.classList.remove('show');
                    });
                    dropdown.classList.toggle('show');
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.dropdown.show').forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        });

        // Language Options
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = btn.getAttribute('data-value');
                this.settings.lang = lang;
                this.applyLanguage();
                this.saveStorage();
                this.syncChannel.postMessage({ type: 'LANG_CHANGE', lang });
                btn.closest('.dropdown').classList.remove('show');
            });
        });

        // Sidebars Actions (Expanded modal view)
        this.$btnExpandRemaining?.addEventListener('click', () => this.openFullView('remaining'));
        this.$btnExpandHistory?.addEventListener('click', () => this.openFullView('history'));
        this.$inputSearchFull?.addEventListener('input', () => {
            const mode = this.$modalFullList?.getAttribute('data-mode');
            if (mode) this.renderFullView(mode);
        });

        // Display Mode Toggles (Restored)
        this.$btnCustomerView?.addEventListener('click', () => this.toggleDisplayMode(true));
        this.$btnExitDisplay?.addEventListener('click', () => this.toggleDisplayMode(false));
        
        // Handle URL parameter
        if (window.location.search.includes('view=customer')) {
            this.toggleDisplayMode(true);
        }

        // Keydown listener for Esc
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.isDisplayMode) this.toggleDisplayMode(false);
        });
    }

    toggleDisplayMode(active, isInit = false) {
        this.isDisplayMode = active;
        document.body.classList.toggle('display-mode', active);
        if (this.$btnExitDisplay) this.$btnExitDisplay.classList.toggle('hidden', !active);
        
        // Persist state so new tabs or refresh know about the mode
        localStorage.setItem(this.displayModeKey, active);

        if (active) {
            // LOCK BODY SCROLL in display mode for maximum stability
            document.body.style.overflow = 'hidden';
            // Force a slight delay before re-rendering to let the layout settle
            setTimeout(() => this.renderIdleSlot(), 50);
        } else {
            document.body.style.overflow = '';
            setTimeout(() => this.renderIdleSlot(), 50);
        }
    }



    handleSyncMessage(data) {
        if (data.type === 'SPIN_TRIGGER') {
            if (!this.isSpinning) this.spin(true, data.winner); // true means sync mode (don't broadcast back)
        } else if (data.type === 'LANG_CHANGE') {
            if (this.settings.lang !== data.lang) {
                this.settings.lang = data.lang;
                this.applyLanguage();
            }
        } else if (data.type === 'STATE_SYNC') {
            const newState = data.state;
            if (!newState) return;
            
            if (newState.items) this.items = newState.items;
            if (newState.settings) {
                this.settings = { ...this.settings, ...newState.settings };
                // Name Room must ALWAYS be in text mode regardless of sync
                if (this.isNameRoom) this.settings.isTextMode = true; 
            }
            if (newState.drawnItems) this.drawnItems = newState.drawnItems;
            if (newState.presets) this.presets = newState.presets;
            
            this.applySettingsToDOM();
            this.updateUI(true); // true to skip saveStorage loop
            
            // Force re-render the slot as well to ensure total consistency
            this.renderIdleSlot();
        }
    }

    showConfirm(title, desc, callback, type = 'warning', parentModalId = null) {
        const lang = this.settings.lang || 'en';
        const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || {};

        const finalTitle = dict[title] || title;
        const finalDesc = dict[desc] || desc;

        const iconEl = document.getElementById('confirm-icon');
        const titleEl = document.getElementById('confirm-title');
        const confirmModal = document.getElementById('modal-confirm');
        
        // If confirm modal doesn't exist on this page, just execute the callback directly
        if (!confirmModal || !iconEl || !titleEl) {
            if (confirm(`${title}\n${desc}`)) {
                callback();
            }
            return;
        }

        iconEl.className = 'dialog-icon';
        if (type === 'danger') {
            iconEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
            iconEl.classList.add('text-danger');
        } else if (type === 'success') {
            iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            iconEl.classList.add('text-success');
        } else {
            iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            iconEl.classList.add('text-warning');
        }

        titleEl.textContent = finalTitle;
        const descEl = document.getElementById('confirm-desc');
        if (descEl) descEl.textContent = finalDesc;
        confirmModal.classList.add('active');
        
        const confirmBtn = document.getElementById('btn-confirm-action');
        if (!confirmBtn) { callback(); return; }
        // Clear previous listeners by replacing node
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        // Styling the confirm button based on type
        newBtn.className = type === 'danger' ? 'btn-danger w-full' : 'btn-primary w-full';
        
        newBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            if (parentModalId) document.getElementById(parentModalId)?.classList.remove('active');
            callback();
        });
    }

    renderManageList() {
        if (!this.$manageItemList) return;
        this.$manageItemList.innerHTML = '';
        if (this.$manageCount) this.$manageCount.textContent = this.items.length;
        const search = this.$searchInput ? this.$searchInput.value.toLowerCase() : '';
        
        const filtered = this.items.filter(item => (item.name || '').toLowerCase().includes(search));
        if (filtered.length === 0) {
            this.$manageItemList.innerHTML = `<li class="text-muted text-center w-full block">No matching items found.</li>`;
            return;
        }

        const limit = 200;
        const toRender = filtered.slice(0, limit);

        toRender.forEach(item => {
            const li = document.createElement('li');
            li.style.flexDirection = 'column';
            li.style.alignItems = 'stretch';
            li.style.gap = '0';

            const thumbHtml = this.settings.isTextMode ? '' : `<img class="thumb" src="${item.image || ''}" onerror="this.src='img/1.png'">`;
            li.innerHTML = `
                <div class="item-row" style="display:flex; align-items:center; gap:12px; width:100%;">
                    <div class="item-info" style="flex:1; min-width:0; display:flex; align-items:center; gap:10px;">
                        ${thumbHtml}
                        <span class="item-name text-truncate">${item.name}</span>
                    </div>
                    <div class="actions" style="flex-shrink:0; display:flex; gap:5px;">
                        <button class="btn-icon small btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon small text-danger btn-del" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="edit-form" style="display:none; padding-top:10px; flex-direction:column; gap:8px;">
                    <input type="text" class="styled-input edit-name" value="${item.name.replace(/"/g, '&quot;')}" placeholder="Name...">
                    ${this.settings.isTextMode ? '' : `
                    <div style="display:flex; gap:8px; align-items:center;">
                        <img class="edit-thumb thumb" src="${item.image || ''}" onerror="this.src='img/1.png'" style="width:40px; height:40px; border-radius:6px; object-fit:contain; background:rgba(0,0,0,0.3);">
                        <input type="text" class="styled-input edit-url" value="${(item.image && !item.image.startsWith('data:')) ? item.image : ''}" placeholder="Image URL...">
                        <label class="btn-icon small" style="cursor:pointer;" title="Upload Image">
                            <i class="fa-solid fa-image"></i>
                            <input type="file" class="edit-file" accept="image/*" hidden>
                        </label>
                    </div>`}
                    <div style="display:flex; gap:8px;">
                        <button class="btn-primary btn-sm btn-save-edit" style="flex:1;">Save</button>
                        <button class="btn-secondary btn-sm btn-cancel-edit" style="flex:1;">Cancel</button>
                    </div>
                </div>
            `;

            const itemRow = li.querySelector('.item-row');
            const editForm = li.querySelector('.edit-form');
            const editNameInput = li.querySelector('.edit-name');
            const editUrlInput = li.querySelector('.edit-url');
            const editThumb = li.querySelector('.edit-thumb');
            const editFile = li.querySelector('.edit-file');

            const openEdit = () => {
                itemRow.style.display = 'none';
                editForm.style.display = 'flex';
                editNameInput.focus();
                editNameInput.select();
            };
            const closeEdit = () => {
                itemRow.style.display = 'flex';
                editForm.style.display = 'none';
            };

            li.querySelector('.btn-edit').addEventListener('click', openEdit);
            li.querySelector('.btn-cancel-edit').addEventListener('click', closeEdit);

            if (editFile) {
                editFile.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                        item._pendingImage = ev.target.result;
                        if (editThumb) editThumb.src = ev.target.result;
                        if (editUrlInput) editUrlInput.value = '';
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (editUrlInput && editThumb) {
                editUrlInput.addEventListener('input', () => {
                    editThumb.src = editUrlInput.value || 'img/1.png';
                    item._pendingImage = null;
                });
            }

            li.querySelector('.btn-save-edit').addEventListener('click', () => {
                const newName = editNameInput.value.trim();
                if (!newName) { editNameInput.focus(); return; }
                const idx = this.items.findIndex(i => i.id === item.id);
                if (idx === -1) return;
                this.items[idx].name = newName;
                if (!this.settings.isTextMode) {
                    if (item._pendingImage) {
                        this.items[idx].image = item._pendingImage;
                    } else if (editUrlInput && editUrlInput.value.trim()) {
                        this.items[idx].image = editUrlInput.value.trim();
                    }
                }
                delete item._pendingImage;
                this.updateUI();
                this.renderManageList();
            });

            editNameInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') li.querySelector('.btn-save-edit').click();
                if (e.key === 'Escape') closeEdit();
            });

            li.querySelector('.btn-del').addEventListener('click', () => {
                this.items = this.items.filter(i => i.id !== item.id);
                this.updateUI();
                this.renderManageList();
            });

            this.$manageItemList.appendChild(li);
        });

        if (filtered.length > limit) {
            const li = document.createElement('li');
            li.className = 'text-center text-xs text-muted w-full block py-3';
            li.style.border = 'none';
            li.innerHTML = `<i class="fa-solid fa-ellipsis"></i> Showing first ${limit} of ${filtered.length} matches. Use search to find more.`;
            this.$manageItemList.appendChild(li);
        }
    }

    renderPresetList() {
        if (!this.$presetList) return;
        this.$presetList.innerHTML = '';
        if (this.presets.length === 0) {
            this.$presetList.innerHTML = `<li class="text-muted text-center w-full block">No custom presets saved.</li>`;
            return;
        }

        this.presets.forEach(preset => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <i class="fa-solid fa-folder"></i>
                    <span>${preset.name} (${preset.items.length} items)</span>
                </div>
                <div class="actions">
                    <button class="btn-icon small text-success btn-load" title="Load Preset"><i class="fa-solid fa-download"></i></button>
                    <button class="btn-icon small text-danger btn-del" title="Delete Preset"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            li.querySelector('.btn-load').addEventListener('click', () => {
                this.showConfirm("Load Preset?", `All current un-saved items will be replaced by '${preset.name}'.`, () => {
                    this.items = JSON.parse(JSON.stringify(preset.items));
                    this.settings.currentPresetName = preset.name;
                    this.drawnItems = [];
                    this.hasSpunOnce = false;
                    if (this.$winnerText) this.$winnerText.textContent = 'Ready to Spin';
                    if (this.$winnerReveal) this.$winnerReveal.classList.remove('hidden');
                    this.updateUI();
                    this.renderManageList();
                }, 'warning', 'modal-settings');
            });
            li.querySelector('.btn-del').addEventListener('click', () => {
                this.showConfirm("Delete Preset?", `Delete preset '${preset.name}' permanently?`, () => {
                    this.presets = this.presets.filter(p => p.id !== preset.id);
                    this.saveStorage();
                    this.renderPresetList();
                });
            });
            this.$presetList.appendChild(li);
        });
    }

    /* -------------------------------------------------------------
       RANDOMIZER ENGINE (SPIN LOGIC)
    ------------------------------------------------------------- */
    spin(isSync = false, forcedWinner = null) {
        if (this.isSpinning || this.items.length === 0) return;
        if (!this.$slotReel || !this.$slotWindow) return;
        this.isSpinning = true;
        this.hasSpunOnce = true;
        
        // Define exact winner early so both screens show the exact same item
        let winner;
        if (forcedWinner) {
            winner = forcedWinner;
        } else {
            const winnerIndex = Math.floor(Math.random() * this.items.length);
            winner = this.items[winnerIndex];
        }

        // Only the initiating screen broadcasts the trigger AND the specific winner
        if (!isSync) {
            this.syncChannel.postMessage({ type: 'SPIN_TRIGGER', winner: winner });
        }
        
        // Hide UI states
        if (this.$winnerText) this.$winnerText.textContent = 'Spinning...';
        this.$slotReel.innerHTML = '';
        
        if (this.$btnSpin) {
            this.$btnSpin.disabled = true;
            const spinTextEl = this.$btnSpin.querySelector('.spin-text');
            if (spinTextEl) spinTextEl.textContent = "Spinning...";
        }

        const isX = this.settings.spinAxis === 'x';
        this.$slotReel.style.flexDirection = isX ? 'row' : 'column';

        // Preload layout
        const reelLength = 30; // 30 items for long spin effect
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < reelLength; i++) {
            const item = (i === reelLength - 3) 
                ? winner // The exact winning spot near the end
                : this.items[Math.floor(Math.random() * this.items.length)];
            
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.style.width = isX ? this.$slotWindow.clientWidth + 'px' : '100%';
            div.style.height = isX ? '100%' : this.$slotWindow.clientHeight + 'px';
            
            if (this.settings.isTextMode) {
                div.innerHTML = `<span class="slot-text">${this.censorText(item.name)}</span>`;
            } else {
                div.innerHTML = `<img src="${item.image || ''}" onerror="this.src='img/1.png'" alt="${item.name}">`;
            }
            fragment.appendChild(div);
        }
        
        this.$slotReel.appendChild(fragment);

        // Apply Transform & Transition
        const itemSize = isX ? this.$slotWindow.clientWidth : this.$slotWindow.clientHeight;
        const targetPos = (reelLength - 3) * itemSize; // Move up to the winner

        let easing = "cubic-bezier(0.15, 0.8, 0.2, 1)"; // normal
        if (this.settings.animStyle === 'bouncy') easing = "cubic-bezier(0.34, 1.56, 0.64, 1)";
        else if (this.settings.animStyle === 'random') {
            easing = Math.random() > 0.5 ? "cubic-bezier(0.15, 0.8, 0.2, 1)" : "cubic-bezier(0.34, 1.56, 0.64, 1)";
        }

        // Setup Reset Frame
        this.$slotReel.style.transition = 'none';
        this.$slotReel.style.transform = isX ? `translateX(0)` : `translateY(0)`;
        
        // Trigger Reflow using a simple hack
        void this.$slotReel.offsetHeight; 

        // Apply Animation
        this.$slotReel.style.transition = `transform ${this.settings.spinDuration}s ${easing}`;
        this.$slotReel.style.transform = isX ? `translateX(-${targetPos}px)` : `translateY(-${targetPos}px)`;

        setTimeout(() => this.finishSpin(winner, isSync), this.settings.spinDuration * 1000 + 100);
    }

    finishSpin(winner, isSync = false) {
        this.isSpinning = false;
        if (this.$btnSpin) {
            this.$btnSpin.disabled = false;
            const spinTextEl = this.$btnSpin.querySelector('.spin-text');
            if (spinTextEl) spinTextEl.textContent = 'Spin Again';
        }

        // Only log to history and save state if WE initiated the spin
        // This prevents double-entries in history when multiple tabs finish spinning
        if (!isSync) {
            const logEntry = {
                ...winner,
                drawnAt: new Date().toLocaleString()
            };
            this.drawnItems.push(logEntry);

            // Remove item if setting enabled
            if (this.settings.removeItemAfterSpin) {
                this.items = this.items.filter(item => item.id !== winner.id);
                this.renderManageList();
            }

            // Update counts and sidebar lists without re-rendering the slot
            if (this.$countRemaining) this.$countRemaining.textContent = this.items.length;
            if (this.$countDrawn) this.$countDrawn.textContent = this.drawnItems.length;
            if (this.$drawnList) this.renderList(this.$drawnList, [...this.drawnItems].reverse(), true);
            if (!this.settings.removeItemAfterSpin && this.$availableList) {
                this.renderList(this.$availableList, this.items, false);
            }
            this.saveStorage();
        }

        // Reveal Winner
        if (this.$winnerText) this.$winnerText.textContent = this.censorText(winner.name);
        if (this.$winnerReveal) this.$winnerReveal.classList.remove('hidden');

        // Confetti
        if (this.settings.isGlowEnabled) {
            this.fireConfetti();
        }
    }

    renderIdleSlot() {
        if (!this.$slotReel || !this.$slotWindow) return;
        clearTimeout(this._idleSlotTimer);
        this.$slotReel.innerHTML = '';
        this.$slotReel.style.transition = 'none';
        this.$slotReel.style.transform = 'translate(0, 0)';

        const isX = this.settings.spinAxis === 'x';
        this.$slotReel.style.flexDirection = isX ? 'row' : 'column';

        this._idleSlotTimer = setTimeout(() => {
            if (!this.$slotReel || !this.$slotWindow) return;
            const itemWidth = this.$slotWindow.clientWidth;
            const itemHeight = this.$slotWindow.clientHeight;

            if (this.isNameRoom && !this.hasSpunOnce) {
                const div = document.createElement('div');
                div.className = 'slot-item';
                div.style.width = isX ? itemWidth + 'px' : '100%';
                div.style.height = isX ? '100%' : itemHeight + 'px';
                div.innerHTML = `<span class="slot-text" style="opacity: 0.5;">Wait...</span>`;
                this.$slotReel.appendChild(div);
                return;
            }

            const itemsToDisplay = this.items.slice(0, 3);
            if (itemsToDisplay.length === 0) return;

            const fragment = document.createDocumentFragment();
            itemsToDisplay.forEach(item => {
                const div = document.createElement('div');
                div.className = 'slot-item';
                div.style.width = isX ? itemWidth + 'px' : '100%';
                div.style.height = isX ? '100%' : itemHeight + 'px';

                if (this.settings.isTextMode) {
                    div.innerHTML = `<span class="slot-text" style="opacity: 0.8;">${this.censorText(item.name)}</span>`;
                } else {
                    div.innerHTML = `<img src="${item.image || ''}" onerror="this.src='img/1.png'" alt="${item.name}" style="opacity: 0.8; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));">`;
                }
                fragment.appendChild(div);
            });
            this.$slotReel.appendChild(fragment);
        }, 50);
    }

    /* -------------------------------------------------------------
       CONFETTI LOGIC
    ------------------------------------------------------------- */
    fireConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        const particles = [];
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height + 10,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 1) * 25 - 5,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.8,
                friction: 0.98
            });
        }

        let isAnimating = true;
        const animate = () => {
            if (!isAnimating) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= p.friction;
                p.rotation += p.rotationSpeed;

                if (p.y < canvas.height + 50) active = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            });

            if (active) requestAnimationFrame(animate);
            else {
                isAnimating = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        animate();
    }

    /* -------------------------------------------------------------
       FULL VIEW MODAL LOGIC
    ------------------------------------------------------------- */
    openFullView(mode) {
        if (!this.$modalFullList) return;
        const lang = this.settings.lang || 'en';
        const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || {};

        this.$modalFullList.setAttribute('data-mode', mode);
        if (this.$fullListTitle) {
            this.$fullListTitle.innerHTML = mode === 'remaining'
                ? `<i class="fa-solid fa-list-ul"></i> ${dict['remaining-items'] || 'Remaining Items'}`
                : `<i class="fa-solid fa-clock-rotate-left"></i> ${dict['history-log'] || 'History Log'}`;
        }

        if (this.$inputSearchFull) this.$inputSearchFull.value = '';
        this.renderFullView(mode);
        this.$modalFullList.classList.add('active');
    }

    renderFullView(mode) {
        if (!this.$fullViewList) return;
        this.$fullViewList.innerHTML = '';
        const search = this.$inputSearchFull ? this.$inputSearchFull.value.toLowerCase() : '';
        
        const sourceData = mode === 'remaining' ? this.items : [...this.drawnItems].reverse();
        const filtered = sourceData.filter(item => (item.name || '').toLowerCase().includes(search));

        if (filtered.length === 0) {
            this.$fullViewList.innerHTML = `<li class="text-muted text-center w-full block">No matching items found.</li>`;
            return;
        }

        // Render all (no limit for full view)
        filtered.forEach(item => {
            const li = document.createElement('li');
            const thumbHtml = this.settings.isTextMode ? '' : `<img class="thumb" src="${item.image || ''}" onerror="this.src='img/1.png'">`;
            li.innerHTML = `
                <div class="item-info">
                    ${thumbHtml}
                    <span>${item.name}</span>
                </div>
                ${mode === 'history' && item.drawnAt ? `<span class="text-xs text-muted">${item.drawnAt}</span>` : ''}
            `;
            this.$fullViewList.appendChild(li);
        });
    }
}

// Ensure execution
window.addEventListener('DOMContentLoaded', () => {
    window.app = new RandomizerApp();
});
