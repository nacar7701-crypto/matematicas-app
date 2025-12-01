import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Asumiendo un archivo CSS para esta vista

export default function Home() {
  return (
    <div className="home-page-container">
      <header className="home-header">
        <h1>Bienvenido al Pizarrón Interactivo 📐</h1>
        <p>Recursos de Matemáticas (6º Primaria) — Proyecto PWA</p>
      </header>

      <section className="home-content">
        <h2>Unidades disponibles:</h2>
        
        {/* Usamos el componente Link para navegar a la ruta de Aproximacion */}
        <Link to="/aproximacion" className="module-card">
          <div className="card-icon">🔢</div>
          <h3>Aproximación de números</h3>
          <p>Practica el redondeo de decimales a la unidad, décima y centésima.</p>
        </Link>
        
        {/* Otros módulos irían aquí */}
        <div className="module-card disabled">
          <div className="card-icon">🧪</div>
          <h3>Unidad 2: [Próximamente]</h3>
          <p>Módulo en desarrollo.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>Hecho con React para la Casa del Saber.</p>
      </footer>
    </div>
  );
}