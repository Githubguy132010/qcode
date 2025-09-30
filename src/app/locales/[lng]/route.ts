import { NextResponse } from 'next/server';
import en from '@/locales/en.json';

type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];

// Helper function to recursively "translate" the JSON object
const translateObject = (obj: Json, lang: string): Json => {
  if (typeof obj === 'string') {
    // Simple "translation" for demonstration: append the language code
    return `${obj} [${lang}]`;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => translateObject(item, lang));
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: Json } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = translateObject(obj[key], lang);
      }
    }
    return newObj;
  }

  return obj;
};

export async function GET(
  _request: Request,
  // HACK: Using `any` here as a workaround for a persistent build error.
  // The correct type signature for this version of Next.js could not be determined.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { lng } = context.params;

  if (lng === 'en') {
    return NextResponse.json(en);
  }

  const translatedJson = translateObject(en, lng);
  return NextResponse.json(translatedJson);
}