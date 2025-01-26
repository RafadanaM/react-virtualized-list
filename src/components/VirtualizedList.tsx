import { useRef } from "react";
import useVirtualizedList from "../hooks/useVirtualizedList";
import ListItem from "./ListItem";

const ITEM_COUNT = 1000;
const MAX_HEIGHT = 144 * 4;

function VirtualizedList() {
  const ref = useRef(null);
  const virtualizer = useVirtualizedList({
    itemCount: ITEM_COUNT,
    itemSize: 288,
    getScrollElement: () => ref.current,
  });

  return (
    <div
      ref={ref}
      style={{
        height: MAX_HEIGHT,
      }}
      className="overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
        className="relative w-full"
      >
        {virtualizer.getVirtualItems().map((item) => (
          <div
            style={{
              transform: `translateY(${item.start}px)`,
            }}
            className="absolute top-0 left-0 w-full"
            key={item.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
          >
            <ListItem position={item.index} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;
