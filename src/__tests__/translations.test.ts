import enTranslations from '../locales/en.json';
import nlTranslations from '../locales/nl.json';

/**
 * Helper function to check if an object has all keys from another object
 * @param obj The object to check
 * @param referenceObj The reference object with expected keys
 * @param path Current path in the object structure
 * @returns Array of missing keys with their paths
 */
 // Explicitly allow working with translation JSON objects
function findMissingKeys(obj: Record<string, unknown>, referenceObj: Record<string, unknown>, path = ''): string[] {
  const missingKeys: string[] = [];

  // Iterate only own enumerable keys to avoid prototype pollution issues
  const refKeys = Object.keys(referenceObj);
  for (const key of refKeys) {
    const newPath = path ? `${path}.${key}` : key;

    // Check presence using hasOwnProperty for safety
    const hasKey = Object.prototype.hasOwnProperty.call(obj, key);
    if (!hasKey) {
      // Key missing completely
      missingKeys.push(newPath);
      continue;
    }

    // If reference value is an object (but not null/array), recurse
    if (
      typeof referenceObj[key] === 'object' &&
      referenceObj[key] !== null &&
      !Array.isArray(referenceObj[key])
    ) {
      const objVal = (obj as Record<string, unknown>)[key];

      // Types don't match (expected object subtree)
      if (
        typeof objVal !== 'object' ||
        objVal === null ||
        Array.isArray(objVal)
      ) {
        missingKeys.push(`${newPath} (type mismatch: expected object)`);
        continue;
      }

      // Both are objects, check recursively
      const nestedMissingKeys = findMissingKeys(
        objVal as Record<string, unknown>,
        referenceObj[key] as Record<string, unknown>,
        newPath
      );
      missingKeys.push(...nestedMissingKeys);
    }
  }

  return missingKeys;
}

describe('Translation files', () => {
  test('Dutch translations should contain all keys from English', () => {
    const missingKeys = findMissingKeys(nlTranslations, enTranslations);
    
    if (missingKeys.length > 0) {
      console.error('Missing Dutch translations:', missingKeys);
    }
    
    expect(missingKeys).toEqual([]);
  });

  test('English translations should contain all keys from Dutch', () => {
    const missingKeys = findMissingKeys(enTranslations, nlTranslations);
    
    if (missingKeys.length > 0) {
      console.error('Missing English translations:', missingKeys);
    }
    
    expect(missingKeys).toEqual([]);
  });
});
