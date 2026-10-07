// DOM-free registry for stable mission identities and atomic content-pack registration.
(function () {
  'use strict';

  class StudioContentRegistry {
    constructor() {
      this.missions = [];
      this._missionsById = new Map();
      this._missionsByKey = new Map();
      this._packIds = new Set();
      this._modelsByKey = new Map();
      this._baseRegistered = false;
    }

    _validateMissions(candidateMissions, packId = null) {
      if (!Array.isArray(candidateMissions)) {
        throw new Error('Content registration requires a missions array.');
      }

      const ids = new Set();
      const keys = new Set();
      const modelKeys = new Set();
      candidateMissions.forEach((mission) => {
        if (!mission || typeof mission !== 'object' || Array.isArray(mission)) {
          throw new Error('Content registration contains an invalid mission.');
        }
        if (!Number.isInteger(mission.id) || mission.id < 1) {
          throw new Error('Mission IDs must be positive integers.');
        }
        if (typeof mission.key !== 'string' || !mission.key.trim() || mission.key !== mission.key.trim()) {
          throw new Error('Every mission requires a stable key.');
        }
        if (packId && (!mission.key.startsWith(packId + ':') || mission.key.length <= packId.length + 1)) {
          throw new Error('Mission key must use the pack namespace: ' + mission.key);
        }
        if (ids.has(mission.id) || this._missionsById.has(mission.id)) {
          throw new Error('Duplicate mission ID: ' + mission.id);
        }
        if (keys.has(mission.key) || this._missionsByKey.has(mission.key)) {
          throw new Error('Duplicate mission key: ' + mission.key);
        }
        this._validateMissionPresentation(mission);
        if (mission.modelKey !== undefined) {
          if (typeof mission.modelKey !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test(mission.modelKey) ||
              modelKeys.has(mission.modelKey) || this._modelsByKey.has(mission.modelKey)) {
            throw new Error('Duplicate or unsafe model key: ' + mission.modelKey);
          }
          ['theme', 'feature', 'editableAction', 'interaction'].forEach(field => {
            if (typeof mission[field] !== 'string' || !mission[field].trim()) throw new Error('Catalog model requires ' + field);
          });
          if (!mission.config || !mission.config.controls) throw new Error('Catalog models require a complete configuration.');
          modelKeys.add(mission.modelKey);
        }
        ids.add(mission.id);
        keys.add(mission.key);
      });

      return { ids, keys };
    }

    _validateMissionPresentation(mission) {
      const requiredText = ['category', 'categoryLabel', 'title', 'targetSize', 'generatorLabel', 'targetTab', 'riddle', 'grade23', 'grade46'];
      requiredText.forEach((field) => {
        if (typeof mission[field] !== 'string' || !mission[field].trim()) {
          throw new Error('Mission requires a non-empty ' + field + ': ' + mission.key);
        }
      });

      const allowedTabs = ['minecraft', 'illusion', 'physics', 'mob'];
      if (!allowedTabs.includes(mission.targetTab)) {
        throw new Error('Mission has an unsupported target tab: ' + mission.targetTab);
      }
      if (!mission.steps || typeof mission.steps !== 'object' || Array.isArray(mission.steps)) {
        throw new Error('Mission requires step text: ' + mission.key);
      }
      ['riddle', 'design', 'mono', 'improve', 'result'].forEach((step) => {
        if (typeof mission.steps[step] !== 'string' || !mission.steps[step].trim()) {
          throw new Error('Mission requires the ' + step + ' step: ' + mission.key);
        }
      });
      if (!Array.isArray(mission.checklist) || mission.checklist.length < 3 || mission.checklist.slice(0, 3).some((item) => typeof item !== 'string' || !item.trim())) {
        throw new Error('Mission requires three checklist items: ' + mission.key);
      }

      if (mission.config !== undefined) {
        if (!mission.config || typeof mission.config !== 'object' || Array.isArray(mission.config)) {
          throw new Error('Mission config must be an object: ' + mission.key);
        }
        if (mission.config.tab !== undefined && (!allowedTabs.includes(mission.config.tab) || mission.config.tab !== mission.targetTab)) {
          throw new Error('Mission config tab must match its target tab: ' + mission.key);
        }
        if (mission.config.mcPreset !== undefined && (typeof mission.config.mcPreset !== 'string' || !mission.config.mcPreset.trim())) {
          throw new Error('Mission preset reference must be a non-empty string: ' + mission.key);
        }
      }
      if (mission.presetKey !== undefined && (typeof mission.presetKey !== 'string' || !mission.presetKey.trim())) {
        throw new Error('Mission preset reference must be a non-empty string: ' + mission.key);
      }
      if (mission.presetKey && mission.config && mission.config.mcPreset && mission.presetKey !== mission.config.mcPreset) {
        throw new Error('Mission preset references must agree: ' + mission.key);
      }
    }

    _validatePreset(key, preset) {
      if (!preset || typeof preset !== 'object' || Array.isArray(preset)) {
        throw new Error('Invalid preset definition: ' + key);
      }
      if (!Array.isArray(preset.grid) || preset.grid.length !== 16 || preset.grid.some((row) => typeof row !== 'string' || row.length !== 16 || !/^[.0-4]{16}$/.test(row))) {
        throw new Error('Preset grid must contain 16 rows of 16 cells using ., 0, 1, 2, 3, or 4: ' + key);
      }
      if (!preset.colors || typeof preset.colors !== 'object' || Array.isArray(preset.colors)) {
        throw new Error('Preset colors must be an RGB object: ' + key);
      }
      Object.keys(preset.colors).forEach((level) => {
        const color = preset.colors[level];
        if (!Number.isInteger(color) || color < 0 || color > 0xffffff) {
          throw new Error('Preset colors must be finite 24-bit RGB integers: ' + key);
        }
      });
      const activeLevels = new Set();
      preset.grid.forEach((row) => {
        Array.from(row).forEach((cell) => {
          if (cell >= '1' && cell <= '4') activeLevels.add(cell);
        });
      });
      activeLevels.forEach((level) => {
        if (!Object.prototype.hasOwnProperty.call(preset.colors, level)) {
          throw new Error('Preset has no color for active level ' + level + ': ' + key);
        }
      });
    }

    registerBaseMissions(candidateMissions) {
      if (this._baseRegistered || this.missions.length > 0) {
        throw new Error('Base missions have already been registered.');
      }
      if (!Array.isArray(candidateMissions) || candidateMissions.length === 0) {
        throw new Error('Base missions cannot be empty.');
      }
      this._validateMissions(candidateMissions);

      candidateMissions.forEach((mission) => {
        this.missions.push(mission);
        this._missionsById.set(mission.id, mission);
        this._missionsByKey.set(mission.key, mission);
        if (mission.modelKey) this._modelsByKey.set(mission.modelKey, mission);
      });
      this._baseRegistered = true;
      return this.missions;
    }

    registerPack(pack, options = {}) {
      const packId = pack && pack.id;
      const presets = pack && pack.presets;
      const candidateMissions = pack && pack.missions;
      options = options && typeof options === 'object' ? options : {};
      const hasPresetTarget = Object.prototype.hasOwnProperty.call(options, 'presetTarget');
      const presetTarget = hasPresetTarget ? options.presetTarget : Object.create(null);

      if (typeof packId !== 'string' || !packId.trim()) {
        throw new Error('Content packs require a stable ID.');
      }
      if (this._packIds.has(packId)) {
        throw new Error('Duplicate content pack ID: ' + packId);
      }
      if (!presets || typeof presets !== 'object' || Array.isArray(presets)) {
        throw new Error('Content packs require a presets object.');
      }
      if (!presetTarget || typeof presetTarget !== 'object' || Array.isArray(presetTarget)) {
        throw new Error('Content registration requires a preset target object.');
      }
      if (!Object.isExtensible(presetTarget)) {
        throw new Error('Preset target must be extensible.');
      }

      const presetKeys = Object.keys(presets);
      if (presetKeys.length > 0 && !hasPresetTarget) {
        throw new Error('Preset target is required when a pack defines presets.');
      }
      const stagedPresetKeys = new Set();
      presetKeys.forEach((key) => {
        if (!key.trim() || stagedPresetKeys.has(key) || Object.prototype.hasOwnProperty.call(presetTarget, key)) {
          throw new Error('Duplicate or empty preset key: ' + key);
        }
        this._validatePreset(key, presets[key]);
        stagedPresetKeys.add(key);
      });

      this._validateMissions(candidateMissions, packId);
      candidateMissions.forEach((mission) => {
        const presetKey = mission.presetKey || (mission.config && mission.config.mcPreset);
        if (presetKey && typeof presetKey !== 'string') {
          throw new Error('Mission preset reference must be a string: ' + mission.key);
        }
        if (presetKey && !stagedPresetKeys.has(presetKey) && !Object.prototype.hasOwnProperty.call(presetTarget, presetKey)) {
          throw new Error('Mission refers to a missing preset: ' + presetKey);
        }
      });

      // All expected failures are checked before either shared registry changes.
      presetKeys.forEach((key) => {
        Object.defineProperty(presetTarget, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: presets[key]
        });
      });
      candidateMissions.forEach((mission) => {
        this.missions.push(mission);
        this._missionsById.set(mission.id, mission);
        this._missionsByKey.set(mission.key, mission);
        if (mission.modelKey) this._modelsByKey.set(mission.modelKey, mission);
      });
      this._packIds.add(packId);

      return Object.freeze({
        id: packId,
        missionIds: Object.freeze(candidateMissions.map((mission) => mission.id)),
        missionKeys: Object.freeze(candidateMissions.map((mission) => mission.key))
      });
    }

    resolveMission(reference) {
      if (Number.isInteger(reference)) return this._missionsById.get(reference) || null;
      if (typeof reference !== 'string' || !reference.trim()) return null;

      const keyMatch = this._missionsByKey.get(reference);
      if (keyMatch) return keyMatch;
      if (!/^\d+$/.test(reference)) return null;
      return this._missionsById.get(Number(reference)) || null;
    }

    listMissions() {
      return this.missions.slice();
    }

    listModels() {
      return Array.from(this._modelsByKey.values());
    }

    resolveModel(key) {
      return this._modelsByKey.get(key) || null;
    }

    getMissionId(key) {
      const mission = this.resolveMission(key);
      return mission ? mission.id : null;
    }

    getMissionKey(reference) {
      const mission = this.resolveMission(reference);
      return mission ? mission.key : null;
    }
  }

  const registry = new StudioContentRegistry();
  registry.create = () => new StudioContentRegistry();
  window.StudioContentRegistry = registry;
})();
