export type ThemeMode = "system" | "light" | "dark";

export type ResolvedThemeMode = "light" | "dark";

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type AppTheme = {
  colors: {
    backgroundTop: string;
    backgroundBottom: string;

    surface: string;
    surfaceMuted: string;
    surfaceElevated: string;

    text: string;
    textSecondary: string;
    textMuted: string;

    border: string;

    primary: string;
    primarySoft: string;

    success: string;
    successSoft: string;

    danger: string;
    dangerSoft: string;

    warning: string;
    warningSoft: string;

    progressTrack: string;

    onPrimary: string;
    subtitle: string;
    iconSurface: string;
    tabBarBorder: string;
    tabBarBackground: string;
    modalBackdrop: string;
  };

  radius: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    pill: number;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  shadow: {
    card: ShadowStyle;
    tabBar: ShadowStyle;
  };
};

const radius = {
  small: 12,
  medium: 16,
  large: 22,
  extraLarge: 28,
  pill: 999
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24
};

export const lightTheme: AppTheme = {
  colors: {
    backgroundTop: "#F8FBFF",
    backgroundBottom: "#EEF7FF",

    surface: "#FFFFFF",
    surfaceMuted: "#F7F9FC",
    surfaceElevated: "#FFFFFF",

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

    progressTrack: "#CBD8E7",

    onPrimary: "#FFFFFF",
    subtitle: "#49678F",
    iconSurface: "rgba(255,255,255,0.68)",
    tabBarBorder: "#D3D9E2",
    tabBarBackground: "rgba(255,255,255,0.76)",
    modalBackdrop: "rgba(8,18,40,0.44)"
  },

  radius,

  spacing,

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
};

export const darkTheme: AppTheme = {
  colors: {
    backgroundTop: "#07111F",
    backgroundBottom: "#0B1728",

    surface: "#101E31",
    surfaceMuted: "#0C192A",
    surfaceElevated: "#14243A",

    text: "#F3F7FC",
    textSecondary: "#A9B9CC",
    textMuted: "#74879F",

    border: "#233750",

    primary: "#45A0FF",
    primarySoft: "#102E4F",

    success: "#2BD69D",
    successSoft: "#0D332B",

    danger: "#FF6075",
    dangerSoft: "#3A1722",

    warning: "#F7B84B",
    warningSoft: "#3A2C10",

    progressTrack: "#263B55",

    onPrimary: "#FFFFFF",
    subtitle: "#91A9C5",
    iconSurface: "rgba(255,255,255,0.06)",
    tabBarBorder: "#29415F",
    tabBarBackground: "rgba(12,25,42,0.86)",
    modalBackdrop: "rgba(0,5,14,0.68)"
  },

  radius,

  spacing,

  shadow: {
    card: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 5
      },
      shadowOpacity: 0.18,
      shadowRadius: 13,
      elevation: 3
    },

    tabBar: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 6
      },
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 9
    }
  }
};

/**
 * Compatibilidade temporária com as telas que ainda não foram
 * migradas para o ThemeProvider.
 *
 * Conforme migrarmos o aplicativo, os componentes passarão a usar
 * useAppTheme() diretamente.
 */
export const theme = lightTheme;
