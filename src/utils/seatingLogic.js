/**
 * Core seating allocation — runs entirely in the browser.
 * Rules:
 *  - 3 rows of benches per room
 *  - Each bench seats 2 students (left + right)
 *  - Students from DIFFERENT branches sit on the same bench
 *  - Roll numbers filled in ascending order
 *  - Admin specifies roll number ranges per room
 */

export function allocateSeating(rooms) {
  /**
   * rooms = [
   *   { name, students: [{rollNo, name, branch}, ...] }
   * ]
   * Returns allocation: [{rollNo, name, branch, room, benchRow, benchNum, side}]
   */
  const allocationList = [];
  const roomLayouts = {}; // roomName → 3D: [row][bench][side 0|1]

  for (const room of rooms) {
    const sorted = [...room.students].sort((a, b) => a.rollNo - b.rollNo);

    // 3 rows, each row has ceil(students/6) benches (max 2 per bench)
    const totalBenches = Math.ceil(sorted.length / 2);
    const benchesPerRow = Math.ceil(totalBenches / 3);

    // Build layout grid: rows × benches × 2 seats
    const layout = Array.from({ length: 3 }, () =>
      Array.from({ length: benchesPerRow }, () => [null, null])
    );

    let si = 0;

    // Interleave branches: seat left side first across all benches, then right side
    // This ensures different branches sit together on same bench
    // Strategy: fill bench by bench, alternating branches
    const queue = [...sorted];
    for (let row = 0; row < 3 && queue.length; row++) {
      for (let b = 0; b < benchesPerRow && queue.length; b++) {
        // Left seat
        if (queue.length) {
          const s = queue.shift();
          layout[row][b][0] = s;
          allocationList.push({
            rollNo: s.rollNo, name: s.name, branch: s.branch,
            room: room.name, benchRow: row + 1, benchNum: b + 1, side: 'L',
          });
        }
        // Right seat — pick from remaining queue (different branch preferred)
        if (queue.length) {
          const leftBranch = layout[row][b][0]?.branch;
          const diffIdx = queue.findIndex(x => x.branch !== leftBranch);
          const pickIdx = diffIdx >= 0 ? diffIdx : 0;
          const s = queue.splice(pickIdx, 1)[0];
          layout[row][b][1] = s;
          allocationList.push({
            rollNo: s.rollNo, name: s.name, branch: s.branch,
            room: room.name, benchRow: row + 1, benchNum: b + 1, side: 'R',
          });
        }
      }
    }

    roomLayouts[room.name] = layout;
  }

  return { allocationList, roomLayouts };
}

export function exportCSV(allocationList) {
  const headers = ['Roll No', 'Name', 'Branch', 'Room', 'Row', 'Bench', 'Side'];
  const rows = allocationList.map(s =>
    [s.rollNo, s.name, s.branch || '-', s.room, s.benchRow, s.benchNum, s.side === 'L' ? 'Left' : 'Right']
  );
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'seating_arrangement.csv'; a.click();
  URL.revokeObjectURL(url);
}

export async function exportPDF(allocationList) {
  try {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Exam Seating Arrangement', 14, 20);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.autoTable({
      startY: 35,
      head: [['Roll No', 'Name', 'Branch', 'Room', 'Row', 'Bench', 'Side']],
      body: allocationList.map(s => [
        s.rollNo, s.name, s.branch || '-', s.room, s.benchRow, s.benchNum,
        s.side === 'L' ? 'Left' : 'Right'
      ]),
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [13, 27, 42] },
      alternateRowStyles: { fillColor: [245, 240, 232] },
    });
    doc.save('seating_arrangement.pdf');
  } catch { alert('PDF export failed. Try CSV.'); }
}
