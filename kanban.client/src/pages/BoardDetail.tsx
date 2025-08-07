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

  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← Back to Boards</Link>
      <h1>{board.name}</h1>
      <p>{board.description}</p>

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
                  <h3>{col.name}</h3>
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
