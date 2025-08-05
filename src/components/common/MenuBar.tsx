import React, { useState } from "react";
import { AppBar, Toolbar, Menu, MenuItem, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import "./MenuBar.css";

const useStyles = makeStyles({
  menuButton: {
    marginRight: "20px",
  },
  title: {
    flexGrow: 1,
  },
});

interface MenuConfig {
  [menu: string]: {
    [action: string]: () => void;
  };
}

interface MenuBarProps {
  config: MenuConfig;
}

const defaultConfig: MenuConfig = {
  // File: {
  //   New: () => console.log("New clicked"),
  //   Open: () => console.log("Open clicked"),
  //   Save: () => console.log("Save clicked"),
  // },
  // Edit: {
  //   Undo: () => console.log("Undo clicked"),
  //   Redo: () => console.log("Redo clicked"),
  // },
  // View: {
  //   "Zoom In": () => console.log("Zoom In clicked"),
  //   "Zoom Out": () => console.log("Zoom Out clicked"),
  //   "Reset View": () => console.log("Reset View clicked"),
  // },
};

const MenuBar: React.FC<MenuBarProps> = ({ config = defaultConfig }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    menu: string
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(menu);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  return (
    <AppBar
      position="static"
      style={{
        color: "black",
        background: "white",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        {Object.keys(config).map((menu) => (
          <div key={menu}>
            <Button
              className={classes.menuButton}
              color="inherit"
              onClick={(event) => handleMenuClick(event, menu)}
            >
              {menu}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={activeMenu === menu}
              onClose={handleClose}
            >
              {Object.keys(config[menu]).map((action) => (
                <MenuItem
                  key={action}
                  onClick={() => {
                    config[menu][action]();
                    handleClose();
                  }}
                >
                  {action}
                </MenuItem>
              ))}
            </Menu>
          </div>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default MenuBar;
export { defaultConfig };
export type { MenuConfig };
