/**
 * Clerk Appearance Configuration
 * Matches the Crowdfund dark navy + indigo theme using Clerk's official
 * `appearance` API (variables + elements). No overlays or hacks.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: "#63b6f100",
    colorBackground: "#111A2E",
    colorInputBackground: "#17213A",
    colorText: "#f8fafc",
    colorTextSecondary: "#CBD5E1",
    colorTextOnPrimaryBackground: "#000000e8",
    colorInputText: "#F8FAFC",
    colorDanger: "#EF4444",
    colorSuccess: "#22C55E",
    borderRadius: "0.75rem",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontSize: "0.9375rem",
    spacingUnit: "1rem",
    fontFamilyButtons: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  elements: {
    // ─── Card / Box ───
    card: {
      background: "#111a2ea6",
      border: "1px solid #263451",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      backdropFilter: "blur(40px)",
    },
    rootBox: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
      width: "auto",
      minHeight: "auto",
    },
    // Full-page auth uses this element
    page: {
      backgroundColor: "#080d1a00",
      minHeight: "100vh",
    },

    // ─── Form fields ───
    formFieldInput: {
      backgroundColor: "#17213A",
      border: "1px solid #263451",
      color: "#F8FAFC",
      borderRadius: "0.75rem",
      padding: "0.625rem 0.875rem",
      fontSize: "0.9375rem",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
      outline: "none",
      "::placeholder": { color: "#64748B" },
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
      },
    },
    formFieldLabel: {
      color: "#CBD5E1",
      fontSize: "0.8125rem",
      fontWeight: 500,
      marginBottom: "0.375rem",
    },
    formFieldRow: {
      marginBottom: "1.125rem",
    },

    // ─── Primary button ───
    formButtonPrimary: {
      backgroundColor: "#6366F1",
      color: "#FFFFFF",
      borderRadius: "0.75rem",
      padding: "0.625rem 1rem",
      fontSize: "0.9375rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      transition: "background-color 150ms ease, box-shadow 150ms ease",
      boxShadow: "none",
      border: "none",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#4F46E5",
        boxShadow: "none",
      },
      "&:active": {
        backgroundColor: "#4338CA",
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },

    // ─── Secondary / Social buttons ───
    socialButtonsBlockButton: {
      backgroundColor: "#17213A",
      border: "1px solid #263451",
      color: "#F8FAFC",
      borderRadius: "0.75rem",
      padding: "0.5rem 0.875rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      transition: "background-color 150ms ease, border-color 150ms ease",
      "&:hover": {
        backgroundColor: "#1C2945",
        borderColor: "#3B4F7A",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#F8FAFC",
      fontWeight: 500,
    },
    socialButtonsIconButton: {
      backgroundColor: "#17213A",
      border: "1px solid #263451",
      color: "#CBD5E1",
      "&:hover": {
        backgroundColor: "#1C2945",
      },
    },
    socialButtonsProviderIcon__github: {
      filter: "invert(1)",
    },

    // ─── Divider ───
    dividerLine: {
      backgroundColor: "#acb0b8",
    },
    dividerText: {
      color: "#64748B",
      fontSize: "0.8125rem",
    },

    // ─── Links ───
    footerActionLink: {
      color: "#818CF8",
      fontWeight: 500,
      fontSize: "0.875rem",
      transition: "color 150ms ease",
      "&:hover": {
        color: "#A5B4FC",
      },
    },
    actionLink: {
      color: "#818CF8",
      fontWeight: 500,
      "&:hover": {
        color: "#A5B4FC",
      },
    },

    // ─── Header ───
    headerTitle: {
      color: "#F8FAFC",
      fontSize: "1.375rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    headerSubtitle: {
      color: "#94A3B8",
      fontSize: "0.875rem",
      fontWeight: 400,
    },

    // ─── Navbar (if present in multipage) ───
    navbar: {
      backgroundColor: "#13275b9f",
      borderBottom: "1px solid #263451",
      borderRadius: "30px",
    },
    navbarButton: {
      color: "#CBD5E1",
      "&:hover": {
        backgroundColor: "#1C2945",
        color: "#F8FAFC",
      },
    },
    navbarButtonActive: {
      color: "#818CF8",
      backgroundColor: "rgba(99,102,241,0.12)",
    },

    // ─── OTP / Code input ───
    otpCodeFieldInput: {
      backgroundColor: "#17213A",
      border: "1px solid #263451",
      color: "#F8FAFC",
      borderRadius: "0.75rem",
      fontSize: "1.25rem",
      fontWeight: 600,
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
      },
    },

    // ─── Checkboxes / Switches ───
    formFieldCheckboxInput: {
      accentColor: "#6366F1",
    },
    switchButton: {
      backgroundColor: "#263451",
      "&:checked": {
        backgroundColor: "#6366F1",
      },
    },

    // ─── Alerts / Errors ───
    alertBox: {
      backgroundColor: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#FCA5A5",
      borderRadius: "0.75rem",
    },
    alertText: {
      color: "#fafafa",
    },

    // ─── Footer ───
    footer: {
      backgroundColor: "transparent",
    },
    footerAction: {
      color: "#94A3B8",
    },

    // ─── Form ╱ Verification ───
    verificationCodeFieldInput: {
      backgroundColor: "#17213A",
      border: "1px solid #263451",
      color: "#F8FAFC",
      "&:focus": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
      },
    },

    // ─── Identity preview / Active sessions ───
    badge: {
      backgroundColor: "rgba(0, 0, 0, 0.52)",
      color: "#818CF8",
    },

    // ─── User button ───
    userButtonAvatarBox: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "2px solid #263451",
    },
    userButtonPopoverCard: {
      backgroundColor: "#0034485a",
      border: "1px solid #263451",
      borderRadius: "0.75rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    },
    userButtonPopoverActionButton: {
      color: "#ffffff",
      borderRadius: "0.5rem",
      "&:hover": {
        backgroundColor: "#ffffff",
        color: "#0a0a0a",
      },
    },
    userButtonPopoverActionButtonText: {
      color: "inherit",
      fontSize: "0.875rem",
    },
    userButtonPopoverFooter: {
      color: "#94a3b800",
      borderTop: "1px solid #26345100",
    },

    // ─── Profile / Organization pages ───
    profilePage: {
      backgroundColor: "#080d1a02",
    },
    profileSectionPrimaryButton: {
      backgroundColor: "#6366F1",
      color: "#FFFFFF",
      borderRadius: "0.75rem",
      "&:hover": {
        backgroundColor: "#4F46E5",
      },
    },

    // ─── Modal / Overlay ───
    modalBackdrop: {
      backgroundColor: "rgba(2, 2, 2, 0.45)",
      backdropFilter: "blur(10px)",
    },
    modalContent: {
     
     
    },

    // ─── Block / OAuth button text alignment ───
    socialButtonsBlockButtonArrow: {
      color: "#94A3B8",
    },

    // ─── Form reset password ───
    formResendCodeLink: {
      color: "#818CF8",
      fontSize: "0.8125rem",
      "&:hover": {
        color: "#A5B4FC",
      },
    },

    // ─── Remove Clerk watermark/branding ───
    poweredByClerk: {
      display: "none",
    },
    logoBox: {
      display: "none",
    },
    clerkBadge: {
      display: "none",
    },
    footerAction__getHelp: {
      display: "none",
    },

    // ─── Checkbox label ───
    formFieldLabelRow: {
      color: "#CBD5E1",
    },
    formFieldInputShowPasswordButton: {
      color: "#94A3B8",
      "&:hover": {
        color: "#CBD5E1",
      },
    },

    // ─── Breadcrumbs (multipage) ───
    breadcrumbs: {
      color: "#94A3B8",
    },
    breadcrumbsItem: {
      color: "#CBD5E1",
    },
    breadcrumbsItemDivider: {
      color: "#3B4F7A",
    },
    breadcrumbsItemActive: {
      color: "#818CF8",
    },
  },
};

export default clerkAppearance;
