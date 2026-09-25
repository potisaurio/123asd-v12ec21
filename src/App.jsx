import React, { useState, useEffect } from 'react';

// --- DATOS BASADOS EN D&D 5E REGLAS BÁSICAS ---
const RACES = {
  elfo_alto: { name: 'Alto Elfo', speed: 30, size: 'Medio', statMods: { dex: 2, int: 1 } },
  elfo_bosques: { name: 'Elfo de los Bosques', speed: 35, size: 'Medio', statMods: { dex: 2, wis: 1 } },
  enano_colinas: { name: 'Enano de las Colinas', speed: 25, size: 'Medio', statMods: { con: 2, wis: 1 }, hpBonus: 1 },
  enano_montaña: { name: 'Enano de la Montaña', speed: 25, size: 'Medio', statMods: { con: 2, str: 2 } },
  humano: { name: 'Humano', speed: 30, size: 'Medio', statMods: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
  mediano_piesligeros: { name: 'Mediano Piesligeros', speed: 25, size: 'Pequeño', statMods: { dex: 2, cha: 1 } },
  mediano_fornido: { name: 'Mediano Fornido', speed: 25, size: 'Pequeño', statMods: { dex: 2, con: 1 } },
};

const CLASSES = {
  clerigo: { name: 'Clérigo', hitDie: 8, saves: ['wis', 'cha'], mainStat: 'wis' },
  guerrero: { name: 'Guerrero', hitDie: 10, saves: ['str', 'con'], mainStat: 'str' },
  picaro: { name: 'Pícaro', hitDie: 8, saves: ['dex', 'int'], mainStat: 'dex' },
  mago: { name: 'Mago', hitDie: 6, saves: ['int', 'wis'], mainStat: 'int' },
};

// --- CONFIGURACIÓN DE ESTADÍSTICAS ---
const STATS_COL_1 = [
  { id: 'str', name: 'FUERZA', skills: [{ id: 'athletics', name: 'Atletismo' }] },
  { id: 'dex', name: 'DESTREZA', skills: [{ id: 'acrobatics', name: 'Acrobacias' }, { id: 'sleightOfHand', name: 'Juego de Manos' }, { id: 'stealth', name: 'Sigilo' }] },
  { id: 'con', name: 'CONSTITUCIÓN', skills: [] }
];

const STATS_COL_2 = [
  { id: 'int', name: 'INTELIGENCIA', skills: [{ id: 'arcana', name: 'Conoc. Arcano' }, { id: 'history', name: 'Historia' }, { id: 'investigation', name: 'Investigación' }, { id: 'nature', name: 'Naturaleza' }, { id: 'religion', name: 'Religión' }] },
  { id: 'wis', name: 'SABIDURÍA', skills: [{ id: 'animalHandling', name: 'Trato Animales' }, { id: 'medicine', name: 'Medicina' }, { id: 'perception', name: 'Percepción' }, { id: 'insight', name: 'Perspicacia' }, { id: 'survival', name: 'Supervivencia' }] },
  { id: 'cha', name: 'CARISMA', skills: [{ id: 'deception', name: 'Engañar' }, { id: 'intimidation', name: 'Intimidación' }, { id: 'performance', name: 'Interpretación' }, { id: 'persuasion', name: 'Persuasión' }] }
];

const ALL_STATS = [...STATS_COL_1, ...STATS_COL_2];

// --- SISTEMA DE COLORES (HUD COMPLETO) ---
const THEMES = {
  amber: { 
    name: 'Ámbar', hex: '#f59e0b', 
    appBg: 'bg-amber-950', panelBg: 'bg-amber-900/30', inputBg: 'bg-amber-950/60', 
    border: 'border-amber-700/50', textMain: 'text-amber-400', textMuted: 'text-amber-100/70', 
    textValue: 'text-white', accent: 'accent-amber-500', 
    tabActive: 'bg-amber-600 text-white shadow-lg shadow-amber-900/50', 
    tabInactive: 'bg-amber-900/50 text-amber-100 hover:bg-amber-800/80',
    btnPrimary: 'bg-amber-600 hover:bg-amber-500 text-white'
  },
  rose: { 
    name: 'Carmesí', hex: '#e11d48', 
    appBg: 'bg-rose-950', panelBg: 'bg-rose-900/30', inputBg: 'bg-rose-950/60', 
    border: 'border-rose-700/50', textMain: 'text-rose-400', textMuted: 'text-rose-100/70', 
    textValue: 'text-white', accent: 'accent-rose-500', 
    tabActive: 'bg-rose-600 text-white shadow-lg shadow-rose-900/50', 
    tabInactive: 'bg-rose-900/50 text-rose-100 hover:bg-rose-800/80',
    btnPrimary: 'bg-rose-600 hover:bg-rose-500 text-white'
  },
  emerald: { 
    name: 'Esmeralda', hex: '#10b981', 
    appBg: 'bg-emerald-950', panelBg: 'bg-emerald-900/30', inputBg: 'bg-emerald-950/60', 
    border: 'border-emerald-700/50', textMain: 'text-emerald-400', textMuted: 'text-emerald-100/70', 
    textValue: 'text-white', accent: 'accent-emerald-500', 
    tabActive: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50', 
    tabInactive: 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-800/80',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white'
  },
  indigo: { 
    name: 'Índigo', hex: '#6366f1', 
    appBg: 'bg-indigo-950', panelBg: 'bg-indigo-900/30', inputBg: 'bg-indigo-950/60', 
    border: 'border-indigo-700/50', textMain: 'text-indigo-400', textMuted: 'text-indigo-100/70', 
    textValue: 'text-white', accent: 'accent-indigo-500', 
    tabActive: 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50', 
    tabInactive: 'bg-indigo-900/50 text-indigo-100 hover:bg-indigo-800/80',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white'
  },
  purple: { 
    name: 'Violeta', hex: '#a855f7', 
    appBg: 'bg-purple-950', panelBg: 'bg-purple-900/30', inputBg: 'bg-purple-950/60', 
    border: 'border-purple-700/50', textMain: 'text-purple-400', textMuted: 'text-purple-100/70', 
    textValue: 'text-white', accent: 'accent-purple-500', 
    tabActive: 'bg-purple-600 text-white shadow-lg shadow-purple-900/50', 
    tabInactive: 'bg-purple-900/50 text-purple-100 hover:bg-purple-800/80',
    btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white'
  },
  cyan: { 
    name: 'Cian', hex: '#06b6d4', 
    appBg: 'bg-cyan-950', panelBg: 'bg-cyan-900/30', inputBg: 'bg-cyan-950/60', 
    border: 'border-cyan-700/50', textMain: 'text-cyan-400', textMuted: 'text-cyan-100/70', 
    textValue: 'text-white', accent: 'accent-cyan-500', 
    tabActive: 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50', 
    tabInactive: 'bg-cyan-900/50 text-cyan-100 hover:bg-cyan-800/80',
    btnPrimary: 'bg-cyan-600 hover:bg-cyan-500 text-white'
  }
};

const DEFAULT_CHAR = {
  id: '', name: 'Nuevo Personaje', theme: 'amber',
  classKey: '', raceKey: '', level: 1, background: '', xp: 0,
  size: 'Med', speed: 30, initiative: 0, passivePerception: 10, profBonus: 2, heroicInspiration: false,
  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { value: '1d8', spent: 0 },
  deathSaves: { successes: 0, failures: 0 },
  ac: 10, shield: 0,
  baseStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
  skills: ALL_STATS.reduce((acc, stat) => {
    stat.skills.forEach(skill => acc[skill.id] = { prof: false, exp: false });
    return acc;
  }, {}),
  proficiencies: { armor: '', weapons: '', tools: '' },
  attacks: [{ name: '', atk: '', dmg: '', notes: '' }],
  magic: {
    ability: 'CAR', mod: 0, saveDC: 10, atkBonus: 0,
    slots: Array(9).fill({ total: 0, spent: 0 }),
    spells: [{ level: 0, name: '', castTime: '', range: '', c: false, r: false, m: false, notes: '' }]
  },
  traits: { class: '', species: '', feats: '' },
  flavor: { appearance: '', backstory: '', languages: '', alignment: '' },
  inventory: { gear: '', attunement: '', coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 } },
  notes: ''
};

