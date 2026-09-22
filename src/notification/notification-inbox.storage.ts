import * as SecureStore from "expo-secure-store";

export type NotificationInboxItem = {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  expenseId: string | null;
  dueDate: string | null;
  read: boolean;
};

const MAX_INBOX_ITEMS = 40;

const STORAGE_PREFIX = "finance.notification-inbox.v1";

let mutationQueue: Promise<void> = Promise.resolve();

export async function loadNotificationInbox(userId: string): Promise<NotificationInboxItem[]> {
  if (!userId) {
    return [];
  }

  const ids = await loadNotificationIndex(userId);

  const entries = await Promise.all(
    ids.map(async (id) => {
      const raw = await SecureStore.getItemAsync(getItemStorageKey(userId, id));

      if (!raw) {
        return null;
      }

      try {
        const parsed: unknown = JSON.parse(raw);

        return isNotificationInboxItem(parsed) ? parsed : null;
      } catch {
        return null;
      }
    })
  );

  return entries
    .filter((item): item is NotificationInboxItem => item !== null)
    .sort(
      (left, right) => new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime()
    );
}

export async function getUnreadNotificationInboxCount(userId: string): Promise<number> {
  const items = await loadNotificationInbox(userId);

  return items.filter((item) => !item.read).length;
}

export function upsertNotificationInboxItem(
  userId: string,
  item: NotificationInboxItem
): Promise<void> {
  if (!userId) {
    return Promise.resolve();
  }

  return enqueueMutation(async () => {
    const index = await loadNotificationIndex(userId);

    const itemKey = getItemStorageKey(userId, item.id);

    const existingRaw = await SecureStore.getItemAsync(itemKey);

    let existing: NotificationInboxItem | null = null;

    if (existingRaw) {
      try {
        const parsed: unknown = JSON.parse(existingRaw);

        if (isNotificationInboxItem(parsed)) {
          existing = parsed;
        }
      } catch {
        existing = null;
      }
    }

    const nextItem: NotificationInboxItem = {
      ...item,
      read: item.read || existing?.read === true
    };

    await SecureStore.setItemAsync(itemKey, JSON.stringify(nextItem));

    const nextIndex = [item.id, ...index.filter((id) => id !== item.id)];

    const retainedIds = nextIndex.slice(0, MAX_INBOX_ITEMS);

    const removedIds = nextIndex.slice(MAX_INBOX_ITEMS);

    await SecureStore.setItemAsync(getIndexStorageKey(userId), JSON.stringify(retainedIds));

    await Promise.all(
      removedIds.map((id) => SecureStore.deleteItemAsync(getItemStorageKey(userId, id)))
    );
  });
}

export function markNotificationInboxItemRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) {
    return Promise.resolve();
  }

  return enqueueMutation(async () => {
    const key = getItemStorageKey(userId, notificationId);

    const raw = await SecureStore.getItemAsync(key);

    if (!raw) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isNotificationInboxItem(parsed) || parsed.read) {
        return;
      }

      await SecureStore.setItemAsync(
        key,
        JSON.stringify({
          ...parsed,
          read: true
        })
      );
    } catch {
      return;
    }
  });
}

export function markAllNotificationInboxItemsRead(userId: string): Promise<void> {
  if (!userId) {
    return Promise.resolve();
  }

  return enqueueMutation(async () => {
    const items = await loadNotificationInbox(userId);

    await Promise.all(
      items
        .filter((item) => !item.read)
        .map((item) =>
          SecureStore.setItemAsync(
            getItemStorageKey(userId, item.id),
            JSON.stringify({
              ...item,
              read: true
            })
          )
        )
    );
  });
}

async function loadNotificationIndex(userId: string): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(getIndexStorageKey(userId));

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    return [];
  }

  return [];
}

function getIndexStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}.${sanitizeKeyPart(userId)}.index`;
}

function getItemStorageKey(userId: string, notificationId: string): string {
  return `${STORAGE_PREFIX}.${sanitizeKeyPart(userId)}.item.${sanitizeKeyPart(notificationId)}`;
}

function sanitizeKeyPart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}

function enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);

  mutationQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
}

function isNotificationInboxItem(value: unknown): value is NotificationInboxItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    typeof item.receivedAt === "string" &&
    (typeof item.expenseId === "string" || item.expenseId === null) &&
    (typeof item.dueDate === "string" || item.dueDate === null) &&
    typeof item.read === "boolean"
  );
}
