"use client";

import { useContext } from "react";
import { BrandingContext } from "@/components/providers/BrandingProvider";

/**
 * Hook to access branding theme and utilities
 */
export function useBranding() {
  const context = useContext(BrandingContext);

  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }

  return context;
}

/**
 * Hook to get inline styles for brand colors
 */
export function useBrandingStyles() {
  const { theme } = useBranding();

  return {
    primary: {
      backgroundColor: theme.colors.primary,
      color: "white",
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: "white",
    },
    primaryText: {
      color: theme.colors.primary,
    },
    secondaryText: {
      color: theme.colors.secondary,
    },
    primaryBorder: {
      borderColor: theme.colors.primary,
    },
    secondaryBorder: {
      borderColor: theme.colors.secondary,
    },
    gradient: {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
    },
    gradientLight: {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}20)`,
    },
  };
}

/**
 * Hook to get CSS class names for branded components
 */
export function useBrandingClasses() {
  return {
    // Backgrounds
    bgPrimary: "bg-primary",
    bgSecondary: "bg-secondary",
    bgGradientPrimary: "bg-gradient-primary",
    bgGradientLight: "bg-gradient-primary-light",

    // Text colors
    textPrimary: "text-primary",
    textSecondary: "text-secondary",

    // Borders
    borderPrimary: "border-primary",
    borderSecondary: "border-secondary",

    // Buttons
    btnPrimary: "btn-primary",
    btnSecondary: "btn-secondary",
    btnOutlinePrimary: "btn-outline-primary",
    btnOutlineSecondary: "btn-outline-secondary",

    // Interactive states
    hoverBgPrimary: "hover-bg-primary",
    hoverBgSecondary: "hover-bg-secondary",
    hoverTextPrimary: "hover-text-primary",
    hoverTextSecondary: "hover-text-secondary",

    // Focus states
    focusPrimary: "focus-primary",
    focusSecondary: "focus-secondary",

    // Links
    linkPrimary: "link-primary",
    linkSecondary: "link-secondary",

    // Cards
    cardPrimary: "card-primary",
    cardSecondary: "card-secondary",

    // Badges
    badgePrimary: "badge-primary",
    badgeSecondary: "badge-secondary",
    badgeOutlinePrimary: "badge-outline-primary",
    badgeOutlineSecondary: "badge-outline-secondary",

    // Alerts
    alertPrimary: "alert-primary",
    alertSecondary: "alert-secondary",

    // Spinners
    spinnerPrimary: "spinner-primary",
    spinnerSecondary: "spinner-secondary",
  };
}
