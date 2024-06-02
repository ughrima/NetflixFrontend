import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

export function parseCookies(req?: IncomingMessage): { [key: string]: string } {
  return cookie.parse(req ? req.headers.cookie || '' : document.cookie);
}

export function setSessionCookie(res: ServerResponse, sessionId: string): void {
  const serializedCookie = cookie.serialize('session_id', sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60,   // 1 hour
    path: '/',
  });

  res.setHeader('Set-Cookie', serializedCookie);
}

export function getSessionId(req: IncomingMessage, res: ServerResponse): string {
  const cookies = parseCookies(req);
  let sessionId = cookies.session_id;

  if (!sessionId) {
    sessionId = uuidv4();
    setSessionCookie(res, sessionId);
  }

  return sessionId;
}
