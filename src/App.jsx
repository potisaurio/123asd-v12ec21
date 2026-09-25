import React, { useState, useEffect } from 'react';

// --- CONSTANTES D&D 5E ---
const STATS = [
  { id: 'str', name: 'FUE', full: 'Fuerza' },
  { id: 'dex', name: 'DES', full: 'Destreza' },
  { id: 'con', name: 'CON', full: 'Constitución' },
  { id: 'int', name: 'INT', full: 'Inteligencia' },
  { id: 'wis', name: 'SAB', full: 'Sabiduría' },
  { id: 'cha', name: 'CAR', full: 'Carisma' }
];

const SKILLS = [
  { id: 'acrobatics', name: 'Acrobacias', stat: 'dex' },
  { id: 'animalHandling', name: 'Trato c/ Animales', stat: 'wis' },
  { id: 'arcana', name: 'Arcano', stat: 'int' },
  { id: 'athletics', name: 'Atletismo', stat: 'str' },
  { id: 'deception', name: 'Engaño', stat: 'cha' },
  { id: 'history', name: 'Historia', stat: 'int' },
  { id: 'insight', name: 'Perspicacia', stat: 'wis' },
  { id: 'intimidation', name: 'Intimidación', stat: 'cha' },
  { id: 'investigation', name: 'Investigación', stat: 'int' },
  { id: 'medicine', name: 'Medicina', stat: 'wis' },
  { id: 'nature', name: 'Naturaleza', stat: 'int' },
  { id: 'perception', name: 'Percepción', stat: 'wis' },
  { id: 'performance', name: 'Interpretación', stat: 'cha' },
  { id: 'persuasion', name: 'Persuasión', stat: 'cha' },
  { id: 'religion', name: 'Religión', stat: 'int' },
  { id: 'sleightOfHand', name: 'Juego de Manos', stat: 'dex' },
  { id: 'stealth', name: 'Sigilo', stat: 'dex' },
  { id: 'survival', name: 'Supervivencia', stat: 'wis' }
];

const DEFAULT_CHAR = {
  id: '', name: 'Nuevo Personaje', race: '', class: '', level: 1, alignment: '', background: '',
  hp: { current: 10, max: 10, temp: 0 },
  ac: 10, speed: 30, initiative: 0,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
  skills: SKILLS.reduce((acc, skill) => ({ ...acc, [skill.id]: { prof: false, exp: false } }), {}),
  deathSaves: { successes: 0, failures: 0 },
  attacks: '', inventory: '', features: ''
};

