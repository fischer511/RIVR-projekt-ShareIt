import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Pretvori sliko v Base64 s kompresijo.
 * @param uri Lokalni URI slike (iz image picker)
 * @param maxWidth Maksimalna širina (default 800px)
 * @returns Base64 string slike
 */
export async function imageToBase64(
  uri: string,
  maxWidth: number = 800
): Promise<string> {
  // Pomanjšaj in kompresiraj sliko
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { 
        compress: 0.7, // 70% kvaliteta
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true 
      }
    );

    if (manipulated && manipulated.base64) {
      return `data:image/jpeg;base64,${manipulated.base64}`;
    }
  } catch (err) {
    console.warn('[storage.imageToBase64] ImageManipulator failed, falling back to FileSystem', err);
  }

  // Fallback: preberi datoteko kot base64 (useful on some devices / runtimes)
  try {
    // uri may be file:// or content:// ; FileSystem.readAsStringAsync supports file://
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error('[storage.imageToBase64] fallback failed for', uri, err);
    throw err;
  }
}

/**
 * Pretvori več slik v Base64.
 * @param uris Array lokalnih URI-jev
 * @param maxWidth Maksimalna širina
 * @returns Array Base64 stringov
 */
export async function imagesToBase64(
  uris: string[],
  maxWidth: number = 800
): Promise<string[]> {
  const base64Images = await Promise.all(
    uris.map((uri) => imageToBase64(uri, maxWidth))
  );
  return base64Images;
}
