/**
 * Clerk Appearance Configuration
 * Matches the CrowdFund landing page theme: black bg with indigo accents,
 * rounded-full buttons, white text, subtle borders.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: "#6366F1",           // Indigo-500
    colorBackground: "#000000",        // Black
    colorInputBackground: "rgba(255,255,255,0.06)", // White/6%
    colorText: "#FFFFFF",              // White
    colorTextSecondary: "rgba(255,255,255,0.6)",    // White/60
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorInputText: "#FFFFFF",
    colorDanger: "#EF4444",
    colorSuccess: "#22C55E",
    // Base (md) radius. Clerk SCALES this per element (lg x1.35, xl x2.7, 2xl x3.35),
    // so a huge value like 999px turns large panels into giant circles.
    borderRadius: "0.75rem",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontSize: "0.9375rem",
    spacingUnit: "1rem",
    fontFamilyButtons: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  elements: {
    // ─── Card / Modal Container ───
    card: {
      background: "rgba(0,0,0,0.85)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "1.5rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      backdropFilter: "blur(40px)",
      // Clips the absolutely-positioned "Secured by Clerk" badge that
      // Clerk hangs off the card edge (it has no styleable class).
      overflow: "hidden",
    },
    rootBox: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
      width: "auto",
      minHeight: "auto",
    },
    page: {
      backgroundColor: "rgba(0,0,0,0.8)",
      minHeight: "100vh",
      borderRadius: "1.5rem",
    },

    // ─── Form Fields ───
    formFieldInput: {
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      borderRadius: "0.75rem",
      padding: "0.75rem 1rem",
      fontSize: "0.9375rem",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
      outline: "none",
      "::placeholder": { color: "rgba(255,255,255,0.4)" },
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.2)",
      },
    },
    formFieldLabel: {
      color: "rgba(255,255,255,0.7)",
      fontSize: "0.8125rem",
      fontWeight: 500,
      marginBottom: "0.375rem",
    },
    formFieldRow: {
      marginBottom: "1.125rem",
    },

    // ─── Primary Button (Continue, etc.) ───
    formButtonPrimary: {
      backgroundColor: "#6366F1",
      color: "#FFFFFF",
      borderRadius: "9999px",
      padding: "0.75rem 1.5rem",
      fontSize: "0.9375rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      transition: "background-color 150ms ease, box-shadow 150ms ease",
      boxShadow: "none",
      border: "none",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#818CF8",
        boxShadow: "none",
      },
      "&:active": {
        backgroundColor: "#4F46E5",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },

    // ─── Social / OAuth Buttons ───
    socialButtonsBlockButton: {
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      borderRadius: "9999px",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      transition: "background-color 150ms ease, border-color 150ms ease",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderColor: "rgba(255,255,255,0.2)",
      },
    },

    socialButtonsIconButton: {
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      borderRadius: "9999px",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.1)",
      },
    },
    socialButtonsProviderIcon__github: {
      filter: "invert(1)",
    },

    // ─── Divider ───
    dividerLine: {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    dividerText: {
      color: "rgba(255,255,255,0.4)",
      fontSize: "0.8125rem",
    },

    // ─── Links ───
    footerActionLink: {
      color: "#A5B4FC",
      fontWeight: 500,
      fontSize: "0.875rem",
      transition: "color 150ms ease",
      "&:hover": {
        color: "#C7D2FE",
      },
    },
    actionLink: {
      color: "#A5B4FC",
      fontWeight: 500,
      "&:hover": {
        color: "#C7D2FE",
      },
    },

    // ─── Header ───
    headerTitle: {
      color: "#FFFFFF",
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    headerSubtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "0.875rem",
      fontWeight: 400,
    },

    // ─── Navbar ───
    navbar: {
      backgroundColor: "rgba(255,255,255,0.03)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      // Override Clerk's border-radius inheritance so the nav rail stays rectangular.
      borderRadius: "0",
      overflow: "hidden",
    },
    navbarButton: {
      color: "rgba(255,255,255,0.6)",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.06)",
        color: "#FFFFFF",
      },
    },
    navbarButtonActive: {
      color: "#FFFFFF",
      backgroundColor: "rgba(99,102,241,0.2)",
    },

    // ─── OTP / Code Input ───
    otpCodeFieldInput: {
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      borderRadius: "0.75rem",
      fontSize: "1.25rem",
      fontWeight: 600,
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.2)",
      },
    },

    // ─── Checkboxes / Switches ───
    formFieldCheckboxInput: {
      accentColor: "#6366F1",
    },
    switchButton: {
      backgroundColor: "rgba(255,255,255,0.1)",
      "&:checked": {
        backgroundColor: "#6366F1",
      },
    },

    // ─── Alerts / Errors ───
    alertBox: {
      backgroundColor: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#FCA5A5",
      borderRadius: "0.75rem",
    },
    alertText: {
      color: "#FFFFFF",
    },

    // ─── Footer ───
    footer: {
      backgroundColor: "transparent",
    },
    footerAction: {
      color: "rgba(255,255,255,0.5)",
    },

    // ─── Verification Code ───
    verificationCodeFieldInput: {
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.2)",
      },
    },

    // ─── Badges ───
    // NOTE: the "Secured by Clerk" branding badge has NO element class; it is
    // hidden via globals.css (attribute selector on its inner clerk.com link).
    badge: {
      display: "none",
    },

    // ─── User Button (Avatar / Popover) ───
    userButtonAvatarBox: {
      width: 36,
      height: 36,
      borderRadius: "9999px",
      border: "2px solid rgba(255,255,255,0.1)",
    },
    userButtonPopoverCard: {
      backgroundColor: "rgba(0,0,0,0.9)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "0.75rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      color: "#FFFFFF",
      backdropFilter: "blur(40px)",
    },
    userButtonPopoverActionButton: {
      color: "#FFFFFF",
      borderRadius: "0.5rem",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.06)",
      },
    },
    userButtonPopoverActionButtonText: {
      color: "inherit",
      fontSize: "0.875rem",
    },
    userButtonPopoverFooter: {
      display: "none",
      color: "rgba(255,255,255,0.5)",
      borderTop: "1px solid rgba(255,255,255,0.1)",
    },

    // ─── Profile Page ───
    profilePage: {
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    profileSectionPrimaryButton: {
      backgroundColor: "rgba(255,255,255,0.06)",
      color: "#FFFFFF",
      borderRadius: "0.375rem",
      border: "1px solid rgba(255,255,255,0.1)",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.1)",
      },
    },

    // ─── Modal / Overlay ───
    modalBackdrop: {
      backgroundColor: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
    },
    modalContent: {},

    // ─── Button Arrow ───
    socialButtonsBlockButtonArrow: {
      color: "rgba(255,255,255,0.4)",
    },

    // ─── Form Reset Password ───
    formResendCodeLink: {
      color: "#A5B4FC",
      fontSize: "0.8125rem",
      "&:hover": {
        color: "#C7D2FE",
      },
    },

    // ─── Hide Help Link ───
    footerAction__getHelp: {
      display: "none",
    },

    // ─── Checkbox / Password Toggle ───
    formFieldLabelRow: {
      color: "rgba(255,255,255,0.7)",
    },
    formFieldInputShowPasswordButton: {
      color: "rgba(255,255,255,0.4)",
      "&:hover": {
        color: "rgba(255,255,255,0.7)",
      },
    },

    // ─── Breadcrumbs ───
    breadcrumbs: {
      color: "rgba(255,255,255,0.4)",
    },
    breadcrumbsItem: {
      color: "rgba(255,255,255,0.6)",
    },
    breadcrumbsItemDivider: {
      color: "rgba(255,255,255,0.2)",
    },
    breadcrumbsItemActive: {
      color: "#A5B4FC",
    },
  },
};

export default clerkAppearance;
