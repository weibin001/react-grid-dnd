import * as React from 'react';
import { createNamedContext } from './utils';
import { reducer, getInitialState, Actions, Action } from './store';
import { usePersistFn, useViewRect } from './hooks';
import type { State, SensorConfig, SensorEvent } from './hooks';
import {
  UniqueId,
  DraggableNode,
  LayoutRect,
  ViewRect,
  DroppableContainer,
  Transform,
  // Announcements,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(...args: any[]) {}

export const ActiveDraggable = createNamedContext<Transform>('ActiveDraggable', {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
});

export const useActiveDraggable = () => {
  const context = React.useContext(ActiveDraggable);

  return context;
};

interface IDndContext {
  dispatch: React.Dispatch<Actions>;
  draggableId: UniqueId | null;
  draggableNode: DraggableNode | null;
  draggableNodeRect: ViewRect | null;
  draggableNodes: Record<UniqueId, DraggableNode>;
  droppableContainers: Map<UniqueId, DroppableContainer>;
  droppableRects: Map<UniqueId, LayoutRect>;
  over: DroppableContainer | null;
  dragOverlay: {
    ref: React.MutableRefObject<HTMLElement | null>;
    rect: ViewRect | null;
  };
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
  recomputeLayouts: () => void;
  willRecomputeLayouts: boolean;
  sensorConfig?: SensorConfig;
  handleDragCancel: (state: State) => void;
  handleDragEnd: (state: State, event: Event) => void;
  handleDragUpdate: (state: State, event: Event) => void;
  handleDragStart: (id: UniqueId, state: State, event: SensorEvent) => void;
  // listeners: ReturnType<typeof useGestureResponser> | null;
}

export const Context = createNamedContext<IDndContext>('DndContext', {
  dispatch: noop,
  draggableId: null,
  draggableNode: null,
  draggableNodeRect: null,
  draggableNodes: {},
  droppableContainers: new Map(),
  droppableRects: new Map(),
  over: null,
  dragOverlay: {
    ref: { current: null },
    rect: null,
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  willRecomputeLayouts: false,
  sensorConfig: {},
  handleDragCancel: noop,
  handleDragEnd: noop,
  handleDragUpdate: noop,
  handleDragStart: noop,
  // listeners: null,
});

export const useDndContext = () => {
  const context = React.useContext(Context);

  if (!context) {
    throw Error('Unable to find Dnd context. Please ensure that is used as a child of DndContext');
  }

  return context;
};

interface Props {
  id?: string;
  autoScroll?: boolean;
  sensorConfig?: SensorConfig;
  onDragStart?: (state: State, event: SensorEvent) => void;
  onDragUpdate?: (state: State, event: Event) => void;
  onDragOver?: () => void;
  onDragEnd?: (state: State, event: Event) => void;
  onDragCancel?: (state: State) => void;
}

export const DndContext: React.FC<Props> = React.memo(function DndContext({
  onDragStart = noop,
  onDragUpdate = noop,
  // onDragOver = noop,
  onDragEnd = noop,
  onDragCancel = noop,
  sensorConfig,
  children,
}) {
  const [store, dispatch] = React.useReducer(reducer, undefined, getInitialState);
  const { draggable, droppable } = store;
  const { id: draggableId, nodes: draggableNodes } = draggable;
  const draggableNode = draggableId ? draggableNodes[draggableId] : null;
  const draggableElement = draggableNode ? draggableNode?.node?.current : null;
  const draggableNodeRect = useViewRect(draggableElement);
  const { containers: droppableContainers } = droppable;

  const collisionRect = React.useRef<any | null>(null);

  const overId = draggableId && collisionRect.current ? '10' : null;
  const over = overId ? droppableContainers.get(overId) ?? null : null;
  const overlay = React.useRef<HTMLElement | null>(null);

  const handleDragStart = usePersistFn((id: UniqueId, state: State, event: SensorEvent) => {
    if (!id) return;

    dispatch({
      type: Action.DragStart,
      id,
      initialCoordinates: state.initial,
    });
    onDragStart(state, event);
  });

  const handleDragUpdate = usePersistFn((state: State, event: Event) => {
    dispatch({
      type: Action.DragMove,
      coordinates: state.coordinates,
    });

    onDragUpdate(state, event);
  });

  const handleDragEnd = usePersistFn((state: State, event: Event) => {
    dispatch({
      type: Action.DragEnd,
    });

    onDragEnd(state, event);
  });

  const handleDragCancel = usePersistFn((state: State) => {
    dispatch({
      type: Action.DragCancel,
    });

    onDragCancel(state);
  });

  const transform = {
    ...draggable.translate,
    scaleX: 1.06,
    scaleY: 1.06,
  };

  const memoContext = React.useMemo(
    () => ({
      dispatch,
      draggableId,
      draggableNode,
      draggableNodeRect,
      draggableNodes,
      droppableContainers,
      droppableRects: new Map(),
      over,
      dragOverlay: {
        ref: overlay,
        rect: null,
      },
      scrollableAncestors: [],
      scrollableAncestorRects: [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      recomputeLayouts: () => {},
      willRecomputeLayouts: false,
      // listeners,
      handleDragStart,
      handleDragUpdate,
      handleDragEnd,
      handleDragCancel,
      sensorConfig,
    }),
    [
      draggableId,
      draggableNode,
      draggableNodeRect,
      draggableNodes,
      droppableContainers,
      handleDragCancel,
      handleDragEnd,
      handleDragStart,
      handleDragUpdate,
      over,
      sensorConfig,
    ],
  );

  return (
    <Context.Provider value={memoContext}>
      <ActiveDraggable.Provider value={transform}>{children}</ActiveDraggable.Provider>
    </Context.Provider>
  );
});
