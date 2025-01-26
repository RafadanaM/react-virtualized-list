import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface IParam {
  itemCount: number;
  itemSize: number;
  overscan?: number;
  gap?: number;
  getScrollElement: () => HTMLElement | null;
}

/**
 * Find the index of item based on current scroll position
 */
function estimateIndex(
  arr: number[],
  scrollTop: number,
  initialLeft = 0
): number {
  let l = initialLeft;
  let r = arr.length - 1;

  let idx = l;
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
  const calcRef = useRef<number | null>(null);
  const cumulativeHeights = useRef<number[]>(
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
    let rafId: number | null = null;

    const handleScroll = () => {
      rafId = window.requestAnimationFrame(() => {
        setStartIndex(
          estimateIndex(cumulativeHeights.current, scrollRefElement.scrollTop)
        );
      });
    };

    scrollRefElement.addEventListener("scroll", handleScroll);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      scrollRefElement.removeEventListener("scroll", handleScroll);
    };
  }, [itemSizeWithGap]);

  const getTotalSize = useCallback(
    () => cumulativeHeights.current[cumulativeHeights.current.length - 1],
    []
  );

  const measureElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    const idxString = element.getAttribute("data-index");
    if (!idxString) return;

    const elIdx = Number(idxString);
    // need to handle case when item count increases
    const savedCumulativeHeight = cumulativeHeights.current[elIdx];
    const itemHeight = element.getBoundingClientRect().height;

    const updatedCumulativeHeight =
      elIdx === 0
        ? itemHeight
        : cumulativeHeights.current[elIdx - 1] + itemHeight;
    cumulativeHeights.current[elIdx] = updatedCumulativeHeight;

    // updates cumulative height from index of element to end, not sure if this is the best approach :thinkge:
    if (updatedCumulativeHeight !== savedCumulativeHeight && elIdx !== 0) {
      if (calcRef.current) {
        window.cancelAnimationFrame(calcRef.current);
      }
      calcRef.current = window.requestAnimationFrame(() => {
        for (let i = elIdx + 1; i < cumulativeHeights.current.length; i++) {
          cumulativeHeights.current[i] =
            cumulativeHeights.current[i] +
            (updatedCumulativeHeight - savedCumulativeHeight);
        }
      });
    }
  }, []);

  const getVirtualItems = useCallback(() => {
    const windowHeight = scrollElement?.getBoundingClientRect()?.height ?? 0;
    const scrollTop = scrollElement?.scrollTop ?? 0;
    const paddedStartIndex = Math.max(0, startIndex - overscan);
    const endIndex = estimateIndex(
      cumulativeHeights.current,
      windowHeight + scrollTop,
      startIndex
    );
    const paddedEndIndex = Math.min(
      endIndex + overscan,
      Math.max(itemCount - 1, 0)
    );

    const result = Array.from(
      { length: paddedEndIndex - paddedStartIndex + 1 },
      (_, i) => {
        const realIdx = paddedStartIndex + i;

        return {
          size:
            cumulativeHeights.current[realIdx] -
            (paddedStartIndex === 0
              ? 0
              : cumulativeHeights.current[paddedStartIndex - 1]),
          key: realIdx,
          index: realIdx,
          start:
            realIdx === 0
              ? 0
              : cumulativeHeights.current[paddedStartIndex - 1 + i],
        };
      }
    );
    return result;
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
