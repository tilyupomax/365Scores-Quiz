"use client";

import { useEffect } from "react";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error boundary captured an error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-center dark:bg-black">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred while loading this page.
        </p>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          You can try again or head back to the home screen.
        </p>
        {error.digest ? <p className="text-sm text-zinc-400">Error code: {error.digest}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
