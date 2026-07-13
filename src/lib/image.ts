/**
 * 사진 압축/리사이즈.
 *
 * 모바일 카메라 원본(특히 최신 스마트폰의 12~48MP 사진)은 수 MB~수십 MB에
 * 달해, 이를 그대로 base64로 들고 있다가 상태/로컬스토리지에 저장하면
 * "메모리 부족" 크래시로 이어진다. 여기서 원본을 최대한 빨리 축소해
 * 이후 파이프라인(미리보기, 상태 저장, 서버 업로드)이 항상 작은 이미지만
 * 다루도록 한다.
 */

const DEFAULT_MAX_DIMENSION = 1280;
const DEFAULT_QUALITY = 0.75;
/** base64 문자열이 이보다 크면 화질을 낮춰가며 다시 인코딩한다 (약 1.5MB) */
const MAX_DATA_URL_LENGTH = 1_500_000;

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

/**
 * File을 축소된 JPEG data URL로 변환한다.
 * `createImageBitmap`을 지원하면 원본을 base64로 거치지 않고 바로
 * 디코드해 메모리 사용을 최소화하고, 미지원 환경에서는 `<img>` 경유로 폴백한다.
 */
export async function compressImage(
  file: File,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY }: CompressOptions = {},
): Promise<string> {
  const { width, height, draw } = await loadDrawable(file);

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('CANVAS_CONTEXT_UNAVAILABLE');
  draw(ctx, targetW, targetH);

  // 리사이즈 후에도 용량이 크면 화질을 단계적으로 낮춰 재인코딩
  let q = quality;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  for (let i = 0; i < 3 && dataUrl.length > MAX_DATA_URL_LENGTH; i++) {
    q = Math.max(0.35, q - 0.15);
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }

  return dataUrl;
}

interface Drawable {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

async function loadDrawable(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => {
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close(); // 디코드된 원본 픽셀 메모리를 즉시 해제
      },
    };
  }

  // 구형 브라우저 폴백: object URL로 디코드 (data URL 왕복보다는 가볍다)
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** data URL → Blob (실서버에 multipart/form-data로 업로드할 때 사용) */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
