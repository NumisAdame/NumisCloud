export const PIECE_TYPES = [
  { value: 'MONEDA', label: 'Moneda' },
  { value: 'BILLETE', label: 'Billete' },
  { value: 'MEDALLA', label: 'Medalla' },
  { value: 'FICHA', label: 'Ficha' },
  { value: 'TOKEN', label: 'Token' },
  { value: 'CONDECORACION', label: 'Condecoración' },
  { value: 'OTRA', label: 'Otra' },
] as const;

export const PIECE_STATUSES = [
  { value: 'EN_COLECCION', label: 'En colección' },
  { value: 'VENDIDA', label: 'Vendida' },
  { value: 'CEDIDA', label: 'Cedida' },
  { value: 'ROBADA', label: 'Robada' },
  { value: 'EXTRAVIADA', label: 'Extraviada' },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'PRIVADA', label: 'Privada' },
  { value: 'PUBLICA', label: 'Pública' },
  { value: 'COMPARTIDA', label: 'Compartida mediante enlace' },
] as const;

export const CONSERVATION_GRADES = [
  { value: 'PR', label: 'PR - Poor (Pobre)' },
  { value: 'FR', label: 'FR - Fair (Mediocre)' },
  { value: 'G', label: 'G - Good (Buena)' },
  { value: 'VG', label: 'VG - Very Good (Muy buena)' },
  { value: 'F', label: 'F - Fine (Fina)' },
  { value: 'VF', label: 'VF - Very Fine (Muy fina)' },
  { value: 'EF', label: 'EF - Extremely Fine (Extremadamente fina)' },
  { value: 'AU', label: 'AU - About Uncirculated (Casi sin circular)' },
  { value: 'UNC', label: 'UNC - Uncirculated (Sin circular)' },
  { value: 'BU', label: 'BU - Brilliant Uncirculated (Brillante sin circular)' },
  { value: 'FDC', label: 'FDC - Flor de cuño' },
  { value: 'PROOF', label: 'Proof (Prueba)' },
] as const;

export const DEFAULT_TAGS = [
  'Romana', 'Griega', 'Medieval', 'Española', 'Europea',
  'Americana', 'Asiática', 'Africana', 'Oro', 'Plata',
  'Bronce', 'Cobre', 'Euro', 'Billetes', 'Conmemorativa',
  'Colonial', 'Antigua', 'Moderna', 'Contemporánea', 'Rara',
] as const;

export const METALS = [
  'Oro', 'Plata', 'Cobre', 'Bronce', 'Platino', 'Paladio',
  'Aluminio', 'Níquel', 'Zinc', 'Hierro', 'Latón', 'Electro',
  'Bimetalica', 'Papel', 'Polímero', 'Otro',
] as const;

export const FREE_PIECE_LIMIT = 20;

export const PLANS = {
  monthly: {
    name: 'Mensual',
    price: 1.99,
    currency: 'EUR',
    interval: 'month' as const,
    description: '€1,99/mes',
  },
  annual: {
    name: 'Anual',
    price: 14.99,
    currency: 'EUR',
    interval: 'year' as const,
    description: '€14,99/año (ahorra ~37%)',
  },
} as const;
