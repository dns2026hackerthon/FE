/**
 * 사진 압축/리사이즈.
 *
 * 모바일 카메라 원본(특히 최신 스마트폰의 12~48MP 사진)은 수 MB~수십 MB에
 * 달해, 이를 그대로 base64로 들고 있다가 상태/로컬스토리지에 저장하면
 * "메모리 부족" 크래시로 이어진다. 여기서 원본을 최대한 빨리 축소해
 * 이후 파이프라인(미리보기, 상태 저장, 서버 업로드)이 항상 작은 이미지만
 * 다루도록 한다.
 *
 * 특정 이미지가 실패하는 가장 흔한 원인은 iPhone 기본 카메라 포맷인
 * HEIC/HEIF다. Safari(iOS)는 네이티브로 디코드하지만 Chrome/Firefox/Android
 * 등 대부분의 브라우저는 `createImageBitmap`/`<img>` 어느 쪽으로도 HEIC를
 * 못 읽는다. 그래서 HEIC로 보이는 파일은 `heic2any`로 먼저 JPEG로 변환한 뒤
 * 같은 압축 파이프를 태운다.
 */

const DEFAULT_MAX_DIMENSION = 1280;
const DEFAULT_QUALITY = 0.75;
/** base64 문자열이 이보다 크면 화질을 낮춰가며 다시 인코딩한다 (약 1.5MB) */
const MAX_DATA_URL_LENGTH = 1_500_000;

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export class ImageProcessError extends Error {
  reason: 'heic' | 'decode' | 'unknown';
  constructor(reason: 'heic' | 'decode' | 'unknown', message: string) {
    super(message);
    this.reason = reason;
  }
}

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') return true;
  return /\.hei[cf]$/i.test(file.name);
}

/** HEIC/HEIF 파일을 JPEG Blob으로 변환 (동적 import — 필요할 때만 로드) */
async function convertHeicToJpeg(file: File): Promise<Blob> {
  const { default: heic2any } = await import('heic2any');
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
  return Array.isArray(result) ? result[0] : result;
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
  let source: File | Blob = file;

  if (isHeic(file)) {
    try {
      source = await convertHeicToJpeg(file);
    } catch (err) {
      console.error('[image] HEIC 변환 실패', {
        name: file.name,
        type: file.type,
        size: file.size,
        err,
      });
      throw new ImageProcessError(
        'heic',
        'HEIC 형식의 사진을 변환하지 못했어요. 카메라 설정을 "높은 호환성(JPEG)"으로 바꾼 뒤 다시 시도해주세요.',
      );
    }
  }

  let width: number;
  let height: number;
  let draw: Drawable['draw'];
  try {
    ({ width, height, draw } = await loadDrawable(source));
  } catch (err) {
    console.error('[image] 디코드 실패', {
      name: file.name,
      type: file.type,
      size: file.size,
      err,
    });
    throw new ImageProcessError(
      'decode',
      '지원하지 않는 이미지 형식이에요. 다른 사진으로 시도해주세요.',
    );
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageProcessError('unknown', '사진을 처리하지 못했어요. 다시 시도해주세요.');
  }
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

async function loadDrawable(source: File | Blob): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(source, {
      imageOrientation: 'from-image',
    });
    if (bitmap.width === 0 || bitmap.height === 0) {
      bitmap.close();
      throw new Error('EMPTY_BITMAP');
    }
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
  const url = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      el.src = url;
    });
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      throw new Error('EMPTY_IMAGE');
    }
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
