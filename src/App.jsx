import React, { useState, useEffect } from 'react';

// --- ESTRUCTURA DE ATRIBUTOS Y HABILIDADES (Basado en D&D 2024) ---
const STATS_CONFIG = [
  { id: 'str', name: 'FUERZA', skills: [{ id: 'athletics', name: 'Atletismo' }] },
  { id: 'dex', name: 'DESTREZA', skills: [{ id: 'acrobatics', name: 'Acrobacias' }, { id: 'sleightOfHand', name: 'Juego de manos' }, { id: 'stealth', name: 'Sigilo' }] },
  { id: 'con', name: 'CONSTITUCIÓN', skills: [] },
  { id: 'int', name: 'INTELIGENCIA', skills: [{ id: 'arcana', name: 'Conocimiento arcano' }, { id: 'history', name: 'Historia' }, { id: 'investigation', name: 'Investigación' }, { id: 'nature', name: 'Naturaleza' }, { id: 'religion', name: 'Religión' }] },
  { id: 'wis', name: 'SABIDURÍA', skills: [{ id: 'animalHandling', name: 'Trato con animales' }, { id: 'medicine', name: 'Medicina' }, { id: 'perception', name: 'Percepción' }, { id: 'insight', name: 'Perspicacia' }, { id: 'survival', name: 'Supervivencia' }] },
  { id: 'cha', name: 'CARISMA', skills: [{ id: 'deception', name: 'Engaño' }, { id: 'intimidation', name: 'Intimidación' }, { id: 'performance', name: 'Interpretación' }, { id: 'persuasion', name: 'Persuasión' }] }
];

const DEFAULT_CHAR = {
  id: '', name: 'Nuevo Personaje',
  class: '', subclass: '', level: 1, background: '', species: '', alignment: '', xp: 0,
  size: 'Mediano', speed: 30, initiative: 0, passivePerception: 10, profBonus: 2, heroicInspiration: false,
  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { value: '1d8', spent: 0, max: 1 },
  deathSaves: { successes: 0, failures: 0 },
  ac: 10, shield: 0,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
  skills: STATS_CONFIG.reduce((acc, stat) => {
    stat.skills.forEach(skill => acc[skill.id] = { prof: false, exp: false });
    return acc;
  }, {}),
  proficiencies: {
    armor: { light: false, medium: false, heavy: false, shields: false },
    weapons: '', tools: ''
  },
  attacks: [{ name: '', atk: '', dmg: '', notes: '' }],
  magic: {
    ability: 'INT', mod: 0, saveDC: 10, atkBonus: 0,
    slots: Array(9).fill({ total: 0, spent: 0 }),
    spells: [{ level: 0, name: '', castTime: '', range: '', c: false, r: false, m: false, notes: '' }]
  },
  traits: { class: '', species: '', feats: '' },
  flavor: { appearance: '', backstory: '', languages: '' },
  inventory: { gear: '', attunement: '', coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 } }
};

