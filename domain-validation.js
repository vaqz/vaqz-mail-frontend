/*
 * Mailbox domain validation is enforced by the Worker/D1 configuration.
 * The frontend only validates email syntax so newly enabled domains do not
 * require a frontend deployment.
 */
window.isValidMailbox = function (value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
