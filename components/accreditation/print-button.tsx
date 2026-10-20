"use client";

export function PrintButton() {
  return <button type="button" className="ui-button ui-button-primary gh-noprint" onClick={() => window.print()}>Print or save as PDF</button>;
}
