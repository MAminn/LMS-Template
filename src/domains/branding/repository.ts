import type {
  BrandingSetting,
  CreateBrandingData,
  UpdateBrandingData,
} from "./types";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Repository interface for branding settings
 */
export interface BrandingRepository {
  /**
   * Find active branding settings
   */
  findActive(): Promise<BrandingSetting | null>;

  /**
   * Find branding settings by ID
   */
  findById(id: string): Promise<BrandingSetting | null>;

  /**
   * Find all branding settings with pagination
   */
  findMany(pagination?: PaginationParams): Promise<readonly BrandingSetting[]>;

  /**
   * Create new branding settings
   */
  create(data: CreateBrandingData): Promise<BrandingSetting>;

  /**
   * Update branding settings
   */
  update(id: string, data: UpdateBrandingData): Promise<BrandingSetting>;

  /**
   * Deactivate all current active settings
   */
  deactivateAll(): Promise<void>;

  /**
   * Set settings as active
   */
  setActive(id: string): Promise<BrandingSetting>;

  /**
   * Delete branding settings
   */
  delete(id: string): Promise<void>;
}
