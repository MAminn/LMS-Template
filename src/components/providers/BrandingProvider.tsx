"use client";

import React, { createContext, useEffect, useState } from "react";
import type { BrandingTheme } from "@/domains/branding/types";

interface BrandingContextType {
  theme: BrandingTheme;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
}

const defaultTheme: BrandingTheme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    primaryHover: "#2563eb",
    secondaryHover: "#1d4ed8",
  },
  fonts: {
    primary: "Inter",
  },
  assets: {},
  identity: {
    siteName: "The Academy",
    siteDescription: "Learn anything, anywhere, anytime",
  },
};

export const BrandingContext = createContext<BrandingContextType>({
  theme: defaultTheme,
  isLoading: false,
  error: null,
  refreshBranding: async () => {},
});

interface BrandingProviderProps {
  children: React.ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<BrandingTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFavicon = React.useCallback((faviconUrl: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = faviconUrl;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    }
  }, []);

  const loadGoogleFont = React.useCallback((fontFamily: string) => {
    const fontName = fontFamily.replace(/\s+/g, "+");
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontName}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }, []);

  const applyThemeToDocument = React.useCallback(
    (theme: BrandingTheme) => {
      const root = document.documentElement;

      // Set CSS custom properties
      root.style.setProperty("--color-primary", theme.colors.primary);
      root.style.setProperty("--color-secondary", theme.colors.secondary);
      root.style.setProperty(
        "--color-primary-hover",
        theme.colors.primaryHover
      );
      root.style.setProperty(
        "--color-secondary-hover",
        theme.colors.secondaryHover
      );
      root.style.setProperty("--font-primary", theme.fonts.primary);

      // Update document title
      document.title = `${theme.identity.siteName} - ${theme.identity.siteDescription}`;

      // Update favicon if provided
      if (theme.assets.favicon) {
        updateFavicon(theme.assets.favicon);
      }

      // Load font if different from default
      if (theme.fonts.primary !== "Inter") {
        loadGoogleFont(theme.fonts.primary);
      }
    },
    [updateFavicon, loadGoogleFont]
  );

  const fetchBranding = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/templates/branding");
      const result = await response.json();

      if (result.success && result.data) {
        const branding = result.data;

        // Convert branding settings to theme
        const newTheme: BrandingTheme = {
          colors: {
            primary: branding.primaryColor || defaultTheme.colors.primary,
            secondary: branding.secondaryColor || defaultTheme.colors.secondary,
            primaryHover: darkenColor(
              branding.primaryColor || defaultTheme.colors.primary,
              10
            ),
            secondaryHover: darkenColor(
              branding.secondaryColor || defaultTheme.colors.secondary,
              10
            ),
          },
          fonts: {
            primary: branding.fontFamily || defaultTheme.fonts.primary,
          },
          assets: {
            logo: branding.logoUrl,
            favicon: branding.faviconUrl,
            heroBackground: branding.heroBackgroundUrl,
          },
          identity: {
            siteName: branding.siteName || defaultTheme.identity.siteName,
            siteDescription:
              branding.siteDescription || defaultTheme.identity.siteDescription,
          },
        };

        setTheme(newTheme);

        // Apply theme to document
        applyThemeToDocument(newTheme);
      }
    } catch (err) {
      console.error("Error fetching branding:", err);
      setError("Failed to load branding settings");
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeToDocument]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const refreshBranding = React.useCallback(async () => {
    await fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider
      value={{
        theme,
        isLoading,
        error,
        refreshBranding,
      }}>
      {children}
    </BrandingContext.Provider>
  );
};

// Utility function to darken a color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
