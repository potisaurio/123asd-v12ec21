import { useState } from 'react';

export default function App() {
  const [rol, setRol] = useState('JUGADOR');
  const [pestanaActiva, setPestanaActiva] = useState('PRINCIPAL');
  
  const [personaje, setPersonaje] = useState({
    nombre: 'Ermitaño (Tavs)',
    clase: 'Druida',
    nivel: 3,
    ca: 17,
    hpActual: 19,
    hpMax: 19,
    imagen: null,
    estadisticas: {
      fuerza: 10, destreza: 14, constitucion: 14,
      inteligencia: 10, sabiduria: 16, carisma: 12
    }
  });

  const [inputDanio, setInputDanio] = useState('');
  const [animacion, setAnimacion] = useState('');

  const aplicarDanio = (esCuracion) => {
    const valor = parseInt(inputDanio);
    if (isNaN(valor) || valor <= 0) return;

    let nuevoHp = esCuracion ? personaje.hpActual + valor : personaje.hpActual - valor;
    
    if (nuevoHp > personaje.hpMax) nuevoHp = personaje.hpMax;
    if (nuevoHp < 0) nuevoHp = 0;

    setPersonaje({ ...personaje, hpActual: nuevoHp });
    setInputDanio('');

    if (esCuracion) {
      setAnimacion('bg-emerald-900/40 scale-[1.02] transition-all duration-300');
    } else {
      setAnimacion('bg-rose-900/40 scale-[0.98] animate-pulse transition-all duration-300');
    }

    setTimeout(() => setAnimacion('transition-all duration-500 ease-in-out'), 400);
  };

  const manejarSubidaImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPersonaje({ ...personaje, imagen: imageUrl });
    }
  };

  const calcularMod = (valor) => Math.floor((valor - 10) / 2);

  if (rol === 'DM') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-500">🔥 Panel del Dungeon Master</h1>
          <button onClick={() => setRol('JUGADOR')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded transition-colors">Volver a Jugador</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-emerald-500 shadow-lg">
            <h2 className="text-xl font-bold">{personaje.nombre}</h2>
            <p className="text-slate-400">{personaje.clase} Nvl {personaje.nivel}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-rose-400 font-bold">HP: {personaje.hpActual}/{personaje.hpMax}</span>
              <span className="text-blue-400 font-bold">CA: {personaje.ca}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans ${animacion}`}>
      <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-800">
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center transition-transform hover:scale-105 duration-300">
              {personaje.imagen ? (
                <img src={personaje.imagen} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl opacity-50">🧙‍♂️</span>
              )}
            </div>
            <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
              <span className="text-xs font-bold tracking-wider">SUBIR FOTO</span>
              <input type="file" accept="image/*" className="hidden" onChange={manejarSubidaImagen} />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-amber-500 tracking-wide">{personaje.nombre}</h1>
            <p className="text-lg text-slate-400 font-medium">{personaje.clase} Nvl {personaje.nivel}</p>
          </div>

          <button onDoubleClick={() => setRol('DM')} className="opacity-0 hover:opacity-100 p-4 transition-opacity" title="Doble clic para modo DM">
            🛡️
          </button>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-5 mb-6 shadow-inner border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center">
              <span className="text-xs tracking-widest text-slate-500 uppercase font-bold block mb-1">Puntos de Golpe</span>
              <div className="text-5xl font-black text-rose-500 drop-shadow-md">
                {personaje.hpActual} <span className="text-2xl text-slate-600">/ {personaje.hpMax}</span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input 
                type="number" 
                value={inputDanio}
                onChange={(e) => setInputDanio(e.target.value)}
                placeholder="0" 
                className="w-20 sm:w-24 bg-slate-900 text-center text-xl rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
              />
              <button onClick={() => aplicarDanio(false)} className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-lg transition-all shadow-lg shadow-rose-900/20 active:scale-95">
                Daño
              </button>
              <button onClick={() => aplicarDanio(true)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                Curar
              </button>
            </div>
          </div>
          
          <div className="w-full bg-slate-900 h-2 rounded-full mt-5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${personaje.hpActual > (personaje.hpMax / 2) ? 'bg-emerald-500' : personaje.hpActual > (personaje.hpMax / 4) ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${(personaje.hpActual / personaje.hpMax) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-slate-800">
          {['PRINCIPAL', 'HABILIDADES', 'COMBATE'].map(tab => (
            <button 
              key={tab}
              onClick={() => setPestanaActiva(tab)}
              className={`px-5 py-2 rounded-t-lg font-bold text-sm tracking-wide transition-all ${pestanaActiva === tab ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {pestanaActiva === 'PRINCIPAL' && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {Object.entries(personaje.estadisticas).map(([stat, valor]) => {
              const mod = calcularMod(valor);
              return (
                <div key={stat} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center hover:border-slate-600 transition-colors">
                  <span className="text-[10px] tracking-widest uppercase text-slate-500 font-bold mb-1">{stat.substring(0,3)}</span>
                  <span className="text-2xl font-black text-slate-200">{valor}</span>
                  <div className="bg-slate-900 w-full mt-2 py-1 rounded text-sm text-amber-500 font-bold shadow-inner">
                    {mod >= 0 ? `+${mod}` : mod}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {pestanaActiva === 'HABILIDADES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-lg flex justify-between items-center border border-slate-800 hover:border-slate-600 transition-colors">
              <span className="flex items-center gap-3 text-slate-300"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Acrobacias</span>
              <span className="font-bold text-slate-400">+2</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg flex justify-between items-center border border-slate-700 shadow-sm">
              <span className="flex items-center gap-3 text-slate-100"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div> Percepción</span>
              <span className="font-bold text-amber-500">+5</span>
            </div>
          </div>
        )}

        {pestanaActiva === 'COMBATE' && (
          <div className="space-y-3">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Cimitarra</h3>
                <p className="text-xs text-slate-500 mt-1">Arma cuerpo a cuerpo (Sutil)</p>
              </div>
              <div className="text-right">
                <span className="block text-sm text-slate-400 mb-1">Atq: <strong className="text-slate-200">+4</strong></span>
                <span className="text-rose-400 font-black text-xl">1d6 + 2</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
