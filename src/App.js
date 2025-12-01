// src/App.js (o tu componente principal)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa tus componentes de página
import Home from './pages/Home';
import Aproximacion from './pages/Aproximacion';

function App() {
  return (
    // CAMBIO CRUCIAL: Añadir basename con el nombre del repositorio
    <Router basename="/matematicas-app">
      <div className="App">
        <Routes>
          
          {/* Las rutas internas (path) siguen siendo las mismas (relativas al basename) */}
          <Route path="/home" element={<Home />} /> 
          <Route path="/aproximacion" element={<Aproximacion />} />
          
          {/* Ahora, la ruta raíz (/) redirige correctamente a /matematicas-app/home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;