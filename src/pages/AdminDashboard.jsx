import React, { useState } from 'react';
import ClassroomView from '../components/ClassroomView';
import { useSeating } from '../context/SeatingStore';
import { allocateSeating, exportCSV, exportPDF } from '../utils/seatingLogic';
import { STUDENTS } from '../context/AuthContext';

const BRANCHES = ['CSE', 'ECE', 'IT', 'MECH', 'EEE', 'CIVIL'];

const badgeClass = (b = '') => {
  const map = { CSE:'b-cse', ECE:'b-ece', MECH:'b-mech', IT:'b-it', EEE:'b-eee', CIVIL:'b-civil' };
  return `badge ${map[b.toUpperCase()] || 'b-def'}`;
};

// ── Resolve roll range string like "101-105, 108, 110-112" → array of rollNos
function parseRollRange(str) {
  const nums = new Set();
  str.split(',').forEach(part => {
    const p = part.trim();
    if (p.includes('-')) {
      const [a, b] = p.split('-').map(Number);
      if (!isNaN(a) && !isNaN(b)) for (let i = a; i <= b; i++) nums.add(i);
    } else {
      const n = Number(p);
      if (!isNaN(n) && n > 0) nums.add(n);
    }
  });
  return [...nums].sort((a, b) => a - b);
}

