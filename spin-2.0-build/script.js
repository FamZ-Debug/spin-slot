/**
 * Pro Randomizer 2.0
 * Clean, Object-Oriented rewritten version.
 */

const DEFAULT_ITEMS = [
    { id: 1710300000000, name: "(HC) Super Super Speed", image: "img/tr/(HC) Super Super Speed.png" },
    { id: 1710300000001, name: "(HC) วิ่งข้ามรั้วเทรนนิ่ง", image: "img/tr/(HC) วิ่งข้ามรั้วเทรนนิ่ง.png" },
    { id: 1710300000002, name: "(HC) เทรนนิ่ง MIX", image: "img/tr/(HC) เทรนนิ่ง MIX.png" },
    { id: 1710300000003, name: "(HC) เทรนนิ่งสปีด", image: "img/tr/(HC) เทรนนิ่งสปีด.png" },
    { id: 1710300000004, name: "การต่อต้านของกิ้งก่าวัยรุ่น", image: "img/tr/การต่อต้านของกิ้งก่าวัยรุ่น.png" },
    { id: 1710300000005, name: "การต่อต้านของหมึกวัยรุ่น", image: "img/tr/การต่อต้านของหมึกวัยรุ่น.png" },
    { id: 1710300000006, name: "การผจญภัยของพิน็อคคิโอ", image: "img/tr/การผจญภัยของพิน็อคคิโอ.png" },
    { id: 1710300000007, name: "การหลบหนีของปีศาจกระทิง", image: "img/tr/การหลบหนีของปีศาจกระทิง.png" },
    { id: 1710300000008, name: "คนเป่าปี่แห่งฮาเมล์น", image: "img/tr/คนเป่าปี่แห่งฮาเมล์น.png" },
    { id: 1710300000009, name: "จิ๊กซอว์ Up&Down(N)", image: "img/tr/จิ๊กซอว์ Up&Down(N).png" },
    { id: 1710300000010, name: "จิ๊กซอว์ปีเตอร์แพน", image: "img/tr/จิ๊กซอว์ปีเตอร์แพน.png" },
    { id: 1710300000011, name: "จิ๊กซอว์แดช", image: "img/tr/จิ๊กซอว์แดช.png" },
    { id: 1710300000012, name: "ซุปเปอร์จัมพ์ 2", image: "img/tr/ซุปเปอร์จัมพ์ 2.png" },
    { id: 1710300000013, name: "ซุปเปอร์จัมพ์ 3", image: "img/tr/ซุปเปอร์จัมพ์ 3.png" },
    { id: 1710300000014, name: "ตะวันกับจันทรา", image: "img/tr/ตะวันกับจันทรา.png" },
    { id: 1710300000015, name: "ตามหาเจ้าหญิงหิมะ", image: "img/tr/ตามหาเจ้าหญิงหิมะ.png" },
    { id: 1710300000016, name: "บล็อคนรก", image: "img/tr/บล็อคนรก.png" },
    { id: 1710300000017, name: "บอสสามเกลอเดือด(N)", image: "img/tr/บอสสามเกลอเดือด(N).png" },
    { id: 1710300000018, name: "ปีเตอร์แพน", image: "img/tr/ปีเตอร์แพน.png" },
    { id: 1710300000019, name: "ฝึกฝนจิ๊กซอว์(H หน้า)", image: "img/tr/ฝึกฝนจิ๊กซอว์(H หน้า).png" },
    { id: 1710300000020, name: "พักเที่ยงอลเวง", image: "img/tr/พักเที่ยงอลเวง.png" },
    { id: 1710300000021, name: "พ่อมดแห่งออซ", image: "img/tr/พ่อมดแห่งออซ.png" },
    { id: 1710300000022, name: "รวมมิตรจิ๊กซอว์ 2", image: "img/tr/รวมมิตรจิ๊กซอว์ 2.png" },
    { id: 1710300000023, name: "รวมมิตรจิ๊กซอว์", image: "img/tr/รวมมิตรจิ๊กซอว์.png" },
    { id: 1710300000024, name: "ลุงหมึกมหาโหด(N)", image: "img/tr/ลุงหมึกมหาโหด(N).png" },
    { id: 1710300000025, name: "วิกฤตการณ์ของลุงกิ้งก่า(N)", image: "img/tr/วิกฤตการณ์ของลุงกิ้งก่า(N).png" },
    { id: 1710300000026, name: "วิ่งข้ามรั้ว(N)", image: "img/tr/วิ่งข้ามรั้ว(N).png" },
    { id: 1710300000027, name: "หนูน้อยหมวกแดงกลายร่าง (N)", image: "img/tr/หนูน้อยหมวกแดงกลายร่าง (N).png" },
    { id: 1710300000028, name: "อาลาดิน(N)", image: "img/tr/อาลาดิน(N).png" },
    { id: 1710300000029, name: "เจ้าชายกบ", image: "img/tr/เจ้าชายกบ.png" },
    { id: 1710300000030, name: "ไดเมนชั่น _ แอคทีฟ", image: "img/tr/ไดเมนชั่น _ แอคทีฟ.png" },
    { id: 1710300000031, name: "ไตรกีฬา", image: "img/tr/ไตรกีฬา.png" }
];

