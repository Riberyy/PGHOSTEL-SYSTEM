// src/pages/admin/ManageUsers.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [toggling, setToggling] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params:{ search, role } });
      setUsers(data.users);
    } catch (_) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, role]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(u => u.map(x => x._id === id ? data.user : x));
      toast.success(data.message);
    } catch (_) { toast.error('Failed'); }
    finally { setToggling(null); }
  };

  return (
    <div>
      <div className="page-header"><h1>Manage Users</h1><p>View and manage all students and owners</p></div>
      <div className="filter-bar">
        <div className="form-group" style={{margin:0,flex:1}}>
          <label>Search</label>
          <input className="form-control" placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="form-group" style={{margin:0}}>
          <label>Role</label>
          <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="owner">Owners</option>
          </select>
        </div>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{fontWeight:600}}>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td className="text-muted">{u.phone}</td>
                  <td><span className={`badge ${u.role==='owner'?'badge-warning':'badge-info'}`}>{u.role}</span></td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${u.isActive?'badge-success':'badge-danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={() => handleToggle(u._id)} disabled={toggling===u._id}>
                      {toggling===u._id?'...':(u.isActive?'Deactivate':'Activate')}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
