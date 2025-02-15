import { memo } from "react";

interface IListItem {
  position: number;
  changeHeight?: boolean;
}

function ListItem({ position, changeHeight = true }: IListItem) {
  return (
    <div
      className="p-4 border border-black h-full"
      style={{
        height: changeHeight ? (position % 2 ? 144 : 288) : 144,
        backgroundColor: position % 2 ? "red" : "blue",
      }}
    >
      <p className="font-semibold text-lg">{`Item Number: ${position}`}</p>
    </div>
  );
}

export default memo(ListItem);
