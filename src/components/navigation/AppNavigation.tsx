import React from 'react';

export type View = 'patient-list' | 'patient-form' | 'session-view';

interface AppNavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onNewPatient: () => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  currentView,
  onNavigate,
  onNewPatient
}) => {
  return (
    <nav className="app-navigation">
      <div className="nav-brand">
        <h1>Dental Photo Doc</h1>
      </div>
      <div className="nav-actions">
        {currentView === 'patient-list' && (
          <button onClick={onNewPatient} className="btn btn-primary">
            Nuevo Paciente
          </button>
        )}
        {currentView !== 'patient-list' && (
          <button
            onClick={() => onNavigate('patient-list')}
            className="btn btn-secondary"
          >
            Volver a Lista
          </button>
        )}
      </div>
    </nav>
  );
}; 