const crypto = require('crypto');

function getApiKeyConfig() {
  const cfg = {
    prefix: process.env.API_KEY_PREFIX || '',
    bytes: Number.parseInt(process.env.API_KEY_BYTES, 10),
    encoding: (process.env.API_KEY_ENCODING || 'hex').toLowerCase(),
    allowedRegex: process.env.API_KEY_ALLOWED_REGEX || ''
  };

  if (!Number.isFinite(cfg.bytes) || cfg.bytes <= 0) {
    cfg.bytes = 32;
  }

  const enc = cfg.encoding;
  if (enc !== 'hex' && enc !== 'base64' && enc !== 'base64url') {
    cfg.encoding = 'hex';
  }

  return cfg;
}

function validateApiKeyFormat(apiKey) {
  const cfg = getApiKeyConfig();

  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return { ok: false, message: 'API Key kosong atau tidak valid' };
  }

  if (cfg.prefix && !apiKey.startsWith(cfg.prefix)) {
    return { ok: false, message: `API Key harus diawali prefix: ${cfg.prefix}` };
  }

  if (cfg.allowedRegex) {
    let re;
    try {
      re = new RegExp(cfg.allowedRegex);
    } catch {
      return { ok: false, message: 'Konfigurasi API_KEY_ALLOWED_REGEX tidak valid' };
    }

    if (!re.test(apiKey)) {
      return { ok: false, message: 'Format API Key tidak sesuai aturan' };
    }
  }

  return { ok: true };
}

function generateApiKey() {
  const cfg = getApiKeyConfig();
  // Generate 32 bytes = 64 hex chars, pad with leading zeros if needed
  const randomPart = crypto.randomBytes(cfg.bytes).toString(cfg.encoding);
  const padded = randomPart.padStart(cfg.bytes * 2, '0'); // hex: 2 chars per byte
  return `${cfg.prefix}${padded}`;
}

module.exports = generateApiKey;
module.exports.getApiKeyConfig = getApiKeyConfig;
module.exports.validateApiKeyFormat = validateApiKeyFormat;
