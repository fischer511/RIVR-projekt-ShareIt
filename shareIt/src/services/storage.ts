import * as ImageManipulator from 'expo-image-manipulator';

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
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { 
      compress: 0.7, // 70% kvaliteta
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true 
    }
  );

  // Vrni base64 z data URI prefixom za enostavno prikazovanje
  return `data:image/jpeg;base64,${manipulated.base64}`;
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
