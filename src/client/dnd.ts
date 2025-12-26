import * as PIXI from "pixi.js";

type GlobalDrag = {
  isClicked: boolean;
  isDragging: boolean;
  current: {
    type?: string;
    data?: any;
  };
};

export const globalDrag: GlobalDrag = {
  isClicked: false,
  isDragging: false,
  current: {},
};

const lastParent = (container: PIXI.Container): PIXI.Container => {
  if (container.parent) {
    return lastParent(container.parent);
  }

  return container;
};

export const draggable = (type: string, target: PIXI.Container) => {
  target.interactive = true;

  const onDragMove = (event: PIXI.FederatedPointerEvent) => {
    if (globalDrag.isClicked && !globalDrag.isDragging) {
      return onDragStart(event);
    }
  };

  const onDragStart = (_event: PIXI.FederatedPointerEvent) => {
    const container = lastParent(target);
    console.log("drag started", container);

    globalDrag.isDragging = true;
  };

  const onDragEnd = () => {
    globalDrag.isClicked = false;
    globalDrag.isDragging = false;
    target.off("mousemove", onDragMove);
    target.off("touchmove", onDragMove);
  };

  const onClick = () => {
    globalDrag.isClicked = true;
    target.on("mousemove", onDragMove);
    target.on("touchmove", onDragMove);
  };

  target.on("mousedown", onClick);
  target.on("touchstart", onClick);
  target.on("mouseup", onDragEnd);
  target.on("mouseupoutside", onDragEnd);
  target.on("touchend", onDragEnd);
  target.on("touchendoutside", onDragEnd);
};

export const droppable = (accept: string[], target: PIXI.Container) => {
  target.interactive = true;

  const onDrop = (event: any) => {
    console.log(event);
  };

  target.on("mouseup", onDrop);
  target.on("touchend", onDrop);
};
