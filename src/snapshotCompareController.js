// Контролер фіксації ескізу (V1), аналітичного порівняння поступу (V1 ↔ V2) та дельти метрик
(function () {
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

      const rawMinutesStr = slicerTimeInput?.value?.trim();
      const fallbackMinutes = d.z > 0 ? Math.ceil(d.x * d.y * d.z / 180) : 15;
      const parsedMinutes = parseInt(rawMinutesStr, 10) || fallbackMinutes;

      this.v1Snapshot = {
        capturedAt: date.toISOString(),
        displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        thumbnail: thumbUrl,
        activeTab: activeTab,
        missionId: mission ? mission.id : 1,
        missionTitle: mission ? mission.title : 'Вільне моделювання',
        dimensions: { x: d.x, y: d.y, z: d.z },
        islands: conn.finalIslands || 1,
        rawIslands: conn.rawIslands || 1,
        activeCount: conn.activeCount || 0,
        solidBase: !!(document.getElementById('mc-solid-base')?.checked),
        estimatedMinutes: parsedMinutes
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

      const islands1 = v1.islands || 1;
      const islands2 = v2.islands || 1;
      const islandsDelta = islands2 - islands1;

      const time1 = v1.estimatedMinutes || 15;
      const time2 = v2.estimatedMinutes || 15;
      const timeDelta = time2 - time1;
      const timePct = time1 > 0 ? Math.round(((time2 - time1) / time1) * 100) : 0;

      return {
        dims: { dx, dy, dz },
        islands: { v1: islands1, v2: islands2, delta: islandsDelta },
        time: { v1: time1, v2: time2, delta: timeDelta, pct: timePct },
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
      const rawMinStr = dom.slicerTimeInput?.value?.trim();
      const fallbackMin2 = d2.z > 0 ? Math.ceil(d2.x * d2.y * d2.z / 180) : 15;
      const v2Minutes = parseInt(rawMinStr, 10) || fallbackMin2;

      const v2State = {
        dimensions: { x: d2.x, y: d2.y, z: d2.z },
        islands: conn2.finalIslands || 1,
        estimatedMinutes: v2Minutes,
        solidBase: !!(dom.mcSolidBase?.checked)
      };

      const now = new Date();
      const v2Time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const delta = this.calculateDelta(v1, v2State);

      // Оновлення V1 картки
      if (dom.v1PreviewImg) dom.v1PreviewImg.src = v1.thumbnail;
      if (dom.v1Timestamp) dom.v1Timestamp.textContent = `Зафіксовано: ${v1.displayTime}`;
      if (dom.v1Metrics) {
        const d1 = v1.dimensions || { x: 0, y: 0, z: 0 };
        dom.v1Metrics.innerHTML = `
          <div class="metric-row"><span>📐 Габарити:</span><b class="num-tabular">${d1.x} × ${d1.y} × ${d1.z} мм</b></div>
          <div class="metric-row"><span>🧩 Зв'язність:</span><b class="${v1.islands > 1 ? 'metric-bad' : 'metric-good'}">${v1.islands} ${v1.islands > 1 ? '🚨 (окремі частини)' : '✅ (1 деталь)'}</b></div>
          <div class="metric-row"><span>🪨 Підкладка:</span><b>${v1.solidBase ? 'Увімкнено' : 'Вимкнено'}</b></div>
          <div class="metric-row"><span>⏱️ Час друку:</span><b class="num-tabular">~${v1.estimatedMinutes} хв</b></div>
        `;
      }

      // Оновлення V2 картки
      if (dom.v2PreviewImg) dom.v2PreviewImg.src = v2Thumb;
      if (dom.v2Timestamp) dom.v2Timestamp.textContent = `Поточний стан: ${v2Time}`;
      if (dom.v2Metrics) {
        const isOk = v2State.islands === 1;
        dom.v2Metrics.innerHTML = `
          <div class="metric-row"><span>📐 Габарити:</span><b class="num-tabular">${d2.x} × ${d2.y} × ${d2.z} мм</b></div>
          <div class="metric-row"><span>🧩 Зв'язність:</span><b class="${isOk ? 'metric-good' : 'metric-bad'}">${v2State.islands} ${isOk ? '✅ (1 суцільна деталь)' : '🚨 (' + v2State.islands + ' розривів)'}</b></div>
          <div class="metric-row"><span>🪨 Підкладка:</span><b>${v2State.solidBase ? 'Увімкнено' : 'Вимкнено'}</b></div>
          <div class="metric-row"><span>⏱️ Час друку:</span><b class="num-tabular">~${v2Minutes} хв</b></div>
        `;
      }

      // Дельта-банер поступу
      if (dom.compareSummaryBanner && delta) {
        let badgeClass = 'banner-good';
        let headline = '';
        let deltaBadges = [];

        // Острови
        if (delta.islands.v1 > 1 && delta.islands.v2 === 1) {
          headline = `🎉 <b>Інженерний успіх:</b> У V1 було ${delta.islands.v1} розірваних острівців, а у V2 модель об'єднана в <b>1 суцільну надійну деталь</b>!`;
          badgeClass = 'banner-success';
          deltaBadges.push(`<span class="delta-chip chip-success">🧩 Острови: ${delta.islands.v1} 🚨 → 1 ✅ (-${delta.islands.v1 - 1})</span>`);
        } else if (delta.islands.v2 === 1) {
          headline = `✅ <b>Готово до друку:</b> Виріб суцільний, геометрія монолітна, без відірваних елементів.`;
          badgeClass = 'banner-good';
          deltaBadges.push(`<span class="delta-chip chip-good">🧩 Острови: 1 ✅</span>`);
        } else {
          headline = `⚠️ <b>Потрібне доопрацювання:</b> У моделі V2 лишається ${delta.islands.v2} розірваних острівців. Увімкніть підкладку або з'єднайте пікселі перед відправкою до слайсера.`;
          badgeClass = 'banner-warn';
          deltaBadges.push(`<span class="delta-chip chip-warn">🧩 Острови: ${delta.islands.v2} 🚨</span>`);
        }

        // Час друку
        if (delta.time.delta !== 0) {
          const sign = delta.time.delta > 0 ? '+' : '';
          const chipClass = delta.time.delta < 0 ? 'chip-good' : 'chip-neutral';
          deltaBadges.push(`<span class="delta-chip ${chipClass}">⏱️ Час: ${delta.time.v1} хв → ${delta.time.v2} хв (${sign}${delta.time.pct}%)</span>`);
        }

        // Габарити
        const dimStr = `Δ: ${delta.dims.dx >= 0 ? '+' : ''}${delta.dims.dx} × ${delta.dims.dy >= 0 ? '+' : ''}${delta.dims.dy} × ${delta.dims.dz >= 0 ? '+' : ''}${delta.dims.dz} мм`;
        deltaBadges.push(`<span class="delta-chip chip-neutral">📐 ${dimStr}</span>`);

        dom.compareSummaryBanner.className = `compare-summary-banner ${badgeClass}`;
        dom.compareSummaryBanner.innerHTML = `
          <div class="summary-headline">${headline}</div>
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
