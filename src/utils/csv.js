export function exportToCSV(logs, activities) {
  const activityMap = {};
  activities.forEach(a => { activityMap[a.id] = a.name; });

  const headers = ['Date', 'Time', 'Activity', 'Reps', 'Touches Per Rep', 'Total Touches', 'Notes'];
  const rows = [];

  Object.entries(logs).forEach(([date, dayEntries]) => {
    dayEntries.forEach(entry => {
      rows.push([
        date,
        entry.time,
        activityMap[entry.activityId] || 'Unknown',
        entry.reps,
        entry.touchesPerRep,
        entry.totalTouches,
        entry.notes || '',
      ]);
    });
  });

  rows.sort((a, b) => {
    const dateComp = b[0].localeCompare(a[0]);
    return dateComp !== 0 ? dateComp : b[1].localeCompare(a[1]);
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `touch-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