export default function App() {
  const [view, setView] = useState('HOME'); // HOME, PLAYER_SELECT, SHEET, DM_DASHBOARD
  const [characters, setCharacters] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [initiativeTracker, setInitiativeTracker] = useState([]);

  // Cargar datos locales (Simulando la Base de Datos)
  useEffect(() => {
    const saved = localStorage.getItem('dnd_party_data');
    if (saved) setCharacters(JSON.parse(saved));
    else {
      // Generar 7 slots vacíos por defecto
      const initialChars = Array.from({ length: 7 }, (_, i) => ({ ...DEFAULT_CHAR, id: `char_${i + 1}`, name: `Personaje ${i + 1}` }));
      setCharacters(initialChars);
    }
  }, []);

  // Guardar cada vez que hay cambios
  useEffect(() => {
    if (characters.length > 0) localStorage.setItem('dnd_party_data', JSON.stringify(characters));
  }, [characters]);

  // Funciones Matemáticas 5e
  const getMod = (score) => Math.floor((score - 10) / 2);
  const getProfBonus = (level) => Math.ceil(level / 4) + 1;
  const getModFormatted = (score) => { const m = getMod(score); return m >= 0 ? `+${m}` : m; };

  const updateActiveChar = (updates) => {
    setCharacters(chars => chars.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
  };

  const activeChar = characters.find(c => c.id === activeCharId) || DEFAULT_CHAR;

  // --- VISTAS SECUNDARIAS ---
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-black text-amber-500 mb-12 text-center drop-shadow-lg">CRÓNICAS DE DISCORD</h1>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <button onClick={() => setView('PLAYER_SELECT')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-amber-500 hover:scale-105 transition-all p-10 rounded-2xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-6xl block mb-4">🗡️</span>
            <h2 className="text-2xl font-bold text-slate-100">Soy Jugador</h2>
            <p className="text-slate-400 mt-2">Accede a tu ficha de personaje interactiva.</p>
          </button>
          <button onClick={() => setView('DM_DASHBOARD')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-rose-500 hover:scale-105 transition-all p-10 rounded-2xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-6xl block mb-4">👁️</span>
            <h2 className="text-2xl font-bold text-slate-100">Dungeon Master</h2>
            <p className="text-slate-400 mt-2">Panel de control, iniciativas y visión global.</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'PLAYER_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
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
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-rose-500">Pantalla del Dungeon Master</h1>
          <button onClick={() => setView('HOME')} className="bg-slate-800 px-4 py-2 rounded">Salir</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo: Party */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-300 border-b border-slate-800 pb-2">El Grupo (Party)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map(char => (
                <div key={char.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${char.hp.current <= 0 ? 'bg-rose-600' : 'bg-emerald-500'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-amber-500">{char.name}</h3>
                      <p className="text-xs text-slate-400">{char.race} {char.class}</p>
                    </div>
                    <span className="bg-slate-950 px-3 py-1 rounded-lg text-sm font-bold border border-slate-700">CA: {char.ac}</span>
                  </div>
                  
                  {/* Barra de Vida DM */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>HP</span>
                      <span className={char.hp.current <= 0 ? 'text-rose-500 font-bold' : ''}>{char.hp.current} / {char.hp.max}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.max(0, (char.hp.current / char.hp.max) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                    <div className="bg-slate-950 py-1 rounded border border-slate-800">
                      <span className="block text-slate-500">Percepción</span>
                      <span className="font-bold">{10 + getMod(char.stats.wis) + (char.skills.perception.prof ? getProfBonus(char.level) : 0)}</span>
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

          {/* Panel Derecho: Iniciativa */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 border-b border-slate-700 pb-2 mb-4">Combate</h2>
            <p className="text-sm text-slate-400 mb-4">Utiliza esto junto a las tiradas que hagan en Discord para ordenar los turnos.</p>
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

  // --- VISTA PRINCIPAL: FICHA DEL JUGADOR ---
  const profBonus = getProfBonus(activeChar.level);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* HEADER: INFO BÁSICA */}
        <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <button onClick={() => setView('PLAYER_SELECT')} className="absolute top-4 right-4 text-slate-500 hover:text-white">🚪 Salir</button>
          
          <div className="w-full md:w-1/3">
            <input 
              type="text" value={activeChar.name} 
              onChange={(e) => updateActiveChar({ name: e.target.value })}
              className="w-full bg-transparent text-3xl font-black text-amber-500 border-b-2 border-transparent hover:border-slate-700 focus:border-amber-500 outline-none transition-colors"
              placeholder="Nombre del Personaje"
            />
          </div>
          
          <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
            {[
              { label: 'Clase', key: 'class' },
              { label: 'Nivel', key: 'level', type: 'number' },
              { label: 'Raza', key: 'race' },
              { label: 'Trasfondo', key: 'background' }
            ].map(field => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">{field.label}</label>
                <input 
                  type={field.type || 'text'} 
                  value={activeChar[field.key]}
                  onChange={(e) => updateActiveChar({ [field.key]: field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                  className="w-full bg-transparent text-sm font-bold text-slate-200 border-b border-slate-700 focus:border-amber-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: 3 COLUMNAS EN DESKTOP */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* COLUMNA 1: ESTADÍSTICAS Y HABILIDADES (Span 3) */}
          <div className="md:col-span-3 space-y-4">
            {/* Atributos Principales */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
              {STATS.map(stat => (
                <div key={stat.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col items-center">
                  <span className="text-xs text-slate-500 font-bold">{stat.name}</span>
                  <input 
                    type="number" 
                    value={activeChar.stats[stat.id]}
                    onChange={(e) => updateActiveChar({ stats: { ...activeChar.stats, [stat.id]: parseInt(e.target.value) || 0 } })}
                    className="w-12 text-center bg-transparent text-xl font-black text-white focus:outline-none focus:text-amber-500"
                  />
                  <div className="mt-1 bg-slate-900 px-3 py-0.5 rounded-full text-xs font-bold text-slate-300 shadow-inner">
                    {getModFormatted(activeChar.stats[stat.id])}
                  </div>
                </div>
              ))}
            </div>

            {/* Habilidades (Skills) */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h3 className="font-bold text-slate-300">Habilidades</h3>
                <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded font-bold">Bono Prof. +{profBonus}</span>
              </div>
              <div className="space-y-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {SKILLS.map(skill => {
                  const isProf = activeChar.skills[skill.id].prof;
                  const statMod = getMod(activeChar.stats[skill.stat]);
                  const total = statMod + (isProf ? profBonus : 0);
                  
                  return (
                    <div key={skill.id} className="flex items-center gap-3 text-sm group hover:bg-slate-950 p-1 rounded">
                      <button 
                        onClick={() => updateActiveChar({ skills: { ...activeChar.skills, [skill.id]: { ...activeChar.skills[skill.id], prof: !isProf } } })}
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${isProf ? 'bg-amber-500 border-amber-500' : 'border-slate-600 group-hover:border-slate-400'}`}
                      ></button>
                      <span className="w-8 text-center font-mono font-bold text-slate-300">{total >= 0 ? `+${total}` : total}</span>
                      <span className="flex-1 text-slate-400 group-hover:text-slate-200 truncate">{skill.name} <span className="text-[9px] text-slate-600 uppercase">({skill.stat})</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMNA 2: COMBATE Y VIDA (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Top Stats de Combate */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">C. Armadura</span>
                <input type="number" value={activeChar.ac} onChange={(e) => updateActiveChar({ ac: e.target.value })} className="bg-transparent text-3xl font-black text-center w-full focus:outline-none" />
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Iniciativa</span>
                <span className="text-3xl font-black text-slate-300">{getModFormatted(activeChar.stats.dex)}</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Velocidad</span>
                <input type="number" value={activeChar.speed} onChange={(e) => updateActiveChar({ speed: e.target.value })} className="bg-transparent text-3xl font-black text-center w-full focus:outline-none" />
              </div>
            </div>

            {/* Componente de Vida (HP) Avanzado */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider">Puntos de Golpe</h3>
                  <div className="flex items-baseline gap-2">
                    <input 
                      type="number" value={activeChar.hp.current} 
                      onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, current: e.target.value } })}
                      className={`bg-transparent text-6xl font-black focus:outline-none w-24 ${activeChar.hp.current <= 0 ? 'text-rose-500' : 'text-emerald-500'}`} 
                    />
                    <span className="text-2xl text-slate-500">/</span>
                    <input 
                      type="number" value={activeChar.hp.max} 
                      onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, max: e.target.value } })}
                      className="bg-transparent text-2xl font-bold text-slate-400 focus:outline-none w-16" 
                    />
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">HP Temp</h3>
                  <input 
                    type="number" value={activeChar.hp.temp} 
                    onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, temp: e.target.value } })}
                    className="bg-slate-950 border border-slate-700 text-amber-500 text-xl font-bold text-center w-16 rounded p-1 focus:outline-none" 
                  />
                </div>
              </div>

              {/* Botones de Salud */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => updateActiveChar({ hp: { ...activeChar.hp, current: Math.max(0, parseInt(activeChar.hp.current) - 1) } })} className="flex-1 bg-rose-900/40 hover:bg-rose-900/60 text-rose-400 py-2 rounded-lg font-bold transition-colors">-1 Daño</button>
                <button onClick={() => updateActiveChar({ hp: { ...activeChar.hp, current: Math.min(activeChar.hp.max, parseInt(activeChar.hp.current) + 1) } })} className="flex-1 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 py-2 rounded-lg font-bold transition-colors">+1 Curar</button>
              </div>

              {/* Utilidades de Descanso y Muerte */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                <div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-2">Salvaciones de Muerte</h4>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-emerald-500">ÉXITO</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <button key={`succ_${i}`} onClick={() => {
                              const curr = activeChar.deathSaves.successes;
                              updateActiveChar({ deathSaves: { ...activeChar.deathSaves, successes: curr === i ? i-1 : i }})
                            }}
                            className={`w-4 h-4 rounded-full border border-emerald-700 ${activeChar.deathSaves.successes >= i ? 'bg-emerald-500' : 'bg-transparent'}`}
                          ></button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-rose-500">FALLO</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                           <button key={`fail_${i}`} onClick={() => {
                              const curr = activeChar.deathSaves.failures;
                              updateActiveChar({ deathSaves: { ...activeChar.deathSaves, failures: curr === i ? i-1 : i }})
                            }}
                            className={`w-4 h-4 rounded-full border border-rose-700 ${activeChar.deathSaves.failures >= i ? 'bg-rose-500' : 'bg-transparent'}`}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-end gap-1">
                   <button onClick={() => updateActiveChar({ hp: { ...activeChar.hp, current: activeChar.hp.max }, deathSaves: { successes:0, failures:0 } })} className="bg-slate-950 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 py-1.5 rounded transition-colors">
                     🏕️ Descanso Largo
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: TEXTOS, ATAQUES E INVENTARIO (Span 4) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-950 p-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800">
                Ataques y Conjuros
              </div>
              <textarea 
                value={activeChar.attacks}
                onChange={(e) => updateActiveChar({ attacks: e.target.value })}
                placeholder="Ej: Cimitarra. +4 Ataque, 1d6+2 Cortante. (Ideal para anotar aquí y tirarlo en Discord)"
                className="w-full flex-1 bg-transparent text-sm p-4 text-slate-300 focus:outline-none resize-none custom-scrollbar"
              ></textarea>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-950 p-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800">
                Inventario
              </div>
              <textarea 
                value={activeChar.inventory}
                onChange={(e) => updateActiveChar({ inventory: e.target.value })}
                placeholder="Oro, pociones, cuerdas, armaduras de repuesto..."
                className="w-full flex-1 bg-transparent text-sm p-4 text-slate-300 focus:outline-none resize-none custom-scrollbar"
              ></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
