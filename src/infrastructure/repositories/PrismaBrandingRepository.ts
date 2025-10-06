import { prisma } from "@/lib/prisma";
import type {
  BrandingSetting,
  CreateBrandingData,
  UpdateBrandingData,
} from "@/domains/branding/types";
import type { BrandingRepository } from "@/domains/branding/repository";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Prisma implementation of BrandingRepository
 */
export class PrismaBrandingRepository implements BrandingRepository {
  /**
   * Find active branding settings
   */
  async findActive(): Promise<BrandingSetting | null> {
    const brandingData = await prisma.brandingSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!brandingData) return null;

    return this.mapPrismaBrandingToEntity(brandingData);
  }

  /**
   * Find branding settings by ID
   */
  async findById(id: string): Promise<BrandingSetting | null> {
    const brandingData = await prisma.brandingSetting.findUnique({
      where: { id },
    });

    if (!brandingData) return null;

    return this.mapPrismaBrandingToEntity(brandingData);
  }

  /**
   * Find all branding settings with pagination
   */
  async findMany(
    pagination?: PaginationParams
  ): Promise<readonly BrandingSetting[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination || {};

    const skip = (page - 1) * limit;

    const brandingData = await prisma.brandingSetting.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return brandingData.map(this.mapPrismaBrandingToEntity);
  }

  /**
   * Create new branding settings
   */
  async create(data: CreateBrandingData): Promise<BrandingSetting> {
    const brandingData = await prisma.brandingSetting.create({
      data: {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        fontFamily: data.fontFamily,
        faviconUrl: data.faviconUrl,
        isActive: true,
        createdBy: data.createdBy,
      },
    });

    return this.mapPrismaBrandingToEntity(brandingData);
  }

  /**
   * Update branding settings
   */
  async update(id: string, data: UpdateBrandingData): Promise<BrandingSetting> {
    const brandingData = await prisma.brandingSetting.update({
      where: { id },
      data: {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        fontFamily: data.fontFamily,
        faviconUrl: data.faviconUrl,
      },
    });

    return this.mapPrismaBrandingToEntity(brandingData);
  }

  /**
   * Deactivate all current active settings
   */
  async deactivateAll(): Promise<void> {
    await prisma.brandingSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  /**
   * Set settings as active
   */
  async setActive(id: string): Promise<BrandingSetting> {
    // First deactivate all
    await this.deactivateAll();

    // Then activate the specified one
    const brandingData = await prisma.brandingSetting.update({
      where: { id },
      data: { isActive: true },
    });

    return this.mapPrismaBrandingToEntity(brandingData);
  }

  /**
   * Delete branding settings
   */
  async delete(id: string): Promise<void> {
    await prisma.brandingSetting.delete({
      where: { id },
    });
  }

  /**
   * Map Prisma branding data to domain entity
   */
  private mapPrismaBrandingToEntity(
    data: Record<string, unknown>
  ): BrandingSetting {
    return {
      id: data.id as string,
      logoUrl: (data.logoUrl as string) || undefined,
      primaryColor: (data.primaryColor as string) || "#3b82f6",
      secondaryColor: (data.secondaryColor as string) || "#1e40af",
      siteName: (data.siteName as string) || "The Academy",
      siteDescription:
        (data.siteDescription as string) || "Learn anything, anywhere, anytime",
      fontFamily: (data.fontFamily as string) || "Inter",
      faviconUrl: (data.faviconUrl as string) || undefined,
      isActive: (data.isActive as boolean) ?? true,
      createdBy: (data.createdBy as string) || undefined,
      createdAt: data.createdAt as Date,
      updatedAt: (data.updatedAt as Date) || (data.createdAt as Date),
    };
  }
}
