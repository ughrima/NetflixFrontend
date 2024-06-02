import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

export function parseCookies(req: IncomingMessage): { [key: string]: string } {
  return cookie.parse(req.headers.cookie || '');
}

function setServerSessionCookie(res: ServerResponse, sessionId: string): void {
  const serializedCookie = cookie.serialize('session_id', sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  res.setHeader('Set-Cookie', serializedCookie);
}

export function getSessionId(req: IncomingMessage, res: ServerResponse): string {
  const cookies = parseCookies(req);
  let sessionId = cookies.session_id;

  if (!sessionId) {
    sessionId = uuidv4();
    setServerSessionCookie(res, sessionId);
  }

  return sessionId;
}