const DEFAULT_SETTINGS = {
    spinDuration: 3.5,
    isGlowEnabled: false,
    glowColor: '#0074ff',
    pulseColor: '#ffffff',
    slotBgColor: '#000000',
    spinAxis: 'y',
    animStyle: 'normal',
    lang: 'en',
    currentPresetName: 'TR Preset (เริ่มต้น)'
};

class RandomizerApp {
    constructor() {
        this.items = [...DEFAULT_ITEMS];
        this.drawnItems = [];
        this.presets = [];
        this.settings = { ...DEFAULT_SETTINGS };
        
        this.isSpinning = false;
        this.uploadedImageBase64 = null;

        this.initDOM();
        this.loadStorage();
        this.bindEvents();
        this.updateUI();
    }

    initDOM() {
        // Core elements
        this.$availableList = document.getElementById('available-list');
        this.$drawnList = document.getElementById('drawn-list');
        this.$countRemaining = document.getElementById('count-remaining');
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
        
        // Manage Items
        this.$inputNewItem = document.getElementById('input-new-item');
        this.$inputItemImage = document.getElementById('input-item-image');
        this.$inputItemUrl = document.getElementById('input-item-url');
        this.$manageItemList = document.getElementById('manage-item-list');
        this.$searchInput = document.getElementById('input-search-items');
        
        // Presets
        this.$presetList = document.getElementById('preset-list');
        this.$inputPresetName = document.getElementById('input-preset-name');
        
        // Manage Multi
        this.$manageCount = document.getElementById('manage-count');
        this.$bulkSection = document.getElementById('bulk-add-section');
        this.$textareaBulk = document.getElementById('textarea-bulk');
    }

