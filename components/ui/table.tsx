import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, TableHTMLAttributes } from "react";

export function Table(props: TableHTMLAttributes<HTMLTableElement>) { return <table {...props} className={`ui-table${props.className ? ` ${props.className}` : ""}`} />; }
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} />; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) { return <tr {...props} />; }
export function TableHead(props: ThHTMLAttributes<HTMLTableCellElement>) { return <th {...props} />; }
export function TableCell(props: TdHTMLAttributes<HTMLTableCellElement>) { return <td {...props} />; }
