// Контролер генерації інженерного паспорта деталі для черги 3D-друку (Anycubic i3 Mega, HiDPI/Retina 2x Canvas, Друк, Буфер обміну)
(function () {
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

      const pairCode = dom.cardPairInput?.value?.trim() || this.getPairCode() || 'Пара #___';
      if (dom.pCardPair) dom.pCardPair.textContent = pairCode;

      const now = new Date();
      const dateStr = now.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
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
      const mission = options.mission;
      if (dom.pCardMission) {
        dom.pCardMission.textContent = mission ? `Місія #${mission.id}: ${mission.title}` : 'Вільне моделювання';
      }

      // Габарити
      const d = isV1 ? snap.dimensions : (options.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      if (dom.pCardDims) {
        dom.pCardDims.textContent = `${d.x} × ${d.y} × ${d.z} мм`;
      }

      // Зв'язність
      const conn = isV1 ? { finalIslands: snap.islands } : (options.mcGen?.lastConnectivity || { finalIslands: 1 });
      if (dom.pCardConn) {
        if (conn.finalIslands === 1) {
          dom.pCardConn.textContent = '✅ 1 суцільна деталь (без розривів)';
          dom.pCardConn.className = 'status-good';
        } else {
          dom.pCardConn.textContent = `🚨 ${conn.finalIslands} розірваних частин`;
          dom.pCardConn.className = 'status-bad';
        }
      }

      // Підкладка
      const baseOn = isV1 ? snap.solidBase : !!(dom.mcSolidBase?.checked);
      if (dom.pCardBase) {
        dom.pCardBase.textContent = baseOn ? 'Увімкнено (1.0 мм шар)' : 'Без підкладки';
      }

      // Специфічний параметр
      if (dom.pCardCustomParam) {
        if (options.activeTab === 'minecraft') {
          const slot = dom.mcSlotWidth?.value || '2.0';
          const isStand = options.mcGen?.currentPresetKey === 'cardboard_stand' || options.mcGen?.currentPresetKey === 'slot_calibrator';
          if (isStand) {
            dom.pCardCustomParam.textContent = `Паз картону: ${slot} мм (+0.2 мм допуск)`;
          } else {
            const vox = dom.mcVoxelSize?.value || '2.0';
            const step = dom.mcHeightStep?.value || '1.2';
            dom.pCardCustomParam.textContent = `Воксель: ${vox} мм, сходинка: ${step} мм`;
          }
        } else if (options.activeTab === 'illusion') {
          dom.pCardCustomParam.textContent = `Слова: "${dom.ilWord1?.value || ''}" ↔ "${dom.ilWord2?.value || ''}"`;
        } else if (options.activeTab === 'physics') {
          dom.pCardCustomParam.textContent = `Механіка: ${dom.phSubmode?.value || 'катапульта'}`;
        } else {
          dom.pCardCustomParam.textContent = `Архетип: ${dom.mobArchetype?.value || 'моб'}`;
        }
      }

      // Монохром
      const checks = options.checks || {};
      if (dom.pCardMono) {
        dom.pCardMono.textContent = checks.mono ? '✅ Перевірено в «🪨 1 Пластик»' : '⏳ Очікує огляду';
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
      const pairCode = dom.cardPairInput?.value?.trim() || this.getPairCode() || 'Пара #___';
      const mission = options.mission;
      const d = isV1 ? snap.dimensions : (options.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      const conn = isV1 ? { finalIslands: snap.islands } : (options.mcGen?.lastConnectivity || { finalIslands: 1 });
      const verLabel = isV1 ? 'V1 (Ескіз)' : 'V2 (Фінал)';
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
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 760, 1060);

      // Тонка внутрішня лінія поля креслення (1px)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, 752, 1052);

      // Шапка технічного паспорта (Dark Obsidian)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(25, 25, 750, 70);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('3D КУЗНЯ ЧУДЕС • ПАСПОРТ ДЕТАЛІ ДЛЯ ЧЕРГИ ДРУКУ', 44, 54);

      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Шкільний інженерний бланк перевірки якості • Anycubic i3 Mega (FDM)', 44, 76);

      // Мета-рядок: Пара / Версія / Дата
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(25, 96, 750, 48);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 96, 750, 48);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`👤 Пара: ${pairCode}`, 44, 126);

      ctx.fillStyle = isV1 ? '#b45309' : '#047857';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🏷️ Версія: ${verLabel}`, 360, 126);

      const now = new Date();
      const dateStr = now.toLocaleDateString('uk-UA') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('📐 ТЕХНІЧНІ ХАРАКТЕРИСТИКИ ГЕОМЕТРІЇ', 382, 188);

        ctx.fillStyle = '#334155';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`📁 Файл: ${filename.slice(0, 36)}`, 382, 218);
        ctx.fillText(`🗺️ Місія: #${mission ? mission.id : 0} ${mission ? mission.title.slice(0, 28) : 'Вільне моделювання'}`, 382, 246);
        ctx.fillText(`📏 Габарити: ${d.x} × ${d.y} × ${d.z} мм`, 382, 274);

        const connText = conn.finalIslands === 1 ? '✅ 1 суцільна деталь (готовність 100%)' : `🚨 ${conn.finalIslands} окремих острівців`;
        ctx.fillStyle = conn.finalIslands === 1 ? '#047857' : '#b91c1c';
        ctx.fillText(`🧩 Зв'язність: ${connText}`, 382, 302);

        ctx.fillStyle = '#334155';
        ctx.fillText(`🪨 Підкладка: ${dom.mcSolidBase?.checked ? 'Увімкнено (1.0 мм шар)' : 'Без підкладки'}`, 382, 330);

        let customParamText = '';
        if (options.activeTab === 'minecraft') {
          const isStand = options.mcGen?.currentPresetKey === 'cardboard_stand' || options.mcGen?.currentPresetKey === 'slot_calibrator';
          customParamText = isStand ? `Паз картону: ${dom.mcSlotWidth?.value || '2.0'} мм (+0.2)` : `Воксель: ${dom.mcVoxelSize?.value || '2.0'} мм`;
        } else if (options.activeTab === 'illusion') {
          customParamText = `Слова: "${dom.ilWord1?.value || ''}" / "${dom.ilWord2?.value || ''}"`;
        } else {
          customParamText = `Режим: ${options.activeTab}`;
        }
        ctx.fillText(`⚙️ Параметр: ${customParamText}`, 382, 358);
        ctx.fillText(`👁️ Монохром: ${checks.mono ? '✅ Перевірено («🪨 1 Пластик»)' : '⏳ Очікує візуального тесту'}`, 382, 386);

        // Блок 2: Чек-лист взаємоперевірки учнів
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 416, 720, 134);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 416, 720, 134);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('✅ ЧЕК-ЛИСТ ВЗАЄМОПЕРЕВІРКИ (ПАРА: ДИЗАЙНЕР + КОНТРОЛЕР ЯКОСТІ)', 56, 442);

        const chk1 = checks.connected ? '[X] Зв\'язність: усі частини з\'єднані в одну міцну деталь' : '[ ] Зв\'язність: потребує з\'єднання або суцільної підкладки';
        const chk2 = checks.mono ? '[X] Монохром: перевірено в режимі «1 Пластик», рельєф читається' : '[ ] Монохром: огляд в 1 кольорі ще не пройдено';
        const chk3 = checks.size ? '[X] Габарити: розмір вкладається у норму столу та час уроку' : '[ ] Габарити: розмір перевірити перед слайсером';

        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = checks.connected ? '#047857' : '#64748b';
        ctx.fillText(chk1, 56, 470);
        ctx.fillStyle = checks.mono ? '#047857' : '#64748b';
        ctx.fillText(chk2, 56, 496);
        ctx.fillStyle = checks.size ? '#047857' : '#64748b';
        ctx.fillText(chk3, 56, 522);

        // Блок 3: Службовий контроль викладача та черга друку
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, 564, 720, 460);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, 564, 720, 460);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('📋 КОНТРОЛЬ ВИКЛАДАЧА ТА ВІДМІТКА СЛАЙСЕРА (ЧЕРГА ДРУКУ)', 56, 594);

        ctx.font = '13.5px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';

        ctx.fillText('1. Слайсер (Cura / PrusaSlicer / OrcaSlicer):', 56, 630);
        ctx.fillText('   • Час друку: ____________________ хв', 56, 658);
        ctx.fillText('   • Витрата філаменту: ___________ г (PLA)', 420, 658);
        ctx.fillText('   • Профіль шару: [  ] 0.20 мм (швидкий)    [  ] 0.16 мм (високий рельєф)', 56, 686);

        ctx.fillText('2. Черга та принтер Anycubic i3 Mega (стіл Ultrabase):', 56, 730);
        ctx.fillText('   • Номер у черзі уроку: № _______', 56, 758);
        ctx.fillText('   • Точний час запуску: ________:________', 420, 758);
        ctx.fillText('   • Температура: сопло 205 °C, стіл 60 °C (PLA)', 56, 786);

        ctx.fillText('3. Інженерний вердикт викладача:', 56, 830);
        ctx.fillText('[  ] ДОПУЩЕНО ДО ДРУКУ (деталь міцна, плоске дно Z = 0, стіл чистий)', 76, 860);
        ctx.fillText('[  ] ВІДХИЛЕНО НА ДООПРАЦЮВАННЯ (окремі острови / завеликий габарит)', 76, 890);

        ctx.fillText('Підпис викладача / інженера лабораторії: ____________________________________', 56, 940);
        ctx.fillText('Підписи учнів пари (дизайнер / перевіряльник): _________________ / _________________', 56, 975);

        // Підвал
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.fillText('«3D Кузня Чудес v1.7.0» • 100% Автономна навчальна студія 3D-моделювання (2–6 класи)', 140, 1060);

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
          const pairCode = options.domCache?.cardPairInput?.value?.trim() || this.getPairCode() || 'Пара';
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
                alert('✅ Картку паспорта у високій якості (Retina 2x) скопійовано в буфер обміну! Вставте її (Ctrl+V) у документ, чат або презентацію.');
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
      const pair = dom.cardPairInput?.value?.trim() || this.getPairCode() || 'Пара #___';
      const mission = options.mission ? `#${options.mission.id} ${options.mission.title}` : 'Вільне моделювання';
      const dims = dom.pCardDims?.textContent || '--';
      const conn = dom.pCardConn?.textContent || '--';
      const text = [
        '📋 ПАСПОРТ ДЕТАЛІ ДЛЯ ЧЕРГИ 3D-ДРУКУ',
        `👤 Пара: ${pair}`,
        `🗺️ Місія: ${mission}`,
        `📐 Габарити: ${dims}`,
        `🧩 Зв'язність: ${conn}`,
        `📅 Дата: ${new Date().toLocaleString('uk-UA')}`,
        '--- Студія «3D Кузня Чудес» ---'
      ].join('\n');

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert('📋 Текстову інформацію паспорта скопійовано в буфер обміну!');
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
