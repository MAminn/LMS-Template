import type { BaseEntity } from "@/shared/types/global";

/**
 * Branding settings entity interface
 */
export interface BrandingSetting extends BaseEntity {
  readonly logoUrl?: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly siteName: string;
  readonly siteDescription: string;
  readonly fontFamily: string;
  readonly faviconUrl?: string;
  readonly isActive: boolean;
  readonly createdBy?: string;
}

/**
 * Branding creation data
 */
export interface CreateBrandingData {
  readonly logoUrl?: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly siteName: string;
  readonly siteDescription: string;
  readonly fontFamily: string;
  readonly faviconUrl?: string;
  readonly createdBy: string;
}

/**
 * Branding update data
 */
export interface UpdateBrandingData {
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly siteName?: string;
  readonly siteDescription?: string;
  readonly fontFamily?: string;
  readonly faviconUrl?: string;
}

/**
 * Branding theme for UI components
 */
export interface BrandingTheme {
  readonly colors: {
    primary: string;
    secondary: string;
    primaryHover: string;
    secondaryHover: string;
  };
  readonly fonts: {
    primary: string;
  };
  readonly assets: {
    logo?: string;
    favicon?: string;
  };
  readonly identity: {
    siteName: string;
    siteDescription: string;
  };
}

/**
 * Font family options
 */
export const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Source Sans Pro",
  "Nunito",
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

/**
 * Color preset options
 */
export const COLOR_PRESETS = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Green", primary: "#10b981", secondary: "#059669" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#7c3aed" },
  { name: "Red", primary: "#ef4444", secondary: "#dc2626" },
  { name: "Orange", primary: "#f97316", secondary: "#ea580c" },
  { name: "Indigo", primary: "#6366f1", secondary: "#4f46e5" },
  { name: "Pink", primary: "#ec4899", secondary: "#db2777" },
  { name: "Teal", primary: "#14b8a6", secondary: "#0d9488" },
] as const;

export type ColorPreset = (typeof COLOR_PRESETS)[number];