    /* -------------------------------------------------------------
       STORAGE
    ------------------------------------------------------------- */
    loadStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('prorandomizer_v2'));
            if (data) {
                if (data.items) this.items = data.items;
                if (data.presets) this.presets = data.presets;
                if (data.settings) this.settings = { ...this.settings, ...data.settings };
            }
        } catch(e) { console.error("Could not parse storage data", e); }
        this.applySettingsToDOM();
    }

    saveStorage() {
        const data = {
            items: this.items,
            presets: this.presets,
            settings: this.settings
        };
        localStorage.setItem('prorandomizer_v2', JSON.stringify(data));
    }

    applySettingsToDOM() {
        this.$inputDuration.value = this.settings.spinDuration;
        this.$valDuration.textContent = this.settings.spinDuration + 's';
        this.$inputGlowEnable.checked = this.settings.isGlowEnabled;
        this.$inputColorGlow.value = this.settings.glowColor;
        this.$inputColorPulse.value = this.settings.pulseColor;
        this.$inputColorBg.value = this.settings.slotBgColor;

        // Apply visual updates variables
        document.documentElement.style.setProperty('--glow-color', this.settings.isGlowEnabled ? this.settings.glowColor : 'transparent');
        document.documentElement.style.setProperty('--pulse-rgb', this.hexToRgb(this.settings.pulseColor));
        this.$slotWindow.style.backgroundColor = this.settings.slotBgColor;

        document.querySelector(`input[name="anim-style"][value="${this.settings.animStyle}"]`).checked = true;
        document.querySelector(`input[name="spin-axis"][value="${this.settings.spinAxis}"]`).checked = true;
    }

    hexToRgb(hex) {
        let r = 255, g = 255, b = 255;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `${r}, ${g}, ${b}`;
    }

    /* -------------------------------------------------------------
       UI UPDATES & RENDERING
    ------------------------------------------------------------- */
    updateUI() {
        this.$countRemaining.textContent = this.items.length;
        this.$countDrawn.textContent = this.drawnItems.length;
        document.getElementById('preset-display-label').textContent = `Preset: ${this.settings.currentPresetName || 'Custom'}`;

        this.renderList(this.$availableList, this.items, false);
        this.renderList(this.$drawnList, [...this.drawnItems].reverse(), true);

        if (this.items.length === 0) {
            this.$btnSpin.disabled = true;
            this.$btnSpin.querySelector('.spin-text').textContent = 'Empty';
            this.$slotReel.innerHTML = '';
        } else {
            this.$btnSpin.disabled = false;
            this.$btnSpin.querySelector('.spin-text').textContent = 'Spin Now!';
            if(!this.isSpinning) this.renderIdleSlot();
        }
        this.saveStorage();
    }

    renderList(container, itemsArray, isHistory) {
        container.innerHTML = '';
        itemsArray.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img class="list-thumb" src="${item.image || ''}" onerror="this.src='img/1.png'">
                <span class="item-name text-truncate">${item.name}</span>
            `;
            container.appendChild(li);
        });
    }

    /* -------------------------------------------------------------
       MODALS & SETTINGS EVENTS
    ------------------------------------------------------------- */
    bindEvents() {
        // Spin Trigger
        this.$btnSpin.addEventListener('click', () => this.spin());

        // Reset & History
        document.getElementById('btn-reset').addEventListener('click', () => {
             this.showConfirm("Reset Everything?", "This will put all drawn items back.", () => {
                 this.drawnItems = [];
                 this.$winnerText.textContent = 'Ready to Spin';
                 this.$slotReel.innerHTML = '';
                 this.updateUI();
             });
        });

        // Modals opening
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.renderManageList();
            this.renderPresetList();
            document.getElementById('modal-settings').classList.add('active');
        });
        document.getElementById('btn-add-quick').addEventListener('click', () => {
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
        this.$inputDuration.addEventListener('input', e => {
            this.settings.spinDuration = e.target.value;
            this.$valDuration.textContent = e.target.value + 's';
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

        document.querySelectorAll('input[name="spin-axis"]').forEach(r => {
            r.addEventListener('change', e => { this.settings.spinAxis = e.target.value; this.saveStorage(); });
        });
        document.querySelectorAll('input[name="anim-style"]').forEach(r => {
            r.addEventListener('change', e => { this.settings.animStyle = e.target.value; this.saveStorage(); });
        });

        document.getElementById('btn-settings-reset').addEventListener('click', () => {
            this.settings = { ...DEFAULT_SETTINGS };
            this.applySettingsToDOM();
            this.saveStorage();
        });

        // Add Item Image preview
        this.$inputItemImage.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                this.uploadedImageBase64 = ev.target.result;
                document.getElementById('preview-img').src = this.uploadedImageBase64;
                document.getElementById('preview-name').textContent = file.name;
                document.getElementById('image-preview-wrapper').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btn-clear-preview').addEventListener('click', () => {
            this.uploadedImageBase64 = null;
            this.$inputItemImage.value = '';
            document.getElementById('image-preview-wrapper').classList.add('hidden');
        });

        document.getElementById('btn-add-item').addEventListener('click', () => {
            const name = this.$inputNewItem.value.trim();
            const url = this.$inputItemUrl.value.trim();
            
            if (name) {
                const finalImage = url || this.uploadedImageBase64 || 'img/1.png';
                
                this.items.push({
                    id: Date.now(),
                    name: name,
                    image: finalImage
                });
                
                this.$inputNewItem.value = '';
                this.$inputItemUrl.value = '';
                document.getElementById('btn-clear-preview').click();
                this.settings.currentPresetName = 'Custom';
                this.updateUI();
                this.renderManageList();
            }
        });

        this.$searchInput.addEventListener('input', () => this.renderManageList());

        // Manage Items Actions
        document.getElementById('btn-clear-all').addEventListener('click', () => {
            this.showConfirm("Clear All Items?", "This will remove all items from the current list.", () => {
                this.items = [];
                this.settings.currentPresetName = 'Empty';
                this.updateUI();
                this.renderManageList();
            });
        });

        document.getElementById('btn-bulk-add').addEventListener('click', () => {
            this.$bulkSection.classList.toggle('hidden');
            if (!this.$bulkSection.classList.contains('hidden')) {
                this.$textareaBulk.focus();
            }
        });

        document.getElementById('btn-close-bulk').addEventListener('click', () => {
            this.$bulkSection.classList.add('hidden');
        });

        document.getElementById('btn-process-bulk').addEventListener('click', () => {
            const raw = this.$textareaBulk.value.trim();
            if (!raw) return;
            const names = raw.split('\n').map(n => n.trim()).filter(n => n !== '');
            if (names.length === 0) return;
            
            names.forEach((name, i) => {
                this.items.push({
                    id: Date.now() + i,
                    name: name,
                    image: 'img/1.png'
                });
            });
            
            this.$textareaBulk.value = '';
            this.$bulkSection.classList.add('hidden');
            this.settings.currentPresetName = 'Custom';
            this.updateUI();
            this.renderManageList();
        });

        // Preset Saving
        document.getElementById('btn-save-preset').addEventListener('click', () => {
            const name = this.$inputPresetName.value.trim();
            if (!name) return;
            this.presets.push({
                id: Date.now(),
                name: name,
                items: JSON.parse(JSON.stringify(this.items))
            });
            this.settings.currentPresetName = name;
            this.$inputPresetName.value = '';
            this.renderPresetList();
            this.updateUI();
        });
        
        // Export & Import
        document.getElementById('btn-export-data').addEventListener('click', () => {
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
        });

        document.getElementById('input-import-data').addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.items) this.items = data.items;
                    if (data.presets) this.presets = data.presets;
                    if (data.settings) this.settings = data.settings;
                    this.applySettingsToDOM();
                    this.updateUI();
                    this.renderPresetList();
                    this.renderManageList();
                    alert("Data imported successfully!");
                } catch(e) { alert("Invalid file format"); }
            };
            reader.readAsText(file);
        });
        
        // Export History
        document.getElementById('btn-export-history').addEventListener('click', () => {
            if (this.drawnItems.length === 0) return;
            let text = `Pro Randomizer - History Log\nDate: ${new Date().toLocaleString()}\n---------------------------------------\n`;
            [...this.drawnItems].reverse().forEach((it, i) => {
                text += `${i + 1}. ${it.name}\n`;
            });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([text], {type: 'text/plain'}));
            a.download = `history_${Date.now()}.txt`;
            a.click();
        });
    }

    showConfirm(title, desc, callback) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-desc').textContent = desc;
        const confirmModal = document.getElementById('modal-confirm');
        confirmModal.classList.add('active');
        
        const confirmBtn = document.getElementById('btn-confirm-action');
        // Clear previous listeners by replacing node
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', () => {
            callback();
            confirmModal.classList.remove('active');
        });
    }

    renderManageList() {
        this.$manageItemList.innerHTML = '';
        this.$manageCount.textContent = this.items.length;
        const search = this.$searchInput.value.toLowerCase();
        
        const filtered = this.items.filter(item => item.name.toLowerCase().includes(search));
        if (filtered.length === 0) {
            this.$manageItemList.innerHTML = `<li class="text-muted text-center w-full block">No matching items found.</li>`;
            return;
        }

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <img class="thumb" src="${item.image || ''}" onerror="this.src='img/1.png'">
                    <span>${item.name}</span>
                </div>
                <div class="actions">
                    <button class="btn-icon small text-danger btn-del" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            li.querySelector('.btn-del').addEventListener('click', () => {
                if(this.items.length <= 1) return alert("Need at least 1 item!");
                this.items = this.items.filter(i => i.id !== item.id);
                this.updateUI();
                this.renderManageList();
            });
            this.$manageItemList.appendChild(li);
        });
    }

    renderPresetList() {
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
                    this.updateUI();
                    this.renderManageList();
                });
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
    spin() {
        if (this.isSpinning || this.items.length === 0) return;
        this.isSpinning = true;
        
        // Hide UI states
        this.$winnerText.textContent = 'Spinning...';
        this.$slotReel.innerHTML = '';
        
        this.$btnSpin.disabled = true;
        this.$btnSpin.querySelector('.spin-text').textContent = "Spinning...";

        // Logic
        const winnerIndex = Math.floor(Math.random() * this.items.length);
        const winner = this.items[winnerIndex];

        // Draw multiple times to make reel long realistically
        const isX = this.settings.spinAxis === 'x';
        this.$slotWindow.style.flexDirection = isX ? 'row' : 'column';

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
            div.innerHTML = `<img src="${item.image || ''}" onerror="this.src='img/1.png'" alt="${item.name}">`;
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

        setTimeout(() => this.finishSpin(winner), this.settings.spinDuration * 1000 + 100);
    }

    finishSpin(winner) {
        this.drawnItems.push(winner);
        this.updateUI();

        // Reveal Winner
        this.$winnerText.textContent = winner.name;
        this.$winnerReveal.classList.remove('hidden');

        // Confetti
        if (this.settings.isGlowEnabled) {
            this.fireConfetti();
        }

        this.isSpinning = false;
        this.$btnSpin.disabled = false;
        this.$btnSpin.querySelector('.spin-text').textContent = 'Spin Again';
    }

    renderIdleSlot() {
        this.$slotReel.innerHTML = '';
        this.$slotReel.style.transition = 'none';
        this.$slotReel.style.transform = 'translate(0, 0)';
        
        const isX = this.settings.spinAxis === 'x';
        this.$slotWindow.style.flexDirection = isX ? 'row' : 'column';

        // Render just 3 random items to fill the view
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 3; i++) {
            const item = this.items[Math.floor(Math.random() * this.items.length)];
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.style.width = isX ? this.$slotWindow.clientWidth + 'px' : '100%';
            div.style.height = isX ? '100%' : this.$slotWindow.clientHeight + 'px';
            div.innerHTML = `<img src="${item.image || ''}" onerror="this.src='img/1.png'" alt="${item.name}" style="opacity: 0.8; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));">`;
            fragment.appendChild(div);
        }
        this.$slotReel.appendChild(fragment);
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
            else isAnimating = false;
        };
        requestAnimationFrame(animate);
    }
}

// Ensure execution
window.addEventListener('DOMContentLoaded', () => {
    window.app = new RandomizerApp();
});
