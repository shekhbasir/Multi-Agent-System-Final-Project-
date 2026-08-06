import crypto from "crypto";
import Certificate from "../model/Certificate.js";

// no 0/O/1/I to avoid confusing characters on a printed certificate
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateCertificateId = async () => {
  let certificateId;
  let exists = true;

  while (exists) {
    let random = "";
    for (let i = 0; i < 10; i++) {
      random += CHARS.charAt(crypto.randomInt(0, CHARS.length));
    }

    certificateId = `CERT-${random.slice(0, 5)}-${random.slice(5)}`;

    const found = await Certificate.findOne({ certificateId });
    if (!found) exists = false;
  }

  return certificateId;
};
