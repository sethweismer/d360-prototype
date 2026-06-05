// Aetna Design System color tokens (light mode) + CVS Health Sans
const theme = {
  token: {
    // Brand & Actions
    colorPrimary: '#004D99',         // action-default (cobalt-70) — buttons, links
    colorInfo: '#002B57',            // info (cobalt-90)
    colorSuccess: '#118738',         // positive (green-60)
    colorWarning: '#B26000',         // warning (orange-70)
    colorError: '#DB3321',           // negative (red-60)
    colorLink: '#004D99',            // action-default
    colorLinkHover: '#013F7C',       // action-hover (cobalt-80)
    colorLinkActive: '#0066CC',      // action-active (cobalt-60)

    // Backgrounds
    colorBgLayout: '#F9F7F5',        // page (gray-2)
    colorBgContainer: '#FFFFFF',     // container (gray-0)
    colorBgElevated: '#FFFFFF',      // container
    colorBgSpotlight: '#F2EFEB',     // section (gray-5)

    // Text / Content
    colorText: '#1A1A19',            // content-default (gray-95)
    colorTextSecondary: '#5E5D5A',   // content-variant (gray-70)
    colorTextTertiary: '#767471',    // gray-60
    colorTextDisabled: '#474644',    // content-disabled (gray-80)

    // Borders
    colorBorder: '#DBD8D5',          // border-decorative (gray-10)
    colorBorderSecondary: '#DBD8D5', // border-decorative
    colorSplit: '#DBD8D5',           // dividers

    // General
    borderRadius: 4,
    fontFamily: '"CVS Health Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#F9F7F5',
    },
    Menu: {
      itemBg: '#FFFFFF',
      itemSelectedBg: '#E6F3FF',       // cobalt-5
      itemSelectedColor: '#004D99',    // action-default
      itemHoverBg: '#F2EFEB',          // section (gray-5)
      itemColor: '#1A1A19',            // content-default
    },
    Table: {
      headerBg: '#F2EFEB',           // section (gray-5)
      headerColor: '#1A1A19',        // content-default
      rowHoverBg: '#F9F7F5',         // page (gray-2)
      borderColor: '#DBD8D5',        // border-decorative
      fontSize: 13,
    },
    Card: {
      colorBorderSecondary: '#DBD8D5',
    },
    Button: {
      colorPrimary: '#004D99',       // action-default
      colorPrimaryHover: '#013F7C',  // action-hover
      colorPrimaryActive: '#0066CC', // action-active
    },
    Input: {
      colorBorder: '#8F8C89',        // border-interaction (gray-50)
      hoverBorderColor: '#004D99',   // action-default
      activeBorderColor: '#0066CC',  // action-active
    },
    Select: {
      colorBorder: '#8F8C89',        // border-interaction
      hoverBorderColor: '#004D99',
      activeBorderColor: '#0066CC',
    },
    DatePicker: {
      colorBorder: '#8F8C89',
      hoverBorderColor: '#004D99',
      activeBorderColor: '#0066CC',
    },
    Switch: {
      colorPrimary: '#004D99',
      colorPrimaryHover: '#013F7C',
    },
    Descriptions: {
      labelBg: '#F2EFEB',            // section (gray-5)
    },
    Collapse: {
      headerBg: '#F9F7F5',           // page (gray-2)
    },
    Statistic: {
      colorTextDescription: '#5E5D5A', // content-variant
    },
    Breadcrumb: {
      separatorColor: '#8F8C89',     // border-interaction
    },
    Tag: {
      defaultBg: '#F2EFEB',          // section (gray-5)
      defaultColor: '#1A1A19',       // content-default
    },
  },
};

export default theme;
