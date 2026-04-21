import { Platform, Share } from 'react-native';
import type { MyDataExport } from '../services/functionsService';

export type DataExportDelivery = 'downloaded' | 'shared' | 'dismissed';

function buildExportFileName(exportedAt: string): string {
  const datePart = exportedAt.split('T')[0] || 'data';
  return `cosmicself-data-${datePart}.json`;
}

function downloadJsonOnWeb(fileName: string, json: string): boolean {
  const webGlobal = globalThis as any;
  const documentRef = webGlobal.document;
  const urlRef = webGlobal.URL;
  const BlobCtor = webGlobal.Blob;

  if (!documentRef?.createElement || !urlRef?.createObjectURL || !BlobCtor) return false;

  const blob = new BlobCtor([json], { type: 'application/json' });
  const objectUrl = urlRef.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';

  try {
    documentRef.body?.appendChild(anchor);
    anchor.click();
    return true;
  } finally {
    anchor.remove?.();
    urlRef.revokeObjectURL?.(objectUrl);
  }
}

export async function shareDataExport(data: MyDataExport): Promise<DataExportDelivery> {
  const fileName = buildExportFileName(data.exportedAt);
  const json = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web' && downloadJsonOnWeb(fileName, json)) {
    return 'downloaded';
  }

  const result = await Share.share(
    {
      title: fileName,
      message: json,
    },
    {
      dialogTitle: 'Export My Data',
    }
  );

  return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
}
