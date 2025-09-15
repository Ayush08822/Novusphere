import type { TAuthConfig, TRefreshTokenExpiredEvent } from "react-oauth2-code-pkce"

export const authConfig: TAuthConfig = {
  clientId: 'OnlineCourseClient',
  authorizationEndpoint: 'http://localhost:7080/realms/OnlineCourseRealm/protocol/openid-connect/auth',
  tokenEndpoint: 'http://localhost:7080/realms/OnlineCourseRealm/protocol/openid-connect/token',
  redirectUri: 'http://localhost:5173',
  scope: 'profile email openid',
  logoutEndpoint: 'http://localhost:7080/realms/OnlineCourseRealm/protocol/openid-connect/logout',
  autoLogin: true,
  onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => event.logIn(undefined, undefined, "popup"),
};
