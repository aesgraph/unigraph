/* eslint-disable react-hooks/exhaustive-deps */
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useCallback, useState } from "react";

interface MenuItemData {
  color: string;
  items?: Record<string, MenuItemData>;
}

interface MenuStructure {
  [key: string]: MenuItemData;
}

interface MenuItemProps {
  label: string;
  data: MenuItemData;
  level?: number;
  selected: string[][];
  onToggle: (path: string[]) => void;
  path?: string[];
}

interface HierarchicalMenuProps {
  data?: MenuStructure;
}

const sampleData: MenuStructure = {
  Fruits: {
    color: "#FF6B6B",
    items: {
      Tropical: {
        color: "#FFA07A",
        items: {
          Mango: { color: "#FFD700" },
          Pineapple: { color: "#FFFF00" },
          Papaya: { color: "#FFA500" },
        },
      },
      Berries: {
        color: "#FF69B4",
        items: {
          Strawberry: { color: "#FF0000" },
          Blueberry: { color: "#0000FF" },
          Raspberry: { color: "#FF1493" },
        },
      },
    },
  },
  Vegetables: {
    color: "#90EE90",
    items: {
      Leafy: {
        color: "#32CD32",
        items: {
          Spinach: { color: "#006400" },
          Kale: { color: "#228B22" },
          Lettuce: { color: "#98FB98" },
        },
      },
      Root: {
        color: "#CD853F",
        items: {
          Carrot: { color: "#FFA500" },
          Potato: { color: "#DEB887" },
          Radish: { color: "#FF69B4" },
        },
      },
    },
  },
};

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  data,
  level = 0,
  selected,
  onToggle,
  path = [],
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hasChildren: boolean =
    !!data.items && Object.keys(data.items).length > 0;
  const currentPath: string[] = [...path, label];

  const handleToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      e.stopPropagation();
      onToggle(currentPath);
    },
    [currentPath, onToggle]
  );

  const isSelected: boolean = selected.some(
    (sel) =>
      sel.length >= currentPath.length &&
      currentPath.every((item, index) => sel[index] === item)
  );

  const isPartiallySelected: boolean =
    hasChildren &&
    selected.some(
      (sel) =>
        sel.length > currentPath.length &&
        currentPath.every((item, index) => sel[index] === item)
    );

  const handleClick = useCallback((): void => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  }, [hasChildren, isOpen]);

  return (
    <div className="select-none">
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
        style={{ marginLeft: `${level * 20}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <span className="w-4">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          ) : (
            <span className="w-4" />
          )}

          <input
            type="checkbox"
            checked={isSelected}
            className="rounded border-gray-300"
            onChange={handleToggle}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            ref={(input: HTMLInputElement | null) => {
              if (input) {
                input.indeterminate = !isSelected && isPartiallySelected;
              }
            }}
          />

          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: data.color }}
          />

          <span>{label}</span>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div>
          {Object.entries(data.items!).map(([childLabel, childData]) => (
            <MenuItem
              key={childLabel}
              label={childLabel}
              data={childData}
              level={level + 1}
              selected={selected}
              onToggle={onToggle}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchicalMenu: React.FC<HierarchicalMenuProps> = ({
  data = sampleData,
}) => {
  const [selected, setSelected] = useState<string[][]>([]);

  const toggleSelection = useCallback(
    (path: string[]): void => {
      const isSelected: boolean = selected.some(
        (sel) =>
          sel.length === path.length &&
          path.every((item, index) => sel[index] === item)
      );

      if (isSelected) {
        // Remove this path and all its children
        setSelected(
          selected.filter(
            (sel) => !sel.every((item, index) => path[index] === item)
          )
        );
      } else {
        // Add this path and remove any existing children
        const newSelected: string[][] = selected.filter(
          (sel) =>
            !sel.every((item, index) => path[index] === item) &&
            !path.every((item, index) => sel[index] === item)
        );

        // Add all leaf nodes under this path
        const addLeafPaths = (
          obj: MenuItemData,
          currentPath: string[]
        ): void => {
          if (!obj.items || Object.keys(obj.items).length === 0) {
            newSelected.push(currentPath);
          } else {
            Object.entries(obj.items).forEach(([label, data]) => {
              addLeafPaths(data, [...currentPath, label]);
            });
          }
        };

        let currentObj: MenuItemData | undefined = { color: "", items: data };
        for (const item of path) {
          currentObj = currentObj?.items?.[item];
          if (!currentObj) break;
        }

        if (currentObj) {
          addLeafPaths(
            {
              color: currentObj.color,
              items: { [path[path.length - 1]]: currentObj },
            },
            path.slice(0, -1)
          );
        }

        setSelected(newSelected);
      }
    },
    [selected, data]
  );

  return (
    <div className="w-64 border rounded shadow-sm bg-white">
      {Object.entries(data).map(([label, itemData]) => (
        <MenuItem
          key={label}
          label={label}
          data={itemData}
          selected={selected}
          onToggle={toggleSelection}
        />
      ))}
    </div>
  );
};

export default HierarchicalMenu;
