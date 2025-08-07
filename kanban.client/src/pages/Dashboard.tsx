import { useEffect, useState } from 'react';
import { useNavigate }          from 'react-router-dom';
import api                       from '../api/axios';
import type { BoardDto }              from '../dtos/BoardDto';
import { useAuth }               from '../contexts/AuthContext';

export default function Dashboard() {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const navigate             = useNavigate();
  const { token, logout }    = useAuth();

  // 1️⃣ Fetch the boards on component mount
  useEffect(() => {
    api.get<BoardDto[]>('/boards')
      .then(res => setBoards(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          // token expired or invalid → send back to login
          navigate('/login');
        }
      });
  }, []);

  // 2️⃣ Simple click handler to drill in
  const openBoard = (id: number) => {
    navigate(`/boards/${id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Kanban Boards</h1>
      <button onClick={() => {logout(); navigate('/login')}}>Log Out</button>
      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
        {boards.length === 0
          ? <p>You have no boards yet.</p>
          : boards.map(board => (
            <div
              key={board.id}
              onClick={() => openBoard(board.id)}
              style={{
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: 16,
                width: 200,
                cursor: 'pointer'
              }}
            >
              <h2>{board.name}</h2>
              <p>{board.description}</p>
              <small>
                {board.columns.reduce((sum, c) => sum + c.cards.length, 0)}
                {' '}cards
              </small>
            </div>
        ))}
      </div>
    </div>
  );
}

