import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [role, setRole]     = useState('admin');
  const [user, setUser]     = useState('');
  const [pass, setPass]     = useState('');
  const [err,  setErr]      = useState('');
  const [busy, setBusy]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    await new Promise(r => setTimeout(r, 550));
    const res = login(role, user.trim(), pass);
    if (!res.ok) setErr(res.msg);
    setBusy(false);
  };

  const switchRole = (r) => { setRole(r); setErr(''); setUser(''); setPass(''); };

  return (
    <div className="auth-wrap">
      {/* ── Left panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-bg" />
        <div className="auth-panel-pattern" />
        <div className="auth-panel-content">
          <div className="auth-badge">🎓 Examination Management System</div>
          <h1>Smart<br /><em>Seating</em><br />Portal</h1>
          <p className="auth-panel-desc">
            Automated exam hall seat allocation with roll-number-based assignment,
            mixed-branch bench pairing, and real-time student lookup.
          </p>
          <div className="auth-feats">
            {[
              'Admin controls all seating arrangements',
              'Students view only their assigned seat',
              '3 rows of benches, 2 students per bench',
              'Different branches seated side by side',
              'Custom roll number ranges per room',
              'Export to CSV or PDF instantly',
            ].map((f, i) => (
              <div className="auth-feat" key={i}>
                <div className="auth-feat-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-logo">🎓</div>
          <h2>Welcome back</h2>
          <p className="auth-card-sub">Sign in to the ExamSeat portal</p>

          {/* Role switcher */}
          <div className="role-toggle">
            <button className={`role-btn ${role==='admin' ? 'active':''}`} onClick={() => switchRole('admin')}>
              🛡 Administrator
            </button>
            <button className={`role-btn ${role==='student' ? 'active':''}`} onClick={() => switchRole('student')}>
              🎓 Student
            </button>
          </div>

          {err && <div className="auth-err">⚠ {err}</div>}

          <form onSubmit={submit}>
            <div className="fgroup">
              <label className="flabel">{role === 'admin' ? 'Username' : 'Roll Number'}</label>
              <input
                className="finput"
                type="text"
                placeholder={role === 'admin' ? 'admin' : 'e.g.  101'}
                value={user}
                onChange={e => setUser(e.target.value)}
                required autoFocus
              />
            </div>
            <div className="fgroup">
              <label className="flabel">Password</label>
              <input
                className="finput"
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
              />
            </div>
            <button className="btn-signin" type="submit" disabled={busy}>
              {busy
                ? <><span className="spin" /> Signing in…</>
                : `Sign in as ${role === 'admin' ? 'Administrator' : 'Student'}`}
            </button>
          </form>

          <div className="auth-hint">
            <strong>Demo credentials</strong><br />
            {role === 'admin'
              ? <>Username: <strong>admin</strong> &nbsp;·&nbsp; Password: <strong>admin123</strong></>
              : <>Roll No: <strong>101 – 120</strong> &nbsp;·&nbsp; Password: <strong>stu + roll</strong> (e.g. stu101)</>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
