// Utilitário para formatação de datas curtas
export function formatShortDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${date.getDate().toString().padStart(2, '0')} ${meses[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDateRange(start, end) {
    if (!start || !end) return '';
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
} 