import { BakeryItem, BakeryCategory, DeliverySettings, ItemVariant } from '../types';
import { BAKERY_ITEMS, GOOGLE_SHEET_CSV_EXPORT, DEFAULT_DELIVERY_SETTINGS } from '../data/bakeryData';

const CACHE_KEY = 'angel_bakery_sheet_items_v10';
const CACHE_TIME_KEY = 'angel_bakery_sheet_items_time_v10';
const CACHE_DELIVERY_KEY = 'angel_bakery_delivery_settings_v6';

export interface SheetParseResult {
  items: BakeryItem[];
  deliverySettings: DeliverySettings;
}

/**
 * Standard CSV line parser that respects quoted commas
 */
function parseCSVRow(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Parse numeric price from strings like "₹800", "800", "per kg, ₹900"
 */
function parsePrice(val?: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Normalizes URL (prepends https:// if missing, strips whitespace)
 */
function cleanAndFormatUrl(val?: string): string | undefined {
  if (!val) return undefined;
  const clean = val.trim();
  if (!clean || clean === '-' || clean === 'N/A' || clean === 'na' || clean.toLowerCase() === 'none') {
    return undefined;
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('www.')) {
    return `https://${clean}`;
  }
  if (clean.includes('youtube.com') || clean.includes('youtu.be') || clean.includes('instagram.com')) {
    return `https://${clean}`;
  }
  // If it looks like an Instagram handle (e.g. @angelbakery)
  if (clean.startsWith('@')) {
    return `https://www.instagram.com/${clean.substring(1)}`;
  }
  return clean;
}

/**
 * Maps raw sheet category to internal category and label.
 * Dynamically supports ANY category added by owner in Google Sheet Column A!
 */
export function mapCategory(rawCat: string): { category: string; label: string; emoji: string } {
  const clean = rawCat ? rawCat.trim() : '';
  if (!clean) {
    return { category: 'bakery-items', label: 'Bakery Items', emoji: '🧁' };
  }
  const lower = clean.toLowerCase();

  if (lower.includes('cake') || lower.includes('pastry') || lower.includes('pastries')) {
    return { category: 'cakes', label: 'Fresh Cakes', emoji: '🎂' };
  }
  if (lower.includes('classic') && lower.includes('pizza')) {
    return { category: 'classic-pizza', label: 'Classic Pizza', emoji: '🍕' };
  }
  if (lower.includes('signature') && lower.includes('pizza')) {
    return { category: 'signature-pizza', label: 'Signature Pizza', emoji: '🍕' };
  }
  if (lower.includes('supereme') || lower.includes('supreme')) {
    return { category: 'supreme-pizza', label: 'Supreme Pizza', emoji: '✨' };
  }
  if (lower.includes('pizza')) {
    return { category: 'classic-pizza', label: 'Classic Pizza', emoji: '🍕' };
  }
  if (lower.includes('burger') || lower.includes('sandwich')) {
    return { category: 'burger-sandwich', label: 'Burgers & Sandwiches', emoji: '🍔' };
  }
  if (lower.includes('fast food') || lower.includes('fastfood') || lower.includes('fast-food') || lower.includes('chaat') || lower.includes('dosa') || lower.includes('noodle')) {
    return { category: 'fast-food', label: 'Fast Food', emoji: '🍟' };
  }
  if (lower.includes('chocolate')) {
    return { category: 'chocolates', label: 'Chocolates & Gifts', emoji: '🍫' };
  }
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('shake') || lower.includes('juice')) {
    return { category: 'beverages', label: 'Beverages & Drinks', emoji: '🥤' };
  }
  if (lower.includes('namkeen') || lower.includes('snack') || lower.includes('bhujia')) {
    return { category: 'snacks', label: 'Namkeen & Snacks', emoji: '🥨' };
  }
  if (lower.includes('sweet') || lower.includes('mithai')) {
    return { category: 'sweets', label: 'Authentic Sweets', emoji: '🍬' };
  }
  if (lower.includes('cookie') || lower.includes('biscuit') || lower.includes('rusk') || lower.includes('toast')) {
    return { category: 'cookies', label: 'Cookies & Bakery', emoji: '🍪' };
  }
  if (lower.includes('ice cream') || lower.includes('icecream') || lower.includes('kulfi')) {
    return { category: 'ice-cream', label: 'Ice Creams', emoji: '🍨' };
  }
  if (lower.includes('south') || lower.includes('idli')) {
    return { category: 'south-indian', label: 'South Indian', emoji: '🥞' };
  }
  if (lower.includes('chinese') || lower.includes('manchurian') || lower.includes('chowmein')) {
    return { category: 'chinese', label: 'Chinese Fast Food', emoji: '🥢' };
  }

  // Any other new category added in the sheet dynamically:
  const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'special';
  const label = clean
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  let emoji = '🍽️';
  if (lower.includes('food') || lower.includes('meal')) emoji = '🍲';
  else if (lower.includes('bread') || lower.includes('bun') || lower.includes('pav')) emoji = '🍞';
  else if (lower.includes('tea') || lower.includes('chai') || lower.includes('coffee')) emoji = '☕';
  else if (lower.includes('salad') || lower.includes('healthy')) emoji = '🥗';
  else if (lower.includes('soup')) emoji = '🥣';
  else if (lower.includes('gift') || lower.includes('pack')) emoji = '🎁';

  return { category: slug, label, emoji };
}

function findBestCuratedMatch(sheetName: string, curatedList: BakeryItem[]): BakeryItem | null {
  const sNorm = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Exact match first
  for (const c of curatedList) {
    const cNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sNorm === cNorm) return c;
  }
  // Substring match
  for (const c of curatedList) {
    const cNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sNorm.length >= 4 && (cNorm.includes(sNorm) || sNorm.includes(cNorm))) {
      return c;
    }
  }
  return null;
}

