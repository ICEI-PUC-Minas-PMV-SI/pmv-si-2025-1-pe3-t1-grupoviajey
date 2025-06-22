// Utilitário para formatação de datas curtas
export function formatShortDate(dateString) {
  // Cria o objeto Date tratando a string como UTC para evitar conversão de fuso horário.
  // Adiciona um 'T00:00:00Z' se não tiver, para garantir que seja interpretado como meia-noite UTC.
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
  
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${date.getUTCDate().toString().padStart(2, '0')} ${meses[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatShortDateRange(start, end) {
  if (!start || !end) return '';
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}
