import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Mini SaaS | Project workspace</title>
        <meta
          name="description"
          content="Manage your team's projects, deadlines, and budgets in one workspace."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Mini SaaS
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Your projects, in one place.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Keep deadlines, budgets, and assignments clear with a shared project
            workspace.
          </p>
        </section>
      </main>
    </>
  );
}
