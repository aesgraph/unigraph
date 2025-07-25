export interface FormSchemaField {
  validate: (value: number | boolean | string) => string | null;
  label: string;
  type: "number" | "checkbox" | "select" | "color";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface FormSchema {
  [key: string]: FormSchemaField;
}

export interface FormFieldProps {
  name: string;
  value: number | boolean | string;
  error: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  schema: FormSchema;
  isDarkMode?: boolean;
}
