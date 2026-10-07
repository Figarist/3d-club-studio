// Pure project-file validation and normalization for «3D Кузня Чудес».
(function (root) {
  const SCHEMA_VERSION = 1;
  const APP_ID = '3d-club-studio';
  const GRID_SIZE = 16;
  const DEFAULT_COLORS = { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe };
  const TABS = ['minecraft', 'illusion', 'physics', 'mob'];
  const VERIFICATION_STATUSES = ['generated', 'sliced', 'printed'];
  const CONTROL_DEFAULTS = {
    mcVoxelSize: '2', mcHeightStep: '1.2', mcSolidBase: true,
    mcMountType: 'keychain', mcSlotWidth: '2.0', mcCustomLabel: '',
    ilWord1: '3D', ilWord2: '★!', ilVoxelSize: '2.2',
    ilSafeSupports: true, ilLayoutMode: 'diagonal', ilColorPrimary: '#10b981',
    phSubmode: 'catapult', phExtrudeHeight: '10', phSpringThickness: '2',
    phWingWeight: '11.0', phArmLength: '68', phIncludeAmmo: true, phCustomText: '',
    mobArchetype: 'creeper', mobHeadScale: '1', mobBodyBulk: '1',
    mobEyeType: 'two', mobHeadgear: 'none', mobBackgear: 'none',
    mobWeapon: 'sword', mobName: '', mobTinkercadBlank: false,
    mobDesign: 'classic', ilDesign: 'classic', phDesign: 'classic'
  };
  const NUMERIC_CONTROLS = {
    mcVoxelSize: { min: 1.8, max: 5.0, step: 0.1, places: 1 },
    mcHeightStep: { min: 0.8, max: 2.8, step: 0.1, places: 1 },
    ilVoxelSize: { min: 2.0, max: 4.0, step: 0.1, places: 1 },
    phExtrudeHeight: { min: 5.0, max: 15.0, step: 0.5, places: 1 },
    phSpringThickness: { min: 1.8, max: 3.6, step: 0.1, places: 1 },
    phWingWeight: { min: 7.0, max: 16.0, step: 0.5, places: 1 },
    phArmLength: { min: 52, max: 85, step: 1, places: 0 },
    mobHeadScale: { min: 0.75, max: 1.45, step: 0.05, places: 2 },
    mobBodyBulk: { min: 0.8, max: 1.35, step: 0.05, places: 2 }
  };
  const ENUM_CONTROLS = {
    mcMountType: ['keychain', 'none', 'stand'],
    ilLayoutMode: ['diagonal', 'line'],
    phSubmode: ['catapult', 'balancer'],
    mobArchetype: ['golem', 'creeper', 'knight', 'dragon', 'cyborg'],
    mobEyeType: ['two', 'creeper', 'visor', 'one', 'three'],
    mobHeadgear: ['crown', 'horns', 'antenna', 'ears', 'none'],
    mobBackgear: ['wings', 'jetpack', 'cape', 'none'],
    mobWeapon: ['sword', 'hammer', 'shield', 'dual_axes']
  };
  const SLOT_WIDTHS = ['1.5', '2.0', '2.5', '3.0'];
  const TEXT_CONTROLS = {
    mcCustomLabel: 9, ilWord1: 9, ilWord2: 9, phCustomText: 6, mobName: 7
  };
  const BOOLEAN_CONTROLS = ['mcSolidBase', 'ilSafeSupports', 'phIncludeAmmo', 'mobTinkercadBlank'];

  function fail(path, message) {
    throw new Error('Invalid project field "' + path + '": ' + message);
  }

  function isRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function enumValue(value, allowed, path, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || allowed.indexOf(value) < 0) {
      fail(path, 'must be one of: ' + allowed.join(', '));
    }
    return value;
  }

  function booleanValue(value, path, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== 'boolean') fail(path, 'must be a boolean');
    return value;
  }

  function colorValue(value, path, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) {
      fail(path, 'must be a six-digit #RRGGBB color');
    }
    return value.toLowerCase();
  }

  function numberInput(value, path) {
    if (typeof value === 'number') {
      if (Number.isFinite(value)) return value;
      fail(path, 'must be finite');
    }
    if (typeof value === 'string' && /^(?:\d+\.?\d*|\.\d+)$/.test(value.trim())) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    fail(path, 'must be a finite number');
  }

  function normalizeSteppedNumber(value, rule, path, legacy) {
    let number = numberInput(value, path);
    const tolerance = 1e-7;
    if (legacy) {
      number = Math.min(rule.max, Math.max(rule.min, number));
      number = rule.min + Math.round((number - rule.min) / rule.step) * rule.step;
    } else {
      if (number < rule.min - tolerance || number > rule.max + tolerance) {
        fail(path, 'must be between ' + rule.min + ' and ' + rule.max);
      }
      const stepIndex = (number - rule.min) / rule.step;
      if (Math.abs(stepIndex - Math.round(stepIndex)) > tolerance) {
        fail(path, 'must use increments of ' + rule.step);
      }
    }
    number = Math.min(rule.max, Math.max(rule.min, number));
    return String(Number(number.toFixed(rule.places)));
  }

  function normalizeControls(value, legacy) {
    if (value !== undefined && !isRecord(value)) fail('controls', 'must be an object');
    const source = value || {};
    const controls = Object.assign({}, CONTROL_DEFAULTS);
    ['mobDesign', 'ilDesign', 'phDesign'].forEach(function (key) {
      const designs = ['classic'];
      if (root.StudioContentRegistry) root.StudioContentRegistry.listModels().forEach(function (mission) {
        const design = mission.config.controls && mission.config.controls[key];
        if (design && !designs.includes(design)) designs.push(design);
      });
      controls[key] = enumValue(source[key], designs, 'controls.' + key, 'classic');
    });

    Object.keys(NUMERIC_CONTROLS).forEach(function (key) {
      if (hasOwn(source, key)) {
        controls[key] = normalizeSteppedNumber(source[key], NUMERIC_CONTROLS[key], 'controls.' + key, legacy);
      }
    });
    Object.keys(ENUM_CONTROLS).forEach(function (key) {
      controls[key] = enumValue(source[key], ENUM_CONTROLS[key], 'controls.' + key, controls[key]);
    });
    if (source.mcSlotWidth !== undefined) {
      const slotWidth = numberInput(source.mcSlotWidth, 'controls.mcSlotWidth');
      const matchedSlot = SLOT_WIDTHS.find(function (item) { return Math.abs(Number(item) - slotWidth) < 1e-7; });
      if (!matchedSlot) fail('controls.mcSlotWidth', 'must be one of: ' + SLOT_WIDTHS.join(', '));
      controls.mcSlotWidth = matchedSlot;
    }
    Object.keys(TEXT_CONTROLS).forEach(function (key) {
      if (source[key] === undefined) return;
      if (typeof source[key] !== 'string') fail('controls.' + key, 'must be text');
      if (source[key].length > TEXT_CONTROLS[key]) fail('controls.' + key, 'is too long');
      controls[key] = source[key];
    });
    controls.ilColorPrimary = colorValue(source.ilColorPrimary, 'controls.ilColorPrimary', controls.ilColorPrimary);
    BOOLEAN_CONTROLS.forEach(function (key) {
      controls[key] = booleanValue(source[key], 'controls.' + key, controls[key]);
    });
    Object.keys(controls).forEach(function (key) {
      if (typeof controls[key] === 'string' && key.toLowerCase().indexOf('color') >= 0) {
        controls[key] = colorValue(controls[key], 'controls.' + key, controls[key]);
      }
    });
    return controls;
  }

  function normalizeGrid(grid) {
    if (!Array.isArray(grid) || grid.length !== GRID_SIZE) {
      fail('minecraft.grid', 'must contain exactly ' + GRID_SIZE + ' rows');
    }
    return grid.map(function (row, rowIndex) {
      if (!Array.isArray(row) || row.length !== GRID_SIZE) {
        fail('minecraft.grid[' + rowIndex + ']', 'must contain exactly ' + GRID_SIZE + ' cells');
      }
      return row.map(function (cell, columnIndex) {
        const path = 'minecraft.grid[' + rowIndex + '][' + columnIndex + ']';
        let level = cell;
        if (typeof level === 'string' && /^[0-4]$/.test(level)) level = Number(level);
        if (!Number.isInteger(level) || level < 0 || level > 4) {
          fail(path, 'must be an integer from 0 to 4');
        }
        return level;
      });
    });
  }

  function normalizeColors(colors) {
    if (colors !== undefined && !isRecord(colors)) fail('minecraft.colors', 'must be an object');
    const source = colors || {};
    Object.keys(source).forEach(function (key) {
      if (['1', '2', '3', '4'].indexOf(key) < 0) fail('minecraft.colors.' + key, 'is not a supported color level');
    });
    const result = {};
    ['1', '2', '3', '4'].forEach(function (key) {
      const value = hasOwn(source, key) ? source[key] : DEFAULT_COLORS[key];
      if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > 0xffffff) {
        fail('minecraft.colors.' + key, 'must be a finite 24-bit RGB integer');
      }
      result[key] = value;
    });
    return result;
  }

  function availableIds(source, field) {
    if (source === undefined || source === null) return null;
    if (source instanceof Set) return Array.from(source).map(String);
    if (Array.isArray(source)) return source.map(function (item) {
      return String(isRecord(item) ? item[field] : item);
    });
    if (isRecord(source)) return Object.keys(source);
    fail('options.' + field, 'must be an array, set, or object');
  }

  function getMissionEntries(source) {
    if (source === undefined || source === null) return null;
    if (Array.isArray(source)) return source;
    if (isRecord(source) && Array.isArray(source.missions)) return source.missions;
    if (isRecord(source) && isRecord(source.list) && Array.isArray(source.list.missions)) return source.list.missions;
    fail('options.missions', 'must provide a mission list');
  }

  function resolveMission(state, source) {
    const entries = getMissionEntries(source);
    const key = state.activeMissionKey;
    let id;

    if (key !== undefined && (typeof key !== 'string' || !key.trim())) {
      fail('activeMissionKey', 'must be a non-empty stable mission key');
    }
    if (!entries) {
      if (key !== undefined) fail('options.missions', 'is required to resolve activeMissionKey');
      return { id: positiveInteger(state.activeMissionId, 'activeMissionId', 1) };
    }

    let found;
    if (key !== undefined) {
      const matchingKeys = entries.filter(function (mission) { return isRecord(mission) && mission.key === key; });
      if (matchingKeys.length !== 1) fail('activeMissionKey', 'does not identify exactly one registered mission');
      found = matchingKeys[0];
    } else {
      id = positiveInteger(state.activeMissionId, 'activeMissionId', 1);
      const matchingIds = entries.filter(function (mission) { return isRecord(mission) && Number(mission.id) === id; });
      if (matchingIds.length !== 1) fail('activeMissionId', 'does not identify exactly one registered mission');
      found = matchingIds[0];
    }

    const resolvedId = positiveInteger(found.id, 'options.missions.id');
    if (typeof found.key !== 'string' || !found.key.trim()) fail('options.missions.key', 'must be a non-empty stable key');
    return { id: resolvedId, key: found.key };
  }

  function positiveInteger(value, path, fallback) {
    if (value === undefined) return fallback;
    const parsed = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
    if (!Number.isSafeInteger(parsed) || parsed < 1) fail(path, 'must be a positive safe integer');
    return parsed;
  }

  function normalizeMissionChecks(value) {
    if (value !== undefined && !isRecord(value)) fail('missionChecks', 'must be an object');
    const source = value || {};
    const result = { connected: false, mono: false, size: false };
    Object.keys(result).forEach(function (key) {
      result[key] = booleanValue(source[key], 'missionChecks.' + key, false);
    });
    return result;
  }

  function finiteNonNegative(value, path, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      fail(path, 'must be a finite non-negative number');
    }
    return value;
  }

  function nonNegativeInteger(value, path, fallback, minimum) {
    if (value === undefined) return fallback;
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < (minimum || 0)) {
      fail(path, 'must be a non-negative integer');
    }
    return value;
  }

  function snapshotThumbnail(value) {
    if (value === undefined || value === '') return '';
    if (typeof value !== 'string' || value.length > 8 * 1024 * 1024 ||
        !/^data:image\/png;base64,[A-Za-z0-9+/]*={0,2}$/.test(value)) {
      fail('v1Snapshot.thumbnail', 'must be a PNG data URL');
    }
    const encoded = value.slice('data:image/png;base64,'.length);
    if (!encoded || encoded.length % 4 !== 0) fail('v1Snapshot.thumbnail', 'must contain valid base64 data');
    return value;
  }

  function nullableCount(value, path, fallback, minimum) {
    if (value === null) return null;
    return nonNegativeInteger(value, path, fallback, minimum);
  }

  function normalizeSnapshot(snapshot, fallbackTab, legacy) {
    if (snapshot === undefined || snapshot === null) return null;
    if (!isRecord(snapshot)) fail('v1Snapshot', 'must be an object or null');
    const dimensions = snapshot.dimensions === undefined ? {} : snapshot.dimensions;
    if (!isRecord(dimensions)) fail('v1Snapshot.dimensions', 'must be an object');
    const missionTitle = snapshot.missionTitle === undefined ? 'Вільне моделювання' : snapshot.missionTitle;
    const displayTime = snapshot.displayTime === undefined ? '' : snapshot.displayTime;
    const capturedAt = snapshot.capturedAt === undefined ? '' : snapshot.capturedAt;
    if (typeof missionTitle !== 'string' || missionTitle.length > 160) fail('v1Snapshot.missionTitle', 'must be text up to 160 characters');
    if (typeof displayTime !== 'string' || displayTime.length > 64) fail('v1Snapshot.displayTime', 'must be text up to 64 characters');
    if (typeof capturedAt !== 'string' || capturedAt.length > 64) fail('v1Snapshot.capturedAt', 'must be text up to 64 characters');
    if (capturedAt && !Number.isFinite(Date.parse(capturedAt))) fail('v1Snapshot.capturedAt', 'must be a valid date');
    const activeTab = enumValue(snapshot.activeTab, TABS, 'v1Snapshot.activeTab', fallbackTab);
    let gridGroups = null;
    let islands = null;
    let rawIslands = null;
    let activeCount = null;
    if (activeTab === 'minecraft') {
      gridGroups = nonNegativeInteger(
        snapshot.gridGroups === undefined ? snapshot.islands : snapshot.gridGroups,
        'v1Snapshot.gridGroups',
        1,
        0
      );
      islands = nullableCount(snapshot.islands, 'v1Snapshot.islands', gridGroups, 0);
      rawIslands = nullableCount(snapshot.rawIslands, 'v1Snapshot.rawIslands', islands, 0);
      activeCount = nullableCount(snapshot.activeCount, 'v1Snapshot.activeCount', 0, 0);
      if (snapshot.gridGroups !== undefined && snapshot.gridGroups !== gridGroups) {
        fail('v1Snapshot.gridGroups', 'must be a non-negative integer');
      }
    } else if (!legacy && snapshot.gridGroups !== undefined && snapshot.gridGroups !== null) {
      fail('v1Snapshot.gridGroups', 'must be null when the active tab is not Minecraft');
    }
    const slicerRecord = snapshot.slicerRecord === undefined
      ? (snapshot.slicerNote === undefined ? '' : snapshot.slicerNote)
      : snapshot.slicerRecord;
    if (typeof slicerRecord !== 'string' || slicerRecord.length > 28) fail('v1Snapshot.slicerRecord', 'must be text up to 28 characters');

    const result = {
      capturedAt: capturedAt,
      displayTime: displayTime,
      thumbnail: snapshotThumbnail(snapshot.thumbnail),
      activeTab: activeTab,
      missionId: positiveInteger(snapshot.missionId, 'v1Snapshot.missionId', 1),
      missionTitle: missionTitle,
      dimensions: {
        x: finiteNonNegative(dimensions.x, 'v1Snapshot.dimensions.x', 0),
        y: finiteNonNegative(dimensions.y, 'v1Snapshot.dimensions.y', 0),
        z: finiteNonNegative(dimensions.z, 'v1Snapshot.dimensions.z', 0)
      },
      gridGroups: gridGroups,
      islands: islands,
      rawIslands: rawIslands,
      activeCount: activeCount,
      solidBase: booleanValue(snapshot.solidBase, 'v1Snapshot.solidBase', false),
      slicerRecord: slicerRecord
    };
    if (typeof snapshot.missionKey === 'string' && snapshot.missionKey.trim()) result.missionKey = snapshot.missionKey;
    return result;
  }

  function normalize(state, options) {
    const opts = options || {};
    if (!isRecord(state)) fail('project', 'must be a JSON object');
    if (state.app !== APP_ID) fail('app', 'does not identify a 3D Club Studio project');

    const legacy = state.schemaVersion === undefined;
    if (!legacy && (!Number.isInteger(state.schemaVersion) || state.schemaVersion !== SCHEMA_VERSION)) {
      fail('schemaVersion', 'unsupported project schema version');
    }
    if (state.version !== undefined && (typeof state.version !== 'string' || state.version.length > 32)) {
      fail('version', 'must be a short app release string');
    }

    const activeTab = enumValue(state.activeTab, TABS, 'activeTab', 'minecraft');
    const activeMission = resolveMission(state, opts.missions);

    if (!isRecord(state.minecraft)) fail('minecraft', 'must be an object');
    const presetKey = state.minecraft.currentPresetKey === undefined && legacy ? 'sword' : state.minecraft.currentPresetKey;
    if (typeof presetKey !== 'string' || !presetKey.trim()) {
      fail('minecraft.currentPresetKey', 'must be a non-empty preset key');
    }
    const presetIds = availableIds(opts.presets, 'key');
    if (presetIds && presetIds.indexOf(presetKey) < 0) {
      fail('minecraft.currentPresetKey', 'does not identify a registered preset');
    }
    const grid = normalizeGrid(state.minecraft.grid);
    const pairCode = state.studentPairCode === undefined ? '' : state.studentPairCode;
    const slicerNote = state.slicerNote === undefined ? '' : state.slicerNote;
    if (typeof pairCode !== 'string' || pairCode.length > 32) fail('studentPairCode', 'must be text up to 32 characters');
    if (typeof slicerNote !== 'string' || slicerNote.length > 28) fail('slicerNote', 'must be text up to 28 characters');

    const normalized = {
      app: APP_ID,
      schemaVersion: SCHEMA_VERSION,
      activeTab: activeTab,
      activeMissionId: activeMission.id,
      activeMissionVisible: booleanValue(state.activeMissionVisible, 'activeMissionVisible', true),
      activeMissionCollapsed: booleanValue(state.activeMissionCollapsed, 'activeMissionCollapsed', false),
      isOrthographic: booleanValue(state.isOrthographic, 'isOrthographic', false),
      v1Snapshot: normalizeSnapshot(state.v1Snapshot, activeTab, legacy),
      studentPairCode: pairCode,
      missionChecks: normalizeMissionChecks(state.missionChecks),
      monochrome: booleanValue(state.monochrome, 'monochrome', false),
      monoColor: colorValue(state.monoColor, 'monoColor', '#cfd6df'),
      verificationStatus: enumValue(state.verificationStatus, VERIFICATION_STATUSES, 'verificationStatus', 'generated'),
      slicerNote: slicerNote,
      minecraft: {
        currentPresetKey: presetKey,
        colors: normalizeColors(state.minecraft.colors),
        grid: grid
      },
      controls: normalizeControls(state.controls, legacy)
    };
    if (activeMission.key !== undefined) normalized.activeMissionKey = activeMission.key;

    if (state.version !== undefined) normalized.version = state.version;
    if (state.savedAt !== undefined) {
      if (typeof state.savedAt !== 'string' || state.savedAt.length > 64) fail('savedAt', 'must be text up to 64 characters');
      normalized.savedAt = state.savedAt;
    }
    return normalized;
  }

  root.ProjectState = Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    normalize: normalize
  });
})(typeof window !== 'undefined' ? window : globalThis);
