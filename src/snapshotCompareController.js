// Контролер фіксації ескізу (V1), аналітичного порівняння поступу (V1 ↔ V2) та дельти метрик
(function () {
  const getPixelGridGroups = (snapshot) => {
    if (!snapshot || snapshot.activeTab !== 'minecraft') return null;
    if (Number(snapshot.activeCount) === 0) return 0;
    const count = Number(snapshot.gridGroups ?? snapshot.islands);
    return Number.isFinite(count) && count >= 0 ? count : null;
  };

  const getSlicerRecord = (snapshot) => {
    const value = snapshot && typeof snapshot.slicerRecord === 'string' ? snapshot.slicerRecord : '';
    return value.trim() ? value : '';
  };

  class SnapshotCompareController {
    constructor() {
      this.v1Snapshot = null;
    }

    hasV1() {
      return !!this.v1Snapshot;
    }

    getV1() {
      return this.v1Snapshot;
    }

    setV1(snapshot) {
      this.v1Snapshot = snapshot;
    }

    captureV1(sceneManager, mcGen, activeTab, mission, slicerTimeInput, silent = false) {
      if (!sceneManager || !sceneManager.renderer) return null;

      // Якщо активна поп-анімація, завершуємо її перед знімком
      if (sceneManager.popAnimBlocks && sceneManager.popAnimBlocks.length > 0) {
        sceneManager.popAnimBlocks.forEach((item) => {
          item.mesh.position.y = item.targetY;
          item.mesh.scale.copy(item.targetScale);
        });
        sceneManager.popAnimBlocks = [];
      }

      sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
      const thumbUrl = sceneManager.renderer.domElement.toDataURL('image/png') || '';
      const d = sceneManager.dimensions || { x: 0, y: 0, z: 0 };
      const conn = mcGen?.lastConnectivity || { finalIslands: 1, rawIslands: 1, activeCount: 0 };
      const date = new Date();
      const slicerRecord = typeof slicerTimeInput?.value === 'string' ? slicerTimeInput.value : '';

      this.v1Snapshot = {
        capturedAt: date.toISOString(),
        displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        thumbnail: thumbUrl,
        activeTab: activeTab,
        missionId: mission ? mission.id : 1,
        missionTitle: mission ? mission.title : 'Вільне моделювання',
        dimensions: { x: d.x, y: d.y, z: d.z },
        gridGroups: activeTab === 'minecraft' ? (conn.activeCount > 0 ? conn.finalIslands : 0) : null,
        islands: conn.finalIslands || 1,
        rawIslands: conn.rawIslands || 1,
        activeCount: conn.activeCount || 0,
        solidBase: !!(document.getElementById('mc-solid-base')?.checked),
        slicerRecord
      };

      if (!silent && window.StudioSound) {
        window.StudioSound.playPop(620);
      }

      return this.v1Snapshot;
    }

    calculateDelta(v1, v2) {
      if (!v1 || !v2) return null;

      const d1 = v1.dimensions || { x: 0, y: 0, z: 0 };
      const d2 = v2.dimensions || { x: 0, y: 0, z: 0 };

      const dx = Math.round((d2.x - d1.x) * 10) / 10;
      const dy = Math.round((d2.y - d1.y) * 10) / 10;
      const dz = Math.round((d2.z - d1.z) * 10) / 10;

      const gridGroups1 = getPixelGridGroups(v1);
      const gridGroups2 = getPixelGridGroups(v2);

      return {
        dims: { dx, dy, dz },
        gridGroups: gridGroups1 === null || gridGroups2 === null
          ? null
          : { v1: gridGroups1, v2: gridGroups2, delta: gridGroups2 - gridGroups1 },
        solidBase: { v1: !!v1.solidBase, v2: !!v2.solidBase }
      };
    }

    openCompareModal(domCache, sceneManager, mcGen, activeTab, mission, slicerTimeInput) {
      const dom = domCache || {};
      if (!dom.compareModal) return;

      if (!this.v1Snapshot) {
        this.captureV1(sceneManager, mcGen, activeTab, mission, slicerTimeInput, true);
      }

      const v1 = this.v1Snapshot;
      if (sceneManager && sceneManager.renderer) {
        if (sceneManager.popAnimBlocks && sceneManager.popAnimBlocks.length > 0) {
          sceneManager.popAnimBlocks.forEach((item) => {
            item.mesh.position.y = item.targetY;
            item.mesh.scale.copy(item.targetScale);
          });
          sceneManager.popAnimBlocks = [];
        }
        sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
      }

      const v2Thumb = sceneManager?.renderer?.domElement?.toDataURL('image/png') || '';
      const d2 = sceneManager?.dimensions || { x: 0, y: 0, z: 0 };
      const conn2 = mcGen?.lastConnectivity || { finalIslands: 1, rawIslands: 1, activeCount: 0 };
      const slicerRecord = typeof dom.slicerTimeInput?.value === 'string' ? dom.slicerTimeInput.value : '';

      const v2State = {
        dimensions: { x: d2.x, y: d2.y, z: d2.z },
        activeTab,
        gridGroups: activeTab === 'minecraft' ? (conn2.activeCount > 0 ? conn2.finalIslands : 0) : null,
        islands: conn2.finalIslands || 1,
        solidBase: activeTab === 'minecraft' ? !!(dom.mcSolidBase?.checked) : null,
        slicerRecord
      };

      const now = new Date();
      const v2Time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const delta = this.calculateDelta(v1, v2State);

      const renderMetrics = (container, snapshot) => {
        const dimensions = snapshot.dimensions || { x: 0, y: 0, z: 0 };
        const gridGroups = getPixelGridGroups(snapshot);
        const gridGroupsRow = gridGroups === null
          ? ''
          : `<div class="metric-row"><span>🧩 Групи клітинок у редакторі:</span><b class="num-tabular">${gridGroups}</b></div>`;
        const baseRow = snapshot.activeTab === 'minecraft'
          ? `<div class="metric-row"><span>🪨 Підкладка в редакторі:</span><b>${snapshot.solidBase ? 'Увімкнено' : 'Вимкнено'}</b></div>`
          : '';

        container.innerHTML = `
          <div class="metric-row"><span>📐 Габарити:</span><b class="num-tabular">${dimensions.x} × ${dimensions.y} × ${dimensions.z} мм</b></div>
          ${gridGroupsRow}
          ${baseRow}
          <div class="metric-row"><span>⏱️ Запис зі слайсера:</span><b class="num-tabular" data-slicer-record></b></div>
        `;
        const recordNode = container.querySelector('[data-slicer-record]');
        if (recordNode) recordNode.textContent = getSlicerRecord(snapshot) || 'Не записано';
      };

      // Оновлення V1 картки
      if (dom.v1PreviewImg) dom.v1PreviewImg.src = v1.thumbnail;
      if (dom.v1Timestamp) dom.v1Timestamp.textContent = `Зафіксовано: ${v1.displayTime}`;
      if (dom.v1Metrics) {
        renderMetrics(dom.v1Metrics, v1);
      }

      // Оновлення V2 картки
      if (dom.v2PreviewImg) dom.v2PreviewImg.src = v2Thumb;
      if (dom.v2Timestamp) dom.v2Timestamp.textContent = `Поточний стан: ${v2Time}`;
      if (dom.v2Metrics) {
        renderMetrics(dom.v2Metrics, v2State);
      }

      // Дельта-банер поступу
      if (dom.compareSummaryBanner && delta) {
        const deltaBadges = [];

        if (delta.gridGroups) {
          deltaBadges.push(`<span class="delta-chip chip-neutral">🧩 Групи клітинок у редакторі: ${delta.gridGroups.v1} → ${delta.gridGroups.v2}</span>`);
        }

        // Габарити
        const dimStr = `Δ: ${delta.dims.dx >= 0 ? '+' : ''}${delta.dims.dx} × ${delta.dims.dy >= 0 ? '+' : ''}${delta.dims.dy} × ${delta.dims.dz >= 0 ? '+' : ''}${delta.dims.dz} мм`;
        deltaBadges.push(`<span class="delta-chip chip-neutral">📐 ${dimStr}</span>`);

        dom.compareSummaryBanner.className = 'compare-summary-banner';
        dom.compareSummaryBanner.innerHTML = `
          <div class="summary-headline">Порівняння параметрів знімків V1 і V2</div>
          <div class="summary-chips-row">${deltaBadges.join(' ')}</div>
        `;
      }

      dom.compareModal.style.display = 'flex';
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    closeCompareModal(domCache) {
      const dom = domCache || {};
      if (dom.compareModal) {
        dom.compareModal.style.display = 'none';
      }
      if (window.StudioSound) window.StudioSound.playPop(340);
    }
  }

  window.SnapshotCompareController = SnapshotCompareController;
})();