/**
 * Helper to extract numeric threshold from description (e.g. "600 rupay" -> 600)
 */
function extractFreeDeliveryThreshold(desc?: string): number {
  if (!desc) return DEFAULT_DELIVERY_SETTINGS.freeDeliveryThreshold;
  const match = 
    desc.match(/(?:take\s*(?:a\s*)?|above\s*|over\s*|orders?\s*(?:of\s*)?|₹\s*)(\d+)/i) || 
    desc.match(/(\d+)\s*(?:rupay|rs|inr|₹)/i) ||
    desc.match(/\b(\d{3,4})\b/);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (val >= 50 && val <= 5000) return val;
  }
  return DEFAULT_DELIVERY_SETTINGS.freeDeliveryThreshold;
}

/**
 * Parses Google Sheet CSV text into items and delivery settings
 * Maps:
 * - Column G (index 6): Image URL
 * - Column H (index 7): Instagram URL / Reel
 * - Column I (index 8): YouTube URL / Shorts
 * - Column J (index 9): Delivery value (Delivery charge set by owner, e.g. 50)
 * - Column K (index 10): Delivery description (e.g. "if till you take a 600 rupay then you get free delivery 🛺")
 */
export function parseSheetCSVFull(csvText: string): SheetParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { items: BAKERY_ITEMS, deliverySettings: DEFAULT_DELIVERY_SETTINGS };
  }

  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]).map((c) => c.trim().toLowerCase());
    if (
      (row.some((c) => c.includes('category')) && row.some((c) => c.includes('item name') || c.includes('name'))) ||
      row.some((c) => c.includes('delivery')) ||
      row.some((c) => c.includes('instagram') || c.includes('youtube'))
    ) {
      headerIndex = i;
      headers = row;
      break;
    }
  }

  // Fallback header lookup: if no line matched both category and name, search for first line with multiple fields
  if (headerIndex === -1) {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length >= 4) {
        headerIndex = i;
        headers = row.map((c) => c.trim().toLowerCase());
        break;
      }
    }
  }

  // Find column indices by header keyword, falling back to standard 0-indexed positions (A=0..K=10)
  const catIdx = headers.findIndex((h) => h.includes('category'));
  const nameIdx = headers.findIndex((h) => h.includes('item name') || h === 'name' || h.includes('item'));
  const descIdx = headers.findIndex((h) => h.includes('description') || h.includes('ingredient') || h.includes('detail'));
  const priceIdx = headers.findIndex((h) => h.includes('regular') || h.includes('unit price') || h === 'price' || h.includes('rate'));
  const medPriceIdx = headers.findIndex((h) => h.includes('medium'));
  const lrgPriceIdx = headers.findIndex((h) => h.includes('large'));
  
  // Column G is image url
  let imgIdx = headers.findIndex((h) => h.includes('imageurl') || h.includes('image url') || h === 'image' || h.includes('photo') || h.includes('pic') || h.includes('img'));
  if (imgIdx === -1) {
    imgIdx = 6; // Column G
  }

  // Column H is Instagram
  let instaIdx = headers.findIndex((h) => h.includes('instagram') || h.includes('insta') || h.includes('reel') || h.includes('ig'));
  if (instaIdx === -1) {
    instaIdx = 7; // Column H (8th column)
  }

  // Column I is YouTube
  let ytIdx = headers.findIndex((h) => h.includes('youtube') || h.includes('you tube') || h.includes('yt') || h.includes('shorts') || h.includes('video'));
  if (ytIdx === -1) {
    ytIdx = 8; // Column I (9th column)
  }

  // Column J is Delivery value (Delivery charge)
  let deliveryValIdx = headers.findIndex((h) => 
    h.includes('delivery value') || 
    h.includes('delivery fee') || 
    h.includes('delivery charge') || 
    h.includes('delivery rate') ||
    h === 'delivery'
  );
  if (deliveryValIdx === -1) {
    deliveryValIdx = 9; // Column J (10th column)
  }

  // Column K is Delivery description
  let deliveryDescIdx = headers.findIndex((h) => 
    h.includes('delivery discription') || 
    h.includes('delivery description') || 
    h.includes('delivery desc') || 
    h.includes('discription') ||
    (h.includes('delivery') && h.includes('desc'))
  );
  if (deliveryDescIdx === -1) {
    deliveryDescIdx = 10; // Column K (11th column)
  }

  const parsedItems: BakeryItem[] = [];
  const seenIds = new Set<string>();

  let detectedDeliveryFee: number | undefined = undefined;
  let detectedDeliveryDesc: string | undefined = undefined;

  const startLine = headerIndex >= 0 ? headerIndex + 1 : 0;

  for (let i = startLine; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const rawCat = catIdx >= 0 && row[catIdx] ? row[catIdx].trim() : (row[0] ? row[0].trim() : '');
    const rawName = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : (row[1] ? row[1].trim() : '');
    const rawDesc = descIdx >= 0 && row[descIdx] ? row[descIdx].trim() : (row[2] ? row[2].trim() : '');
    const rawPrice = priceIdx >= 0 && row[priceIdx] ? row[priceIdx].trim() : (row[3] ? row[3].trim() : '');
    const rawMedPrice = medPriceIdx >= 0 && row[medPriceIdx] ? row[medPriceIdx].trim() : (row[4] ? row[4].trim() : '');
    const rawLrgPrice = lrgPriceIdx >= 0 && row[lrgPriceIdx] ? row[lrgPriceIdx].trim() : (row[5] ? row[5].trim() : '');
    
    // Column G (Index 6) Image
    let rawImg = imgIdx >= 0 && row[imgIdx] ? row[imgIdx].trim() : (row[6] ? row[6].trim() : '');
    // Column H (Index 7) Instagram
    let rawInsta = instaIdx >= 0 && row[instaIdx] ? row[instaIdx].trim() : (row[7] ? row[7].trim() : '');
    // Column I (Index 8) YouTube
    let rawYt = ytIdx >= 0 && row[ytIdx] ? row[ytIdx].trim() : (row[8] ? row[8].trim() : '');
    // Column J (Index 9) Delivery Value
    let rawDeliveryVal = deliveryValIdx >= 0 && row[deliveryValIdx] ? row[deliveryValIdx].trim() : (row[9] ? row[9].trim() : '');
    // Column K (Index 10) Delivery Description
    let rawDeliveryDesc = deliveryDescIdx >= 0 && row[deliveryDescIdx] ? row[deliveryDescIdx].trim() : (row[10] ? row[10].trim() : '');

    // Collect delivery fee from Column J
    if (rawDeliveryVal) {
      const parsedFee = parsePrice(rawDeliveryVal);
      if (parsedFee !== undefined && parsedFee >= 0 && detectedDeliveryFee === undefined) {
        detectedDeliveryFee = parsedFee;
      }
    }
    // Collect delivery description from Column K
    if (rawDeliveryDesc && rawDeliveryDesc.length > 3 && !detectedDeliveryDesc) {
      detectedDeliveryDesc = rawDeliveryDesc;
    }

    // Skip empty name or header row echoes
    if (!rawName || rawName.toLowerCase() === 'item name' || rawName.toLowerCase() === 'name') continue;

    // Smart check: if user placed YouTube link in Column H or Instagram link in Column I, auto-detect & swap
    if (rawInsta && (rawInsta.includes('youtube.com') || rawInsta.includes('youtu.be'))) {
      if (!rawYt) rawYt = rawInsta;
      rawInsta = '';
    }
    if (rawYt && (rawYt.includes('instagram.com') || rawYt.includes('instagr.am'))) {
      if (!rawInsta) rawInsta = rawYt;
      rawYt = '';
    }

    // Also scan row for any other YouTube or Instagram links if not found
    if (!rawYt) {
      for (const cell of row) {
        if (cell.includes('youtube.com') || cell.includes('youtu.be')) {
          rawYt = cell.trim();
          break;
        }
      }
    }
    if (!rawInsta) {
      for (const cell of row) {
        if (cell.includes('instagram.com') || cell.includes('instagr.am')) {
          rawInsta = cell.trim();
          break;
        }
      }
    }

    // Clean & Format URLs
    let imageUrl: string | undefined = undefined;
    if (rawImg && (rawImg.startsWith('http://') || rawImg.startsWith('https://'))) {
      imageUrl = rawImg;
    }

    const finalInsta = cleanAndFormatUrl(rawInsta);
    const finalYt = cleanAndFormatUrl(rawYt);

    const price = parsePrice(rawPrice) || 100;
    const medPrice = parsePrice(rawMedPrice);
    const lrgPrice = parsePrice(rawLrgPrice);

    // Look for matching curated item
    const matchedCurated = findBestCuratedMatch(rawName, BAKERY_ITEMS);

    const itemId = matchedCurated ? matchedCurated.id : `sheet-${i}-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Avoid duplicates if same item name appears multiple times
    let finalId = itemId;
    let dupCount = 1;
    while (seenIds.has(finalId)) {
      dupCount++;
      finalId = `${itemId}-${dupCount}`;
    }
    seenIds.add(finalId);

    const { category, label, emoji } = mapCategory(rawCat);

    if (matchedCurated) {
      // Merge with curated item: ONLY use mediumPrice and largePrice if explicitly present in the Google Sheet!
      parsedItems.push({
        ...matchedCurated,
        id: finalId,
        name: rawName,
        category: rawCat ? category : matchedCurated.category,
        categoryLabel: rawCat ? label : matchedCurated.categoryLabel,
        emoji: rawCat ? emoji : matchedCurated.emoji,
        price,
        mediumPrice: medPrice !== undefined ? medPrice : undefined,
        largePrice: lrgPrice !== undefined ? lrgPrice : undefined,
        mediumRaw: rawMedPrice || undefined,
        largeRaw: rawLrgPrice || undefined,
        halfKgPrice: undefined,
        description: rawDesc && rawDesc !== 'per kg' ? rawDesc : matchedCurated.description,
        imageUrl: imageUrl || matchedCurated.imageUrl,
        instagramUrl: finalInsta || matchedCurated.instagramUrl,
        youtubeUrl: finalYt || matchedCurated.youtubeUrl,
        deliveryValue: parsePrice(rawDeliveryVal),
        deliveryDescription: rawDeliveryDesc || undefined,
      });
    } else {
      // Create new item with dynamic category
      parsedItems.push({
        id: finalId,
        name: rawName,
        category,
        categoryLabel: label,
        price,
        mediumPrice: medPrice !== undefined ? medPrice : undefined,
        largePrice: lrgPrice !== undefined ? lrgPrice : undefined,
        mediumRaw: rawMedPrice || undefined,
        largeRaw: rawLrgPrice || undefined,
        halfKgPrice: undefined,
        description: rawDesc && rawDesc !== 'per kg' ? rawDesc : `Fresh and delicious ${rawName} made fresh daily at Angel Bakery Chandpur.`,
        imageUrl,
        instagramUrl: finalInsta || undefined,
        youtubeUrl: finalYt || undefined,
        deliveryValue: parsePrice(rawDeliveryVal),
        deliveryDescription: rawDeliveryDesc || undefined,
        isVegetarian: true,
        isCustomizable: medPrice !== undefined || lrgPrice !== undefined || category === 'cakes',
        rating: 4.8,
        reviewsCount: 120,
        prepTimeMinutes: category === 'cakes' ? 20 : 15,
        emoji,
        gradient: 'from-amber-100 via-rose-50 to-amber-200',
      });
    }
  }

  // Construct final delivery settings
  const deliverySettings: DeliverySettings = {
    deliveryFee: detectedDeliveryFee !== undefined ? detectedDeliveryFee : DEFAULT_DELIVERY_SETTINGS.deliveryFee,
    deliveryDescription: detectedDeliveryDesc || DEFAULT_DELIVERY_SETTINGS.deliveryDescription,
    freeDeliveryThreshold: extractFreeDeliveryThreshold(detectedDeliveryDesc || DEFAULT_DELIVERY_SETTINGS.deliveryDescription),
  };

  return {
    items: parsedItems.length > 0 ? parsedItems : BAKERY_ITEMS,
    deliverySettings,
  };
}

/**
 * Parses Google Sheet CSV text into an array of BakeryItem (backwards compatible)
 */
export function parseSheetCSV(csvText: string): BakeryItem[] {
  return parseSheetCSVFull(csvText).items;
}

/**
 * Fetch latest items and delivery settings directly from the Google Sheet CSV
 */
export async function fetchLiveSheetData(): Promise<SheetParseResult> {
  try {
    const bustCacheUrl = `${GOOGLE_SHEET_CSV_EXPORT}&_t=${Date.now()}`;
    const response = await fetch(bustCacheUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const result = parseSheetCSVFull(csvText);

    if (result.items && result.items.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result.items));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        localStorage.setItem(CACHE_DELIVERY_KEY, JSON.stringify(result.deliverySettings));
      } catch {
        // ignore quota errors
      }
      return result;
    }
    return { items: BAKERY_ITEMS, deliverySettings: DEFAULT_DELIVERY_SETTINGS };
  } catch (err) {
    console.warn('Error fetching live Google Sheet data, falling back to local/cached data:', err);
    return {
      items: getCachedSheetItems() || BAKERY_ITEMS,
      deliverySettings: getCachedDeliverySettings(),
    };
  }
}

/**
 * Fetch latest items directly from the Google Sheet CSV
 */
export async function fetchLiveSheetItems(): Promise<BakeryItem[]> {
  const result = await fetchLiveSheetData();
  return result.items;
}

/**
 * Returns cached sheet items if available
 */
export function getCachedSheetItems(): BakeryItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const items: BakeryItem[] = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Returns cached delivery settings (Column J & K)
 */
export function getCachedDeliverySettings(): DeliverySettings {
  try {
    const raw = localStorage.getItem(CACHE_DELIVERY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.deliveryFee === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_DELIVERY_SETTINGS;
}
