import { ChevronDown, X } from "lucide-react";
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
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  placeholder = "Select options...",
  onChange,
  values = [],
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.find((v) => v.value === option.value)
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
    onChange?.([...values, option]);
    setSearchTerm("");
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
          onClick={(_e) => setSearchTerm("")}
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
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
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
            ))
          ) : (
            <div className={styles.noOptions}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
