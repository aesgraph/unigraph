import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo } from "react";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface DemoRow {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface DemosListProps {
  demos: DemoRow[];
  onDemoDoubleClick?: (demoId: string) => void;
  style?: React.CSSProperties;
}

const DemosList: React.FC<DemosListProps> = ({
  demos,
  onDemoDoubleClick,
  style = {},
}) => {
  const colDefs = useMemo<ColDef<DemoRow>[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        flex: 1,
        filter: false,
      },
      {
        headerName: "Category",
        field: "category",
        flex: 1,
        filter: false,
      },
      {
        headerName: "Description",
        field: "description",
        flex: 2,
        filter: false,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      filter: false,
      sortable: true,
      resizable: true,
      minWidth: 120,
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        borderRadius: 10,
        ...style,
      }}
      className="demos-list-scrollbar"
    >
      <style>
        {`
        .demos-list-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f5f6fa;
        }
        .demos-list-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #f5f6fa;
        }
        .demos-list-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 6px;
        }
        .demos-list-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bfc7d1;
        }
        `}
      </style>
      <AgGridReact
        theme={themeBalham}
        rowData={demos}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        domLayout="normal"
        rowSelection="single"
        animateRows={true}
        suppressCellFocus={true}
        enableRangeSelection={true}
        suppressContextMenu={false}
        allowContextMenuWithControlKey={false}
        suppressMenuHide={false}
        getRowStyle={() => ({
          display: "flex",
          alignItems: "center",
        })}
        onRowDoubleClicked={(event) => {
          if (event.data && event.data.id && onDemoDoubleClick) {
            onDemoDoubleClick(event.data.id);
          }
        }}
        overlayNoRowsTemplate={`<span style="color:#888;">No demos found</span>`}
      />
    </div>
  );
};

export default DemosList;
