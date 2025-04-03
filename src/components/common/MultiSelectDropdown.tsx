import { ChevronDown, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getTextColorBasedOnBackground } from "../../utils/colorUtils";
import styles from "./MultiSelectDropdown.module.css";

interface Option {
  value: string;
  label: string;
  color: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  placeholder?: string;
  onChange?: (values: Option[]) => void;
  values?: Option[];
  isDarkMode?: boolean;
  allowNewItems?: boolean; // New prop to enable adding new items
  defaultNewItemColor?: string; // Default color for new items
  onAddNewItem?: (item: Option) => void; // Optional callback when new item is added
  showColorPicker?: boolean; // New prop to enable color picker
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  placeholder = "Select options...",
  onChange,
  values = [],
  isDarkMode = false,
  allowNewItems = false, // Default to false to maintain backward compatibility
  defaultNewItemColor = "#4285f4", // Default blue color
  onAddNewItem,
  showColorPicker = false, // Default to false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemColor, setNewItemColor] = useState("#4285f4"); // Default color
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.find((v) => v.value === option.value)
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
    !values.some((v) => v.label.toLowerCase() === searchTerm.toLowerCase());

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
    onChange?.([...values, option]);
    setSearchTerm("");
  };

  const handleAddNewItem = () => {
    if (!searchTerm.trim()) return;

    const newOption: Option = {
      value: searchTerm.trim(), // Generate a unique value
      label: searchTerm.trim(),
      color: newItemColor,
    };

    // Create a new array instead of mutating the existing one
    const updatedValues = [...values, newOption];
    onChange?.(updatedValues);

    // Call the optional callback if provided
    if (onAddNewItem) {
      onAddNewItem(newOption);
    }

    setSearchTerm("");
    setNewItemColor(defaultNewItemColor); // Reset color to default
  };

  const handleRemove = (optionToRemove: Option) => {
    onChange?.(
      values.filter((option) => option.value !== optionToRemove.value)
    );
  };

  const handleClear = () => {
    onChange?.([]);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && shouldShowAddNew) {
      e.preventDefault();
      handleAddNewItem();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemColor(e.target.value);
  };

  return (
    <div
      className={`${styles.multiSelectDropdown} ${isDarkMode ? styles.dark : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.selectedOptions}>
        {values.map((value) => (
          <div
            key={value.value}
            className={styles.selectedOption}
            style={{
              backgroundColor: value.color,
              color: getTextColorBasedOnBackground(value.color),
            }}
          >
            {value.label}
            <X
              className={styles.removeOption}
              style={{ color: getTextColorBasedOnBackground(value.color) }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(value);
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.dropdownHeader} onClick={() => setIsOpen(!isOpen)}>
        <input
          className={styles.multiselectSearchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ""}
          readOnly={!isOpen}
          autoFocus={isOpen}
        />
        <div className={styles.dropdownIcons}>
          {values.length > 0 && !isOpen && (
            <X
              className={`${styles.icon} ${styles.clearIcon}`}
              onClick={(e) => {
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
                  {option.label}
                  <div
                    style={{
                      backgroundColor: option.color,
                      color: getTextColorBasedOnBackground(option.color),
                      width: "2rem",
                      paddingRight: "0.5rem",
                    }}
                  ></div>
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

export default MultiSelectDropdown;