export default function AdminDashboard() {
  const { publish } = useSeating();

  // ── Rooms config ──
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Hall A', rangeStr: '101-106' },
    { id: 2, name: 'Hall B', rangeStr: '107-112' },
  ]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomRange, setNewRoomRange] = useState('');

  // ── Additional students (beyond the 20 in AuthContext) ──
  const [extraStudents, setExtraStudents] = useState([]);
  const [newStu, setNewStu] = useState({ rollNo: '', name: '', branch: 'CSE' });

  // ── Results ──
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [tab, setTab]         = useState('layout');
  const [filterText, setFilter] = useState('');
  const [sortF, setSortF]     = useState('rollNo');
  const [sortAsc, setSortAsc] = useState(true);

  const allStudents = [...STUDENTS, ...extraStudents];

  // ── Add / remove room ──
  const addRoom = () => {
    if (!newRoomName.trim()) return;
    setRooms(p => [...p, { id: Date.now(), name: newRoomName.trim(), rangeStr: newRoomRange.trim() }]);
    setNewRoomName(''); setNewRoomRange('');
  };
  const removeRoom = (id) => setRooms(p => p.filter(r => r.id !== id));
  const updateRoom = (id, key, val) => setRooms(p => p.map(r => r.id === id ? { ...r, [key]: val } : r));

  // ── Add / remove extra student ──
  const addStudent = () => {
    if (!newStu.rollNo || !newStu.name) return;
    const rn = parseInt(newStu.rollNo);
    if (allStudents.find(s => s.rollNo === rn)) { setErr('Roll number already exists.'); return; }
    setExtraStudents(p => [...p, { ...newStu, rollNo: rn }]);
    setNewStu({ rollNo: '', name: '', branch: 'CSE' });
    setErr('');
  };
  const removeStu = (rn) => setExtraStudents(p => p.filter(s => s.rollNo !== rn));

  // ── Generate ──
  const generate = async () => {
    setErr(''); setLoading(true); setResult(null);
    await new Promise(r => setTimeout(r, 400));

    const roomPayloads = rooms.map(room => {
      const rollNos = parseRollRange(room.rangeStr);
      const students = rollNos
        .map(rn => allStudents.find(s => s.rollNo === rn))
        .filter(Boolean);
      return { name: room.name, students };
    });

    const unmatched = rooms.flatMap(room => {
      const rollNos = parseRollRange(room.rangeStr);
      return rollNos.filter(rn => !allStudents.find(s => s.rollNo === rn));
    });

    if (unmatched.length) {
      setErr(`Warning: Roll numbers not found in system: ${unmatched.join(', ')}. They were skipped.`);
    }

    const data = allocateSeating(roomPayloads);
    setResult(data);
    publish(data);   // make visible to students
    setLoading(false);
  };

  const alloc = result?.allocationList || [];
  const layouts = result?.roomLayouts || {};

  const filteredAlloc = alloc
    .filter(s =>
      String(s.rollNo).includes(filterText) ||
      s.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      (s.branch||'').toLowerCase().includes(filterText.toLowerCase()) ||
      s.room.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortF], vb = b[sortF];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const handleSort = (f) => { if (sortF === f) setSortAsc(p => !p); else { setSortF(f); setSortAsc(true); } };
  const arr = (f) => sortF === f ? (sortAsc ? ' ↑' : ' ↓') : '';

  const totalSeats = rooms.reduce((a, r) => a + parseRollRange(r.rangeStr).length, 0);

  return (
    <div className="page">
      <div className="pg-eyebrow">Administrator Portal</div>
      <h2 className="pg-title">Seating Arrangement Manager</h2>
      <p className="pg-sub">Configure rooms, assign roll number ranges, and publish seating for students</p>

      {/* ── STUDENT ROSTER ── */}
      <div className="card">
        <div className="card-head">
          <div className="card-title"><span className="card-icon">👤</span> Student Roster</div>
          <span className="card-meta">{allStudents.length} students in system</span>
        </div>

        {/* Add extra student */}
        <div className="fg4" style={{ marginBottom: '1.25rem' }}>
          <div>
            <label className="flabel">Roll No</label>
            <input className="finput" type="number" placeholder="121"
              value={newStu.rollNo} onChange={e => setNewStu({ ...newStu, rollNo: e.target.value })} />
          </div>
          <div>
            <label className="flabel">Full Name</label>
            <input className="finput" type="text" placeholder="Student Name"
              value={newStu.name} onChange={e => setNewStu({ ...newStu, name: e.target.value })} />
          </div>
          <div>
            <label className="flabel">Branch</label>
            <select className="finput" value={newStu.branch}
              onChange={e => setNewStu({ ...newStu, branch: e.target.value })}>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="fg-align-end">
            <button className="btn btn-gold" style={{ width: '100%' }} onClick={addStudent}>+ Add Student</button>
          </div>
        </div>

        {err && <div className="alert alert-err">⚠ {err}</div>}

        <div style={{ overflowX: 'auto', maxHeight: '240px', overflowY: 'auto' }}>
          <table className="dtable">
            <thead>
              <tr><th>Roll No</th><th>Name</th><th>Branch</th><th style={{ width: 60 }}></th></tr>
            </thead>
            <tbody>
              {allStudents.sort((a, b) => a.rollNo - b.rollNo).map((s, i) => (
                <tr key={i}>
                  <td><span className="mono" style={{ fontWeight: 600 }}>{s.rollNo}</span></td>
                  <td>{s.name}</td>
                  <td><span className={badgeClass(s.branch)}>{s.branch || '—'}</span></td>
                  <td>
                    {extraStudents.find(x => x.rollNo === s.rollNo) && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeStu(s.rollNo)}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ROOM CONFIGURATION ── */}
      <div className="card">
        <div className="card-head">
          <div className="card-title"><span className="card-icon">🏫</span> Exam Rooms & Roll Ranges</div>
          <span className="card-meta">Each room: 3 rows of benches, 2 students per bench</span>
        </div>

        {/* Add room */}
        <div className="fg3" style={{ marginBottom: '1.25rem' }}>
          <div>
            <label className="flabel">Room Name</label>
            <input className="finput" type="text" placeholder="Hall C"
              value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
          </div>
          <div>
            <label className="flabel">Roll Number Range</label>
            <input className="finput" type="text" placeholder="113-118 or 113,115,117"
              value={newRoomRange} onChange={e => setNewRoomRange(e.target.value)} />
          </div>
          <div className="fg-align-end">
            <button className="btn btn-gold" style={{ width: '100%' }} onClick={addRoom}>+ Add Room</button>
          </div>
        </div>

        {/* Room list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rooms.map(room => {
            const rolls = parseRollRange(room.rangeStr);
            return (
              <div key={room.id} style={{
                display: 'grid', gridTemplateColumns: '160px 1fr auto',
                gap: '0.75rem', alignItems: 'center',
                background: 'var(--parchment)', borderRadius: '8px',
                padding: '0.75rem 1rem', border: '1px solid var(--parchment3)',
              }}>
                <input className="finput" style={{ background: 'var(--white)', margin: 0 }}
                  value={room.name} onChange={e => updateRoom(room.id, 'name', e.target.value)} />
                <div>
                  <input className="finput" style={{ background: 'var(--white)', margin: 0 }}
                    value={room.rangeStr} placeholder="e.g. 101-106"
                    onChange={e => updateRoom(room.id, 'rangeStr', e.target.value)} />
                  {rolls.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--mist)' }}>
                      → {rolls.length} students: {rolls.slice(0, 8).join(', ')}{rolls.length > 8 ? '…' : ''}
                    </div>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeRoom(room.id)}>✕ Remove</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GENERATE BAR ── */}
      <div className="gen-bar card">
        <div className="gen-bar-left">
          <div className="gen-bar-eyebrow">Ready to publish</div>
          <div className="gen-bar-desc">
            {allStudents.length} students · {rooms.length} room{rooms.length !== 1 ? 's' : ''} · ~{totalSeats} seats to fill
          </div>
        </div>
        <button className="btn-generate" onClick={generate}
          disabled={loading || rooms.length === 0}>
          {loading ? <><span className="spin" /> Generating…</> : '🎯 Generate & Publish Seating'}
        </button>
      </div>

      {/* ── RESULTS ── */}
      {result && (
        <>
          {/* Stats */}
          <div className="stats-row">
            {[
              { n: alloc.length,                lbl: 'Students Seated' },
              { n: Object.keys(layouts).length, lbl: 'Rooms Used' },
              { n: alloc.length,                lbl: 'Seats Filled' },
              { n: new Set(alloc.map(s=>s.branch)).size, lbl: 'Branches' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-head">
              <div className="tabs-bar" style={{ margin: 0 }}>
                <button className={`tab ${tab === 'layout' ? 'active' : ''}`} onClick={() => setTab('layout')}>🏫 Hall Layout</button>
                <button className={`tab ${tab === 'list'   ? 'active' : ''}`} onClick={() => setTab('list')}>📋 Allocation List</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(alloc)}>⬇ CSV</button>
                <button className="btn btn-ghost btn-sm" onClick={() => exportPDF(alloc)}>⬇ PDF</button>
              </div>
            </div>

            {tab === 'layout' && (
              <div>
                {rooms.map(room => (
                  <ClassroomView
                    key={room.name}
                    roomName={room.name}
                    layout={layouts[room.name]}
                    allocationList={alloc}
                    highlighted={null}
                  />
                ))}
              </div>
            )}

            {tab === 'list' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="card-meta">Showing {filteredAlloc.length} of {alloc.length}</span>
                  <input className="finput" style={{ maxWidth: 260 }}
                    placeholder="Filter by name, roll, branch, room…"
                    value={filterText} onChange={e => setFilter(e.target.value)} />
                </div>
                <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                  <table className="dtable">
                    <thead>
                      <tr>
                        {[['rollNo','Roll No'],['name','Name'],['branch','Branch'],['room','Room'],['benchRow','Row'],['benchNum','Bench'],['side','Side']].map(([k,l]) => (
                          <th key={k} style={{ cursor: 'pointer' }} onClick={() => handleSort(k)}>{l}{arr(k)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlloc.map((s, i) => (
                        <tr key={i}>
                          <td><span className="mono" style={{ fontWeight: 600 }}>{s.rollNo}</span></td>
                          <td>{s.name}</td>
                          <td><span className={badgeClass(s.branch)}>{s.branch||'—'}</span></td>
                          <td>{s.room}</td>
                          <td style={{ textAlign:'center' }}>{s.benchRow}</td>
                          <td style={{ textAlign:'center' }}>{s.benchNum}</td>
                          <td style={{ textAlign:'center' }}>{s.side === 'L' ? '⬅ Left' : '➡ Right'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="empty">
          <div className="empty-icon">🪑</div>
          <div className="empty-title">No seating published yet</div>
          <div className="empty-sub">Configure your rooms and roll ranges above, then click Generate & Publish.</div>
        </div>
      )}
    </div>
  );
}