export default function App() {
  const [view, setView] = useState('HOME'); 
  const [characters, setCharacters] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [activeTab, setActiveTab] = useState('PRINCIPAL');
  const [initiativeTracker, setInitiativeTracker] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dnd2024_party_data');
    if (saved) setCharacters(JSON.parse(saved));
    else {
      const initialChars = Array.from({ length: 7 }, (_, i) => ({ ...DEFAULT_CHAR, id: `char_${i + 1}`, name: `Personaje ${i + 1}` }));
      setCharacters(initialChars);
    }
  }, []);

  useEffect(() => {
    if (characters.length > 0) localStorage.setItem('dnd2024_party_data', JSON.stringify(characters));
  }, [characters]);

  const getMod = (score) => Math.floor((score - 10) / 2);
  const getModFormatted = (score) => { const m = getMod(score); return m >= 0 ? `+${m}` : m; };

  const updateActiveChar = (updates) => {
    setCharacters(chars => chars.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
  };

  const activeChar = characters.find(c => c.id === activeCharId) || DEFAULT_CHAR;

  // --- VISTAS SECUNDARIAS ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
        <h1 className="text-5xl font-black text-amber-500 mb-12 text-center drop-shadow-lg">CRÓNICAS DE DISCORD</h1>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <button onClick={() => setView('PLAYER_SELECT')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-amber-500 transition-all p-10 rounded-2xl group">
            <span className="text-6xl block mb-4">🗡️</span>
            <h2 className="text-2xl font-bold text-slate-100">Soy Jugador</h2>
            <p className="text-slate-400 mt-2">Accede a tu ficha D&D 2024.</p>
          </button>
          <button onClick={() => setView('DM_DASHBOARD')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-rose-500 transition-all p-10 rounded-2xl group">
            <span className="text-6xl block mb-4">👁️</span>
            <h2 className="text-2xl font-bold text-slate-100">Dungeon Master</h2>
            <p className="text-slate-400 mt-2">Panel global e iniciativas.</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'PLAYER_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 p-8 font-sans">
        <button onClick={() => setView('HOME')} className="text-slate-400 hover:text-white mb-8">← Volver al Inicio</button>
        <h2 className="text-3xl font-bold text-amber-500 mb-8 text-center">Selecciona tu Personaje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {characters.map((char) => (
            <button key={char.id} onClick={() => { setActiveCharId(char.id); setView('SHEET'); }} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500 text-left transition-all hover:-translate-y-1">
              <h3 className="text-xl font-bold text-slate-100">{char.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{char.class || 'Sin Clase'} Nvl {char.level}</p>
              <div className="mt-4 flex gap-2">
                <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded">HP: {char.hp.current}</span>
                <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded">CA: {char.ac}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'DM_DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-rose-500">Pantalla del Dungeon Master</h1>
          <button onClick={() => setView('HOME')} className="bg-slate-800 px-4 py-2 rounded">Salir</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-300 border-b border-slate-800 pb-2">El Grupo (Party)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map(char => (
                <div key={char.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${char.hp.current <= 0 ? 'bg-rose-600' : 'bg-emerald-500'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-amber-500">{char.name}</h3>
                      <p className="text-xs text-slate-400">{char.species} {char.class}</p>
                    </div>
                    <span className="bg-slate-950 px-3 py-1 rounded-lg text-sm font-bold border border-slate-700">CA: {char.ac}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>HP (Temp: {char.hp.temp})</span>
                      <span className={char.hp.current <= 0 ? 'text-rose-500 font-bold' : ''}>{char.hp.current} / {char.hp.max}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.max(0, (char.hp.current / char.hp.max) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                    <div className="bg-slate-950 py-1 rounded border border-slate-800">
                      <span className="block text-slate-500">P. Pasiva</span>
                      <span className="font-bold">{char.passivePerception}</span>
                    </div>
                    <div className="bg-slate-950 py-1 rounded border border-slate-800">
                      <span className="block text-slate-500">Iniciativa</span>
                      <span className="font-bold">{getModFormatted(char.stats.dex)}</span>
                    </div>
                    <div className="bg-slate-950 py-1 rounded border border-slate-800">
                      <span className="block text-slate-500">Mov.</span>
                      <span className="font-bold">{char.speed} ft</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 border-b border-slate-700 pb-2 mb-4">Iniciativa</h2>
            <div className="space-y-2 mb-4">
              {initiativeTracker.sort((a, b) => b.roll - a.roll).map((entity, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-700">
                  <span className="font-bold">{i + 1}. {entity.name}</span>
                  <span className="text-amber-500 font-mono text-lg">{entity.roll}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" id="initName" placeholder="Nombre" className="w-1/2 bg-slate-950 p-2 rounded border border-slate-700 text-sm" />
              <input type="number" id="initRoll" placeholder="Tirada" className="w-1/4 bg-slate-950 p-2 rounded border border-slate-700 text-sm" />
              <button onClick={() => {
                const name = document.getElementById('initName').value;
                const roll = document.getElementById('initRoll').value;
                if(name && roll) setInitiativeTracker([...initiativeTracker, {name, roll: parseInt(roll)}]);
              }} className="w-1/4 bg-amber-600 hover:bg-amber-500 rounded text-sm font-bold">Add</button>
            </div>
            <button onClick={() => setInitiativeTracker([])} className="w-full mt-4 bg-slate-800 hover:bg-rose-900 text-slate-300 py-2 rounded text-sm transition-colors">Limpiar Combate</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL: FICHA DEL JUGADOR 2024 ---
  const handleStatChange = (stat, value) => updateActiveChar({ stats: { ...activeChar.stats, [stat]: parseInt(value) || 0 } });
  const handleSkillChange = (skillId) => updateActiveChar({ skills: { ...activeChar.skills, [skillId]: { ...activeChar.skills[skillId], prof: !activeChar.skills[skillId].prof } } });
  const handleSaveChange = (stat) => updateActiveChar({ saves: { ...activeChar.saves, [stat]: !activeChar.saves[stat] } });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* HEADER: INFO BÁSICA (Bloque Superior D&D 2024) */}
        <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800 relative">
          <button onClick={() => setView('PLAYER_SELECT')} className="absolute top-4 right-4 text-slate-500 hover:text-white text-sm">🚪 Salir</button>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label className="text-[10px] uppercase text-slate-500 font-bold block">Nombre del Personaje</label>
              <input type="text" value={activeChar.name} onChange={(e) => updateActiveChar({ name: e.target.value })} className="w-full bg-transparent text-3xl font-black text-amber-500 border-b-2 border-slate-700 focus:border-amber-500 outline-none" />
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Nivel', key: 'level', type: 'number' },
                { label: 'Clase', key: 'class' },
                { label: 'Subclase', key: 'subclass' },
                { label: 'Trasfondo', key: 'background' },
                { label: 'Especie', key: 'species' },
                { label: 'PX', key: 'xp', type: 'number' }
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] uppercase text-slate-500 font-bold block truncate">{field.label}</label>
                  <input type={field.type || 'text'} value={activeChar[field.key]} onChange={(e) => updateActiveChar({ [field.key]: field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full bg-transparent text-sm font-bold border-b border-slate-700 focus:border-amber-500 outline-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {['PRINCIPAL', 'COMBATE Y MAGIA', 'RASGOS', 'INVENTARIO'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: PRINCIPAL (Estadísticas, Vida, Habilidades) */}
        {activeTab === 'PRINCIPAL' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Columna Izquierda: Atributos y Habilidades D&D 2024 */}
            <div className="md:col-span-4 space-y-4">
              {STATS_CONFIG.map(stat => (
                <div key={stat.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-700 flex flex-col items-center w-20">
                      <span className="text-[10px] text-slate-500 font-bold">{stat.name}</span>
                      <input type="number" value={activeChar.stats[stat.id]} onChange={(e) => handleStatChange(stat.id, e.target.value)} className="w-full text-center bg-transparent text-xl font-black text-white focus:outline-none" />
                      <div className="bg-slate-800 w-full text-center rounded-sm text-xs font-bold text-amber-500 mt-1">{getModFormatted(activeChar.stats[stat.id])}</div>
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-200 cursor-pointer">
                        <input type="checkbox" checked={activeChar.saves[stat.id]} onChange={() => handleSaveChange(stat.id)} className="accent-amber-500" />
                        Tirada de salvación
                      </label>
                      <div className="mt-1 space-y-1">
                        {stat.skills.map(skill => (
                          <label key={skill.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" checked={activeChar.skills[skill.id].prof} onChange={() => handleSkillChange(skill.id)} className="accent-amber-500" />
                            {skill.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Columna Derecha: Combate, Vida y Bloque Central */}
            <div className="md:col-span-8 space-y-4">
              {/* Bloque Superior de Combate */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 justify-between items-center">
                <div className="text-center">
                  <span className="block text-[10px] text-slate-500 font-bold">C. ARMADURA</span>
                  <input type="number" value={activeChar.ac} onChange={(e) => updateActiveChar({ ac: e.target.value })} className="w-16 bg-transparent text-3xl font-black text-center focus:outline-none" />
                </div>
                <div className="text-center border-l border-slate-800 pl-4">
                  <span className="block text-[10px] text-slate-500 font-bold">ESCUDO</span>
                  <input type="number" value={activeChar.shield} onChange={(e) => updateActiveChar({ shield: e.target.value })} className="w-12 bg-transparent text-xl font-bold text-center focus:outline-none" placeholder="+2"/>
                </div>
                <div className="text-center border-l border-slate-800 pl-4">
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Inspiración Heróica</span>
                    <input type="checkbox" checked={activeChar.heroicInspiration} onChange={() => updateActiveChar({ heroicInspiration: !activeChar.heroicInspiration })} className="w-6 h-6 accent-amber-500" />
                  </label>
                </div>
              </div>

              {/* Puntos de Golpe y Dados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-2">Puntos de Golpe</h3>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-baseline gap-1">
                      <input type="number" value={activeChar.hp.current} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, current: e.target.value } })} className="w-16 bg-transparent text-4xl font-black text-emerald-500 focus:outline-none text-right" />
                      <span className="text-slate-500">/</span>
                      <input type="number" value={activeChar.hp.max} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, max: e.target.value } })} className="w-12 bg-transparent text-xl font-bold text-slate-400 focus:outline-none" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 font-bold">TEMP</span>
                      <input type="number" value={activeChar.hp.temp} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, temp: e.target.value } })} className="w-12 bg-slate-950 border border-slate-700 text-amber-500 text-lg font-bold text-center rounded focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateActiveChar({ hp: { ...activeChar.hp, current: Math.max(0, parseInt(activeChar.hp.current) - 1) } })} className="flex-1 bg-rose-900/40 text-rose-400 py-1 rounded font-bold">-1</button>
                    <button onClick={() => updateActiveChar({ hp: { ...activeChar.hp, current: Math.min(activeChar.hp.max, parseInt(activeChar.hp.current) + 1) } })} className="flex-1 bg-emerald-900/40 text-emerald-400 py-1 rounded font-bold">+1</button>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-[10px] uppercase text-slate-500 font-bold">Dados de Golpe</h3>
                      <div className="flex gap-2 items-center mt-1">
                        <input type="text" value={activeChar.hitDice.value} onChange={(e) => updateActiveChar({ hitDice: { ...activeChar.hitDice, value: e.target.value } })} className="w-12 bg-transparent text-xl font-bold border-b border-slate-700 focus:outline-none" placeholder="1d8"/>
                        <span className="text-xs text-slate-500">Gastados:</span>
                        <input type="number" value={activeChar.hitDice.spent} onChange={(e) => updateActiveChar({ hitDice: { ...activeChar.hitDice, spent: e.target.value } })} className="w-10 bg-slate-950 text-center rounded border border-slate-700 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-800 pt-2">
                    <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-1">T.S. Contra Muerte</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1 items-center"><span className="text-[10px] text-emerald-500">ÉXITOS</span>{[1,2,3].map(i => <input type="checkbox" key={`succ_${i}`} checked={activeChar.deathSaves.successes >= i} onChange={() => updateActiveChar({ deathSaves: { ...activeChar.deathSaves, successes: activeChar.deathSaves.successes === i ? i-1 : i } })} className="accent-emerald-500"/>)}</div>
                      <div className="flex gap-1 items-center"><span className="text-[10px] text-rose-500">FALLOS</span>{[1,2,3].map(i => <input type="checkbox" key={`fail_${i}`} checked={activeChar.deathSaves.failures >= i} onChange={() => updateActiveChar({ deathSaves: { ...activeChar.deathSaves, failures: activeChar.deathSaves.failures === i ? i-1 : i } })} className="accent-rose-500"/>)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque Central D&D 2024 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Bonif. Competencia', key: 'profBonus', type: 'number' },
                  { label: 'Iniciativa', key: 'initiative', type: 'number' },
                  { label: 'Velocidad', key: 'speed', type: 'number' },
                  { label: 'Tamaño', key: 'size', type: 'text' },
                  { label: 'Percepción Pasiva', key: 'passivePerception', type: 'number' }
                ].map(item => (
                  <div key={item.key} className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1 h-6">{item.label}</span>
                    <input type={item.type} value={activeChar[item.key]} onChange={(e) => updateActiveChar({ [item.key]: item.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full bg-transparent text-xl font-bold text-center focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMBATE Y MAGIA */}
        {activeTab === 'COMBATE Y MAGIA' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Armas y Trucos de Daño</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-500 font-bold uppercase px-2">
                  <div className="col-span-3">Nombre</div>
                  <div className="col-span-2 text-center">Bonif. Atq/CD</div>
                  <div className="col-span-3">Daño y Tipo</div>
                  <div className="col-span-4">Notas</div>
                </div>
                {activeChar.attacks.map((atk, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                    <input type="text" value={atk.name} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].name = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="col-span-3 bg-transparent text-sm focus:outline-none" placeholder="Cimitarra" />
                    <input type="text" value={atk.atk} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].atk = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="col-span-2 bg-transparent text-sm text-center focus:outline-none" placeholder="+4" />
                    <input type="text" value={atk.dmg} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].dmg = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="col-span-3 bg-transparent text-sm focus:outline-none" placeholder="1d6+2 Cortante" />
                    <input type="text" value={atk.notes} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].notes = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="col-span-4 bg-transparent text-sm focus:outline-none" placeholder="Sutil" />
                  </div>
                ))}
                <button onClick={() => updateActiveChar({ attacks: [...activeChar.attacks, { name: '', atk: '', dmg: '', notes: '' }] })} className="text-xs text-amber-500 hover:text-amber-400 mt-2">+ Añadir Ataque</button>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm uppercase text-amber-500 font-bold mb-4">Aptitud Mágica y Conjuros</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Aptitud Mágica', key: 'ability', type: 'text', ph: 'INT/SAB/CAR' },
                  { label: 'Modificador', key: 'mod', type: 'number' },
                  { label: 'CD de Salvación', key: 'saveDC', type: 'number' },
                  { label: 'Bonif. Ataque', key: 'atkBonus', type: 'number' }
                ].map(item => (
                  <div key={item.key} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">{item.label}</span>
                    <input type={item.type} value={activeChar.magic[item.key]} onChange={(e) => updateActiveChar({ magic: { ...activeChar.magic, [item.key]: item.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value } })} placeholder={item.ph} className="w-full bg-transparent text-xl font-bold text-center focus:outline-none" />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <span className="block text-[10px] uppercase text-slate-500 font-bold mb-2">Espacios de Conjuro (Total / Gastados)</span>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                  {activeChar.magic.slots.map((slot, i) => (
                    <div key={i} className="bg-slate-950 p-1 rounded border border-slate-800 text-center">
                      <span className="block text-[9px] text-slate-500">Nivel {i+1}</span>
                      <div className="flex items-center justify-center gap-1">
                        <input type="number" value={slot.total} onChange={(e) => { const newSlots = [...activeChar.magic.slots]; newSlots[i].total = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, slots: newSlots } }); }} className="w-6 bg-transparent text-sm text-right focus:outline-none" />
                        <span className="text-slate-600">/</span>
                        <input type="number" value={slot.spent} onChange={(e) => { const newSlots = [...activeChar.magic.slots]; newSlots[i].spent = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, slots: newSlots } }); }} className="w-6 bg-transparent text-sm text-amber-500 focus:outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-500 font-bold uppercase px-2">
                  <div className="col-span-1">Nivel</div>
                  <div className="col-span-3">Nombre</div>
                  <div className="col-span-2">Tiempo</div>
                  <div className="col-span-2">Alcance</div>
                  <div className="col-span-1 text-center">C R M</div>
                  <div className="col-span-3">Notas</div>
                </div>
                {activeChar.magic.spells.map((spell, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded border border-slate-800 items-center">
                    <input type="number" value={spell.level} onChange={(e) => { const newSpells = [...activeChar.magic.spells]; newSpells[index].level = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, spells: newSpells } }); }} className="col-span-1 bg-transparent text-sm text-center focus:outline-none" />
                    <input type="text" value={spell.name} onChange={(e) => { const newSpells = [...activeChar.magic.spells]; newSpells[index].name = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: newSpells } }); }} className="col-span-3 bg-transparent text-sm focus:outline-none" placeholder="Bola de fuego" />
                    <input type="text" value={spell.castTime} onChange={(e) => { const newSpells = [...activeChar.magic.spells]; newSpells[index].castTime = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: newSpells } }); }} className="col-span-2 bg-transparent text-sm focus:outline-none" placeholder="1 Acción" />
                    <input type="text" value={spell.range} onChange={(e) => { const newSpells = [...activeChar.magic.spells]; newSpells[index].range = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: newSpells } }); }} className="col-span-2 bg-transparent text-sm focus:outline-none" placeholder="150 pies" />
                    <div className="col-span-1 flex gap-1 justify-center">
                       <input type="checkbox" checked={spell.c} onChange={() => { const s = [...activeChar.magic.spells]; s[index].c = !s[index].c; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="accent-amber-500 w-3 h-3" title="Concentración" />
                       <input type="checkbox" checked={spell.r} onChange={() => { const s = [...activeChar.magic.spells]; s[index].r = !s[index].r; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="accent-amber-500 w-3 h-3" title="Ritual" />
                       <input type="checkbox" checked={spell.m} onChange={() => { const s = [...activeChar.magic.spells]; s[index].m = !s[index].m; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="accent-amber-500 w-3 h-3" title="Material" />
                    </div>
                    <input type="text" value={spell.notes} onChange={(e) => { const newSpells = [...activeChar.magic.spells]; newSpells[index].notes = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: newSpells } }); }} className="col-span-3 bg-transparent text-sm focus:outline-none" placeholder="8d6 fuego" />
                  </div>
                ))}
                <button onClick={() => updateActiveChar({ magic: { ...activeChar.magic, spells: [...activeChar.magic.spells, { level: 0, name: '', castTime: '', range: '', c: false, r: false, m: false, notes: '' }] } })} className="text-xs text-amber-500 hover:text-amber-400 mt-2">+ Añadir Conjuro</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RASGOS Y TRASFONDO */}
        {activeTab === 'RASGOS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-64">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Rasgos de Clase</h3>
                <textarea value={activeChar.traits.class} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, class: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Ataque furtivo, Furia, etc..."></textarea>
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-48">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Atributos de Especie</h3>
                <textarea value={activeChar.traits.species} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, species: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Visión en la oscuridad..."></textarea>
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-32">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Dotes</h3>
                <textarea value={activeChar.traits.feats} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, feats: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Actor, Alerta..."></textarea>
               </div>
            </div>
            <div className="space-y-4">
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-64">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Historia y Personalidad</h3>
                <textarea value={activeChar.flavor.backstory} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, backstory: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Tu origen..."></textarea>
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Aspecto</h3>
                <input type="text" value={activeChar.flavor.appearance} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, appearance: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm text-slate-300 focus:outline-none border border-slate-700" placeholder="Alto, pelo oscuro..." />
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Alineamiento</h3>
                <input type="text" value={activeChar.alignment} onChange={(e) => updateActiveChar({ alignment: e.target.value })} className="w-full bg-slate-950 p-2 rounded text-sm text-slate-300 focus:outline-none border border-slate-700" placeholder="Caótico Bueno..." />
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-32">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Idiomas</h3>
                <textarea value={activeChar.flavor.languages} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, languages: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Común, Élfico..."></textarea>
               </div>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTARIO Y COMPETENCIAS */}
        {activeTab === 'INVENTARIO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-4">Entrenamiento con Equipo</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-2">ARMADURAS</span>
                    <div className="flex gap-4">
                      {['light', 'medium', 'heavy', 'shields'].map(armorType => (
                         <label key={armorType} className="flex items-center gap-1 text-sm cursor-pointer hover:text-slate-300">
                           <input type="checkbox" checked={activeChar.proficiencies.armor[armorType]} onChange={() => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, armor: { ...activeChar.proficiencies.armor, [armorType]: !activeChar.proficiencies.armor[armorType] } } })} className="accent-amber-500" />
                           {armorType === 'light' ? 'Ligeras' : armorType === 'medium' ? 'Medias' : armorType === 'heavy' ? 'Pesadas' : 'Escudos'}
                         </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">ARMAS</span>
                    <input type="text" value={activeChar.proficiencies.weapons} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, weapons: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm focus:outline-none border border-slate-700" placeholder="Simples, Marciales, Espada larga..." />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">HERRAMIENTAS</span>
                    <input type="text" value={activeChar.proficiencies.tools} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, tools: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm focus:outline-none border border-slate-700" placeholder="Herramientas de ladrón..." />
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-4">Monedas</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'pc', label: 'PC', color: 'text-amber-700' },
                    { key: 'pp', label: 'PP', color: 'text-slate-300' },
                    { key: 'pe', label: 'PE', color: 'text-blue-300' },
                    { key: 'po', label: 'PO', color: 'text-amber-400' },
                    { key: 'ppt', label: 'PPT', color: 'text-slate-100' }
                  ].map(coin => (
                    <div key={coin.key} className="bg-slate-950 p-2 rounded border border-slate-800 text-center flex flex-col">
                      <span className={`text-xs font-bold mb-1 ${coin.color}`}>{coin.label}</span>
                      <input type="number" value={activeChar.inventory.coins[coin.key]} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, coins: { ...activeChar.inventory.coins, [coin.key]: parseInt(e.target.value)||0 } } })} className="w-full bg-transparent text-lg font-bold text-center focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-[400px]">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Equipo</h3>
                <textarea value={activeChar.inventory.gear} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, gear: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="Mochila, cuerda, raciones..."></textarea>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-32">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Sintonización con objetos mágicos</h3>
                <textarea value={activeChar.inventory.attunement} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, attunement: e.target.value } })} className="w-full flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar" placeholder="1. Anillo de protección..."></textarea>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
