import { useState } from "react";
import { SITE_CONTENT } from "../content/siteContent";

function WhatsAppChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(SITE_CONTENT.contact.defaultMessage);

  const sanitizedNumber = SITE_CONTENT.contact.whatsappNumber.replace(/\D/g, "");
  const canSend = sanitizedNumber.length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const finalMessage = [
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      "",
      message.trim()
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="wa-widget" aria-live="polite">
      <div
        id="wa-form"
        className={`wa-panel${isOpen ? " wa-panel--open" : ""}`}
        role="dialog"
        aria-label="Send WhatsApp message"
        aria-hidden={!isOpen}
      >
          <div className="wa-panel-head">
            <h3>Chat With Us</h3>
            <button
              type="button"
              className="wa-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp form"
            >
              x
            </button>
          </div>
          <form className="wa-form" onSubmit={handleSubmit}>
            <label htmlFor="wa-name">Name</label>
            <input
              id="wa-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
            />

            <label htmlFor="wa-phone">Phone Number</label>
            <input
              id="wa-phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone number"
              required
            />

            <label htmlFor="wa-message">Message</label>
            <textarea
              id="wa-message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Type your message"
              required
            />

            <button type="submit" className="button wa-send" disabled={!canSend}>
              Send On WhatsApp
            </button>
          </form>
        </div>

      <button
        type="button"
        className="wa-trigger"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="wa-form"
        aria-label={isOpen ? "Close chat" : SITE_CONTENT.contact.chatButtonLabel}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.373 2 11.7c0 2.07.638 3.993 1.73 5.59L2.06 21.44a.5.5 0 0 0 .625.64l4.506-1.594A10.05 10.05 0 0 0 12 21.4c5.523 0 10-4.373 10-9.7S17.523 2 12 2zm0 17.4a8.07 8.07 0 0 1-4.013-1.068l-.286-.172-2.963 1.048 1.02-2.88-.195-.297A7.468 7.468 0 0 1 4 11.7C4 7.48 7.582 4 12 4s8 3.48 8 7.7-3.582 7.7-8 7.7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default WhatsAppChatWidget;