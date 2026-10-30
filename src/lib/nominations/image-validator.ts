/**
 * Image Validation Utility for Kutchmitra Home & Decor Awards 2026.
 * Enforces client requirements:
 * 1. Minimum width: 500 pixels
 * 2. Minimum height: 500 pixels
 * 3. Recommended resolution: 1000 x 1000 pixels or higher (guidance only)
 * 4. Square 1:1 aspect ratio recommended (non-square accepted if >= 500x500)
 * 5. Accepted formats: JPEG (.jpg, .jpeg) and PNG (.png)
 * 6. Maximum file size: 10 MB per image
 */

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_IMAGE_DIMENSION = 500; // 500 px
export const RECOMMENDED_IMAGE_DIMENSION = 1000; // 1000 px

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  isSquare?: boolean;
  isRecommendedResolution?: boolean;
}

/**
 * Extracts width and height from PNG or JPEG buffer without external dependencies.
 */
export function extractImageDimensions(buffer: Buffer): { width: number; height: number; format: "png" | "jpeg" } | null {
  if (!buffer || buffer.length < 24) return null;

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    // IHDR chunk begins at offset 8.
    // Offset 16 = width (4 bytes, big endian), Offset 20 = height (4 bytes, big endian)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height, format: "png" };
  }

  // Check JPEG signature: FF D8
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = buffer[offset + 1];

      // Stop if SOS (Start of Scan) or EOI (End of Image) reached
      if (marker === 0xda || marker === 0xd9) break;

      // SOF markers: SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        // Height is at offset + 5 (2 bytes, big endian)
        // Width is at offset + 7 (2 bytes, big endian)
        if (offset + 9 <= buffer.length) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, format: "jpeg" };
        }
      }

      // Move to next marker by reading section length
      if (offset + 3 < buffer.length) {
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      } else {
        break;
      }
    }
  }

  return null;
}

/**
 * Server-side validation of image buffer against client specifications.
 */
export function validateImageBuffer(buffer: Buffer, originalFilename: string): ImageValidationResult {
  // 1. File size check (<= 10 MB)
  if (buffer.length > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Each image must be 10 MB or smaller. (Uploaded image is ${(buffer.length / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  // 2. Extension check
  const ext = originalFilename.split(".").pop()?.toLowerCase();
  if (ext !== "jpg" && ext !== "jpeg" && ext !== "png") {
    return {
      valid: false,
      error: "Only JPG and PNG images are accepted.",
    };
  }

  // 3. Inspect buffer magic bytes & extract dimensions
  const dims = extractImageDimensions(buffer);
  if (!dims) {
    return {
      valid: false,
      error: "Invalid or unsupported image file. Only genuine JPG and PNG files are accepted.",
    };
  }

  // 4. Dimension check (minimum 500 x 500 px)
  if (dims.width < MIN_IMAGE_DIMENSION || dims.height < MIN_IMAGE_DIMENSION) {
    return {
      valid: false,
      width: dims.width,
      height: dims.height,
      error: `Image must be at least 500 × 500 pixels. (Current image dimensions: ${dims.width} × ${dims.height} px)`,
    };
  }

  const isSquare = dims.width === dims.height;
  const isRecommendedResolution =
    dims.width >= RECOMMENDED_IMAGE_DIMENSION && dims.height >= RECOMMENDED_IMAGE_DIMENSION;

  return {
    valid: true,
    width: dims.width,
    height: dims.height,
    isSquare,
    isRecommendedResolution,
  };
}

/**
 * Client-side validation using browser Image API.
 */
export async function validateImageFileClient(file: File): Promise<ImageValidationResult> {
  // 1. File size check
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Each image must be 10 MB or smaller. (Current file: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  // 2. File extension & MIME type check
  const ext = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["jpg", "jpeg", "png"];
  if (!ext || !validExtensions.includes(ext) || (!file.type.includes("jpeg") && !file.type.includes("png"))) {
    return {
      valid: false,
      error: "Only JPG and PNG images are accepted.",
    };
  }

  // 3. Load image to check dimensions
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
        resolve({
          valid: false,
          width,
          height,
          error: `Image must be at least 500 × 500 pixels. (Current image: ${width} × ${height} px)`,
        });
        return;
      }

      const isSquare = width === height;
      const isRecommendedResolution =
        width >= RECOMMENDED_IMAGE_DIMENSION && height >= RECOMMENDED_IMAGE_DIMENSION;

      resolve({
        valid: true,
        width,
        height,
        isSquare,
        isRecommendedResolution,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: "Unable to read image dimensions. Please verify the file is a valid JPG or PNG image.",
      });
    };

    img.src = objectUrl;
  });
}
