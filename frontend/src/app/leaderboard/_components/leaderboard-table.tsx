"use client";

import type { LeaderboardEntry } from "@/api/leaderboard";

import { useRef } from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib";

const ROW_HEIGHT = 56;
const VIRTUALIZATION_OVERSCAN = 8;

const columnHelper = createColumnHelper<LeaderboardEntry>();

const columns: ColumnDef<LeaderboardEntry, string>[] = [
  columnHelper.accessor("rank", {
    id: "rank",
    header: () => "#",
    cell: (info) => `#${info.getValue()}`,
  }),
  columnHelper.accessor("userId", {
    id: "userId",
    header: () => "Player",
    cell: (info) => (
      <span className="block max-w-[16rem] truncate font-mono text-xs text-zinc-600 dark:text-zinc-300">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("score", {
    id: "score",
    header: () => "Score",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("achievedAt", {
    id: "achievedAt",
    header: () => "Achieved",
    cell: (info) => formatTimestamp(info.getValue()),
  }),
];

const headerClassNames: Record<string, string> = {
  rank: "px-4 py-3",
  userId: "px-4 py-3",
  score: "px-4 py-3 text-right",
  achievedAt: "px-4 py-3 text-right",
};

const cellClassNames: Record<string, string> = {
  rank: "whitespace-nowrap px-4 py-3 font-semibold",
  userId: "px-4 py-3",
  score: "px-4 py-3 text-right font-semibold text-zinc-800 dark:text-zinc-100",
  achievedAt: "px-4 py-3 text-right text-xs text-zinc-500 dark:text-zinc-300",
};

const stickyHeaderClassName =
  "sticky top-0 z-10 bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300";

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  isLoading: boolean;
};

export function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  "use no memo";

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: VIRTUALIZATION_OVERSCAN,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950/60">
      <div ref={scrollContainerRef} className="max-h-[480px] overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className={stickyHeaderClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(headerClassNames[header.column.id])}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-300"
                >
                  Syncing latest scores...
                </td>
              </tr>
            ) : tableRows.length > 0 ? (
              <>
                {paddingTop > 0 ? (
                  <tr className="border-none">
                    <td colSpan={columns.length} style={{ height: paddingTop }} />
                  </tr>
                ) : null}
                {virtualRows.map((virtualRow) => {
                  const row = tableRows[virtualRow.index];
                  const isFirstRow = row.index === 0;

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                        !isFirstRow && "border-t border-zinc-100 dark:border-zinc-800",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className={cn(cellClassNames[cell.column.id])}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr className="border-none">
                    <td colSpan={columns.length} style={{ height: paddingBottom }} />
                  </tr>
                ) : null}
              </>
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-300"
                >
                  Be the first to appear on the leaderboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
