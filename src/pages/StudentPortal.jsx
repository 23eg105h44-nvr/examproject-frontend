import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeating } from '../context/SeatingStore';
import ClassroomView from '../components/ClassroomView';

export default function StudentPortal() {
  const { user } = useAuth();
  const { publishedSeating } = useSeating();
  const [tab, setTab] = useState('myseat');
  const [searchRoll, setSearchRoll] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchErr, setSearchErr] = useState('');

  const alloc   = publishedSeating?.allocationList || [];
  const layouts = publishedSeating?.roomLayouts    || {};
  const mySeat  = alloc.find(s => s.rollNo === user.rollNo) || null;

  const handleSearch = () => {
    setSearchErr(''); setSearchResult(null);
    const rn = parseInt(searchRoll);
    if (!rn) return;
    const found = alloc.find(s => s.rollNo === rn);
    if (found) setSearchResult(found);
    else setSearchErr(`Roll number ${rn} not found in current seating arrangement.`);
  };

  // What to highlight on the grid
  const highlighted = tab === 'myseat' ? mySeat : searchResult;

  return (
    <div className="page">
      {/* Hero */}
      <div className="stu-hero card" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="stu-hero-name">Hello, {user.name} 👋</div>
          <div className="stu-hero-sub">
            Roll No: <strong style={{ color: 'var(--gold-lt)' }}>{user.rollNo}</strong>
            &ensp;·&ensp; Branch: {user.branch}
            &ensp;·&ensp; {publishedSeating ? 'Seating has been published' : 'Seating not yet published by admin'}
          </div>
        </div>
      </div>

      {/* Not published yet */}
      {!publishedSeating && (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-title">Seating Not Published Yet</div>
            <div className="empty-sub">The administrator has not generated the seating arrangement yet. Please check back later.</div>
          </div>
        </div>
      )}

      {publishedSeating && (
        <>
          {/* My seat summary */}
          {mySeat ? (
            <div className="my-seat-card">
              {[
                { label: 'Roll Number', value: mySeat.rollNo },
                { label: 'Room',        value: mySeat.room },
                { label: 'Row',         value: `Row ${mySeat.benchRow}` },
                { label: 'Bench',       value: `Bench ${mySeat.benchNum}` },
                { label: 'Seat Side',   value: mySeat.side === 'L' ? '⬅ Left' : '➡ Right' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="ms-field-label">{label}</div>
                  <div className="ms-field-value">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              ℹ Your roll number has not been assigned a seat yet. Contact the administrator.
            </div>
          )}

          {/* Tabs */}
          <div className="card">
            <div className="card-head">
              <div className="tabs-bar" style={{ margin: 0 }}>
                <button className={`tab ${tab==='myseat' ?'active':''}`} onClick={()=>setTab('myseat')}>
                  📍 My Seat
                </button>
                <button className={`tab ${tab==='search' ?'active':''}`} onClick={()=>setTab('search')}>
                  🔍 Search
                </button>
                <button className={`tab ${tab==='all' ?'active':''}`} onClick={()=>setTab('all')}>
                  🏫 Full Layout
                </button>
              </div>
            </div>

            {/* My Seat tab */}
            {tab === 'myseat' && (
              mySeat ? (
                <>
                  <div className="alert alert-ok" style={{ marginBottom: '1.25rem' }}>
                    ✅ Your seat is highlighted in gold below — Room <strong>{mySeat.room}</strong>,
                    Row <strong>{mySeat.benchRow}</strong>, Bench <strong>{mySeat.benchNum}</strong>,
                    <strong> {mySeat.side === 'L' ? 'Left' : 'Right'}</strong> side.
                  </div>
                  <ClassroomView
                    roomName={mySeat.room}
                    layout={layouts[mySeat.room]}
                    allocationList={alloc}
                    highlighted={mySeat}
                  />
                </>
              ) : (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No seat assigned</div>
                  <div className="empty-sub">Your roll number was not found in the current arrangement.</div>
                </div>
              )
            )}

            {/* Search tab */}
            {tab === 'search' && (
              <div>
                <div className="search-row" style={{ marginBottom: '1rem' }}>
                  <input className="finput" style={{ maxWidth: 220 }}
                    type="number" placeholder="Enter roll number"
                    value={searchRoll}
                    onChange={e => setSearchRoll(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-ink" onClick={handleSearch}>🔍 Search</button>
                  {(searchResult || searchErr) && (
                    <button className="btn btn-ghost" onClick={() => { setSearchResult(null); setSearchErr(''); setSearchRoll(''); }}>Clear</button>
                  )}
                </div>

                {searchErr && <div className="alert alert-err">{searchErr}</div>}

                {searchResult && (
                  <>
                    <div className="search-result" style={{ marginBottom: '1.5rem' }}>
                      {[
                        { label: 'Roll No', value: searchResult.rollNo },
                        { label: 'Name',    value: searchResult.name },
                        { label: 'Branch',  value: searchResult.branch },
                        { label: 'Room',    value: searchResult.room },
                        { label: 'Row',     value: `Row ${searchResult.benchRow}` },
                        { label: 'Bench',   value: `Bench ${searchResult.benchNum}` },
                        { label: 'Side',    value: searchResult.side === 'L' ? '⬅ Left' : '➡ Right' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="sr-label">{label}</div>
                          <div className="sr-value">{value}</div>
                        </div>
                      ))}
                    </div>
                    <ClassroomView
                      roomName={searchResult.room}
                      layout={layouts[searchResult.room]}
                      allocationList={alloc}
                      highlighted={searchResult}
                    />
                  </>
                )}

                {!searchResult && !searchErr && (
                  <div className="empty">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-title">Search for a student</div>
                    <div className="empty-sub">Enter any roll number to find their seat location.</div>
                  </div>
                )}
              </div>
            )}

            {/* Full layout tab */}
            {tab === 'all' && (
              Object.entries(layouts).map(([roomName, layout]) => (
                <ClassroomView
                  key={roomName}
                  roomName={roomName}
                  layout={layout}
                  allocationList={alloc}
                  highlighted={mySeat}
                />
              ))
            )}
          </div>

          <div style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--mist)', marginTop:'0.5rem' }}>
            🔒 Read-only view — contact your administrator for any seating changes.
          </div>
        </>
      )}
    </div>
  );
}
