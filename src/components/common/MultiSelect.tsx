import { Box, Chip, MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React from "react";

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  isDarkMode?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  isDarkMode = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Select
      multiple
      displayEmpty
      value={value}
      onChange={handleChange}
      renderValue={(selected) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {selected.length === 0 ? (
            <span style={{ color: isDarkMode ? "#888" : "#666" }}>{label}</span>
          ) : (
            selected.map((value) => (
              <Chip
                key={value}
                label={value}
                size="small"
                sx={{
                  backgroundColor: isDarkMode ? "#4a5568" : "#e2e8f0",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              />
            ))
          )}
        </Box>
      )}
      sx={{
        minWidth: 200,
        backgroundColor: isDarkMode ? "#2d3748" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        "& .MuiSelect-icon": {
          color: isDarkMode ? "#fff" : "#000",
        },
      }}
      MenuProps={{
        sx: {
          zIndex: 99999, // Higher than dialog
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option) => (
        <MenuItem
          key={option}
          value={option}
          sx={{
            backgroundColor: isDarkMode ? "#2d3748" : "#fff",
            "&:hover": {
              backgroundColor: isDarkMode ? "#4a5568" : "#f7fafc",
            },
          }}
        >
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};

export default MultiSelect;
