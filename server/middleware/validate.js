const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,15}$/;

function validateRegistration(body) {
  const errors = {};
  const v = (k) => (body?.[k] ?? "").toString().trim();
  if (v("name").length < 2) errors.name = "Please enter your full name.";
  if (!v("registerNumber")) errors.registerNumber = "Register number is required.";
  if (!v("department")) errors.department = "Department is required.";
  if (!v("year")) errors.year = "Year is required.";
  if (!PHONE_RE.test(v("phone"))) errors.phone = "Enter a valid phone number.";
  if (!EMAIL_RE.test(v("email"))) errors.email = "Enter a valid email address.";
  if (!v("selectedEvent")) errors.selectedEvent = "Please choose an event.";
  return errors;
}

module.exports = { validateRegistration };
