import React, { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

// Admin account
const ADMIN = { username: 'admin', password: 'admin123', name: 'Administrator' };

// Student accounts — roll 101-120, password = "stu" + rollNo
const STUDENTS = Array.from({ length: 20 }, (_, i) => ({
  rollNo: 101 + i,
  username: String(101 + i),
  password: `stu${101 + i}`,
  name: [
    'Arjun Sharma','Bhavya Reddy','Charan Patel','Divya Nair','Eshan Gupta',
    'Farhan Khan','Geetha Iyer','Harish Babu','Ishaan Mehta','Jyoti Verma',
    'Kiran Rao','Lakshmi Devi','Manoj Kumar','Niharika Sen','Omar Shaikh',
    'Priya Menon','Qasim Ali','Radha Iyer','Sanjay Gupta','Tanvi Joshi'
  ][i],
  branch: ['CSE','ECE','CSE','MECH','IT','ECE','CSE','EEE','CSE','IT',
           'ECE','MECH','CSE','EEE','IT','CSE','ECE','MECH','CSE','IT'][i],
}));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role, username, password) => {
    if (role === 'admin') {
      if (username === ADMIN.username && password === ADMIN.password) {
        setUser({ role: 'admin', name: ADMIN.name });
        return { ok: true };
      }
      return { ok: false, msg: 'Wrong username or password.' };
    }
    const s = STUDENTS.find(x => x.username === username && x.password === password);
    if (s) {
      setUser({ role: 'student', name: s.name, rollNo: s.rollNo, branch: s.branch });
      return { ok: true };
    }
    return { ok: false, msg: 'Roll number or password is incorrect.' };
  };

  const logout = () => setUser(null);

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
export { STUDENTS };
