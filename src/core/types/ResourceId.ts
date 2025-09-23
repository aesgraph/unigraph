export interface ResourceId {
  id: string;
  type: string;
  label?: string;
  description?: string;
  [key: string]: any;
}

export interface WebUrlResourceId extends ResourceId {
  type: "web-url";
  url: string;
}
