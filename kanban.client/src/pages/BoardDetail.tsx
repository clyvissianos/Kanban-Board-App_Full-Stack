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

  // For “Add Card” forms (one form per column)
  const [showCardFormFor, setShowCardFormFor] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle]       = useState('');
  const [newCardDesc, setNewCardDesc]         = useState('');
  
  // For editing cards
  const [editingCardId, setEditingCardId]     = useState<number | null>(null);
  const [editCardTitle, setEditCardTitle]     = useState('');
  const [editCardDesc, setEditCardDesc]       = useState('');
  
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
  // inside your component:
const onDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const fromColId = parseInt(source.droppableId);
  const toColId   = parseInt(destination.droppableId);

  // no-op if nothing changed
  if (fromColId === toColId && source.index === destination.index) return;

  // 1) Clone your board state deeply
  const newColumns = board.columns.map(col => ({
    ...col,
    cards: [...col.cards]
  }));

  // 2) Remove the moved card from its source column
  const sourceCol = newColumns.find(c => c.id === fromColId)!;
  const [movedCard] = sourceCol.cards.splice(source.index, 1);

  // 3) Insert it into the destination column
  const destCol = newColumns.find(c => c.id === toColId)!;
  destCol.cards.splice(destination.index, 0, movedCard);

  // 4) Reindex orders in both affected columns
  const affectedCols = [sourceCol, destCol];
  affectedCols.forEach(col => {
    col.cards.forEach((card, idx) => {
      card.order = idx;
      // if it's the moved card, also update its columnId
      if (card.id === movedCard.id) {
        card.columnId = toColId;
      }
    });
  });

  // 5) Update React state immediately
  setBoard(b => b ? { ...b, columns: newColumns } : b);

  // 6) Persist changes: moved card (and optionally other re-ordered cards)
  try {
    // Update the moved card first
    await api.put(`/cards/${movedCard.id}`, {
      title:       movedCard.title,
      description: movedCard.description,
      order:       movedCard.order,
      columnId:    movedCard.columnId
    });

    // If you want to persist the re-indexed orders of *all* cards in the two columns,
    // you can batch those here. For simplicity, at least update the moved card.
  } catch (err) {
    console.error('Failed to persist drag-and-drop:', err);
  }
};

  // CREATE
  const handleCreateCard = async (e: React.FormEvent, columnId: number) => {
    e.preventDefault();
    const order = board.columns
      .find(c => c.id === columnId)!.cards.length;
  
    const dto = {
      title:       newCardTitle,
      description: newCardDesc,
      order,
      columnId
    };
  
    const { data: created } = await api.post<CardDto>('/cards', dto);
  
    setBoard(prev => prev && ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, created] }
          : col
      )
    }));
  
    setNewCardTitle('');
    setNewCardDesc('');
    setShowCardFormFor(null);
  };
  
  // DELETE
  const handleDeleteCard = async (card: CardDto) => {
    if (!confirm('Delete this card?')) return;
    await api.delete(`/cards/${card.id}`);
    setBoard(prev => prev && ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.filter(c => c.id !== card.id)
      }))
    }));
  };
  
  // START EDIT
  const startEditCard = (card: CardDto) => {
    setEditingCardId(card.id);
    setEditCardTitle(card.title);
    setEditCardDesc(card.description);
  };
  
  // CANCEL EDIT
  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardTitle('');
    setEditCardDesc('');
  };
  
  // SAVE UPDATE
  const handleUpdateCard = async (e: React.FormEvent, card: CardDto) => {
    e.preventDefault();
    const dto = {
      title:       editCardTitle,
      description: editCardDesc,
      order:       card.order,
      columnId:    card.columnId
    };
    await api.put<CardDto>(`/cards/${card.id}`, dto);
    setBoard(prev => prev && ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.map(c =>
          c.id === card.id
            ? { ...c, title: editCardTitle, description: editCardDesc }
            : c
        )
      }))
    }));
    cancelEditCard();
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
                        {editingCardId === card.id ? (
                            // Edit form
                            <form onSubmit={e => handleUpdateCard(e, card)}>
                              <input
                                value={editCardTitle}
                                onChange={e => setEditCardTitle(e.target.value)}
                                required
                                style={{ width: '100%' }}
                              />
                              <textarea
                                value={editCardDesc}
                                onChange={e => setEditCardDesc(e.target.value)}
                                rows={2}
                                style={{ width: '100%', marginTop: 4 }}
                              />
                              <button type="submit">Save</button>
                              <button type="button" onClick={cancelEditCard} style={{ marginLeft: 4 }}>
                                Cancel
                              </button>
                            </form>
                        ) : (
                          // Display card + actions
                          <>
                          <strong>{card.title}</strong>
                          <p>{card.description}</p>
                          <div style={{ textAlign: 'right' }}>
                             <button onClick={() => startEditCard(card)} style={{ marginRight: 4 }}>
                               ✏️
                             </button>
                             <button onClick={() => handleDeleteCard(card)}>
                               🗑️
                             </button>
                           </div>
                         </>
                         )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <div style={{ marginTop: 8 }}>
                  {showCardFormFor === col.id ? (
                    <form onSubmit={e => handleCreateCard(e, col.id)}>
                      <input
                        placeholder="Card title"
                        value={newCardTitle}
                        onChange={e => setNewCardTitle(e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                      <textarea
                        placeholder="Description"
                        value={newCardDesc}
                        onChange={e => setNewCardDesc(e.target.value)}
                        rows={2}
                        style={{ width: '100%', marginTop: 4 }}
                      />
                      <button type="submit">Add</button>
                      <button
                        type="button"
                        onClick={() => setShowCardFormFor(null)}
                        style={{ marginLeft: 4 }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button onClick={() => setShowCardFormFor(col.id)}>
                      + Add Card
                    </button>
                  )}
                 </div>
                </div>
              )}
            </Droppable>
          ))}          
        </div>
      </DragDropContext>
    </div>
  );
}
