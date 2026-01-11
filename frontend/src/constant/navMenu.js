import {
  HOME_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  RESET_PASSWORD_ROUTE,
} from "./routes";

/**
 * Main Navigation Menu (Public + Private)
 */
const navMenu = [
  {
    route: HOME_ROUTE,
    label: "Home",
    access: "public", // visible to everyone
  },
  {
    route: DASHBOARD_ROUTE,
    label: "Dashboard",
    access: "private", // only logged-in users
  },
];

/**
 * Authentication Menu
 */
const authMenu = [
  {
    route: LOGIN_ROUTE,
    label: "Login",
  },
  {
    route: REGISTER_ROUTE,
    label: "Register",
  },
  {
    route: RESET_PASSWORD_ROUTE,
    label: "Reset Password",
  },
];

export {
    navMenu,
    authMenu
}