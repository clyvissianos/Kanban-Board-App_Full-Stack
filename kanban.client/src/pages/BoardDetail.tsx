import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api                                 from '../api/axios';
import type { BoardDto }                        from '../dtos/BoardDto';
import type { ColumnDto }                       from '../dtos/ColumnDto';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardDto | null>(null);

  // inside BoardDetail()
  const [showColForm, setShowColForm] = useState(false);
  const [newColName, setNewColName]   = useState('');
  const [newColOrder, setNewColOrder] = useState(0);

  // For editing
  const [editingColId, setEditingColId] = useState<number | null>(null);
  const [editColName, setEditColName]   = useState('');
  const [editColOrder, setEditColOrder] = useState(0);

  // 1️⃣ Fetch board on mount
  useEffect(() => {
    if (!id) return navigate('/');
    api.get<BoardDto>(`/boards/${id}`)
       .then(res => setBoard(res.data))
       .catch(err => {
         console.error(err);
         if (err.response?.status === 404) navigate('/');
       });
  }, [id]);

  if (!board) return <div>Loading...</div>;

  // 2️⃣ Handle drag end
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // If dropped in the same spot, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find source & dest columns
    const srcCol = board.columns.find(c => c.id.toString() === source.droppableId)!;
    const dstCol = board.columns.find(c => c.id.toString() === destination.droppableId)!;

    // Remove card from src
    const [moved] = srcCol.cards.splice(source.index, 1);
    // Insert into dest
    dstCol.cards.splice(destination.index, 0, moved);

    // Update local state to rerender
    setBoard({ ...board });

    // Persist: update only the moved card’s columnId + order
    await api.put(`/cards/${moved.id}`, {
      title:       moved.title,
      description: moved.description,
      order:       destination.index,
      columnId:    dstCol.id
    });
  };

  // CREATE
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { name: newColName, order: newColOrder, boardId: board.id };
    const { data: created } = await api.post<ColumnDto>('/columns', dto);
    setBoard(prev => prev && ({
    ...prev,
    columns: [...prev.columns, created]
    }));
    setNewColName('');
    setNewColOrder(board.columns.length);
    setShowColForm(false);
  };

  // DELETE
  const handleDeleteColumn = async (colId: number) => {
    if (!confirm('Delete this column?')) return;
    await api.delete(`/columns/${colId}`);
    setBoard(prev => prev && ({
    ...prev,
    columns: prev.columns.filter(c => c.id !== colId)
    }));
  };

  // START EDIT
  const startEditColumn = (col: ColumnDto) => {
    setEditingColId(col.id);
    setEditColName(col.name);
    setEditColOrder(col.order);
  };

  // CANCEL EDIT
  const cancelEditColumn = () => {
    setEditingColId(null);
    setEditColName('');
    setEditColOrder(0);
  };

  // SAVE UPDATE
  const handleUpdateColumn = async (e: React.FormEvent, colId: number) => {
    e.preventDefault();
    const dto = { name: editColName, order: editColOrder };
    await api.put<ColumnDto>(`/columns/${colId}`, dto);
    setBoard(prev => prev && ({
    ...prev,
    columns: prev.columns.map(c =>
        c.id === colId ? { ...c, name: editColName, order: editColOrder } : c
    )
    }));
    cancelEditColumn();
  };


  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← Back to Boards</Link>
      <h1>{board.name}</h1>
      <p>{board.description}</p>

      <button onClick={() => setShowColForm(!showColForm)}>
        {showColForm ? 'Cancel New Column' : 'Add Column'}
      </button>

      {showColForm && (
        <form onSubmit={handleCreateColumn} style={{ margin: '8px 0' }}>
          <input
            placeholder="Column Name"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Order"
            value={newColOrder}
            onChange={e => setNewColOrder(parseInt(e.target.value, 10))}
            required
            style={{ width: 60, marginLeft: 8 }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>Create</button>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {board.columns.map((col: ColumnDto) => (
            <Droppable droppableId={col.id.toString()} key={col.id}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: '#f0f0f0',
                    padding: '1rem',
                    borderRadius: 4,
                    width: 250,
                    minHeight: 200
                  }}
                >
                  {editingColId === col.id ? (
                  <form onSubmit={e => handleUpdateColumn(e, col.id)}>
                    <input
                      value={editColName}
                      onChange={e => setEditColName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      value={editColOrder}
                      onChange={e => setEditColOrder(parseInt(e.target.value, 10))}
                      required
                      style={{ width: 50, marginLeft: 4 }}
                    />
                    <button type="submit" style={{ marginLeft: 4 }}>Save</button>
                    <button type="button" onClick={cancelEditColumn} style={{ marginLeft: 4 }}>Cancel</button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{col.name}</h3>
                    <div>
                      <button onClick={() => startEditColumn(col)} style={{ marginRight: 4 }}>✏️</button>
                      <button onClick={() => handleDeleteColumn(col.id)}>🗑️</button>
                    </div>
                  </div>
                )}
                  {col.cards.map((card, idx) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id.toString()}
                      index={idx}
                    >
                      {dragProvided => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={{
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            background: 'white',
                            borderRadius: 4,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            ...dragProvided.draggableProps.style
                          }}
                        >
                          <strong>{card.title}</strong>
                          <p>{card.description}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
