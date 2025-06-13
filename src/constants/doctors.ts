export const DOCTORS = [
  'Dr. David Carralero',
  'Dra. Eva Tormo',
  'Dra. Lucía Sanchis',
  'Dra. Marta Piquer',
  'Dra. Ángela Martín',
  'Dra. Marina Marco',
  'Dra. Sara Macias',
  'Dr. Nicolás Pastrana',
  'Dra. Alicia Rocher',
  'Dra. Ofelia Sánchez',
  'Dra. Lidón Pedrós'
] as const;

export type Doctor = typeof DOCTORS[number]; 