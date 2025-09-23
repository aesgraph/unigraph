import { Input } from "antd";
import { ChevronDown, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./SelectDropdown.module.css";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface SelectDropdownProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: Option | null) => void;
  value?: Option | null;
  isDarkMode?: boolean;
  showClearButton?: boolean;
  allowNewItems?: boolean; // New prop to enable adding new items
  defaultNewItemColor?: string; // Default color for new items
  showColorPicker?: boolean; // New prop to enable color picker
  onAddNewItem?: (item: Option) => void; // Optional callback when new item is added
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  placeholder = "Select an option...",
  onChange,
  value,
  isDarkMode = false,
  showClearButton = true,
  allowNewItems = false,
  defaultNewItemColor = "#4285f4",
  showColorPicker = false,
  onAddNewItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemColor, setNewItemColor] = useState(defaultNewItemColor);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term matches any existing option (for new item validation)
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === searchTerm.toLowerCase()
  );

  // Determine if we should show the "Add new item" option
  const shouldShowAddNew =
    allowNewItems &&
    searchTerm.trim() !== "" &&
    !exactMatch &&
    (!value || value.label.toLowerCase() !== searchTerm.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange?.(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.(null);
    setSearchTerm("");
  };

  const handleAddNewItem = () => {
    if (!searchTerm.trim()) return;

    // Create a new object rather than modifying existing ones
    const newOption: Option = {
      value: searchTerm.trim(),
      label: searchTerm.trim(),
      color: newItemColor,
    };

    // Pass the new object to the callback
    onChange?.(newOption);

    // Call the optional callback if provided
    if (onAddNewItem) {
      onAddNewItem({ ...newOption }); // Create a new copy for the callback
    }

    setSearchTerm("");
    setIsOpen(false);
    setNewItemColor(defaultNewItemColor);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemColor(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && shouldShowAddNew) {
      e.preventDefault();
      handleAddNewItem();
    }
  };

  return (
    <div
      className={`${styles.searchableDropdown} ${isDarkMode ? styles.dark : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.dropdownHeader} onClick={() => setIsOpen(!isOpen)}>
        <Input
          className={styles.selectdropdownSearchInput}
          value={isOpen ? searchTerm : value ? value.label : ""}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
            setSearchTerm("");
          }}
          placeholder={placeholder}
          readOnly={!isOpen}
          autoFocus={isOpen}
          onKeyDown={handleKeyDown}
        />
        {value?.color && (
          <div
            className={styles.colorIndicator}
            style={{ backgroundColor: value.color }}
          />
        )}
        <div className={styles.dropdownIcons}>
          {showClearButton && value && !isOpen && (
            <X
              className={`${styles.icon} ${styles.clearIcon}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <ChevronDown
            className={`${styles.icon} ${isOpen ? styles.rotate : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdownList}>
          {filteredOptions.length > 0 || shouldShowAddNew ? (
            <>
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(option)}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{option.label}</span>
                  {option.color && (
                    <div
                      style={{
                        backgroundColor: option.color,
                        width: "2rem",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </div>
              ))}

              {shouldShowAddNew && (
                <div className={`${styles.dropdownItem} ${styles.addNewItem}`}>
                  <div className={styles.addNewItemRow}>
                    <div
                      className={styles.addNewItemContent}
                      onClick={handleAddNewItem}
                    >
                      <Plus size={14} className={styles.addIcon} />
                      <span>Add: {searchTerm}</span>
                    </div>
                    {showColorPicker && (
                      <input
                        type="color"
                        value={newItemColor}
                        onChange={handleColorChange}
                        className={styles.colorPicker}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noOptions}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
