import { NextResponse } from "next/server";

export function authError(
  status: 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503,
  code: string,
  message: string,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    { error: true, code, message },
    { status, headers },
  );
}
