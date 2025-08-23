type CountryRule = {
  code: string
  regex: RegExp
  example: string
}

const countryRules: Record<string, CountryRule> = {
  PK: {
    code: "+92",
    // Accepts either 03XXXXXXXXX (local) or 3XXXXXXXXX (after country code)
    regex: /^(03\d{9}|3\d{9})$/,
    example: "03339174349 or +923339174349",
  },
  IN: {
    code: "+91",
    regex: /^[6-9]\d{9}$/,
    example: "9876543210 or +919876543210",
  },
  US: {
    code: "+1",
    regex: /^[2-9]\d{9}$/,
    example: "2345678901 or +12345678901",
  },
}

export function validatePhoneNumber(
  number: string,
  country: keyof typeof countryRules = "PK"
): { valid: boolean; formatted?: string; error?: string } {
  const rule = countryRules[country]

  // Remove spaces, dashes
  const cleaned = number.replace(/[\s-]/g, "")

  // Case 1: Already has country code
  if (cleaned.startsWith(rule.code)) {
    const withoutCode = cleaned.slice(rule.code.length)
    if (rule.regex.test(withoutCode)) {
      return { valid: true, formatted: cleaned }
    }
    return { valid: false, error: `Invalid format. Example: ${rule.example}` }
  }

  // Case 2: Local number (with or without 0)
  if (rule.regex.test(cleaned)) {
    // Strip leading zero if present, then prepend country code
    const formatted = cleaned.startsWith("0")
      ? rule.code + cleaned.slice(1)
      : rule.code + cleaned
    return { valid: true, formatted }
  }

  return { valid: false, error: `Invalid format. Example: ${rule.example}` }
}
