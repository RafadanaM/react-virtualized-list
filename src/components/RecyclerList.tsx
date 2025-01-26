import {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

const MAX_HEIGHT = 144 * 4;

interface IRecyclerListProps<T> {
  itemSize: number;
  data: T[];
  renderItem: (item: T, idx: number) => ReactNode;
}

function RecyclerList<T>({
  data,
  itemSize,
  renderItem,
}: IRecyclerListProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const currStartIdxRef = useRef<number>(0);
  const totalHeight = data.length * itemSize;
  const maxElementCount = Math.floor(MAX_HEIGHT / itemSize);

  const items = useMemo(
    () => data.slice(0, maxElementCount),
    [data, maxElementCount]
  );

  const storeItem = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    itemsRef.current.push(node);
  }, []);

  useEffect(() => {
    const scrollEl = parentRef.current;
    if (!scrollEl) return;
    const handleScroll = () => {
      const children = itemsRef.current;
      if (!children) return;
      const scrollTop = scrollEl.scrollTop;
      const newStartIdx = Math.floor(scrollTop / itemSize);
      const currStartIdx = currStartIdxRef.current;

      if (newStartIdx === currStartIdx) return;

      if (newStartIdx > currStartIdx) {
        console.log({ currStartIdx, newStartIdx });
        const idx = newStartIdx % maxElementCount;
        const endIdx = newStartIdx + (maxElementCount - 1);
        const element = children[idx];
        element.style.transform = `translateY(${itemSize * endIdx}px)`;
      }
      currStartIdxRef.current = newStartIdx;
    };
    scrollEl.addEventListener("scroll", handleScroll);

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
    };
  }, [maxElementCount, itemSize]);

  return (
    <div
      ref={parentRef}
      style={{
        height: MAX_HEIGHT,
      }}
      className="overflow-auto"
    >
      <div className="relative" style={{ height: totalHeight }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            ref={storeItem}
            style={{
              height: itemSize,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${idx * itemSize}px)`,
            }}
          >
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(RecyclerList);
