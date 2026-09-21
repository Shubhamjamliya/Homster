const normalizeName = (name = '') => {
  const lettersOnly = String(name).replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (lettersOnly || 'USER').slice(0, 5).padEnd(5, 'X');
};

const normalizePhone = (phone = '') => {
  const digitsOnly = String(phone).replace(/\D/g, '');
  return (digitsOnly || '00000').slice(0, 5).padEnd(5, '0');
};

const getBookingNumberBase = (name, phone) => `${normalizeName(name)}${normalizePhone(phone)}`;

/**
 * Creates a readable customer booking number.
 * The base is exactly 5 name letters + 5 phone digits.
 * A suffix is added only if that base already belongs to another booking.
 */
const generateBookingNumber = async ({ name, phone, BookingModel }) => {
  const base = getBookingNumberBase(name, phone);

  if (!BookingModel) return base;

  let candidate = base;
  let suffix = 1;
  while (await BookingModel.exists({ bookingNumber: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

module.exports = { getBookingNumberBase, generateBookingNumber };
