// src/App.js (o tu componente principal)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa tus componentes de página
import Home from './pages/Home'; // Nueva pantalla de inicio
import Aproximacion from './pages/Aproximacion'; // Tu módulo existente

function App() {
  return (
    // 1. Usar el Router como contenedor principal
    <Router>
      <div className="App">
        {/* 2. Definir las rutas */}
        <Routes>
          {/* Ruta de inicio, que coincide con el 'start_url' del manifest */}
          <Route path="/home" element={<Home />} /> 
          
          {/* Ruta para el módulo que ya creaste */}
          <Route path="/aproximacion" element={<Aproximacion />} />
          
          {/* Opcional: Redirigir la raíz (/) a /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;