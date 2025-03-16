import { Input } from "antd";
import { ChevronDown, X } from "lucide-react";
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
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  placeholder = "Select an option...",
  onChange,
  value,
  isDarkMode = false,
  showClearButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={(_e) => setSearchTerm("")}
          placeholder={placeholder}
          readOnly={!isOpen}
          autoFocus={isOpen}
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
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
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
            ))
          ) : (
            <div className={styles.noOptions}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
