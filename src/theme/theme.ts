export const theme = {
  colors: {
    backgroundTop: "#F8FBFF",
    backgroundBottom: "#EEF7FF",

    surface: "#FFFFFF",
    surfaceMuted: "#F7F9FC",

    text: "#111827",
    textSecondary: "#536176",
    textMuted: "#8491A5",

    border: "#E3E9F1",

    primary: "#0784F9",
    primarySoft: "#E7F2FF",

    success: "#00B978",
    successSoft: "#E4F9F1",

    danger: "#FF334F",
    dangerSoft: "#FFE8ED",

    warning: "#F5A400",
    warningSoft: "#FFF4D7",

    progressTrack: "#CBD8E7"
  },

  radius: {
    small: 12,
    medium: 16,
    large: 22,
    extraLarge: 28,
    pill: 999
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24
  },

  shadow: {
    card: {
      shadowColor: "#41516B",
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.045,
      shadowRadius: 11,
      elevation: 1
    },

    tabBar: {
      shadowColor: "#41516B",
      shadowOffset: {
        width: 0,
        height: 5
      },
      shadowOpacity: 0.09,
      shadowRadius: 15,
      elevation: 7
    }
  }
} as const;