export default function App() {
  const [view, setView] = useState('HOME'); 
  const [characters, setCharacters] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [activeTab, setActiveTab] = useState('ESTADÍSTICAS');
  const [initiativeTracker, setInitiativeTracker] = useState([]);

  const [showCreator, setShowCreator] = useState(false);
  const [newChar, setNewChar] = useState({ name: '', raceKey: '', classKey: '', theme: 'amber' });

  useEffect(() => {
    const saved = localStorage.getItem('dnd_party_data_auto_v2');
    if (saved) setCharacters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('dnd_party_data_auto_v2', JSON.stringify(characters));
  }, [characters]);

  const getMod = (score) => Math.floor((score - 10) / 2);
  const getModFormatted = (score) => { const m = getMod(score); return m >= 0 ? `+${m}` : m; };

  const updateActiveChar = (updates) => {
    setCharacters(chars => chars.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
  };

  const activeChar = characters.find(c => c.id === activeCharId) || DEFAULT_CHAR;
  const t = THEMES[activeChar.theme] || THEMES['amber']; 
  const currentProfBonus = parseInt(activeChar.profBonus) || 0;

  // --- AUTOMATIZACIÓN DE CREACIÓN ---
  const handleCreateCharacter = () => {
    if (!newChar.name || !newChar.raceKey || !newChar.classKey) return;
    const raceData = RACES[newChar.raceKey];
    const classData = CLASSES[newChar.classKey];
    
    let newStats = { ...DEFAULT_CHAR.baseStats };
    if (raceData.statMods) {
      Object.keys(raceData.statMods).forEach(stat => newStats[stat] += raceData.statMods[stat]);
    }

    const conMod = getMod(newStats.con);
    let startHp = classData.hitDie + conMod;
    if (raceData.hpBonus) startHp += raceData.hpBonus;

    let newSaves = { ...DEFAULT_CHAR.saves };
    classData.saves.forEach(save => newSaves[save] = true);

    const generatedChar = {
      ...DEFAULT_CHAR,
      id: `char_${Date.now()}`,
      name: newChar.name,
      theme: newChar.theme,
      raceKey: newChar.raceKey,
      species: raceData.name,
      classKey: newChar.classKey,
      class: classData.name,
      speed: raceData.speed,
      size: raceData.size,
      baseStats: newStats,
      stats: newStats,
      hp: { current: startHp, max: startHp, temp: 0 },
      hitDice: { value: `1d${classData.hitDie}`, spent: 0 },
      saves: newSaves,
      magic: { ...DEFAULT_CHAR.magic, ability: classData.mainStat.toUpperCase() }
    };

    setCharacters([...characters, generatedChar]);
    setShowCreator(false);
    setNewChar({ name: '', raceKey: '', classKey: '', theme: 'amber' });
  };

  // --- VISTA: INICIO ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-12 drop-shadow-lg text-center">
          CRÓNICAS DE <span className="text-indigo-400">DISCORD</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <button onClick={() => setView('PLAYER_SELECT')} className="flex-1 bg-slate-900 border-2 border-slate-700 hover:border-indigo-400 p-10 rounded-2xl transition-all shadow-xl group">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">🗡️</span>
            <h2 className="text-2xl font-black text-white">Jugador</h2>
          </button>
          <button onClick={() => setView('DM_DASHBOARD')} className="flex-1 bg-slate-900 border-2 border-slate-700 hover:border-rose-400 p-10 rounded-2xl transition-all shadow-xl group">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">👁️</span>
            <h2 className="text-2xl font-black text-white">Dungeon Master</h2>
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA: SELECCIÓN DE PERSONAJE ---
  if (view === 'PLAYER_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-12 relative font-sans">
        <button onClick={() => setView('HOME')} className="text-white hover:text-indigo-300 mb-8 font-bold flex items-center gap-2">← Volver al Menú</button>
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-black text-white">Tus Personajes</h2>
          <button onClick={() => setShowCreator(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-900/50">+ Crear Personaje</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {characters.map((char) => {
            const charTheme = THEMES[char.theme || 'amber'];
            return (
              <button key={char.id} onClick={() => { setActiveCharId(char.id); setView('SHEET'); }} 
                className={`bg-slate-900 p-6 rounded-2xl border-2 border-slate-800 text-left transition-all hover:-translate-y-1 shadow-lg flex flex-col group relative`}
                style={{ borderColor: charTheme.hex }}
              >
                <div className={`absolute inset-0 opacity-10 rounded-2xl transition-opacity`} style={{ backgroundColor: charTheme.hex }}></div>
                <h3 className={`text-2xl font-black text-white z-10 drop-shadow-md`}>{char.name}</h3>
                <p className={`text-sm mt-1 z-10 font-bold`} style={{ color: charTheme.hex }}>{char.species} {char.class} (Nvl {char.level})</p>
                <div className="mt-auto pt-4 flex gap-2 z-10">
                  <span className="text-xs bg-slate-950 text-white px-3 py-1.5 rounded-lg font-bold">CA: {char.ac}</span>
                  <span className="text-xs bg-slate-950 text-white px-3 py-1.5 rounded-lg font-bold">HP: {char.hp.current}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* MODAL CREADOR DE PERSONAJE */}
        {showCreator && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-black text-white mb-6">Creación Rápida</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-2 uppercase tracking-wider">Nombre del Héroe</label>
                  <input type="text" value={newChar.name} onChange={e => setNewChar({...newChar, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-bold focus:border-indigo-500 focus:outline-none" placeholder="Ej: Faelin" />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-2 uppercase tracking-wider">Raza</label>
                  <select value={newChar.raceKey} onChange={e => setNewChar({...newChar, raceKey: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-bold focus:border-indigo-500 focus:outline-none">
                    <option value="">Selecciona Raza...</option>
                    {Object.entries(RACES).map(([key, race]) => <option key={key} value={key}>{race.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-300 block mb-2 uppercase tracking-wider">Clase</label>
                  <select value={newChar.classKey} onChange={e => setNewChar({...newChar, classKey: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-bold focus:border-indigo-500 focus:outline-none">
                    <option value="">Selecciona Clase...</option>
                    {Object.entries(CLASSES).map(([key, cls]) => <option key={key} value={key}>{cls.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-300 block mb-2 uppercase tracking-wider">Color del HUD</label>
                  <div className="flex gap-3 bg-slate-950 p-3 rounded-xl border border-slate-700">
                    {Object.entries(THEMES).map(([key, themeObj]) => (
                      <button key={key} onClick={() => setNewChar({...newChar, theme: key})} title={themeObj.name}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${newChar.theme === key ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white' : ''}`}
                        style={{ backgroundColor: themeObj.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowCreator(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleCreateCharacter} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50" disabled={!newChar.name || !newChar.raceKey || !newChar.classKey}>FORJAR</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA: DUNGEON MASTER ---
  if (view === 'DM_DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-white font-sans">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white">👁️ Panel del Dungeon Master</h1>
          <button onClick={() => setView('HOME')} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors">Salir al Menú</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            {characters.map(char => {
              const charTheme = THEMES[char.theme || 'amber'];
              return (
                <div key={char.id} className={`bg-slate-900 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-2 h-full`} style={{ backgroundColor: charTheme.hex }}></div>
                  <div className="flex justify-between items-start mb-4 pl-3">
                    <div>
                      <h3 className={`font-black text-xl text-white`}>{char.name}</h3>
                      <p className="text-sm font-bold mt-1" style={{ color: charTheme.hex }}>{char.species} {char.class} (Nvl {char.level})</p>
                    </div>
                    <span className="bg-slate-950 px-3 py-1.5 rounded-lg text-sm font-black border border-slate-700 text-white">CA {char.ac}</span>
                  </div>
                  <div className="pl-3">
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="text-slate-300">Vida (Temp: {char.hp.temp})</span>
                      <span className={char.hp.current <= 0 ? 'text-rose-500 font-black' : 'text-emerald-400 font-black'}>{char.hp.current} / {char.hp.max}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-5 border border-slate-800">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.max(0, (char.hp.current / char.hp.max) * 100)}%` }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-950 rounded-xl py-2 border border-slate-700"><span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">P. Pasiva</span><span className="font-black text-lg text-white">{char.passivePerception}</span></div>
                      <div className="bg-slate-950 rounded-xl py-2 border border-slate-700"><span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Iniciativa</span><span className="font-black text-lg text-white">{getModFormatted(char.stats.dex)}</span></div>
                      <div className="bg-slate-950 rounded-xl py-2 border border-slate-700"><span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Movimiento</span><span className="font-black text-lg text-white">{char.speed} ft</span></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 h-fit sticky top-6 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-5 flex items-center gap-2">⚔️ Iniciativa</h2>
            {initiativeTracker.sort((a, b) => b.roll - a.roll).map((entity, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl mb-3 border border-slate-700">
                <span className="font-bold text-white text-lg">{i + 1}. {entity.name}</span>
                <span className="text-rose-500 font-black text-2xl">{entity.roll}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-6">
              <input type="text" id="initName" placeholder="Monstruo / Jugador" className="w-full bg-slate-950 p-3.5 rounded-xl text-sm font-bold text-white border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500" />
              <input type="number" id="initRoll" placeholder="Tirada" className="w-24 bg-slate-950 p-3.5 rounded-xl text-sm font-bold text-white border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 text-center" />
              <button onClick={() => {
                const name = document.getElementById('initName').value;
                const roll = document.getElementById('initRoll').value;
                if(name && roll) {
                  setInitiativeTracker([...initiativeTracker, {name, roll: parseInt(roll)}]);
                  document.getElementById('initName').value = '';
                  document.getElementById('initRoll').value = '';
                }
              }} className="px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-black text-white transition-colors">+</button>
            </div>
            <button onClick={() => setInitiativeTracker([])} className="w-full mt-5 bg-slate-950 hover:bg-rose-900/50 border border-slate-700 text-sm text-slate-300 font-bold py-3 rounded-xl transition-colors">Limpiar Combate</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: FICHA DEL JUGADOR CON HUD TEÑIDO ---
  const renderStatBlock = (statsArray) => (
    <div className="space-y-4">
      {statsArray.map(stat => {
        const statScore = activeChar.stats[stat.id];
        const statMod = getMod(statScore);
        const isProfSave = activeChar.saves[stat.id];
        const totalSave = statMod + (isProfSave ? currentProfBonus : 0);
        const formatSave = totalSave >= 0 ? `+${totalSave}` : totalSave;

        return (
          <div key={stat.id} className={`p-5 rounded-3xl border shadow-md flex gap-5 ${t.panelBg} ${t.border}`}>
            <div className={`p-3 rounded-2xl border flex flex-col items-center w-24 justify-center ${t.inputBg} ${t.border}`}>
              <span className={`text-[12px] font-black mb-1 tracking-wider ${t.textMain}`}>{stat.name}</span>
              <input type="number" value={statScore} onChange={(e) => updateActiveChar({ stats: { ...activeChar.stats, [stat.id]: parseInt(e.target.value) || 0 } })} className={`w-full text-center bg-transparent text-3xl font-black ${t.textValue} focus:outline-none rounded transition-colors`} />
              <div className={`w-full text-center rounded-lg text-sm font-black mt-2 py-1 bg-black/20 ${t.textValue}`}>{getModFormatted(statScore)}</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <label className={`flex items-center gap-3 text-sm font-bold cursor-pointer mb-3 pb-3 border-b hover:bg-black/10 p-2 rounded-xl transition-colors ${t.border} ${t.textValue}`}>
                <input type="checkbox" checked={isProfSave} onChange={() => updateActiveChar({ saves: { ...activeChar.saves, [stat.id]: !isProfSave } })} className={`w-5 h-5 ${t.accent} cursor-pointer rounded`} />
                <span className={`w-8 text-center text-xl font-black ${isProfSave ? t.textMain : t.textMuted}`}>{formatSave}</span>
                Tirada de Salvación
              </label>
              <div className="space-y-1">
                {stat.skills.map(skill => {
                  const isProfSkill = activeChar.skills[skill.id].prof;
                  const totalSkill = statMod + (isProfSkill ? currentProfBonus : 0);
                  const formatSkill = totalSkill >= 0 ? `+${totalSkill}` : totalSkill;

                  return (
                    <label key={skill.id} className={`flex items-center gap-3 text-sm cursor-pointer hover:bg-black/10 p-2 rounded-xl transition-colors ${isProfSkill ? t.textValue + ' font-bold' : t.textMuted + ' font-medium'}`}>
                      <input type="checkbox" checked={isProfSkill} onChange={() => updateActiveChar({ skills: { ...activeChar.skills, [skill.id]: { ...activeChar.skills[skill.id], prof: !isProfSkill } } })} className={`w-4 h-4 ${t.accent} cursor-pointer rounded-sm`} />
                      <span className={`w-8 text-center font-black ${isProfSkill ? t.textMain : t.textMuted}`}>{formatSkill}</span>
                      <span>{skill.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );

  return (
    <div className={`min-h-screen font-sans p-2 md:p-6 transition-colors duration-500 ${t.appBg}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera Principal */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-xl relative transition-colors duration-500 ${t.panelBg} ${t.border}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`flex gap-3 p-3 rounded-2xl border ${t.inputBg} ${t.border}`}>
              {Object.entries(THEMES).map(([key, themeObj]) => (
                <button 
                  key={key} 
                  onClick={() => updateActiveChar({ theme: key })}
                  title={themeObj.name}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${activeChar.theme === key ? 'ring-2 ring-offset-4 ring-offset-transparent ring-white' : ''}`}
                  style={{ backgroundColor: themeObj.hex }}
                />
              ))}
            </div>
            <button onClick={() => setView('PLAYER_SELECT')} className={`font-black text-sm px-4 py-2.5 rounded-xl border transition-colors ${t.inputBg} ${t.border} ${t.textValue} hover:bg-black/20`}>🚪 CAMBIAR PERSONAJE</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-2/5">
              <label className={`text-xs uppercase font-black block mb-2 tracking-widest ${t.textMuted}`}>Nombre del Héroe</label>
              <input type="text" value={activeChar.name} onChange={(e) => updateActiveChar({ name: e.target.value })} className={`w-full p-3 rounded-2xl text-4xl md:text-5xl font-black ${t.textValue} border border-transparent focus:outline-none transition-colors ${t.inputBg} focus:${t.border}`} />
            </div>
            
            <div className={`w-full md:w-3/5 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl border ${t.inputBg} ${t.border}`}>
              {[
                { label: 'Clase', key: 'class' }, { label: 'Nivel', key: 'level', type: 'number' },
                { label: 'Trasfondo', key: 'background' }, { label: 'Especie', key: 'species' }
              ].map(field => (
                <div key={field.key}>
                  <label className={`text-[11px] uppercase font-black block mb-1 pl-1 tracking-widest ${t.textMuted}`}>{field.label}</label>
                  <input type={field.type || 'text'} value={activeChar[field.key]} onChange={(e) => updateActiveChar({ [field.key]: field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className={`w-full bg-transparent hover:bg-black/10 p-2 rounded-xl text-base font-bold ${t.textValue} border border-transparent focus:outline-none transition-colors focus:${t.border}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'ESTADÍSTICAS', icon: '🎲' },
            { id: 'COMBATE', icon: '⚔️' },
            { id: 'MAGIA', icon: '✨' },
            { id: 'RASGOS Y EQUIPO', icon: '🎒' },
            { id: 'DIARIO', icon: '📖' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-6 py-4 font-black text-sm rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${activeTab === tab.id ? t.tabActive + ' border-transparent' : t.tabInactive + ' border-transparent'}`}
            >
              <span className="text-lg">{tab.icon}</span> {tab.id}
            </button>
          ))}
        </div>
        
        {/* PESTAÑA 1: ESTADÍSTICAS */}
        {activeTab === 'ESTADÍSTICAS' && (
          <div className="space-y-6">
            <div className={`grid grid-cols-2 md:grid-cols-6 gap-4 p-6 rounded-3xl border shadow-md ${t.panelBg} ${t.border}`}>
              {[
                { label: 'Competencia', key: 'profBonus', ph: '+2' }, { label: 'Iniciativa', key: 'initiative', ph: '+0' },
                { label: 'Velocidad', key: 'speed', ph: '30' }, { label: 'Percepción Pas.', key: 'passivePerception', ph: '10' }
              ].map(item => (
                <div key={item.key} className={`p-4 rounded-2xl text-center border ${t.inputBg} ${t.border}`}>
                  <span className={`block text-[11px] uppercase font-black mb-2 tracking-widest h-6 ${t.textMuted}`}>{item.label}</span>
                  <input type="text" value={activeChar[item.key]} onChange={(e) => updateActiveChar({ [item.key]: e.target.value })} className={`w-full bg-transparent text-2xl font-black text-center focus:outline-none rounded transition-colors ${t.textValue}`} placeholder={item.ph}/>
                </div>
              ))}
              <div className={`col-span-2 p-4 rounded-2xl text-center border flex flex-col justify-center items-center ${t.inputBg} ${t.border}`}>
                 <span className={`block text-[11px] uppercase font-black mb-3 tracking-widest ${t.textMuted}`}>Inspiración Heroica</span>
                 <input type="checkbox" checked={activeChar.heroicInspiration} onChange={() => updateActiveChar({ heroicInspiration: !activeChar.heroicInspiration })} className={`w-8 h-8 ${t.accent} cursor-pointer rounded`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderStatBlock(STATS_COL_1)}
              {renderStatBlock(STATS_COL_2)}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: COMBATE */}
        {activeTab === 'COMBATE' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              <div className={`flex gap-6 md:w-1/3 p-8 rounded-3xl border shadow-md items-center justify-center ${t.panelBg} ${t.border}`}>
                <div className="text-center">
                  <span className={`block text-sm font-black mb-3 tracking-widest ${t.textMuted}`}>C. ARMADURA</span>
                  <div className={`p-5 rounded-full border-4 flex items-center justify-center mx-auto w-28 h-28 ${t.border} ${t.inputBg}`}>
                    <input type="number" value={activeChar.ac} onChange={(e) => updateActiveChar({ ac: e.target.value })} className={`w-full bg-transparent text-5xl font-black text-center focus:outline-none ${t.textValue}`} />
                  </div>
                </div>
                <div className="text-center">
                  <span className={`block text-sm font-black mb-3 tracking-widest ${t.textMuted}`}>ESCUDO</span>
                  <input type="number" value={activeChar.shield} onChange={(e) => updateActiveChar({ shield: e.target.value })} className={`w-20 p-4 rounded-2xl text-2xl font-black text-center border focus:outline-none transition-colors ${t.inputBg} ${t.border} ${t.textValue}`} placeholder="+2" />
                </div>
              </div>

              <div className={`md:w-2/3 p-8 rounded-3xl border shadow-md flex flex-col md:flex-row gap-8 justify-between items-center ${t.panelBg} ${t.border}`}>
                <div className="flex-1 w-full">
                  <h3 className={`text-sm uppercase font-black mb-3 tracking-widest ${t.textMuted}`}>Puntos de Golpe</h3>
                  <div className={`flex items-baseline gap-3 p-5 rounded-3xl border w-full justify-center md:justify-start ${t.inputBg} ${t.border}`}>
                    <input type="number" value={activeChar.hp.current} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, current: e.target.value } })} className="w-24 bg-transparent text-6xl font-black text-emerald-400 text-right focus:outline-none" />
                    <span className={`text-4xl ${t.textMuted}`}>/</span>
                    <input type="number" value={activeChar.hp.max} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, max: e.target.value } })} className={`w-20 bg-transparent text-3xl font-black focus:outline-none ${t.textValue}`} />
                  </div>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                   <div className={`text-center flex-1 p-5 rounded-3xl border ${t.inputBg} ${t.border}`}>
                    <span className={`block text-[11px] font-black mb-3 tracking-widest ${t.textMuted}`}>HP TEMP</span>
                    <input type="number" value={activeChar.hp.temp} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, temp: e.target.value } })} className={`w-full bg-transparent text-4xl font-black text-center focus:outline-none ${t.textMain}`} />
                  </div>
                  <div className={`text-center flex-1 p-5 rounded-3xl border ${t.inputBg} ${t.border}`}>
                    <span className={`block text-[11px] font-black mb-3 tracking-widest ${t.textMuted}`}>DADOS GOLPE</span>
                    <input type="text" value={activeChar.hitDice.value} onChange={(e) => updateActiveChar({ hitDice: { ...activeChar.hitDice, value: e.target.value } })} className={`w-full bg-transparent text-2xl font-black text-center focus:outline-none ${t.textValue}`} placeholder="1d8" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border shadow-md ${t.panelBg} ${t.border}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg uppercase font-black tracking-widest ${t.textMain}`}>Armas y Trucos de Daño</h3>
                <button onClick={() => updateActiveChar({ attacks: [...activeChar.attacks, { name: '', atk: '', dmg: '', notes: '' }] })} className={`text-sm font-black px-4 py-2 rounded-xl border transition-colors ${t.inputBg} ${t.border} ${t.textValue} hover:bg-black/20`}>+ AÑADIR ATAQUE</button>
              </div>
              <div className="space-y-4">
                {activeChar.attacks.map((atk, index) => (
                  <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl border ${t.inputBg} ${t.border}`}>
                    <input type="text" value={atk.name} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].name = e.target.value; updateActiveChar({ attacks: newAtks }); }} className={`bg-transparent p-2 rounded text-base font-bold focus:outline-none ${t.textValue}`} placeholder="Ej: Espada Larga" />
                    <input type="text" value={atk.atk} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].atk = e.target.value; updateActiveChar({ attacks: newAtks }); }} className={`bg-transparent p-2 rounded text-base text-center font-black focus:outline-none ${t.textMain}`} placeholder="Atq: +5" />
                    <input type="text" value={atk.dmg} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].dmg = e.target.value; updateActiveChar({ attacks: newAtks }); }} className={`bg-transparent p-2 rounded text-base font-black text-rose-400 focus:outline-none`} placeholder="Daño: 1d8+3 Cort." />
                    <input type="text" value={atk.notes} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].notes = e.target.value; updateActiveChar({ attacks: newAtks }); }} className={`bg-transparent p-2 rounded text-sm font-bold focus:outline-none ${t.textMuted}`} placeholder="Notas adicionales" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: MAGIA */}
        {activeTab === 'MAGIA' && (
          <div className={`p-8 rounded-3xl border shadow-md space-y-8 ${t.panelBg} ${t.border}`}>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'Aptitud Mágica', key: 'ability', ph: 'INT' }, { label: 'Modificador', key: 'mod', ph: '+3' },
                 { label: 'CD Salvación', key: 'saveDC', ph: '13' }, { label: 'Bonif. Ataque', key: 'atkBonus', ph: '+5' }
               ].map(item => (
                 <div key={item.key} className={`p-5 rounded-2xl text-center border ${t.inputBg} ${t.border}`}>
                   <span className={`block text-[11px] uppercase font-black mb-3 tracking-widest ${t.textMuted}`}>{item.label}</span>
                   <input type="text" value={activeChar.magic[item.key]} onChange={(e) => updateActiveChar({ magic: { ...activeChar.magic, [item.key]: e.target.value } })} className={`w-full bg-transparent text-3xl font-black text-center focus:outline-none ${t.textValue}`} placeholder={item.ph}/>
                 </div>
               ))}
             </div>

             <div className={`p-6 rounded-2xl border ${t.inputBg} ${t.border}`}>
               <h3 className={`text-sm uppercase font-black mb-4 tracking-widest ${t.textMuted}`}>Espacios de Conjuro (Total)</h3>
               <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                 {activeChar.magic.slots.map((slot, i) => (
                   <div key={i} className={`p-3 rounded-xl border text-center ${t.panelBg} ${t.border}`}>
                     <span className={`block text-[11px] font-black mb-2 ${t.textMuted}`}>Nvl {i+1}</span>
                     <input type="number" value={slot.total} onChange={(e) => { const newSlots = [...activeChar.magic.slots]; newSlots[i].total = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, slots: newSlots } }); }} className={`w-full bg-transparent text-xl font-black text-center focus:outline-none ${t.textValue}`} />
                   </div>
                 ))}
               </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg uppercase font-black tracking-widest ${t.textMain}`}>Lista de Conjuros</h3>
                  <button onClick={() => updateActiveChar({ magic: { ...activeChar.magic, spells: [...activeChar.magic.spells, { level: 0, name: '', notes: '' }] } })} className={`text-sm font-black px-4 py-2 rounded-xl border transition-colors ${t.inputBg} ${t.border} ${t.textValue} hover:bg-black/20`}>+ AÑADIR CONJURO</button>
                </div>
                <div className="space-y-4">
                  {activeChar.magic.spells.map((spell, index) => (
                    <div key={index} className={`flex gap-4 p-4 rounded-2xl border items-center ${t.inputBg} ${t.border}`}>
                      <input type="number" value={spell.level} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].level = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className={`w-16 bg-black/20 p-3 rounded-xl text-lg font-black text-center focus:outline-none ${t.textMuted}`} title="Nivel" />
                      <input type="text" value={spell.name} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].name = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className={`flex-1 bg-transparent p-3 text-base font-black focus:outline-none ${t.textValue}`} placeholder="Nombre del Conjuro" />
                      <input type="text" value={spell.notes} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].notes = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className={`flex-[2] bg-transparent p-3 text-sm font-bold focus:outline-none hidden md:block ${t.textMuted}`} placeholder="Efecto, alcance, daño..." />
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* PESTAÑA 4: RASGOS Y EQUIPO */}
        {activeTab === 'RASGOS Y EQUIPO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border flex flex-col h-80 shadow-md ${t.panelBg} ${t.border}`}>
                <h3 className={`text-sm uppercase font-black mb-4 tracking-widest ${t.textMain}`}>Rasgos y Dotes</h3>
                <textarea value={activeChar.traits.class} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, class: e.target.value } })} className={`w-full flex-1 p-5 rounded-2xl text-sm font-bold focus:outline-none resize-none custom-scrollbar border transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} placeholder="Anota aquí tus habilidades de clase, dotes, visión en la oscuridad, etc..."></textarea>
              </div>
              <div className={`p-8 rounded-3xl border shadow-md ${t.panelBg} ${t.border}`}>
                <h3 className={`text-sm uppercase font-black mb-4 tracking-widest ${t.textMain}`}>Competencias</h3>
                <div className="space-y-4">
                  <input type="text" value={activeChar.proficiencies.armor} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, armor: e.target.value } })} className={`w-full p-4 rounded-2xl text-sm font-bold focus:outline-none border ${t.inputBg} ${t.border} ${t.textValue}`} placeholder="Armaduras y Escudos..." />
                  <input type="text" value={activeChar.proficiencies.weapons} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, weapons: e.target.value } })} className={`w-full p-4 rounded-2xl text-sm font-bold focus:outline-none border ${t.inputBg} ${t.border} ${t.textValue}`} placeholder="Armas..." />
                  <input type="text" value={activeChar.proficiencies.tools} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, tools: e.target.value } })} className={`w-full p-4 rounded-2xl text-sm font-bold focus:outline-none border ${t.inputBg} ${t.border} ${t.textValue}`} placeholder="Herramientas e Idiomas..." />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border flex flex-col h-80 shadow-md ${t.panelBg} ${t.border}`}>
                <h3 className={`text-sm uppercase font-black mb-4 tracking-widest ${t.textMain}`}>Equipo e Inventario</h3>
                <textarea value={activeChar.inventory.gear} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, gear: e.target.value } })} className={`w-full flex-1 p-5 rounded-2xl text-sm font-bold focus:outline-none resize-none custom-scrollbar border transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} placeholder="Mochila, pociones, cuerdas..."></textarea>
              </div>
              <div className={`p-8 rounded-3xl border shadow-md ${t.panelBg} ${t.border}`}>
                <h3 className={`text-sm uppercase font-black mb-5 tracking-widest ${t.textMain}`}>Monedas</h3>
                <div className="grid grid-cols-5 gap-3">
                  {['pc', 'pp', 'pe', 'po', 'ppt'].map(coin => (
                    <div key={coin} className={`p-3 rounded-2xl border text-center ${t.inputBg} ${t.border}`}>
                      <span className={`text-[11px] font-black uppercase block mb-2 ${t.textMuted}`}>{coin}</span>
                      <input type="number" value={activeChar.inventory.coins[coin]} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, coins: { ...activeChar.inventory.coins, [coin]: parseInt(e.target.value)||0 } } })} className={`w-full bg-transparent text-xl font-black text-center focus:outline-none ${t.textValue}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 5: DIARIO */}
        {activeTab === 'DIARIO' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`md:col-span-2 p-8 rounded-3xl border flex flex-col h-[650px] shadow-md ${t.panelBg} ${t.border}`}>
              <h3 className={`text-sm uppercase font-black mb-4 tracking-widest flex items-center gap-2 ${t.textMain}`}>📖 Notas de Campaña y Diario</h3>
              <textarea 
                value={activeChar.notes} 
                onChange={(e) => updateActiveChar({ notes: e.target.value })} 
                className={`w-full flex-1 p-6 rounded-2xl text-base leading-relaxed font-medium focus:outline-none resize-none custom-scrollbar border transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} 
                placeholder="Anota aquí los nombres de los NPCs importantes, pistas de la misión principal, ideas, lugares visitados, o las locuras que hace tu party en cada sesión..."
              ></textarea>
            </div>
            
            <div className={`p-8 rounded-3xl border flex flex-col h-[650px] shadow-md ${t.panelBg} ${t.border}`}>
              <h3 className={`text-sm uppercase font-black mb-4 tracking-widest ${t.textMain}`}>Historia del Personaje</h3>
              <textarea 
                value={activeChar.flavor.backstory} 
                onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, backstory: e.target.value } })} 
                className={`w-full flex-1 p-5 rounded-2xl text-sm font-medium focus:outline-none resize-none custom-scrollbar border transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} 
                placeholder="Escribe tu trasfondo, tus motivaciones, tu familia y por qué decidiste convertirte en aventurero..."
              ></textarea>
              
              <div className={`mt-6 pt-6 border-t space-y-5 ${t.border}`}>
                <div>
                  <label className={`text-[11px] uppercase font-black block mb-2 tracking-widest ${t.textMuted}`}>Alineamiento</label>
                  <input type="text" value={activeChar.flavor.alignment} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, alignment: e.target.value } })} className={`w-full p-4 rounded-2xl text-sm font-bold border focus:outline-none transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} placeholder="Caótico Bueno" />
                </div>
                <div>
                  <label className={`text-[11px] uppercase font-black block mb-2 tracking-widest ${t.textMuted}`}>Aspecto Físico</label>
                  <input type="text" value={activeChar.flavor.appearance} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, appearance: e.target.value } })} className={`w-full p-4 rounded-2xl text-sm font-bold border focus:outline-none transition-colors ${t.inputBg} ${t.border} ${t.textValue} focus:border-white/20`} placeholder="Alto, cicatriz en el ojo..." />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
