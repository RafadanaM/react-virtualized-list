import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface IParam {
  itemCount: number;
  getScrollElement: () => HTMLElement | null;
  itemSize: number;
  overscan?: number;
  gap?: number;
}

function estimateIndex(arr: number[], scrollTop: number, initialLeft = 0) {
  let l = initialLeft;
  let r = arr.length - 1;

  let idx = 0;
  while (l < r) {
    const m = Math.floor((l + r) / 2);

    if (l === m) {
      break;
    }

    const currHeight = arr[m];

    if (scrollTop < currHeight) {
      r = m;
    } else {
      l = m;
      idx = l;
    }
  }

  return idx;
}

function useVirtualizedList({
  itemCount,
  itemSize,
  gap = 0,
  overscan = 2,
  getScrollElement,
}: IParam) {
  const [startIndex, setStartIndex] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  const getScrollElementRef = useRef(getScrollElement);
  const rafId = useRef<number | null>(null);
  const elHeights = useRef<number[]>(
    Array.from(
      { length: itemCount },
      (_, i) => i * itemSize + (i === itemCount - 1 ? 0 : gap)
    )
  );

  const itemSizeWithGap = itemSize + gap;

  useEffect(() => {
    const scrollRefElement = getScrollElementRef.current();
    if (!scrollRefElement) return;
    setScrollElement(scrollRefElement);
    const handleScroll = () => {
      rafId.current = window.requestAnimationFrame(() => {
        const scrollTop = scrollRefElement.scrollTop;
        const currIndex = estimateIndex(elHeights.current, scrollTop);
        setStartIndex(currIndex);
      });
    };

    scrollRefElement.addEventListener("scroll", handleScroll);
    return () => {
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
      scrollRefElement.removeEventListener("scroll", handleScroll);
    };
  }, [itemSizeWithGap]);

  // last element does not have *gap*
  const getTotalSize = useCallback(
    () => elHeights.current[elHeights.current.length - 1],
    []
  );

  const measureElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    const idxString = element.getAttribute("data-index");
    if (!idxString) return;
    const idx = Number(idxString);

    // need to handle case when item count increases
    const height = element.getBoundingClientRect().height;
    elHeights.current[idx] =
      idx === 0 ? height : elHeights.current[idx - 1] + height;
  }, []);

  const getVirtualItems = useCallback(() => {
    const windowHeight = scrollElement?.getBoundingClientRect()?.height ?? 0;
    const scrollTop = scrollElement?.scrollTop ?? 0;
    const nextHeight = windowHeight + scrollTop;
    const paddedStartIndex = Math.max(0, startIndex - overscan);
    const endIndex = estimateIndex(elHeights.current, nextHeight, startIndex);
    const paddedEndIndex = Math.min(
      endIndex + overscan,
      Math.max(itemCount - 1, 0)
    );

    const x = Array.from(
      { length: paddedEndIndex - paddedStartIndex + 1 },
      (_, i) => ({
        size:
          elHeights.current[paddedStartIndex + i] -
          (paddedStartIndex === 0
            ? 0
            : elHeights.current[paddedStartIndex - 1]),
        key: paddedStartIndex + i,
        index: paddedStartIndex + i,
        start:
          paddedStartIndex + i === 0
            ? 0
            : elHeights.current[paddedStartIndex - 1 + i],
      })
    );
    return x;
  }, [itemCount, overscan, scrollElement, startIndex]);

  const memoedValue = useMemo(
    () => ({
      getTotalSize,
      getVirtualItems,
      measureElement,
    }),
    [getTotalSize, getVirtualItems, measureElement]
  );

  return memoedValue;
}

export default useVirtualizedList;
