// React
import { createContext, ReactNode, useContext, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// Local
import { UserRole } from '../../../types/enums';
import { DragChip, DropZone } from '../styles';
import { VolunteerRow } from '../types';

const LONG_PRESS_MS = 250;
const DRAG_DISTANCE_PX = 8;

interface DragState {
  dragging: VolunteerRow | null;
  canMove: (volunteer: VolunteerRow, target: UserRole) => boolean;
}

const DragStateContext = createContext<DragState>({ dragging: null, canMove: () => false });

interface BoardProps {
  canMove: (volunteer: VolunteerRow, target: UserRole) => boolean;
  onMove: (volunteer: VolunteerRow, target: UserRole) => void;
  children: ReactNode;
}

export function RoleBoard({ canMove, onMove, children }: BoardProps) {
  const [dragging, setDragging] = useState<VolunteerRow | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }),
    useSensor(TouchSensor, { activationConstraint: { delay: LONG_PRESS_MS, tolerance: 5 } }),
  );

  const start = (event: DragStartEvent) => setDragging(event.active.data.current?.volunteer ?? null);

  const end = (event: DragEndEvent) => {
    const volunteer = event.active.data.current?.volunteer as VolunteerRow | undefined;
    const target = event.over?.id as UserRole | undefined;
    setDragging(null);
    if (volunteer && target && canMove(volunteer, target)) onMove(volunteer, target);
  };

  return (
    <DndContext sensors={sensors} onDragStart={start} onDragEnd={end} onDragCancel={() => setDragging(null)}>
      <DragStateContext.Provider value={{ dragging, canMove }}>{children}</DragStateContext.Provider>
      <DragOverlay>{dragging && <DragChip>{dragging.name}</DragChip>}</DragOverlay>
    </DndContext>
  );
}

export function RoleDropZone({ role, children }: { role: UserRole; children: ReactNode }) {
  const { dragging, canMove } = useContext(DragStateContext);
  const { setNodeRef, isOver } = useDroppable({ id: role });
  const accepts = !!dragging && canMove(dragging, role);

  return (
    <DropZone ref={setNodeRef} $active={!!dragging} $accepts={accepts} $over={isOver && accepts}>
      {children}
    </DropZone>
  );
}

interface DraggableProps {
  volunteer: VolunteerRow;
  enabled: boolean;
  children: (props: {
    ref: (node: HTMLElement | null) => void;
    dragProps: Record<string, unknown>;
    isDragging: boolean;
  }) => ReactNode;
}

export function DraggableVolunteer({ volunteer, enabled, children }: DraggableProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: volunteer.id,
    data: { volunteer },
    disabled: !enabled,
  });
  return <>{children({ ref: setNodeRef, dragProps: enabled ? { ...listeners, ...attributes } : {}, isDragging })}</>;
}
