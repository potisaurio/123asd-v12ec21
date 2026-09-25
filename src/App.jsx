import React, { useState, useEffect } from 'react';

// Estructura en dos columnas según el PDF
const STATS_COL_1 = [
  { id: 'str', name: 'FUERZA', skills: [{ id: 'athletics', name: 'Atletismo' }] },
  { id: 'dex', name: 'DESTREZA', skills: [{ id: 'acrobatics', name: 'Acrobacias' }, { id: 'sleightOfHand', name: 'Juego de Manos' }, { id: 'stealth', name: 'Sigilo' }] },
  { id: 'con', name: 'CONSTITUCIÓN', skills: [] }
];

const STATS_COL_2 = [
  { id: 'int', name: 'INTELIGENCIA', skills: [{ id: 'arcana', name: 'Conocimiento Arcano' }, { id: 'history', name: 'Historia' }, { id: 'investigation', name: 'Investigación' }, { id: 'nature', name: 'Naturaleza' }, { id: 'religion', name: 'Religión' }] },
  { id: 'wis', name: 'SABIDURÍA', skills: [{ id: 'animalHandling', name: 'Trato con Animales' }, { id: 'medicine', name: 'Medicina' }, { id: 'perception', name: 'Percepción' }, { id: 'insight', name: 'Perspicacia' }, { id: 'survival', name: 'Supervivencia' }] },
  { id: 'cha', name: 'CARISMA', skills: [{ id: 'deception', name: 'Engañar' }, { id: 'intimidation', name: 'Intimidación' }, { id: 'performance', name: 'Interpretación' }, { id: 'persuasion', name: 'Persuasión' }] }
];

const ALL_STATS = [...STATS_COL_1, ...STATS_COL_2];

const DEFAULT_CHAR = {
  id: '', name: 'Nuevo Personaje',
  class: '', subclass: '', level: 1, background: '', species: '', xp: 0,
  size: 'Med', speed: 30, initiative: 0, passivePerception: 10, profBonus: 2, heroicInspiration: false,
  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { value: '1d8', spent: 0, max: 1 },
  deathSaves: { successes: 0, failures: 0 },
  ac: 10, shield: 0,
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
  inventory: { gear: '', attunement: '', coins: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 } }
};

