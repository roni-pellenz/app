import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import {
  loadNotificationInbox,
  markAllNotificationInboxItemsRead,
  markNotificationInboxItemRead,
  type NotificationInboxItem
} from "@/notification/notification-inbox.storage";
import {
  recordExpenseNotificationInInbox,
  syncNotificationInboxFromPresented
} from "@/notification/notification-inbox.service";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

export default function NotificationInboxScreen() {
  const { user } = useAuth();

  const { theme } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [items, setItems] = useState<NotificationInboxItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((item) => !item.read).length;

  const refresh = useCallback(
    async (showLoading = false): Promise<void> => {
      if (!user?.id) {
        setItems([]);
        setLoading(false);

        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        await syncNotificationInboxFromPresented(user.id);

        const stored = await loadNotificationInbox(user.id);

        setItems(stored);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      void refresh(true);

      return undefined;
    }, [refresh])
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      void recordExpenseNotificationInInbox(user.id, notification)
        .then(() => refresh(false))
        .catch(() => undefined);
    });

    return () => {
      subscription.remove();
    };
  }, [user?.id, refresh]);

  async function handleItemPress(item: NotificationInboxItem): Promise<void> {
    if (!user?.id) {
      return;
    }

    try {
      await markNotificationInboxItemRead(user.id, item.id);

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                read: true
              }
            : currentItem
        )
      );
    } catch {
      // A navegação não depende
      // da persistência do estado de leitura.
    }

    if (item.expenseId) {
      router.push({
        pathname: "/expenses/[id]",
        params: {
          id: item.expenseId
        }
      });
    }
  }

  async function handleMarkAllRead(): Promise<void> {
    if (!user?.id || unreadCount === 0 || markingAll) {
      return;
    }

    setMarkingAll(true);

    try {
      await markAllNotificationInboxItemsRead(user.id);

      setItems((current) =>
        current.map((item) => ({
          ...item,
          read: true
        }))
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.navigation}>
          <Pressable
            onPress={() => {
              router.back();
            }}
            hitSlop={10}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={27} color={theme.colors.primary} />

            <Text style={styles.backText}>Home</Text>
          </Pressable>

          {unreadCount > 0 ? (
            <Pressable
              disabled={markingAll}
              onPress={() => {
                void handleMarkAllRead();
              }}
              hitSlop={8}
            >
              {markingAll ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.markAllText}>Marcar lidas</Text>
              )}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.header}>
          <View style={styles.heroIcon}>
            <Ionicons name="notifications-outline" size={33} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>Notificações</Text>

          <Text style={styles.subtitle}>Lembretes recebidos neste aparelho.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={31} color={theme.colors.textMuted} />
            </View>

            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>

            <Text style={styles.emptyText}>
              Quando o Finance enviar um lembrete de despesa, ele aparecerá aqui.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  void handleItemPress(item);
                }}
                style={({ pressed }) => [
                  styles.notificationCard,
                  !item.read && styles.notificationCardUnread,
                  pressed && styles.notificationCardPressed
                ]}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !item.read && styles.notificationTitleUnread
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.notificationBody}>{item.body}</Text>

                  <Text style={styles.notificationDate}>
                    {formatNotificationDate(item.receivedAt)}
                  </Text>
                </View>

                {item.expenseId ? (
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                ) : null}
              </Pressable>
            ))}

            <Text style={styles.footerText}>
              Esta central mantém os lembretes do Finance associados à sua conta neste aparelho.
            </Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  const hour = String(date.getHours()).padStart(2, "0");

  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} às ${hour}:${minute}`;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.backgroundTop
    },

    root: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.backgroundTop
    },

    navigation: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center"
    },

    backText: {
      marginLeft: -3,
      fontSize: 17,
      fontWeight: "600",
      color: theme.colors.primary
    },

    markAllText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary
    },

    header: {
      alignItems: "center",
      marginTop: 18,
      marginBottom: 24
    },

    heroIcon: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      backgroundColor: theme.colors.primarySoft
    },

    title: {
      marginTop: 13,
      fontSize: 27,
      lineHeight: 33,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      color: theme.colors.textSecondary
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: 100
    },

    emptyIcon: {
      width: 64,
      height: 64,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted
    },

    emptyTitle: {
      marginTop: 15,
      fontSize: 17,
      fontWeight: "800",
      color: theme.colors.text
    },

    emptyText: {
      marginTop: 6,
      maxWidth: 290,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: theme.colors.textSecondary
    },

    listContent: {
      paddingBottom: 36,
      gap: 10
    },

    notificationCard: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    },

    notificationCardUnread: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceElevated
    },

    notificationCardPressed: {
      opacity: 0.7
    },

    notificationIcon: {
      width: 43,
      height: 43,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      backgroundColor: theme.colors.primarySoft
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
      marginRight: 8
    },

    notificationHeader: {
      flexDirection: "row",
      alignItems: "center"
    },

    notificationTitle: {
      flex: 1,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      color: theme.colors.text
    },

    notificationTitleUnread: {
      fontWeight: "800"
    },

    unreadDot: {
      width: 8,
      height: 8,
      marginLeft: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary
    },

    notificationBody: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.textSecondary
    },

    notificationDate: {
      marginTop: 6,
      fontSize: 10,
      lineHeight: 14,
      color: theme.colors.textMuted
    },

    footerText: {
      marginTop: 7,
      paddingHorizontal: 16,
      fontSize: 10,
      lineHeight: 15,
      textAlign: "center",
      color: theme.colors.textMuted
    }
  });
}
