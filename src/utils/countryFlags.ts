/**
 * Country Flag Utilities
 * 
 * Provides country flag images using flagcdn.com
 * 
 * @module utils/countryFlags
 */

/**
 * Map of country codes to flag URLs using flagcdn.com CDN
 */
export const FLAG_URLS: Record<string, string> = {
    MX: 'https://flagcdn.com/w40/mx.png',
    AR: 'https://flagcdn.com/w40/ar.png',
    CO: 'https://flagcdn.com/w40/co.png',
    CL: 'https://flagcdn.com/w40/cl.png',
    PE: 'https://flagcdn.com/w40/pe.png',
    BR: 'https://flagcdn.com/w40/br.png',
    VE: 'https://flagcdn.com/w40/ve.png',
    EC: 'https://flagcdn.com/w40/ec.png',
    UY: 'https://flagcdn.com/w40/uy.png',
    PY: 'https://flagcdn.com/w40/py.png',
    BO: 'https://flagcdn.com/w40/bo.png',
    CR: 'https://flagcdn.com/w40/cr.png',
    PA: 'https://flagcdn.com/w40/pa.png',
    GT: 'https://flagcdn.com/w40/gt.png',
    HN: 'https://flagcdn.com/w40/hn.png',
    SV: 'https://flagcdn.com/w40/sv.png',
    NI: 'https://flagcdn.com/w40/ni.png',
    CU: 'https://flagcdn.com/w40/cu.png',
    DO: 'https://flagcdn.com/w40/do.png',
    PR: 'https://flagcdn.com/w40/pr.png',
};

/**
 * Country names in Spanish
 */
export const COUNTRY_NAMES: Record<string, string> = {
    MX: 'México',
    AR: 'Argentina',
    CO: 'Colombia',
    CL: 'Chile',
    PE: 'Perú',
    BR: 'Brasil',
    VE: 'Venezuela',
    EC: 'Ecuador',
    UY: 'Uruguay',
    PY: 'Paraguay',
    BO: 'Bolivia',
    CR: 'Costa Rica',
    PA: 'Panamá',
    GT: 'Guatemala',
    HN: 'Honduras',
    SV: 'El Salvador',
    NI: 'Nicaragua',
    CU: 'Cuba',
    DO: 'República Dominicana',
    PR: 'Puerto Rico',
};

/**
 * Get flag URL for a country code
 */
export function getFlagUrl(countryCode: string): string {
    return FLAG_URLS[countryCode.toUpperCase()] || FLAG_URLS.MX;
}

/**
 * Get country name for a country code
 */
export function getCountryName(countryCode: string): string {
    return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
}