export default function App() {
  const [view, setView] = useState('HOME'); 
  const [characters, setCharacters] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [activeTab, setActiveTab] = useState('ESTADÍSTICAS');
  const [initiativeTracker, setInitiativeTracker] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dnd_party_data_v2');
    if (saved) setCharacters(JSON.parse(saved));
    else {
      const initialChars = Array.from({ length: 7 }, (_, i) => ({ ...DEFAULT_CHAR, id: `char_${i + 1}`, name: `Personaje ${i + 1}` }));
      setCharacters(initialChars);
    }
  }, []);

  useEffect(() => {
    if (characters.length > 0) localStorage.setItem('dnd_party_data_v2', JSON.stringify(characters));
  }, [characters]);

  const getMod = (score) => Math.floor((score - 10) / 2);
  const getModFormatted = (score) => { const m = getMod(score); return m >= 0 ? `+${m}` : m; };

  const updateActiveChar = (updates) => {
    setCharacters(chars => chars.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
  };

  const activeChar = characters.find(c => c.id === activeCharId) || DEFAULT_CHAR;

  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-black text-amber-500 mb-12 drop-shadow-lg">CRÓNICAS DE DISCORD</h1>
        <div className="flex gap-6 w-full max-w-2xl">
          <button onClick={() => setView('PLAYER_SELECT')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-amber-500 p-10 rounded-2xl transition-all">
            <span className="text-6xl block mb-4">🗡️</span>
            <h2 className="text-2xl font-bold text-slate-100">Jugador</h2>
          </button>
          <button onClick={() => setView('DM_DASHBOARD')} className="flex-1 bg-slate-900 border border-slate-700 hover:border-rose-500 p-10 rounded-2xl transition-all">
            <span className="text-6xl block mb-4">👁️</span>
            <h2 className="text-2xl font-bold text-slate-100">Dungeon Master</h2>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'PLAYER_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <button onClick={() => setView('HOME')} className="text-slate-400 hover:text-white mb-8">← Volver</button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {characters.map((char) => (
            <button key={char.id} onClick={() => { setActiveCharId(char.id); setView('SHEET'); }} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500 text-left">
              <h3 className="text-xl font-bold text-slate-100">{char.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{char.class} Nvl {char.level}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'DM_DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <button onClick={() => setView('HOME')} className="text-slate-400 hover:text-white mb-4">← Volver</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {characters.map(char => (
              <div key={char.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-amber-500">{char.name}</h3>
                    <p className="text-xs text-slate-400">{char.species} {char.class}</p>
                  </div>
                  <span className="bg-slate-950 px-2 py-1 rounded text-sm font-bold border border-slate-700">CA: {char.ac}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>HP (Temp: {char.hp.temp})</span>
                  <span className={char.hp.current <= 0 ? 'text-rose-500' : ''}>{char.hp.current} / {char.hp.max}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(0, (char.hp.current / char.hp.max) * 100)}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 rounded py-1">P. Pasiva<br/><span className="font-bold">{char.passivePerception}</span></div>
                  <div className="bg-slate-950 rounded py-1">Iniciativa<br/><span className="font-bold">{getModFormatted(char.stats.dex)}</span></div>
                  <div className="bg-slate-950 rounded py-1">Mov.<br/><span className="font-bold">{char.speed}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-amber-500 mb-4">Iniciativa</h2>
            {initiativeTracker.sort((a, b) => b.roll - a.roll).map((entity, i) => (
              <div key={i} className="flex justify-between bg-slate-950 p-2 rounded mb-2 border border-slate-700">
                <span>{i + 1}. {entity.name}</span><span className="text-amber-500 font-bold">{entity.roll}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <input type="text" id="initName" placeholder="Nombre" className="w-1/2 bg-slate-950 p-2 rounded text-sm" />
              <input type="number" id="initRoll" placeholder="Tirada" className="w-1/4 bg-slate-950 p-2 rounded text-sm" />
              <button onClick={() => {
                const name = document.getElementById('initName').value;
                const roll = document.getElementById('initRoll').value;
                if(name && roll) setInitiativeTracker([...initiativeTracker, {name, roll: parseInt(roll)}]);
              }} className="w-1/4 bg-amber-600 rounded text-sm font-bold">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStatBlock = (statsArray) => (
    <div className="space-y-4">
      {statsArray.map(stat => (
        <div key={stat.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex gap-4">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-700 flex flex-col items-center w-24">
            <span className="text-[10px] text-slate-500 font-bold">{stat.name}</span>
            <input type="number" value={activeChar.stats[stat.id]} onChange={(e) => updateActiveChar({ stats: { ...activeChar.stats, [stat.id]: parseInt(e.target.value) || 0 } })} className="w-full text-center bg-transparent text-2xl font-black focus:outline-none" />
            <div className="bg-slate-800 w-full text-center rounded-sm text-sm font-bold text-amber-500 mt-1">{getModFormatted(activeChar.stats[stat.id])}</div>
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-200 cursor-pointer mb-1 border-b border-slate-800 pb-1">
              <input type="checkbox" checked={activeChar.saves[stat.id]} onChange={() => updateActiveChar({ saves: { ...activeChar.saves, [stat.id]: !activeChar.saves[stat.id] } })} className="accent-amber-500" />
              Tirada de Salvación
            </label>
            <div className="space-y-1">
              {stat.skills.map(skill => (
                <label key={skill.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={activeChar.skills[skill.id].prof} onChange={() => updateActiveChar({ skills: { ...activeChar.skills, [skill.id]: { ...activeChar.skills[skill.id], prof: !activeChar.skills[skill.id].prof } } })} className="accent-amber-500" />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Cabecera Principal */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative">
          <button onClick={() => setView('PLAYER_SELECT')} className="absolute top-4 right-4 text-slate-500 text-sm">🚪 Volver</button>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <label className="text-[10px] uppercase text-slate-500 font-bold block">Nombre del Personaje</label>
              <input type="text" value={activeChar.name} onChange={(e) => updateActiveChar({ name: e.target.value })} className="w-full bg-transparent text-3xl font-black text-amber-500 border-b border-slate-700 focus:outline-none" />
            </div>
            
            <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: 'Clase', key: 'class' }, { label: 'Nivel', key: 'level', type: 'number' },
                { label: 'Trasfondo', key: 'background' }, { label: 'Especie', key: 'species' },
                { label: 'Subclase', key: 'subclass' }, { label: 'PX', key: 'xp', type: 'number' }
              ].map(field => (
                <div key={field.key} className="border-b border-slate-800 pb-1">
                  <label className="text-[9px] uppercase text-slate-500 font-bold block">{field.label}</label>
                  <input type={field.type || 'text'} value={activeChar[field.key]} onChange={(e) => updateActiveChar({ [field.key]: field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full bg-transparent text-sm font-bold focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 justify-between">
            <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 font-bold">C. ARMADURA</span>
                <input type="number" value={activeChar.ac} onChange={(e) => updateActiveChar({ ac: e.target.value })} className="w-12 bg-transparent text-2xl font-black text-center focus:outline-none" />
              </div>
              <div className="text-center border-l border-slate-800 pl-4">
                <span className="block text-[10px] text-slate-500 font-bold">ESCUDO</span>
                <input type="number" value={activeChar.shield} onChange={(e) => updateActiveChar({ shield: e.target.value })} className="w-12 bg-transparent text-xl font-bold text-center focus:outline-none" />
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] uppercase text-slate-500 font-bold">Puntos de Golpe</h3>
                <div className="flex items-baseline gap-1">
                  <input type="number" value={activeChar.hp.current} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, current: e.target.value } })} className="w-16 bg-transparent text-3xl font-black text-emerald-500 text-right focus:outline-none" />
                  <span className="text-slate-500">/</span>
                  <input type="number" value={activeChar.hp.max} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, max: e.target.value } })} className="w-10 bg-transparent font-bold text-slate-400 focus:outline-none" />
                </div>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 font-bold">TEMP.</span>
                <input type="number" value={activeChar.hp.temp} onChange={(e) => updateActiveChar({ hp: { ...activeChar.hp, temp: e.target.value } })} className="w-12 bg-slate-900 border border-slate-700 text-amber-500 font-bold text-center rounded focus:outline-none" />
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="block text-[10px] text-slate-500 font-bold">DADOS GOLPE</span>
                <input type="text" value={activeChar.hitDice.value} onChange={(e) => updateActiveChar({ hitDice: { ...activeChar.hitDice, value: e.target.value } })} className="w-12 bg-transparent font-bold text-center focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Bonif. Competencia', key: 'profBonus' }, { label: 'Iniciativa', key: 'initiative' },
            { label: 'Velocidad', key: 'speed' }, { label: 'Tamaño', key: 'size', type: 'text' },
            { label: 'Percepción Pasiva', key: 'passivePerception' }
          ].map(item => (
            <div key={item.key} className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
              <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1 h-6">{item.label}</span>
              <input type={item.type || 'number'} value={activeChar[item.key]} onChange={(e) => updateActiveChar({ [item.key]: item.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full bg-transparent text-lg font-bold text-center focus:outline-none" />
            </div>
          ))}
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
             <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Inspiración Heroica</span>
             <input type="checkbox" checked={activeChar.heroicInspiration} onChange={() => updateActiveChar({ heroicInspiration: !activeChar.heroicInspiration })} className="w-5 h-5 accent-amber-500" />
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-800">
          {['ESTADÍSTICAS', 'RASGOS', 'MAGIA', 'EQUIPO'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-bold text-sm rounded-t-lg ${activeTab === tab ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        {activeTab === 'ESTADÍSTICAS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderStatBlock(STATS_COL_1)}
            {renderStatBlock(STATS_COL_2)}
            
            <div className="md:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Armas y Trucos de Daño</h3>
              {activeChar.attacks.map((atk, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 bg-slate-950 p-2 rounded border border-slate-800 mb-2">
                  <input type="text" value={atk.name} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].name = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-transparent text-sm focus:outline-none" placeholder="Nombre" />
                  <input type="text" value={atk.atk} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].atk = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-transparent text-sm text-center focus:outline-none" placeholder="Bonif. Atq" />
                  <input type="text" value={atk.dmg} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].dmg = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-transparent text-sm focus:outline-none" placeholder="Daño y Tipo" />
                  <input type="text" value={atk.notes} onChange={(e) => { const newAtks = [...activeChar.attacks]; newAtks[index].notes = e.target.value; updateActiveChar({ attacks: newAtks }); }} className="bg-transparent text-sm focus:outline-none" placeholder="Notas" />
                </div>
              ))}
              <button onClick={() => updateActiveChar({ attacks: [...activeChar.attacks, { name: '', atk: '', dmg: '', notes: '' }] })} className="text-xs text-amber-500 hover:text-amber-400">+ Añadir Arma</button>
            </div>
          </div>
        )}

        {activeTab === 'RASGOS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-64">
              <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Rasgos de Clase</h3>
              <textarea value={activeChar.traits.class} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, class: e.target.value } })} className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none"></textarea>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-32">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Atributos de Especie</h3>
                <textarea value={activeChar.traits.species} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, species: e.target.value } })} className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-28">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Dotes</h3>
                <textarea value={activeChar.traits.feats} onChange={(e) => updateActiveChar({ traits: { ...activeChar.traits, feats: e.target.value } })} className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none"></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MAGIA' && (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
               {['ability', 'mod', 'saveDC', 'atkBonus'].map(key => (
                 <div key={key} className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                   <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">{key}</span>
                   <input type="text" value={activeChar.magic[key]} onChange={(e) => updateActiveChar({ magic: { ...activeChar.magic, [key]: e.target.value } })} className="w-full bg-transparent text-lg font-bold text-center focus:outline-none" />
                 </div>
               ))}
             </div>
             <div className="grid grid-cols-9 gap-1 mb-6">
               {activeChar.magic.slots.map((slot, i) => (
                 <div key={i} className="bg-slate-950 p-1 rounded border border-slate-800 text-center">
                   <span className="block text-[9px] text-slate-500">Nivel {i+1}</span>
                   <input type="number" value={slot.total} onChange={(e) => { const newSlots = [...activeChar.magic.slots]; newSlots[i].total = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, slots: newSlots } }); }} className="w-full bg-transparent text-sm text-center focus:outline-none" />
                 </div>
               ))}
             </div>
             <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Trucos y Conjuros Preparados</h3>
             {activeChar.magic.spells.map((spell, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded border border-slate-800 mb-2 items-center">
                  <input type="number" value={spell.level} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].level = parseInt(e.target.value)||0; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="col-span-1 bg-transparent text-sm text-center focus:outline-none" />
                  <input type="text" value={spell.name} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].name = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="col-span-3 bg-transparent text-sm focus:outline-none" placeholder="Nombre" />
                  <input type="text" value={spell.notes} onChange={(e) => { const s = [...activeChar.magic.spells]; s[index].notes = e.target.value; updateActiveChar({ magic: { ...activeChar.magic, spells: s } }); }} className="col-span-8 bg-transparent text-sm focus:outline-none" placeholder="Efecto / Notas" />
                </div>
              ))}
              <button onClick={() => updateActiveChar({ magic: { ...activeChar.magic, spells: [...activeChar.magic.spells, { level: 0, name: '', notes: '' }] } })} className="text-xs text-amber-500">+ Añadir Conjuro</button>
          </div>
        )}

        {activeTab === 'EQUIPO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-64">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Equipo e Inventario</h3>
                <textarea value={activeChar.inventory.gear} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, gear: e.target.value } })} className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Monedas</h3>
                <div className="grid grid-cols-5 gap-2">
                  {['pc', 'pp', 'pe', 'po', 'ppt'].map(coin => (
                    <div key={coin} className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                      <span className="text-xs font-bold uppercase text-slate-500">{coin}</span>
                      <input type="number" value={activeChar.inventory.coins[coin]} onChange={(e) => updateActiveChar({ inventory: { ...activeChar.inventory, coins: { ...activeChar.inventory.coins, [coin]: parseInt(e.target.value)||0 } } })} className="w-full bg-transparent text-lg font-bold text-center focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col h-32">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Historia y Personalidad</h3>
                <textarea value={activeChar.flavor.backstory} onChange={(e) => updateActiveChar({ flavor: { ...activeChar.flavor, backstory: e.target.value } })} className="w-full flex-1 bg-transparent text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm uppercase text-amber-500 font-bold mb-2">Entrenamiento y Competencias</h3>
                <input type="text" value={activeChar.proficiencies.armor} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, armor: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm mb-2 border border-slate-700" placeholder="Armaduras..." />
                <input type="text" value={activeChar.proficiencies.weapons} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, weapons: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm mb-2 border border-slate-700" placeholder="Armas..." />
                <input type="text" value={activeChar.proficiencies.tools} onChange={(e) => updateActiveChar({ proficiencies: { ...activeChar.proficiencies, tools: e.target.value } })} className="w-full bg-slate-950 p-2 rounded text-sm border border-slate-700" placeholder="Herramientas e Idiomas..." />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
