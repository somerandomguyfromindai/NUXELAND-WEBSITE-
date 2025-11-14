// Level configurations for the platformer
export const LEVELS = {
  lab_interior: {
    id: 'lab_interior',
    name: 'Field Lab 3 - Interior',
    description: 'Navigate the laboratory where miniaturization experiments take place',
    environment: {
      background: 0x1a1a2e,
      fog: { color: 0x1a1a2e, near: 30, far: 100 },
      ambient: 0x404040,
      lighting: { color: 0xffffff, intensity: 0.5 }
    },
    platforms: [
      { x: 0, y: 0, z: 0, w: 15, h: 0.5, d: 8, color: 0x2d2d44 },
      { x: 18, y: 2, z: 0, w: 8, h: 0.5, d: 6, color: 0x2d2d44 },
      { x: 28, y: 5, z: -3, w: 10, h: 0.5, d: 8, color: 0x2d2d44 },
      { x: 40, y: 4, z: -8, w: 12, h: 0.5, d: 10, color: 0x2d2d44 },
      { x: 52, y: 7, z: -5, w: 8, h: 0.5, d: 6, color: 0x2d2d44 },
      { x: 62, y: 10, z: -2, w: 15, h: 0.5, d: 8, color: 0x2d2d44 }
    ],
    obstacles: [
      { x: 12, y: 1, z: 0, type: 'laser', color: 0xff0000 },
      { x: 35, y: 5, z: -8, type: 'laser', color: 0xff0000 },
      { x: 58, y: 8, z: -5, type: 'laser', color: 0xff0000 }
    ],
    terminals: [
      { 
        x: 18, y: 3, z: 0, 
        id: 'lab_terminal_1',
        gameType: 'memory',
        securityLevel: 'MEDIUM',
        description: 'Research Database Access',
        intel: { type: 'EXPERIMENT_LOG', content: 'Bio-stress levels in subjects reaching critical thresholds' }
      },
      { 
        x: 52, y: 8, z: -5, 
        id: 'lab_terminal_2',
        gameType: 'code',
        securityLevel: 'HIGH',
        description: 'Personnel Files',
        intel: { type: 'STAFF_COMM', content: 'Dr. Ni\'s security clearance was revoked after objecting to Phase 2' }
      }
    ],
    collectibles: [
      { x: 10, y: 3, z: 2, type: 'data_chip', clue: 'PASSWORD_FRAGMENT: NUX' },
      { x: 32, y: 6, z: -6, type: 'evidence', clue: 'MORTALITY_RATE: 30%' },
      { x: 58, y: 11, z: -2, type: 'data_chip', clue: 'PASSWORD_FRAGMENT: E' }
    ]
  },

  ventilation_system: {
    id: 'ventilation_system',
    name: 'Ventilation Ducts',
    description: 'A treacherous path through the building\'s air system',
    environment: {
      background: 0x404040,
      fog: { color: 0x303030, near: 20, far: 80 },
      ambient: 0x303030,
      lighting: { color: 0x6699ff, intensity: 0.4 }
    },
    platforms: [
      { x: 0, y: 0, z: 0, w: 10, h: 0.5, d: 6, color: 0x4a4a4a },
      { x: 12, y: 3, z: -2, w: 6, h: 0.5, d: 6, color: 0x4a4a4a },
      { x: 20, y: 6, z: 0, w: 8, h: 0.5, d: 5, color: 0x4a4a4a },
      { x: 30, y: 4, z: -5, w: 10, h: 0.5, d: 8, color: 0x4a4a4a },
      { x: 42, y: 8, z: -3, w: 7, h: 0.5, d: 6, color: 0x4a4a4a },
      { x: 52, y: 12, z: 0, w: 12, h: 0.5, d: 8, color: 0x4a4a4a }
    ],
    obstacles: [
      { x: 16, y: 5, z: -2, type: 'fan', speed: 2 },
      { x: 35, y: 6, z: -5, type: 'fan', speed: 3 }
    ],
    terminals: [
      { 
        x: 30, y: 5, z: -5, 
        id: 'vent_terminal_1',
        gameType: 'wire',
        securityLevel: 'LOW',
        description: 'Ventilation Control System',
        intel: { type: 'FACILITY_MAP', content: 'Hidden server room location: Sub-basement Level 3' }
      },
      { 
        x: 52, y: 13, z: 0, 
        id: 'vent_terminal_2',
        gameType: 'sequence',
        securityLevel: 'HIGH',
        description: 'Security Camera Feed',
        intel: { type: 'SURVEILLANCE', content: 'Agents being deployed without consent protocols' }
      }
    ],
    collectibles: [
      { x: 15, y: 7, z: 0, type: 'intel', clue: 'ARK PROTOCOL: Mass evacuation plan' },
      { x: 38, y: 9, z: -3, type: 'evidence', clue: 'Subject Survival Rate: 34%' },
      { x: 48, y: 13, z: 2, type: 'data_chip', clue: 'PASSWORD_FRAGMENT: LAND' }
    ]
  },

  underground_facility: {
    id: 'underground_facility',
    name: 'Sub-Basement Research Wing',
    description: 'The secret research facility where it all began',
    environment: {
      background: 0x0a0a0a,
      fog: { color: 0x0a0a0a, near: 15, far: 60 },
      ambient: 0x202020,
      lighting: { color: 0xff6600, intensity: 0.3 }
    },
    platforms: [
      { x: 0, y: 0, z: 0, w: 12, h: 0.5, d: 10, color: 0x1a1a1a },
      { x: 15, y: 4, z: -3, w: 9, h: 0.5, d: 7, color: 0x1a1a1a },
      { x: 27, y: 7, z: -6, w: 11, h: 0.5, d: 9, color: 0x1a1a1a },
      { x: 40, y: 5, z: -10, w: 10, h: 0.5, d: 8, color: 0x1a1a1a },
      { x: 53, y: 9, z: -7, w: 8, h: 0.5, d: 7, color: 0x1a1a1a },
      { x: 64, y: 13, z: -4, w: 14, h: 0.5, d: 10, color: 0x1a1a1a }
    ],
    obstacles: [
      { x: 20, y: 6, z: -3, type: 'laser', color: 0xff0000 },
      { x: 35, y: 6, z: -10, type: 'laser', color: 0xff0000 },
      { x: 58, y: 10, z: -7, type: 'laser', color: 0xff0000 }
    ],
    terminals: [
      { 
        x: 27, y: 8, z: -6, 
        id: 'facility_terminal_1',
        gameType: 'code',
        securityLevel: 'MAXIMUM',
        description: 'Dr. Ni\'s Personal Terminal',
        intel: { type: 'NI_LOGS', content: 'They\'re turning my life\'s work into weapons. The Ark was meant to save us all.' }
      },
      { 
        x: 53, y: 10, z: -7, 
        id: 'facility_terminal_2',
        gameType: 'memory',
        securityLevel: 'MAXIMUM',
        description: 'Phase 2 Documentation',
        intel: { type: 'PHASE_2_PLAN', content: 'Weaponization contracts: $4.7B. Military deployment: Q2 2026' }
      },
      { 
        x: 64, y: 14, z: -4, 
        id: 'facility_terminal_3',
        gameType: 'wire',
        securityLevel: 'CRITICAL',
        description: 'Ark Protocol Core System',
        intel: { type: 'ARK_CORE', content: 'Mass miniaturization sequence ready. 2 billion humans can be saved.' }
      }
    ],
    collectibles: [
      { x: 12, y: 5, z: -3, type: 'evidence', clue: 'CLASSIFIED: Profit over safety directive' },
      { x: 35, y: 8, z: -8, type: 'intel', clue: 'Dr. Ni\'s vision: Humanity\'s last hope' },
      { x: 48, y: 10, z: -10, type: 'data_chip', clue: 'FINAL FRAGMENT: Complete access granted' },
      { x: 70, y: 15, z: -2, type: 'evidence', clue: 'The truth must be exposed' }
    ]
  }
};

export function getLevel(levelId) {
  return LEVELS[levelId] || LEVELS.lab_interior;
}

export function getAllLevelIds() {
  return Object.keys(LEVELS);
}