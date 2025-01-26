import { useCallback } from "react";
import RecyclerList from "./RecyclerList";
import ListItem from "./ListItem";

const ITEM_COUNT = 1000;
const ITEM_SIZE = 144;
const MOCK_DATA = Array.from({ length: ITEM_COUNT }, (_, i) => i);
function RecyclerListExample() {
  const renderItem = useCallback(<T,>(item: T, idx: number) => {
    return <ListItem position={idx} changeHeight={false} />;
  }, []);

  return (
    <RecyclerList
      itemSize={ITEM_SIZE}
      data={MOCK_DATA}
      renderItem={renderItem}
    />
  );
}

export default RecyclerListExample;
