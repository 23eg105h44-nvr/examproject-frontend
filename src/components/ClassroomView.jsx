import React from 'react';

const branchClass = (b = '') => {
  const map = { CSE:'b-cse', ECE:'b-ece', MECH:'b-mech', IT:'b-it', EEE:'b-eee', CIVIL:'b-civil' };
  return `badge ${map[b.toUpperCase()] || 'b-def'}`;
};

/**
 * Renders one classroom as a physical bench layout:
 * BLACKBOARD at top, then 3 rows of benches.
 * Each bench shows 2 seats side by side.
 */
const ClassroomView = ({ roomName, layout, allocationList, highlighted }) => {
  if (!layout) return null;

  const totalStudents = allocationList?.filter(s => s.room === roomName).length || 0;
  const totalSeats    = layout.flat().flat().filter(Boolean).length;

  return (
    <div className="classroom-wrap">
      <div className="classroom-title">
        🏫 {roomName}
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: 'var(--mist)', marginLeft: 4 }}>
          {totalStudents} students seated
        </span>
      </div>

      {/* Blackboard */}
      <div className="blackboard">▬ Blackboard / Front ▬</div>

      {/* Bench rows */}
      <div className="bench-rows">
        {layout.map((row, rowIdx) => (
          <div key={rowIdx} className="bench-row">
            <div className="bench-row-label">Row {rowIdx + 1}</div>
            <div className="benches">
              {row.map((bench, bIdx) => {
                const [left, right] = bench;
                return (
                  <div key={bIdx} className="bench">
                    {/* Left seat */}
                    <Seat student={left} highlighted={highlighted} />
                    {/* Right seat */}
                    <Seat student={right} highlighted={highlighted} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Seat = ({ student, highlighted }) => {
  if (!student) {
    return (
      <div className="seat empty">
        <span className="seat-empty-lbl">Empty</span>
      </div>
    );
  }

  const isHighlighted = highlighted && highlighted.rollNo === student.rollNo;

  return (
    <div className={`seat filled ${isHighlighted ? 'highlighted' : ''}`}>
      <span className="seat-roll">{student.rollNo}</span>
      <span className={branchClass(student.branch)}>{student.branch || '?'}</span>
    </div>
  );
};

export default ClassroomView;
