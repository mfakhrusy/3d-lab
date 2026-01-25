import { createSignal, onMount, For, Show } from "solid-js";
import {
  fetchGuestEntries,
  createGuestEntry,
  formatRelativeTime,
  isGuestBookEnabled,
  type GuestEntry,
} from "./guestBookApi";
import "./MobileGuestBook.css";

const MAX_MESSAGE_LENGTH = 280;

export function MobileGuestBook() {
  if (!isGuestBookEnabled()) return null;

  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<"form" | "list">("list");
  const [entries, setEntries] = createSignal<GuestEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const [name, setName] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [website, setWebsite] = createSignal("");
  const [status, setStatus] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const serverEntries = await fetchGuestEntries();

      const storedPending = localStorage.getItem("pendingGuestEntries");
      let localPending: GuestEntry[] = [];
      if (storedPending) {
        try {
          localPending = JSON.parse(storedPending);
        } catch (e) {
          console.error("Failed to parse pending entries", e);
        }
      }

      const serverIds = new Set(serverEntries.map((e) => e.id));
      const stillPending = localPending.filter((e) => !serverIds.has(e.id));

      if (stillPending.length !== localPending.length) {
        localStorage.setItem(
          "pendingGuestEntries",
          JSON.stringify(stillPending)
        );
      }

      setEntries([...stillPending, ...serverEntries]);
    } catch {
      console.error("Failed to load guest entries");
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    loadEntries();
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const trimmedName = name().trim();
    const trimmedMessage = message().trim();

    if (!trimmedName || !trimmedMessage) {
      setStatus({ type: "error", text: "ERROR: All fields required" });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setStatus({ type: "error", text: "ERROR: Message too long" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const trimmedWebsite = website().trim();
      const newEntry = await createGuestEntry({
        name: trimmedName,
        message: trimmedMessage,
        website: trimmedWebsite || undefined,
      });

      if (newEntry.status === "pending_review") {
        const storedPending = localStorage.getItem("pendingGuestEntries");
        const localPending: GuestEntry[] = storedPending
          ? JSON.parse(storedPending)
          : [];
        localPending.unshift(newEntry);
        localStorage.setItem(
          "pendingGuestEntries",
          JSON.stringify(localPending)
        );

        setStatus({
          type: "success",
          text: "SENT FOR REVIEW (VISIBLE TO YOU)",
        });
      } else {
        setStatus({ type: "success", text: "ENTRY LOGGED SUCCESSFULLY" });
      }

      setEntries((prev) => [newEntry, ...prev]);
      setName("");
      setMessage("");
      setWebsite("");
      setActiveTab("list");

      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", text: "ERROR: Failed to submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = () => message().length;
  const charCountClass = () => {
    if (charCount() > MAX_MESSAGE_LENGTH) return "mobile-guest-book-char-count-error";
    if (charCount() > MAX_MESSAGE_LENGTH * 0.9)
      return "mobile-guest-book-char-count-warning";
    return "";
  };

  return (
    <div
      class="mobile-guest-book"
      classList={{ "mobile-guest-book-minimized": isMinimized() }}
    >
      <div class="mobile-guest-book-header">
        <span class="mobile-guest-book-title">GUEST TERMINAL</span>
        <button
          class="mobile-guest-book-toggle"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? "Maximize" : "Minimize"}
        >
          <span class="mobile-guest-book-toggle-icon">
            {isMinimized() ? "□" : "−"}
          </span>
        </button>
      </div>

      {!isMinimized() && (
        <div class="mobile-guest-book-body">
          <div class="mobile-guest-book-tabs">
            <button
              class="mobile-guest-book-tab"
              classList={{ "mobile-guest-book-tab-active": activeTab() === "list" }}
              onClick={() => setActiveTab("list")}
            >
              Visitor Log [{entries().length}]
            </button>
            <button
              class="mobile-guest-book-tab"
              classList={{ "mobile-guest-book-tab-active": activeTab() === "form" }}
              onClick={() => setActiveTab("form")}
            >
              Sign Book
            </button>
          </div>

          <Show when={activeTab() === "form"}>
            <div class="mobile-guest-book-form-panel">
              <Show when={status()}>
                <div
                  class={`mobile-guest-book-status ${
                    status()?.type === "success"
                      ? "mobile-guest-book-status-success"
                      : "mobile-guest-book-status-error"
                  }`}
                >
                  {status()?.text}
                </div>
              </Show>

              <form onSubmit={handleSubmit}>
                <div class="mobile-guest-book-field">
                  <label class="mobile-guest-book-label">
                    <span class="mobile-guest-book-label-icon">&gt;</span>
                    Name
                  </label>
                  <input
                    type="text"
                    class="mobile-guest-book-input"
                    placeholder="Enter your name..."
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    disabled={isSubmitting()}
                    maxLength={50}
                  />
                </div>

                <div class="mobile-guest-book-field">
                  <label class="mobile-guest-book-label">
                    <span class="mobile-guest-book-label-icon">&gt;</span>
                    Message
                  </label>
                  <textarea
                    class="mobile-guest-book-input mobile-guest-book-textarea"
                    placeholder="Leave a message..."
                    value={message()}
                    onInput={(e) => setMessage(e.currentTarget.value)}
                    disabled={isSubmitting()}
                  />
                  <div class={`mobile-guest-book-char-count ${charCountClass()}`}>
                    {charCount()}/{MAX_MESSAGE_LENGTH}
                  </div>
                </div>

                <div class="mobile-guest-book-field">
                  <label class="mobile-guest-book-label">
                    <span class="mobile-guest-book-label-icon">&gt;</span>
                    Website
                    <span class="mobile-guest-book-label-optional">(optional)</span>
                  </label>
                  <input
                    type="url"
                    class="mobile-guest-book-input"
                    placeholder="https://yoursite.com"
                    value={website()}
                    onInput={(e) => setWebsite(e.currentTarget.value)}
                    disabled={isSubmitting()}
                  />
                </div>

                <button
                  type="submit"
                  class="mobile-guest-book-submit"
                  disabled={isSubmitting() || !name().trim() || !message().trim()}
                >
                  <span class="mobile-guest-book-submit-icon">⏎</span>
                  {isSubmitting() ? "Submitting..." : "Submit Entry"}
                </button>
              </form>
            </div>
          </Show>

          <Show when={activeTab() === "list"}>
            <div class="mobile-guest-book-list-panel">
              <div class="mobile-guest-book-list">
                <Show when={isLoading()}>
                  <div class="mobile-guest-book-loading">Loading entries</div>
                </Show>

                <Show when={!isLoading() && entries().length === 0}>
                  <div class="mobile-guest-book-empty">
                    <div class="mobile-guest-book-empty-icon">📝</div>
                    <div class="mobile-guest-book-empty-text">
                      No entries yet. Be the first to sign!
                    </div>
                  </div>
                </Show>

                <Show when={!isLoading() && entries().length > 0}>
                  <For each={entries()}>
                    {(entry) => (
                      <div class="mobile-guest-book-entry">
                        <div class="mobile-guest-book-entry-header">
                          <Show
                            when={entry.website}
                            fallback={
                              <span class="mobile-guest-book-entry-name">
                                {entry.name}
                              </span>
                            }
                          >
                            <a
                              href={entry.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="mobile-guest-book-entry-name mobile-guest-book-entry-link"
                            >
                              {entry.name}
                            </a>
                          </Show>
                          <span class="mobile-guest-book-entry-time">
                            {formatRelativeTime(entry.createdAt)}
                          </span>
                        </div>
                        <div class="mobile-guest-book-entry-message">
                          {entry.message}
                          <Show when={entry.status === "pending_review"}>
                            <span class="mobile-guest-book-pending-badge">
                              [PENDING REVIEW]
                            </span>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      )}
    </div>
  );
}
