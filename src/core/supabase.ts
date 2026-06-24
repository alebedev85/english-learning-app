import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Конвертирует Base64 строку в Blob и загружает в бакет Supabase Storage
 */
export const uploadWordImage = async (base64Data: string, fileName: string): Promise<string> => {
  // Очищаем префикс "data:image/png;base64," если он есть
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
  
  // Декодируем в бинарный массив
  const binaryStr = atob(base64Clean);
  const byteNumbers = new Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    byteNumbers[i] = binaryStr.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  // Загружаем в бакет 'word-images' (убедись, что создал его в консоли Supabase и сделал публичным)
  const filePath = `images/${Date.now()}_${fileName}.png`;
  
  const { data, error } = await supabase.storage
    .from('word-images')
    .upload(filePath, blob, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) throw error;

  // Получаем публичную ссылку на файл
  const { data: { publicUrl } } = supabase.storage
    .from('word-images')
    .getPublicUrl(filePath);

  return publicUrl;
};