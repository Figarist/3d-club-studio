// Контролер генерації інженерного паспорта деталі для черги 3D-друку (Anycubic i3 Mega, HiDPI/Retina 2x Canvas, Друк, Буфер обміну)
(function () {
  const t = (key, vars) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(key, vars) : key;
  const getLocale = () => (typeof window !== 'undefined' && window.StudioI18n && typeof window.StudioI18n.getLocaleTag === 'function') ? window.StudioI18n.getLocaleTag() : 'uk-UA';
  const locMission = (m) => (m && typeof window !== 'undefined' && window.StudioI18n && typeof window.StudioI18n.localizeMission === 'function') ? window.StudioI18n.localizeMission(m) : m;

  const getPixelGridGroups = (activeTab, snapshot, mcGen) => {
    if (activeTab !== 'minecraft') return null;
    const source = snapshot || mcGen?.lastConnectivity;
    if (!source) return null;
    if (Number(source.activeCount) === 0) return 0;
    const count = Number(source.gridGroups ?? source.islands ?? source.finalIslands);
    return Number.isFinite(count) && count >= 0 ? count : null;
  };

  const formatPixelGridGroups = (count) => count === null
    ? t('js.pp.groups_na')
    : t('js.pp.groups_val', { n: count });

  class PassportPrintController {
    constructor() {
      this.selectedVersion = 'V2';
    }

    getPairCode() {
      if (window.SafeStorage) {
        return window.SafeStorage.getItem('3d_kuznya_pair_code') || '';
      }
      return '';
    }

    setPairCode(code) {
      if (window.SafeStorage) {
        window.SafeStorage.setItem('3d_kuznya_pair_code', code);
      }
    }

    updatePrintCardContent(options = {}) {
      const dom = options.domCache || {};
      const chosenVer = options.version || this.selectedVersion || 'V2';
      this.selectedVersion = chosenVer;

      const v1Snap = options.v1Snapshot;
      const isV1 = chosenVer === 'V1' && !!v1Snap;
      const snap = isV1 ? v1Snap : null;

      const pairCode = dom.cardPairInput?.value?.trim() || this.getPairCode() || t('js.pp.pair_default');
      if (dom.pCardPair) dom.pCardPair.textContent = pairCode;

      const now = new Date();
      const dateStr = now.toLocaleDateString(getLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (dom.pCardDate) dom.pCardDate.textContent = isV1 && snap.displayTime ? `V1 (${snap.displayTime})` : dateStr;

      // Зображення попереднього перегляду
      if (dom.pCardImg) {
        if (isV1 && snap.thumbnail) {
          dom.pCardImg.src = snap.thumbnail;
        } else if (options.sceneManager?.renderer) {
          if (options.sceneManager.popAnimBlocks && options.sceneManager.popAnimBlocks.length > 0) {
            options.sceneManager.popAnimBlocks.forEach((item) => {
              item.mesh.position.y = item.targetY;
              item.mesh.scale.copy(item.targetScale);
            });
            options.sceneManager.popAnimBlocks = [];
          }
          options.sceneManager.renderer.render(options.sceneManager.scene, options.sceneManager.camera);
          dom.pCardImg.src = options.sceneManager.renderer.domElement.toDataURL('image/png');
        }
      }

      // Назва файлу
      const baseFilename = options.filename || 'model.stl';
      const verSuffix = isV1 ? '_V1_draft.stl' : '_V2_final.stl';
      const displayFilename = baseFilename.replace(/\.stl$/i, verSuffix);
      if (dom.pCardFilename) dom.pCardFilename.textContent = displayFilename;

      // Місія
      const mission = locMission(options.mission);
      if (dom.pCardMission) {
        dom.pCardMission.textContent = mission ? t('js.pp.mission_val', { id: mission.id, title: mission.title }) : t('js.free_modeling');
      }

      // Габарити
      const d = isV1 ? snap.dimensions : (options.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      const activeTab = isV1 ? snap.activeTab : options.activeTab;
      if (dom.pCardDims) {
        dom.pCardDims.textContent = `${d.x} × ${d.y} × ${d.z} ${t('js.unit_mm')}`;
      }

      // Кількість 4-сусідніх груп редактора не перевіряє STL-меш або придатність до друку.
      const gridGroups = getPixelGridGroups(activeTab, snap, options.mcGen);
      if (dom.pCardConn) {
        dom.pCardConn.textContent = formatPixelGridGroups(gridGroups);
        dom.pCardConn.className = '';
      }

      // Підкладка
      const baseOn = isV1 ? snap.solidBase : !!(dom.mcSolidBase?.checked);
      if (dom.pCardBase) {
        dom.pCardBase.textContent = activeTab === 'minecraft'
          ? (baseOn ? t('js.pp.base_on') : t('js.pp.base_off'))
          : t('js.pp.base_na');
      }

      // Специфічний параметр
      if (dom.pCardCustomParam) {
        if (options.activeTab === 'minecraft') {
          const slot = dom.mcSlotWidth?.value || '2.0';
          const isStand = options.mcGen?.currentPresetKey === 'cardboard_stand' || options.mcGen?.currentPresetKey === 'slot_calibrator';
          if (isStand) {
            dom.pCardCustomParam.textContent = t('js.pp.param_slot', { slot });
          } else {
            const vox = dom.mcVoxelSize?.value || '2.0';
            const step = dom.mcHeightStep?.value || '1.2';
            dom.pCardCustomParam.textContent = t('js.pp.param_voxel', { vox, step });
          }
        } else if (options.activeTab === 'illusion') {
          dom.pCardCustomParam.textContent = t('js.pp.param_words', { w1: dom.ilWord1?.value || '', w2: dom.ilWord2?.value || '' });
        } else if (options.activeTab === 'physics') {
          dom.pCardCustomParam.textContent = t('js.pp.param_mech', { mode: dom.phSubmode?.value || 'catapult' });
        } else {
          dom.pCardCustomParam.textContent = t('js.pp.param_arch', { arch: dom.mobArchetype?.value || 'mob' });
        }
      }

      // Монохром
      const checks = options.checks || {};
      if (dom.pCardMono) {
        dom.pCardMono.textContent = checks.mono ? t('js.pp.mono_ok') : t('js.pp.mono_wait');
      }

      // Чек-лист
      if (dom.pCardChecklist && mission && mission.checklist) {
        dom.pCardChecklist.innerHTML = mission.checklist.map((item, idx) => {
          const isChecked = idx === 0 ? !!checks.connected : idx === 1 ? !!checks.mono : !!checks.size;
          return `<label class="checklist-item-preview"><input type="checkbox" ${isChecked ? 'checked' : ''} disabled /> ${item}</label>`;
        }).join('');
      }
    }

    openModal(options = {}) {
      const dom = options.domCache || {};
      if (!dom.printCardModal) return;

      const savedPair = this.getPairCode();
      if (dom.cardPairInput && !dom.cardPairInput.value && savedPair) {
        dom.cardPairInput.value = savedPair;
      }

      const version = options.version || 'V2';
      const chosenVer = (version === 'V1' && options.v1Snapshot) ? 'V1' : 'V2';
      if (dom.pVerV1) dom.pVerV1.checked = (chosenVer === 'V1');
      if (dom.pVerV2) dom.pVerV2.checked = (chosenVer === 'V2');

      this.updatePrintCardContent(Object.assign({}, options, { version: chosenVer }));
      dom.printCardModal.style.display = 'flex';
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    closeModal(domCache) {
      const dom = domCache || {};
      if (dom.printCardModal) {
        dom.printCardModal.style.display = 'none';
      }
      if (window.StudioSound) window.StudioSound.playPop(340);
    }

    // Рендеринг паспорта у ультра-високій роздільній здатності (Retina 2x: 1600 × 2200 px)
    renderRetinaCanvas(options, callback) {
      const dom = options.domCache || {};
      const isV1 = dom.pVerV1?.checked && !!options.v1Snapshot;
      const snap = isV1 ? options.v1Snapshot : null;
      const pairCode = dom.cardPairInput?.value?.trim() || this.getPairCode() || t('js.pp.pair_default');
      const mission = locMission(options.mission);
      const d = isV1 ? snap.dimensions : (options.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      const activeTab = isV1 ? snap.activeTab : options.activeTab;
      const gridGroups = getPixelGridGroups(activeTab, snap, options.mcGen);
      const verLabel = isV1 ? t('js.pp.ver_v1') : t('js.pp.ver_v2');
      const filename = (options.filename || 'model.stl').replace(/\.stl$/i, isV1 ? '_V1.stl' : '_V2.stl');
      const checks = options.checks || {};

      const scale = 2; // HiDPI Retina множник
      const logicalW = 800;
      const logicalH = 1100;

      const canvas = document.createElement('canvas');
      canvas.width = logicalW * scale;
      canvas.height = logicalH * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Фон — матовий білий папір вищого ґатунку
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, logicalW, logicalH);

      // Зовнішня прецизійна рамка креслення
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 760, 1060);

      // Тонка внутрішня лінія поля креслення (1px)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, 752, 1052);

      // Шапка технічного паспорта (Midnight Surface)
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(25, 25, 750, 70);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(t('js.pp.c_header'), 44, 54);

      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(t('js.pp.c_sub'), 44, 76);

      // Мета-рядок: Пара / Версія / Дата
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(25, 96, 750, 48);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 96, 750, 48);

      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(t('js.pp.c_pair', { pair: pairCode }), 44, 126);

      ctx.fillStyle = isV1 ? '#b45309' : '#047857';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(t('js.pp.c_ver', { ver: verLabel }), 360, 126);

      const now = new Date();
      const dateStr = now.toLocaleDateString(getLocale()) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#64748b';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.fillText(`📅 ${dateStr}`, 610, 126);

      const finishDrawing = (imgObj) => {
        // Поле 3D прев'ю (ліва колонка)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(40, 160, 310, 240);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 160, 310, 240);

        if (imgObj) {
          try {
            ctx.drawImage(imgObj, 40, 160, 310, 240);
          } catch (_) {}
        }

        // Блок 1: Інженерні характеристики (права колонка)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(366, 160, 394, 240);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(366, 160, 394, 240);

        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(t('js.pp.c_specs'), 382, 188);

        ctx.fillStyle = '#334155';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(t('js.pp.c_file', { file: filename.slice(0, 36) }), 382, 218);
        ctx.fillText(t('js.pp.c_mission', { id: mission ? mission.id : 0, title: mission ? mission.title.slice(0, 28) : t('js.free_modeling') }), 382, 246);
        ctx.fillText(t('js.pp.c_dims', { x: d.x, y: d.y, z: d.z }), 382, 274);

        ctx.fillStyle = '#334155';
        ctx.fillText(`🧩 ${formatPixelGridGroups(gridGroups)}`, 382, 302);

        ctx.fillStyle = '#334155';
        const baseText = activeTab === 'minecraft'
          ? (isV1 ? (snap.solidBase ? t('js.pp.base_on') : t('js.pp.base_off')) : (dom.mcSolidBase?.checked ? t('js.pp.base_on') : t('js.pp.base_off')))
          : t('js.pp.base_na');
        ctx.fillText(t('js.pp.c_base', { base: baseText }), 382, 330);

        let customParamText = '';
        if (options.activeTab === 'minecraft') {
          const isStand = options.mcGen?.currentPresetKey === 'cardboard_stand' || options.mcGen?.currentPresetKey === 'slot_calibrator';
          customParamText = isStand ? t('js.pp.param_slot', { slot: dom.mcSlotWidth?.value || '2.0' }) : `${dom.mcVoxelSize?.value || '2.0'} ${t('js.unit_mm')}`;
        } else if (options.activeTab === 'illusion') {
          customParamText = `"${dom.ilWord1?.value || ''}" / "${dom.ilWord2?.value || ''}"`;
        } else {
          customParamText = `${options.activeTab}`;
        }
        ctx.fillText(t('js.pp.c_param', { param: customParamText }), 382, 358);
        ctx.fillText(t('js.pp.c_mono', { mono: checks.mono ? t('js.pp.mono_ok') : t('js.pp.mono_wait') }), 382, 386);

        // Блок 2: Чек-лист взаємоперевірки учнів
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 416, 720, 134);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 416, 720, 134);

        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(t('js.pp.c_chk_title'), 56, 442);

        const chk1 = activeTab === 'minecraft'
          ? (checks.connected ? t('js.pp.c_chk1_ok') : t('js.pp.c_chk1_no'))
          : t('js.pp.c_chk1_na');
        const chk2 = checks.mono ? t('js.pp.c_chk2_ok') : t('js.pp.c_chk2_no');
        const chk3 = checks.size ? t('js.pp.c_chk3_ok') : t('js.pp.c_chk3_no');

        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = checks.connected && activeTab === 'minecraft' ? '#047857' : '#64748b';
        ctx.fillText(chk1, 56, 470);
        ctx.fillStyle = checks.mono ? '#047857' : '#64748b';
        ctx.fillText(chk2, 56, 496);
        ctx.fillStyle = checks.size ? '#047857' : '#64748b';
        ctx.fillText(chk3, 56, 522);

        // Блок 3: Службовий контроль викладача та черга друку
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, 564, 720, 460);
        ctx.strokeStyle = '#0f3460';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, 564, 720, 460);

        ctx.fillStyle = '#0f3460';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(t('js.pp.c_teacher'), 56, 594);

        ctx.font = '13.5px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f3460';

        ctx.fillText(t('js.pp.c_slicer'), 56, 630);
        ctx.fillText(t('js.pp.c_time'), 56, 658);
        ctx.fillText(t('js.pp.c_fil'), 420, 658);
        ctx.fillText(t('js.pp.c_layer'), 56, 686);

        ctx.fillText(t('js.pp.c_queue'), 56, 730);
        ctx.fillText(t('js.pp.c_qnum'), 56, 758);
        ctx.fillText(t('js.pp.c_start'), 420, 758);
        ctx.fillText(t('js.pp.c_temp'), 56, 786);

        ctx.fillText(t('js.pp.c_verdict'), 56, 830);
        ctx.fillText(t('js.pp.c_pass'), 76, 860);
        ctx.fillText(t('js.pp.c_fail'), 76, 890);

        ctx.fillText(t('js.pp.c_tsig'), 56, 940);
        ctx.fillText(t('js.pp.c_ssig'), 56, 975);

        // Підвал
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        // Static release check marker: 3D Кузня Чудес v2.3.0
        ctx.fillText(t('js.pp.c_footer'), 140, 1060);

        callback(canvas);
      };

      // Підготовка картинки
      const previewImgEl = dom.pCardImg;
      if (previewImgEl && previewImgEl.complete && previewImgEl.naturalWidth > 0) {
        finishDrawing(previewImgEl);
      } else {
        const tempImg = new Image();
        tempImg.onload = () => finishDrawing(tempImg);
        tempImg.onerror = () => finishDrawing(null);
        tempImg.src = previewImgEl?.src || '';
      }
    }

    downloadPassportPng(options = {}) {
      this.renderRetinaCanvas(options, (canvas) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pairCode = options.domCache?.cardPairInput?.value?.trim() || this.getPairCode() || t('js.pp.pair_clean');
          const cleanPair = pairCode.replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ_-]/g, '_');
          const filename = options.filename || 'model.stl';
          const isV1 = options.domCache?.pVerV1?.checked && !!options.v1Snapshot;
          const ver = isV1 ? 'V1' : 'V2';

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `passport_${cleanPair}_${filename.replace(/\.stl$/i, '')}_${ver}_Retina2x.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          if (window.StudioSound) window.StudioSound.playExportSuccess();
        }, 'image/png');
      });
    }

    copyPassport(options = {}) {
      this.renderRetinaCanvas(options, (canvas) => {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          canvas.toBlob((blob) => {
            if (!blob) return;
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
              .then(() => {
                alert(t('js.pp.copy_img_ok'));
                if (window.StudioSound) window.StudioSound.playPop(580);
              })
              .catch(() => {
                this._fallbackCopyText(options);
              });
          }, 'image/png');
        } else {
          this._fallbackCopyText(options);
        }
      });
    }

    _fallbackCopyText(options) {
      const dom = options.domCache || {};
      const pair = dom.cardPairInput?.value?.trim() || this.getPairCode() || t('js.pp.pair_default');
      const missionObj = locMission(options.mission);
      const mission = missionObj ? `#${missionObj.id} ${missionObj.title}` : t('js.free_modeling');
      const dims = dom.pCardDims?.textContent || '--';
      const conn = dom.pCardConn?.textContent || '--';
      const text = [
        t('passport.doc_title'),
        t('js.pp.c_pair', { pair }),
        `${t('passport.mission_lbl')} ${mission}`,
        `${t('js.cmp.dims')} ${dims}`,
        `${t('passport.spec_conn')} ${conn}`,
        `${t('passport.meta_date')} ${new Date().toLocaleString(getLocale())}`
      ].join('\n');

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert(t('js.pp.copy_txt_ok'));
        });
      } else {
        alert(text);
      }
    }

    printPassport() {
      window.print();
    }
  }

  window.PassportPrintController = PassportPrintController;
})();
