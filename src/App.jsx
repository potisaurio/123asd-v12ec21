import React, { useState, useEffect } from 'react';

// --- DATOS BASADOS EN D&D 5E REGLAS BÁSICAS ---
// Razas Básicas
const RACES = {
  elfo_alto: { name: 'Alto Elfo', speed: 30, size: 'Medio', statMods: { dex: 2, int: 1 } },
  elfo_bosques: { name: 'Elfo de los Bosques', speed: 35, size: 'Medio', statMods: { dex: 2, wis: 1 } },
  enano_colinas: { name: 'Enano de las Colinas', speed: 25, size: 'Medio', statMods: { con: 2, wis: 1 }, hpBonus: 1 },
  enano_montaña: { name: 'Enano de la Montaña', speed: 25, size: 'Medio', statMods: { con: 2, str: 2 } },
  humano: { name: 'Humano', speed: 30, size: 'Medio', statMods: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
  mediano_piesligeros: { name: 'Mediano Piesligeros', speed: 25, size: 'Pequeño', statMods: { dex: 2, cha: 1 } },
  mediano_fornido: { name: 'Mediano Fornido', speed: 25, size: 'Pequeño', statMods: { dex: 2, con: 1 } },
};

// Clases Básicas
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

// --- SISTEMA DE COLORES ---
const THEMES = {
  amber: { name: 'Ámbar', hex: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-600', border: 'border-amber-500/50', accent: 'accent-amber-500', lightBg: 'bg-amber-500/10' },
  rose: { name: 'Carmesí', hex: '#e11d48', text: 'text-rose-500', bg: 'bg-rose-600', border: 'border-rose-500/50', accent: 'accent-rose-500', lightBg: 'bg-rose-500/10' },
  emerald: { name: 'Esmeralda', hex: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-600', border: 'border-emerald-500/50', accent: 'accent-emerald-500', lightBg: 'bg-emerald-500/10' },
  indigo: { name: 'Índigo', hex: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-600', border: 'border-indigo-400/50', accent: 'accent-indigo-500', lightBg: 'bg-indigo-500/10' },
  purple: { name: 'Violeta', hex: '#a855f7', text: 'text-purple-400', bg: 'bg-purple-600', border: 'border-purple-400/50', accent: 'accent-purple-500', lightBg: 'bg-purple-500/10' },
  cyan: { name: 'Cian', hex: '#06b6d4', text: 'text-cyan-400', bg: 'bg-cyan-600', border: 'border-cyan-400/50', accent: 'accent-cyan-500', lightBg: 'bg-cyan-500/10' }
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

  // Variables para el Modal de Creación
  const [showCreator, setShowCreator] = useState(false);
  const [newChar, setNewChar] = useState({ name: '', raceKey: '', classKey: '' });

  useEffect(() => {
    const saved = localStorage.getItem('dnd_party_data_auto');
    if (saved) setCharacters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('dnd_party_data_auto', JSON.stringify(characters));
  }, [characters]);

  // Funciones Matemáticas
  const getMod = (score) => Math.floor((score - 10) / 2);
  const getModFormatted = (score) => { const m = getMod(score); return m >= 0 ? `+${m}` : m; };

  const updateActiveChar = (updates) => {
    setCharacters(chars => chars.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
  };

  const activeChar = characters.find(c => c.id === activeCharId) || DEFAULT_CHAR;
  const t = THEMES[activeChar.theme] || THEMES['amber']; 
  const currentProfBonus = parseInt(activeChar.profBonus) || 0;

  // --- AUTOMATIZACIÓN DE CREACIÓN DE PERSONAJE ---
  const handleCreateCharacter = () => {
    if (!newChar.name || !newChar.raceKey || !newChar.classKey) return;

    const raceData = RACES[newChar.raceKey];
    const classData = CLASSES[newChar.classKey];
    
    // Aplicar bonificadores raciales a estadísticas base (10 por defecto)
    let newStats = { ...DEFAULT_CHAR.baseStats };
    if (raceData.statMods) {
      Object.keys(raceData.statMods).forEach(stat => {
        newStats[stat] += raceData.statMods[stat];
      });
    }

    // Calcular Vida Nivel 1 (Dado + Mod. Constitución)
    const conMod = getMod(newStats.con);
    let startHp = classData.hitDie + conMod;
    if (raceData.hpBonus) startHp += raceData.hpBonus; // Bono Enano de las Colinas

    // Asignar Salvaciones Automáticas de Clase
    let newSaves = { ...DEFAULT_CHAR.saves };
    classData.saves.forEach(save => newSaves[save] = true);

    const generatedChar = {
      ...DEFAULT_CHAR,
      id: `char_${Date.now()}`,
      name: newChar.name,
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
    setNewChar({ name: '', raceKey: '', classKey: '' });
  };

  // --- VISTA: INICIO ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl md:text-6xl font-black text-slate-100 mb-12 drop-shadow-lg text-center">
          CRÓNICAS DE <span className="text-indigo-500">DISCORD</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <button onClick={() => setView('PLAYER_SELECT')} className="flex-1 bg-slate-900 border-2 border-slate-800 hover:border-indigo-500 p-10 rounded-2xl transition-all shadow-xl shadow-slate-950 group">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">🗡️</span>
            <h2 className="text-2xl font-bold text-slate-100">Jugador</h2>
          </button>
          <button onClick={() => setView('DM_DASHBOARD')} className="flex-1 bg-slate-900 border-2 border-slate-800 hover:border-rose-500 p-10 rounded-2xl transition-all shadow-xl shadow-slate-950 group">
            <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">👁️</span>
            <h2 className="text-2xl font-bold text-slate-100">Dungeon Master</h2>
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA: SELECCIÓN DE PERSONAJE ---
  if (view === 'PLAYER_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-12 relative">
        <button onClick={() => setView('HOME')} className="text-slate-400 hover:text-white mb-8 font-bold flex items-center gap-2">← Volver al Menú</button>
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-bold text-slate-100">Tus Personajes</h2>
          <button onClick={() => setShowCreator(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg">+ Crear Personaje</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {characters.map((char) => {
            const charTheme = THEMES[char.theme || 'amber'];
            return (
              <button key={char.id} onClick={() => { setActiveCharId(char.id); setView('SHEET'); }} 
                className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-800 text-left transition-all hover:-translate-y-1 shadow-lg flex flex-col group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-t from-${charTheme.hex} to-transparent opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <h3 className={`text-xl font-black ${charTheme.text}`}>{char.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{char.species} {char.class} Nvl {char.level}</p>
                <div className="mt-auto pt-4 flex gap-2">
                  <span className="text-xs bg-slate-950 text-slate-300 px-2 py-1 rounded-md font-bold">CA: {char.ac}</span>
                  <span className="text-xs bg-slate-950 text-slate-300 px-2 py-1 rounded-md font-bold">HP: {char.hp.current}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* MODAL CREADOR DE PERSONAJE */}
        {showCreator && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-black text-indigo-400 mb-6">Creación Rápida</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Nombre</label>
                  <input type="text" value={newChar.name} onChange={e => setNewChar({...newChar, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 focus:outline-none" placeholder="Nombre de tu héroe" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Raza</label>
                  <select value={newChar.raceKey} onChange={e => setNewChar({...newChar, raceKey: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option value="">Selecciona Raza...</option>
                    {Object.entries(RACES).map(([key, race]) => (
                      <option key={key} value={key}>{race.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Clase</label>
                  <select value={newChar.classKey} onChange={e => setNewChar({...newChar, classKey: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option value="">Selecciona Clase...</option>
                    {Object.entries(CLASSES).map(([key, cls]) => (
                      <option key={key} value={key}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowCreator(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleCreateCharacter} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled={!newChar.name || !newChar.raceKey || !newChar.classKey}>Forjar Destino</button>
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
      <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-rose-500">👁️ Visión del Dungeon Master</h1>
          <button onClick={() => setView('HOME')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition-colors">Volver</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map(char => {
              const charTheme = THEMES[char.theme || 'amber'];
              return (
                <div key={char.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{ backgroundColor: charTheme.hex }}></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <h3 className={`font-black text-lg ${charTheme.text}`}>{char.name}</h3>
                      <p className="text-xs text-slate-400">{char.species} {char.class} (Nvl {char.level})</p>
                    </div>
                    <span className="bg-slate-950 px-3 py-1 rounded-lg text-sm font-bold border border-slate-700">CA {char.ac}</span>
                  </div>
                  <div className="pl-2">
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-400">Vida (Temp: {char.hp.temp})</span>
                      <span className={char.hp.current <= 0 ? 'text-rose-500' : 'text-emerald-400'}>{char.hp.current} / {char.hp.max}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-800">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.max(0, (char.hp.current / char.hp.max) * 100)}%` }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 rounded-lg py-2 border border-slate-800/50">P. Pasiva<br/><span className="font-bold text-sm text-slate-200">{char.passivePerception}</span></div>
                      <div className="bg-slate-950 rounded-lg py-2 border border-slate-800/50">Iniciativa<br/><span className="font-bold text-sm text-slate-200">{getModFormatted(char.stats.dex)}</span></div>
                      <div className="bg-slate-950 rounded-lg py-2 border border-slate-800/50">Mov.<br/><span className="font-bold text-sm text-slate-200">{char.speed} ft</span></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit sticky top-6">
            <h2 className="text-xl font-black text-slate-200 mb-4 flex items-center gap-2">⚔️ Iniciativa</h2>
            {initiativeTracker.sort((a, b) => b.roll - a.roll).map((entity, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg mb-2 border border-slate-800">
                <span className="font-bold text-slate-300">{i + 1}. {entity.name}</span>
                <span className="text-rose-400 font-black text-lg">{entity.roll}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-6">
              <input type="text" id="initName" placeholder="Monstruo/Jugador" className="w-full bg-slate-950 p-3 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-rose-500" />
              <input type="number" id="initRoll" placeholder="Rol" className="w-24 bg-slate-950 p-3 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-rose-500" />
              <button onClick={() => {
                const name = document.getElementById('initName').value;
                const roll = document.getElementById('initRoll').value;
                if(name && roll) {
                  setInitiativeTracker([...initiativeTracker, {name, roll: parseInt(roll)}]);
                  document.getElementById('initName').value = '';
                  document.getElementById('initRoll').value = '';
                }
              }} className="px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold border border-slate-700 transition-colors">+</button>
            </div>
            <button onClick={() => setInitiativeTracker([])} className="w-full mt-4 text-xs text-slate-500 hover:text-rose-400 font-bold transition-colors">Limpiar Combate</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: FICHA DEL JUGADOR ---
  const renderStatBlock = (statsArray) => (
    <div className="space-y-4">
      {statsArray.map(stat => {
        const statScore = activeChar.stats[stat.id];
        const statMod = getMod(statScore);
        const isProfSave = activeChar.saves[stat.id];
        const totalSave = statMod + (isProfSave ? currentProfBonus : 0);
        const formatSave = totalSave >= 0 ? `+${totalSave}` : totalSave;

        return (
          <div key={stat.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-4 shadow-sm">
            <div className={`p-3 rounded-xl border ${t.border} flex flex-col items-center w-24 bg-slate-950`}>
              <span className="text-[10px] text-slate-500 font-black mb-1">{stat.name}</span>
              <input type="number" value={statScore} onChange={(e) => updateActiveChar({ stats: { ...activeChar.stats, [stat.id]: parseInt(e.target.value) || 0 } })} className={`w-full text-center bg-transparent text-2xl font-black ${t.text} focus:outline-none hover:bg-slate-900 rounded transition-colors`} />
              <div className="bg-slate-800/50 w-full text-center rounded text-sm font-bold text-slate-300 mt-2 py-0.5">{getModFormatted(statScore)}</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-200 cursor-pointer mb-2 border-b border-slate-800/50 pb-2 hover:bg-slate-800/30 p-1 rounded transition-colors">
                <input type="checkbox" checked={isProfSave} onChange={() => updateActiveChar({ saves: { ...activeChar.saves, [stat.id]: !isProfSave } })} className={`w-4 h-4 ${t.accent} cursor-pointer rounded`} />
                <span className={`w-6 text-center text-lg font-mono ${isProfSave ? t.text : 'text-slate-400'}`}>{formatSave}</span>
                Tirada de Salvación
              </label>
              <div className="space-y-1">
                {stat.skills.map(skill => {
                  const isProfSkill = activeChar.skills[skill.id].prof;
                  const totalSkill = statMod + (isProfSkill ? currentProfBonus : 0);
                  const formatSkill = totalSkill >= 0 ? `+${totalSkill}` : totalSkill;

                  return (
                    <label key={skill.id} className="flex items-center gap-3 text-xs text-slate-400 cursor-pointer hover:bg-slate-800/30 p-1 rounded transition-colors">
                      <input type="checkbox" checked={isProfSkill} onChange={() => updateActiveChar({ skills: { ...activeChar.skills, [skill.id]: { ...activeChar.skills[skill.id], prof: !isProfSkill } } })} className={`w-3.5 h-3.5 ${t.accent} cursor-pointer rounded-sm`} />
                      <span className={`w-6 text-center font-mono text-sm ${isProfSkill ? t.text : 'text-slate-500'}`}>{formatSkill}</span>
                      <span className={isProfSkill ? 'text-slate-200 font-bold' : ''}>{skill.name}</span>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 md:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera Principal */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              {Object.entries(THEMES).map(([key, themeObj]) => (
                <button 
                  key={key} 
                  onClick={() => updateActiveChar({ theme: key })}
                  title={themeObj.name}
                  className={`w-5 h-5 rounded-full transition-transform hover:scale-125 ${activeChar.theme === key ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-slate-400' : ''}`}
                  style={{ backgroundColor: themeObj.hex }}
                />
              ))}
            </div>
            <button onClick={() => setView('PLAYER_SELECT')} className="text-slate-500 hover:text-slate-200 font-bold text-sm bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">🚪 Cambiar Personaje</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-2/5">
              <label className="text-xs uppercase text-slate-500 font-black block mb-1">Nombre del Personaje</label>
              <input type="text" value={activeChar.name} onChange={(e) => updateActiveChar({ name: e.target.value })} className={`w-full bg-slate-950/50 hover:bg-slate-950 p-2 rounded-xl text-3xl md:text-4xl font-black ${t.text} border border-transparent hover:border-slate-700 focus:outline-none focus:border-slate-600 transition-colors`} />
            </div>
            
            <div className="w-full md:w-3/5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
              {[
                { label: 'Clase', key: 'class' }, { label: 'Nivel', key: 'level', type: 'number' },
                { label: 'Trasfondo', key: 'background' }, { label: 'Especie', key: 'species' }
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1 pl-1">{field.label}</label>
                  <input type={field.type || 'text'} value={activeChar[field.key]} onChange={(e) => updateActiveChar({ [field.key]: field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full bg-slate-900 hover:bg-slate-800 p-2 rounded-lg text-sm font-bold text-slate-200 border border-transparent hover:border-slate-700 focus:outline-none transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
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
              className={`px-5 py-3 font-bold text-sm rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${activeTab === tab.id ? `${t.bg} text-white border-transparent shadow-lg` : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <span>{tab.icon}</span> {tab.id}
            </button>
          ))}
        </div>
        
        {/* PESTAÑA 1: ESTADÍSTICAS */}
        {activeTab === 'ESTADÍSTICAS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              {[
                { label: 'Competencia', key: 'profBonus', ph: '+2' }, { label: 'Iniciativa', key: 'initiative', ph: '+0' },
                { label: 'Velocidad', key: 'speed', ph: '30' }, { label: 'Percepción Pas.', key: 'passivePerception', ph: '10' }
              ].map(item => (
                <div key={item.key} className="bg-slate-950 p-3 rounded-xl text-center border border-slate-800/50">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1 h-6">{item.label}</span>
                  <input type="text" value={activeChar[item.key]} onChange={(e) => updateActiveChar({ [item.key]: e.target.value })} className="w-full bg-transparent text-xl font-bold text-center focus:outline-none hover:bg-slate-900 rounded transition-colors" placeholder={item.ph}/>
                </div>
              ))}
              <div className="col-span-2 bg-slate-950 p-3 rounded-xl text-center border border-slate-800/50 flex flex-col justify-center items-center">
                 <span className="block text-[10px] uppercase text-slate-500 font-bold mb-2">Inspiración Heroica</span>
                 <input type="checkbox" checked={activeChar.heroicInspiration} onChange={() => updateActiveChar({ heroicInspiration: !activeChar.heroicInspiration })} className={`w-6 h-6 ${t.accent} cursor-pointer rounded`} />
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
              
              <div className="flex gap-4 md:w-1/3 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm items-center justify-center">
                <div className="text-center">
                  <span className="block text-xs text-slate-500 font-black mb-2">C. ARMADURA</span>
                  <div className={`p-4 rounded-full border-4 ${t.border} bg-slate-950 w-24 h-24 flex items-center justify-center mx-auto`}>
                    <input type="number" value={activeChar.ac} onChange={(e) => updateActiveChar({ ac: e.target.value })} className="w-full bg-transparent text-4xl font-black text-center focus:outline-none" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-slate-500 font-black mb-2">ESCUDO</span>
                  <input type="number" value={activeChar.shield} onChange={(e) => updateActiveChar({ shield: e.target.value })} className="w-16 bg-slate-950 p-2 rounded-xl text-xl font-bold text-center border border-slate-800 focus:outline-none hover:border-slate-600 transition-colors" placeholder="+2" />
                </div>
              </div>

              <div className="md:w-2/3 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xs uppercase text-slate-500 font-black mb-2">Puntos de Golpe</h3>
                  <div className="flex items-baseline gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 w-fit">
                    <input type="number" value={activeChar.hp.current} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, current: e.target.value } })} className="w-20 bg-transparent text-5xl font-black text-emerald-500 text-right focus:outline-none hover:bg-slate-900 rounded transition-colors" />
                    <span className="text-slate-600 text-3xl">/</span>
                    <input type="number" value={activeChar.hp.max} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, max: e.target.value } })} className="w-16 bg-transparent text-2xl font-bold text-slate-400 focus:outline-none hover:bg-slate-900 rounded transition-colors" />
                  </div>
                </div>
                
                <div className="flex gap-4 flex-1">
                   <div className="text-center flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold mb-2">HP TEMP</span>
                    <input type="number" value={activeChar.hp.temp} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, temp: e.target.value } })} className={`w-full bg-transparent text-3xl font-bold text-center ${t.text} focus:outline-none hover:bg-slate-900 rounded transition-colors`} />
                  </div>
                  <div className="text-center flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold mb-2">DADOS GOLPE</span>
                    <input type="text" value={activeChar.hitDice.value} onChange={(e) => updateActiveChar({ hitDice: { ...activeChar.hitDice, value: e.target.value } })} className="w-full bg-transparent text-xl font-bold text-center text-slate-300 focus:outline-none hover:bg-slate-900 rounded transition-colors" placeholder="1d8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm uppercase text-slate-300 font-black">Armas y Trucos de Daño</h3>
                <button onClick={() => updateActiveChar({ attacks: [...activeChar.attacks, { name: '', atk: '', dmg: '', notes: '' }] })} className={`text-xs font-bold ${t.text} bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors`}>+ Añadir Ataque</button>
              </div>
              <div className="space-y-3">
                {activeChar.attacks.map((atk, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/50">
                    <input type="text" value={atk.name} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].name = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-200 focus:outline-none transition-colors border border-transparent hover:border-slate-700" placeholder="Ej: Espada Larga" />
                    <input type="text" value={atk.atk} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].atk = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm text-center font-bold text-slate-300 focus:outline-none transition-colors border border-transparent hover:border-slate-700" placeholder="Atq: +5" />
                    <input type="text" value={atk.dmg} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].dmg = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm font-bold text-rose-400 focus:outline-none transition-colors border border-transparent hover:border-slate-700" placeholder="Daño: 1d8+3 Cort." />
                    <input type="text" value={atk.notes} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].notes = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm text-slate-400 focus:outline-none transition-colors border border-transparent hover:border-slate-700" placeholder="Notas adicionales" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: MAGIA */}
        {activeTab === 'MAGIA' && (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Aptitud Mágica', key: 'ability', ph: 'INT' }, { label: 'Modificador', key: 'mod', ph: '+3' },
                 { label: 'CD Salvación', key: 'saveDC', ph: '13' }, { label: 'Bonif. Ataque', key: 'atkBonus', ph: '+5' }
               ].map(item => (
                 <div key={item.key} className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800/50">
                   <span className="block text-[10px] uppercase text-slate-500 font-bold mb-2">{item.label}</span>
                   <input type="text" value={activeChar.magic[item.key]} onChange={(e) => updateActiveChar({ magic: { ...activeChar.magic, [item.key]: e.target.value } })} className={`w-full bg-slate-900 hover:bg-slate-800 p-2 rounded-xl text-xl font-black text-center ${t.text} focus:outline-none transition-colors`} placeholder={item.ph}/>
                 </div>
               ))}
             </div>

             <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
               <h3 className="text-xs uppercase text-slate-500 font-black mb-3">Espacios de Conjuro (Total)</h3>
               <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                 {activeChar.magic.slots.map((slot, i) => (
                   <div key={i} className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                     <span className="block text-[10px] text-slate-400 font-bold mb-1">Nv {i+1}</span>
                     <input type="number" value={slot.total} onChange={(e) => { const newSlots = [...activeChar.magic.slots]; newSlots[i].total = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, slots: newSlots } }); }} className="w-full bg-slate-950 hover:bg-slate-800 p-1 rounded-lg text-sm font-bold text-center text-slate-200 focus:outline-none transition-colors" />
                   </div>
                 ))}
               </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm uppercase text-slate-300 font-black">Lista de Conjuros</h3>
                  <button onClick={() => updateActiveChar({ magic: { ...activeChar.magic, spells: [...activeChar.magic.spells, { level: 0, name: '', notes: '' }] } })} className={`text-xs font-bold ${t.text} bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors`}>+ Añadir Conjuro</button>
                </div>
                <div className="space-y-3">
                  {activeChar.magic.spells.map((spell, index) => (
                    <div key={index} className="flex gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/50 items-center">
                      <input type="number" value={spell.level} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].level = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="w-12 bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm font-bold text-center text-slate-400 focus:outline-none transition-colors border border-transparent hover:border-slate-700" title="Nivel" />
                      <input type="text" value={spell.name} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].name = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="flex-1 bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-200 focus:outline-none transition-colors border border-transparent hover:border-slate-700" placeholder="Nombre del Conjuro" />
                      <input type="text" value={spell.notes} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].notes = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="flex-[2] bg-slate-900 hover:bg-slate-800 p-3 rounded-xl text-sm text-slate-400 focus:outline-none transition-colors border border-transparent hover:border-slate-700 hidden md:block" placeholder="Efecto, alcance, daño..." />
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
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col h-72 shadow-sm">
                <h3 className="text-sm uppercase text-slate-300 font-black mb-3">Rasgos y Dotes</h3>
                <textarea value={activeChar.traits.class} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, class: e.target.value } })} className="w-full flex-1 bg-slate-950/50 hover:bg-slate-950 p-4 rounded-xl text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar border border-transparent hover:border-slate-700 transition-colors" placeholder="Anota aquí tus habilidades de clase, dotes, visión en la oscuridad, etc..."></textarea>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
                <h3 className="text-sm uppercase text-slate-300 font-black mb-3">Competencias</h3>
                <div className="space-y-3">
                  <input type="text" value={activeChar.proficiencies.armor} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, armor: e.target.value } })} className="w-full bg-slate-950 hover:bg-slate-800 p-3 rounded-xl text-sm border border-slate-800/50 focus:outline-none transition-colors" placeholder="Armaduras y Escudos..." />
                  <input type="text" value={activeChar.proficiencies.weapons} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, weapons: e.target.value } })} className="w-full bg-slate-950 hover:bg-slate-800 p-3 rounded-xl text-sm border border-slate-800/50 focus:outline-none transition-colors" placeholder="Armas..." />
                  <input type="text" value={activeChar.proficiencies.tools} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, tools: e.target.value } })} className="w-full bg-slate-950 hover:bg-slate-800 p-3 rounded-xl text-sm border border-slate-800/50 focus:outline-none transition-colors" placeholder="Herramientas e Idiomas..." />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col h-72 shadow-sm">
                <h3 className="text-sm uppercase text-slate-300 font-black mb-3">Equipo e Inventario</h3>
                <textarea value={activeChar.inventory.gear} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, gear: e.target.value } })} className="w-full flex-1 bg-slate-950/50 hover:bg-slate-950 p-4 rounded-xl text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar border border-transparent hover:border-slate-700 transition-colors" placeholder="Mochila, pociones, cuerdas..."></textarea>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
                <h3 className="text-sm uppercase text-slate-300 font-black mb-4">Monedas</h3>
                <div className="grid grid-cols-5 gap-3">
                  {['pc', 'pp', 'pe', 'po', 'ppt'].map(coin => (
                    <div key={coin} className="bg-slate-950 p-3 rounded-xl border border-slate-800/50 text-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">{coin}</span>
                      <input type="number" value={activeChar.inventory.coins[coin]} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, coins: { ...activeChar.inventory.coins, [coin]: parseInt(e.target.value)||0 } } })} className="w-full bg-slate-900 hover:bg-slate-800 p-1 rounded-lg text-lg font-bold text-center text-amber-500 focus:outline-none transition-colors" />
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
            <div className="md:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col h-[600px] shadow-sm">
              <h3 className="text-sm uppercase text-slate-300 font-black mb-3 flex items-center gap-2">📖 Notas de Campaña y Diario</h3>
              <textarea 
                value={activeChar.notes} 
                onChange={(e) => updateActiveChar({ notes: e.target.value })} 
                className="w-full flex-1 bg-slate-950/50 hover:bg-slate-950 p-5 rounded-2xl text-sm md:text-base leading-relaxed text-slate-300 focus:outline-none resize-none custom-scrollbar border border-transparent hover:border-slate-700 transition-colors" 
                placeholder="Anota aquí los nombres de los NPCs importantes, pistas de la misión principal, ideas, lugares visitados, o las locuras que hace tu party en cada sesión..."
              ></textarea>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col h-[600px] shadow-sm">
              <h3 className="text-sm uppercase text-slate-300 font-black mb-3">Historia del Personaje</h3>
              <textarea 
                value={activeChar.flavor.backstory} 
                onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, backstory: e.target.value } })} 
                className="w-full flex-1 bg-slate-950/50 hover:bg-slate-950 p-4 rounded-2xl text-sm text-slate-400 focus:outline-none resize-none custom-scrollbar border border-transparent hover:border-slate-700 transition-colors" 
                placeholder="Escribe tu trasfondo, tus motivaciones, tu familia y por qué decidiste convertirte en aventurero..."
              ></textarea>
              
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Alineamiento</label>
                  <input type="text" value={activeChar.flavor.alignment} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, alignment: e.target.value } })} className="w-full bg-slate-950 hover:bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-300 border border-transparent hover:border-slate-700 focus:outline-none transition-colors" placeholder="Caótico Bueno" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Aspecto Físico</label>
                  <input type="text" value={activeChar.flavor.appearance} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, appearance: e.target.value } })} className="w-full bg-slate-950 hover:bg-slate-800 p-3 rounded-xl text-sm text-slate-300 border border-transparent hover:border-slate-700 focus:outline-none transition-colors" placeholder="Alto, cicatriz en el ojo..." />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
