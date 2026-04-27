// QRIS EMVCo parser and dynamic generator

// Helper to calculate CRC16 CCITT (0xFFFF)
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = (crc >> 8) ^ data.charCodeAt(i);
    x ^= x >> 4;
    crc = (crc << 8) ^ (x << 12) ^ (x << 5) ^ x;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function createDynamicQris(staticQris: string, amount: number): string {
  // A valid QRIS always ends with "6304" + 4 alphanumeric characters (CRC).
  if (!staticQris || typeof staticQris !== "string" || staticQris.length < 10) {
    throw new Error("Invalid QRIS string");
  }

  // 1. Change Point of Initiation Method (Tag 01) from 11 (Static) to 12 (Dynamic)
  // Typically "010211" -> "010212"
  let modifiedQris = staticQris.replace("010211", "010212");

  // 2. Remove the existing CRC to append new fields.
  // The CRC is the last 8 characters: "6304" + 4 hex chars
  const qrisWithoutCrc = modifiedQris.slice(0, -8);

  // 3. Construct the Transaction Amount (Tag 54)
  const amountStr = amount.toString();
  const amountLength = amountStr.length.toString().padStart(2, "0");
  const tag54 = `54${amountLength}${amountStr}`;

  // 4. We can optionally append a bill number or reference (Tag 62).
  // Tag 62 is Additional Data Field.
  // Sub-tag 01 is Bill Number, 07 is Terminal Label, etc.
  // We'll just add the Amount for now.

  const newPayload = qrisWithoutCrc + tag54;

  // 5. Append "6304" to calculate the new CRC
  const payloadToCrc = newPayload + "6304";

  // 6. Calculate new CRC
  const newCrc = crc16(payloadToCrc);

  // 7. Return the full dynamic QRIS
  return payloadToCrc + newCrc;
}
