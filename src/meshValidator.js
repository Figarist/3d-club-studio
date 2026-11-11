// Модуль топологічної валідації 3D-геометрії (Print-Safe MeshValidator)
// Чистий офлайн Vanilla JS для перевірки замкненості (manifold/watertight),
// правильної орієнтації граней та відсутності дірок.
(function () {
  'use strict';

  class MeshValidator {
    /**
     * Аналізує THREE.Group або окремий THREE.Mesh на відповідність вимогам 3D-друку.
     * @param {THREE.Object3D} object 
     * @returns {Object} Результат аналізу
     */
    static analyze(object) {
      if (!object) {
        return {
          ok: false,
          triangles: 0,
          boundaryEdges: 0,
          nonManifoldEdges: 0,
          flippedEdges: 0,
          signedVolume: 0,
          shells: 0,
          error: 'Об\'єкт порожній'
        };
      }

      // Збираємо всі трикутники після трансформацій
      object.updateMatrixWorld(true);
      const triangles = [];

      object.traverse((child) => {
        if (!child.isMesh || child.userData.exportable === false) return;
        let geom = child.geometry;
        if (!geom || !geom.attributes.position) return;

        let workingGeom = geom.clone();
        workingGeom.applyMatrix4(child.matrixWorld);

        if (workingGeom.index !== null) {
          const nonIndexed = workingGeom.toNonIndexed();
          workingGeom.dispose();
          workingGeom = nonIndexed;
        }

        const pos = workingGeom.attributes.position;
        for (let i = 0; i < pos.count; i += 3) {
          const v1 = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
          const v2 = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
          const v3 = new THREE.Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));

          const e1 = new THREE.Vector3().subVectors(v2, v1);
          const e2 = new THREE.Vector3().subVectors(v3, v1);
          const normal = new THREE.Vector3().crossVectors(e1, e2);

          // Пропускаємо вироджені трикутники нульової площі
          if (normal.lengthSq() > 1e-12) {
            triangles.push({ a: v1, b: v2, c: v3 });
          }
        }
        workingGeom.dispose();
      });

      if (triangles.length === 0) {
        return {
          ok: false,
          triangles: 0,
          boundaryEdges: 0,
          nonManifoldEdges: 0,
          flippedEdges: 0,
          signedVolume: 0,
          shells: 0,
          error: 'Геометрія відсутня'
        };
      }

      // Зварювання вершин (Weld / Quantization) з точністю 1e-4 мм (0.1 мікрона)
      // Ключ вершини для хеш-мапи
      const PRECISION = 10000;
      const keyOf = (v) => `${Math.round(v.x * PRECISION)},${Math.round(v.y * PRECISION)},${Math.round(v.z * PRECISION)}`;

      // Ребра у формі графа для підрахунку та перевірки напрямку обходу
      // Для замкненої маніфолд-поверхні кожне неорієнтоване ребро повинно зустрічатися рівно 2 рази,
      // і в протилежних напрямках (u -> v та v -> u).
      const edgeMap = new Map(); // key: "minKey#maxKey" => { count: N, dirAtoB: N, dirBtoA: N }
      let signedVolume = 0;

      for (let i = 0; i < triangles.length; i++) {
        const t = triangles[i];
        const ka = keyOf(t.a);
        const kb = keyOf(t.b);
        const kc = keyOf(t.c);

        // Якщо трикутник виродився після квантування
        if (ka === kb || kb === kc || kc === ka) continue;

        // Обчислення знакового об'єму за формулою тетраедрів (Divergence Theorem)
        // Об'єм тетраедра = (a ⋅ (b × c)) / 6
        signedVolume += t.a.dot(new THREE.Vector3().crossVectors(t.b, t.c)) / 6.0;

        const verts = [ka, kb, kc];
        for (let j = 0; j < 3; j++) {
          const u = verts[j];
          const v = verts[(j + 1) % 3];
          const edgeKey = u < v ? `${u}#${v}` : `${v}#${u}`;
          const isForward = (u < v);

          let entry = edgeMap.get(edgeKey);
          if (!entry) {
            entry = { count: 0, forward: 0, backward: 0 };
            edgeMap.set(edgeKey, entry);
          }
          entry.count++;
          if (isForward) {
            entry.forward++;
          } else {
            entry.backward++;
          }
        }
      }

      let boundaryEdges = 0;
      let nonManifoldEdges = 0;
      let flippedEdges = 0;

      for (const entry of edgeMap.values()) {
        if (entry.count === 1) {
          boundaryEdges++; // Дірка в моделі (не замкнено)
        } else if (entry.count > 2) {
          nonManifoldEdges++; // Т-подібне перетинання або самоперетин граней
        } else if (entry.count === 2) {
          if (entry.forward !== 1 || entry.backward !== 1) {
            flippedEdges++; // Обидва трикутники йдуть в одному напрямку (вивернута нормаль!)
          }
        }
      }

      // Перевірка кількості зв'язних компонентів (shells)
      // Будуємо граф суміжності трикутників через спільні ребра
      const ok = (boundaryEdges === 0) && (nonManifoldEdges === 0) && (flippedEdges === 0) && (signedVolume > 0);

      return {
        ok,
        triangles: triangles.length,
        boundaryEdges,
        nonManifoldEdges,
        flippedEdges,
        signedVolume,
        isWatertight: boundaryEdges === 0 && nonManifoldEdges === 0,
        hasConsistentNormals: flippedEdges === 0,
        isPositiveVolume: signedVolume > 0
      };
    }
  }

  window.MeshValidator = MeshValidator;
})();
