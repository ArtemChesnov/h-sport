
"use client";

import React from "react";

export function FieldErrorText(props: { message?: string }) {
  const { message } = props;
  if (!message) return null;
  return <p className="text-[11px] text-destructive">{message}</p>;
}
