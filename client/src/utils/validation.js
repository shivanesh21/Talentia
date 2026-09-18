const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,15}$/;

export function validateRegistration(values) {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length < 2)
    errors.name = "Please enter your full name.";
  if (!values.registerNumber?.trim())
    errors.registerNumber = "Register number is required.";
  if (!values.department?.trim())
    errors.department = "Department is required.";
  if (!values.year?.trim()) errors.year = "Year is required.";
  if (!PHONE_RE.test(values.phone?.trim() || ""))
    errors.phone = "Enter a valid phone number.";
  if (!EMAIL_RE.test(values.email?.trim() || ""))
    errors.email = "Enter a valid email address.";
  if (!values.selectedEvent)
    errors.selectedEvent = "Please choose an event.";
  return errors;
}
