declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.xml" {
  const content: string;
  export default content;
}

declare module "d3-force-3d";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png";

// Lucide React type declarations
declare module "lucide-react" {
  import { ComponentType, SVGProps } from "react";

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = ComponentType<LucideProps>;

  // Export all the icons as LucideIcon type
  export const AlertTriangle: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const BookOpen: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronsLeft: LucideIcon;
  export const ChevronsRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Clock: LucideIcon;
  export const Cloud: LucideIcon;
  export const Edit: LucideIcon;
  export const FileEdit: LucideIcon;
  export const FilePlus: LucideIcon;
  export const FilterX: LucideIcon;
  export const FolderPlus: LucideIcon;
  export const Globe: LucideIcon;
  export const LogOut: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MinusSquare: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Plus: LucideIcon;
  export const PlusSquare: LucideIcon;
  export const Scan: LucideIcon;
  export const Share2: LucideIcon;
  export const Table: LucideIcon;
  export const Table2: LucideIcon;
  export const Trash: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const X: LucideIcon;
  export const Settings2: LucideIcon;
  export const Send: LucideIcon;
  export const Save: LucideIcon;
  export const Edit2: LucideIcon;
  export const Tag: LucideIcon;
  export const FileJson: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Workflow: LucideIcon;
  export const Bold: LucideIcon;
  export const Italic: LucideIcon;
  export const Underline: LucideIcon;
  export const Strikethrough: LucideIcon;
  export const AlignLeft: LucideIcon;
  export const AlignCenter: LucideIcon;
  export const AlignRight: LucideIcon;
  export const AlignJustify: LucideIcon;
  export const List: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const Quote: LucideIcon;
  export const Code: LucideIcon;
  export const Code2: LucideIcon;
  export const Link: LucideIcon;
  export const Image: LucideIcon;
  export const Undo: LucideIcon;
  export const Redo: LucideIcon;
  export const Type: LucideIcon;
  export const Heading1: LucideIcon;
  export const Heading2: LucideIcon;
  export const Heading3: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Menu: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const SortAsc: LucideIcon;
  export const SortDesc: LucideIcon;
  export const Grid: LucideIcon;
  export const BarChart3: LucideIcon;
  export const PieChart: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Activity: LucideIcon;
  export const Cpu: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Wifi: LucideIcon;
  export const Database: LucideIcon;
  export const Server: LucideIcon;
  export const Monitor: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Tablet: LucideIcon;
  export const Laptop: LucideIcon;
  export const Desktop: LucideIcon;
  export const Info: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpLeft: LucideIcon;
  export const Edit3: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const Home: LucideIcon;
  export const File: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderClosed: LucideIcon;
  export const FileText: LucideIcon;
  export const FileImage: LucideIcon;
  export const FileVideo: LucideIcon;
  export const FileAudio: LucideIcon;
  export const FilePdf: LucideIcon;
  export const FileCode: LucideIcon;
  export const FileArchive: LucideIcon;
  export const FileSpreadsheet: LucideIcon;
  export const FileDocument: LucideIcon;
  export const FilePresentation: LucideIcon;
  export const FileUnknown: LucideIcon;
  export const Download: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Layout: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Maximize2: LucideIcon;
  export const Minimize2: LucideIcon;
  export const Settings: LucideIcon;
  export const Check: LucideIcon;
  export const Copy: LucideIcon;
  export const Play: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Square: LucideIcon;
  export const MapPin: LucideIcon;
  export const Zap: LucideIcon;

  // Add any other icons as needed - this covers the main ones used in the codebase
}

// PDF.js type declarations
declare module "pdfjs-dist" {
  export function getDocument(params: any): any;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module "pdfjs-dist/types/src/display/api" {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): PDFPageViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): any;
    getTextContent(): Promise<any>;
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
  }

  export interface TextItem {
    str: string;
    transform: number[];
  }
}
