import type {
  BrandingSetting,
  CreateBrandingData,
  UpdateBrandingData,
  BrandingTheme,
} from "./types";
import type { BrandingRepository } from "./repository";
import type { UserRepository } from "@/domains/users/repository";
import type { PaginationParams } from "@/shared/types/global";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/shared/errors/AppError";

/**
 * Branding service - handles business logic for branding settings
 */
export class BrandingService {
  constructor(
    private readonly brandingRepo: BrandingRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Get active branding settings
   */
  async getActiveBranding(): Promise<BrandingSetting> {
    const branding = await this.brandingRepo.findActive();

    if (!branding) {
      // Return default branding if none exists
      return this.getDefaultBranding();
    }

    return branding;
  }

  /**
   * Get branding theme for UI consumption
   */
  async getBrandingTheme(): Promise<BrandingTheme> {
    const branding = await this.getActiveBranding();

    return {
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
        primaryHover: this.darkenColor(branding.primaryColor, 10),
        secondaryHover: this.darkenColor(branding.secondaryColor, 10),
      },
      fonts: {
        primary: branding.fontFamily,
      },
      assets: {
        logo: branding.logoUrl || undefined,
        favicon: branding.faviconUrl || undefined,
      },
      identity: {
        siteName: branding.siteName,
        siteDescription: branding.siteDescription,
      },
    };
  }

  /**
   * Get all branding settings
   */
  async getAllBranding(
    pagination?: PaginationParams
  ): Promise<readonly BrandingSetting[]> {
    return this.brandingRepo.findMany(pagination);
  }

  /**
   * Get branding by ID
   */
  async getBrandingById(id: string): Promise<BrandingSetting> {
    const branding = await this.brandingRepo.findById(id);
    if (!branding) {
      throw new NotFoundError("Branding settings not found");
    }
    return branding;
  }

  /**
   * Create new branding settings
   */
  async createBranding(
    data: CreateBrandingData,
    userId: string
  ): Promise<BrandingSetting> {
    // Verify user has admin permissions
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== "ADMIN") {
      throw new AuthorizationError("Admin access required");
    }

    // Validate branding data
    this.validateBrandingData(data);

    // Deactivate current active branding
    await this.brandingRepo.deactivateAll();

    // Create new branding settings
    const branding = await this.brandingRepo.create({
      ...data,
      createdBy: userId,
    });

    return branding;
  }

  /**
   * Update branding settings
   */
  async updateBranding(
    id: string,
    data: UpdateBrandingData,
    userId: string
  ): Promise<BrandingSetting> {
    // Verify user has admin permissions
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== "ADMIN") {
      throw new AuthorizationError("Admin access required");
    }

    // Validate branding data
    if (
      data.primaryColor ||
      data.secondaryColor ||
      data.siteName ||
      data.siteDescription ||
      data.fontFamily
    ) {
      this.validateBrandingData(data as CreateBrandingData);
    }

    // Update branding settings
    const branding = await this.brandingRepo.update(id, data);
    return branding;
  }

  /**
   * Set branding as active
   */
  async setBrandingActive(
    id: string,
    userId: string
  ): Promise<BrandingSetting> {
    // Verify user has admin permissions
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== "ADMIN") {
      throw new AuthorizationError("Admin access required");
    }

    // Deactivate all current settings
    await this.brandingRepo.deactivateAll();

    // Set the specified branding as active
    const branding = await this.brandingRepo.setActive(id);
    return branding;
  }

  /**
   * Delete branding settings
   */
  async deleteBranding(id: string, userId: string): Promise<void> {
    // Verify user has admin permissions
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== "ADMIN") {
      throw new AuthorizationError("Admin access required");
    }

    // Check if trying to delete active branding
    const branding = await this.brandingRepo.findById(id);
    if (branding?.isActive) {
      throw new ValidationError("Cannot delete active branding settings");
    }

    await this.brandingRepo.delete(id);
  }

  /**
   * Get default branding settings
   */
  private getDefaultBranding(): BrandingSetting {
    return {
      id: "default",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      siteName: "The Academy",
      siteDescription: "Learn anything, anywhere, anytime",
      fontFamily: "Inter",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validate branding data
   */
  private validateBrandingData(data: Partial<CreateBrandingData>): void {
    if (data.primaryColor && !this.isValidHexColor(data.primaryColor)) {
      throw new ValidationError("Invalid primary color format");
    }

    if (data.secondaryColor && !this.isValidHexColor(data.secondaryColor)) {
      throw new ValidationError("Invalid secondary color format");
    }

    if (data.siteName && data.siteName.trim().length === 0) {
      throw new ValidationError("Site name cannot be empty");
    }

    if (data.siteDescription && data.siteDescription.length > 500) {
      throw new ValidationError(
        "Site description too long (max 500 characters)"
      );
    }

    if (data.logoUrl && !this.isValidUrl(data.logoUrl)) {
      throw new ValidationError("Invalid logo URL format");
    }

    if (data.faviconUrl && !this.isValidUrl(data.faviconUrl)) {
      throw new ValidationError("Invalid favicon URL format");
    }
  }

  /**
   * Check if color is valid hex format
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Darken a hex color by a percentage
   */
  private darkenColor(hex: string, percent: number): string {
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
}
