import { useState, useEffect } from 'react';
import { useNavigate }          from 'react-router-dom';
import { useAuth }              from '../contexts/AuthContext';
import api                      from '../api/axios';
import type { BoardDto }        from '../dtos/BoardDto';

export default function Dashboard() {
  const { logout }       = useAuth();
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]       = useState('');
  const [description, setDescription] = useState('');

  const [editingId, setEditingId] = useState<number|null>(null);
  const [editName, setEditName]       = useState('');
  const [editDescription, setEditDescription] = useState('');

  const navigate = useNavigate();

  // Fetch boards
  useEffect(() => {
    api.get<BoardDto[]>('/boards')
       .then(r => setBoards(r.data))
       .catch(err => {
         if (err.response?.status === 401) navigate('/login');
       });
  }, []);

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { name, description };
    const { data: newBoard } = await api.post<BoardDto>('/boards', dto);
    setBoards([newBoard, ...boards]);
    setName(''); setDescription(''); setShowForm(false);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this board?')) return;
    await api.delete(`/boards/${id}`);
    setBoards(boards.filter(b => b.id !== id));
  };

  // Edit flow
  const startEdit = (b: BoardDto) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditDescription(b.description);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName(''); setEditDescription('');
  };
  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    try {
    const dto = { name: editName, description: editDescription };
    await api.put(`/boards/${id}`, dto);

    setBoards(boards.map(b =>
      b.id === id
        ? {
            ...b,
            name:        editName,         // use local form values
            description: editDescription,
            updatedAt:   new Date().toISOString(), // or keep b.updatedAt if you prefer
          }
        : b
    ));

    cancelEdit();
  } catch (err) {
    console.error('Update failed', err);
  }
    cancelEdit();
  };

  return (
    <div style={{ padding:20 }}>
      <h1>Your Kanban Boards</h1>
      <button onClick={logout}>Log Out</button>
      <button onClick={() => setShowForm(!showForm)} style={{ marginLeft:8 }}>
        {showForm ? 'Cancel' : 'New Board'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: '16px 0' }}>
          <div>
            <input
              placeholder="Name"
              value={name}
              onChange={e=>setName(e.target.value)}
              required
              style={{ width:300 }}
            />
          </div>
          <div style={{ marginTop:8 }}>
            <textarea
              placeholder="Description"
              value={description}
              onChange={e=>setDescription(e.target.value)}
              rows={3}
              style={{ width:300 }}
            />
          </div>
          <button type="submit" style={{ marginTop:8 }}>Create</button>
        </form>
      )}

      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        {boards.map(b => (
          <div
            key={b.id}
            style={{ border:'1px solid #ccc', borderRadius:4, padding:16, width:200, position:'relative' }}
          >
            {editingId === b.id ? (
              <form onSubmit={e=>handleUpdate(e,b.id)}>
                <input
                  value={editName}
                  onChange={e=>setEditName(e.target.value)}
                  required
                  style={{ width:'100%' }}
                />
                <textarea
                  value={editDescription}
                  onChange={e=>setEditDescription(e.target.value)}
                  rows={2}
                  style={{ width:'100%', marginTop:4 }}
                />
                <button type="submit" style={{ marginTop:4 }}>Save</button>
                <button type="button" onClick={cancelEdit} style={{ marginLeft:4 }}>Cancel</button>
              </form>
            ) : (
              <>
                <h2
                  onClick={()=>navigate(`/boards/${b.id}`)}
                  style={{ cursor:'pointer' }}
                >{b.name}</h2>
                <p>{b.description}</p>
                <small>{b.columns.reduce((s,c)=>s+c.cards.length,0)} cards</small>
                <div style={{ position:'absolute', top:8, right:8 }}>
                  <button onClick={()=>startEdit(b)} style={{ marginRight:4 }}>✏️</button>
                  <button onClick={()=>handleDelete(b.id)}>🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
