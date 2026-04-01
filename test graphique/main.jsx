import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DataToolbar from "./SortdialogJSX.jsx";

function Documentation() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-16 mb-24 px-6 text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Data Table &mdash; Permissions, Filters &amp; Views</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">Interactive prototype of an ERP-style data toolbar with role-based access control.</p>

      {/* Roles */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
          Roles
        </h2>
        <p className="mb-3">The toolbar simulates 3 hierarchical roles. Use the role switcher at the top to preview what each role sees.</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead><tr className="bg-zinc-50 dark:bg-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 font-semibold">Role</th><th className="px-4 py-2 font-semibold">Description</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr><td className="px-4 py-2.5 font-medium">Dev</td><td className="px-4 py-2.5">Full access. Can configure all restrictions for Owner and User roles.</td></tr>
              <tr><td className="px-4 py-2.5 font-medium">Owner</td><td className="px-4 py-2.5">Can impose views on Users. Restricted by Dev rules.</td></tr>
              <tr><td className="px-4 py-2.5 font-medium">User</td><td className="px-4 py-2.5">Personal access and views only. Restricted by both Dev and Owner rules (most restrictive wins).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Views */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
          Views
        </h2>
        <p className="mb-3">Each role has its own set of view tabs:</p>
        <ul className="space-y-2 ml-1">
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Default view</strong> &mdash; Always the first tab. Personal workspace. Use <em>"Save as new view"</em> to create a copy as a personal view.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>View for all</strong> <span className="text-emerald-500">(Dev &amp; Owner only)</span> &mdash; The dedicated tab to configure what lower roles see. Filters added here are pushed as locked (non-editable) to target roles. Column access levels and filter visibility are configured exclusively in this tab.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Personal views</strong> &mdash; Created via "Save as new view" or the + button. Renamed with double-click, deleted with the X. Carry no access rules.</span></li>
        </ul>
      </section>

      {/* Save */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
          Saving
        </h2>
        <p className="mb-3">The save button adapts to the active tab:</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead><tr className="bg-zinc-50 dark:bg-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 font-semibold">Active tab</th><th className="px-4 py-2 font-semibold">Button</th><th className="px-4 py-2 font-semibold">Behavior</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr><td className="px-4 py-2.5">View for all</td><td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">Save for all</td><td className="px-4 py-2.5">Pushes filters, hidden columns and access rules to lower roles&rsquo; default views. Disabled when no changes.</td></tr>
              <tr><td className="px-4 py-2.5">Default view</td><td className="px-4 py-2.5 font-medium">Save as new view</td><td className="px-4 py-2.5">Creates a copy of the current view as a personal view.</td></tr>
              <tr><td className="px-4 py-2.5">Personal view</td><td className="px-4 py-2.5 font-medium">Save</td><td className="px-4 py-2.5">Saves changes to the current view. Disabled when no changes.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block" />
          Filters
        </h2>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-2">Simple filters</h3>
        <p className="mb-3">Click <em>Filter</em>, pick a column, then an operator and value via cascading dropdowns. The filter chip appears in the toolbar and applies immediately. Operators adapt to the column type (text, number, date, select, checkbox, tags, user).</p>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-2">Advanced filters</h3>
        <p className="mb-3">Click <em>Advanced filter</em> in the filter dropdown. Build groups of conditions with AND/OR logic. Conditions are applied live as you add them &mdash; no validate button needed. Empty filters are cleaned up when you close the builder.</p>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-2">Filter access levels <span className="text-xs text-zinc-400 font-normal">(View for all only)</span></h3>
        <p className="mb-3">In the <em>View for all</em> tab, each filter chip shows a colored key icon. Click it to set per-role visibility:</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead><tr className="bg-zinc-50 dark:bg-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 font-semibold">Level</th><th className="px-4 py-2 font-semibold">Key color</th><th className="px-4 py-2 font-semibold">Effect for target role</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr><td className="px-4 py-2.5">Visible</td><td className="px-4 py-2.5 text-emerald-500 font-medium">Green</td><td className="px-4 py-2.5">Filter displayed, not editable.</td></tr>
              <tr><td className="px-4 py-2.5">Restricted access</td><td className="px-4 py-2.5 text-amber-500 font-medium">Amber</td><td className="px-4 py-2.5">Hidden, user can request access.</td></tr>
              <tr><td className="px-4 py-2.5">Hidden</td><td className="px-4 py-2.5 text-red-500 font-medium">Red</td><td className="px-4 py-2.5">Filter active in background, data is pre-filtered. User doesn&rsquo;t know the filter exists.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Column access */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-pink-500 inline-block" />
          Column access levels
        </h2>
        <p className="mb-3">In the <em>View for all</em> tab, open the columns panel. Each column has a key icon to set per-role access:</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead><tr className="bg-zinc-50 dark:bg-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 font-semibold">Level</th><th className="px-4 py-2 font-semibold">Effect</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr><td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">Editable</td><td className="px-4 py-2.5">Can view and edit the column.</td></tr>
              <tr><td className="px-4 py-2.5 font-medium text-blue-600 dark:text-blue-400">Read-only</td><td className="px-4 py-2.5">Can view but not modify.</td></tr>
              <tr><td className="px-4 py-2.5 font-medium text-amber-600 dark:text-amber-400">Hidden + request</td><td className="px-4 py-2.5">Column hidden, user knows it exists and can request access.</td></tr>
              <tr><td className="px-4 py-2.5 font-medium text-red-600 dark:text-red-400">Fully hidden</td><td className="px-4 py-2.5">Column completely invisible. No notification.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">For the <strong>User</strong> role, the effective access is always the <em>most restrictive</em> between the Dev rule and the Owner rule.</p>
      </section>

      {/* Sorts */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-cyan-500 inline-block" />
          Sorting
        </h2>
        <p className="mb-3">Click <em>Sort</em> to pick a column. Multiple sort levels are supported, applied in order. Each sort chip allows:</p>
        <ul className="space-y-2 ml-1">
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Direction toggle</strong> &mdash; ascending or descending.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Custom order</strong> &mdash; for select/status/emoji columns, drag-and-drop items to define a custom sort order.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Sub-sort</strong> &mdash; email (address/domain), phone (prefix/number), file (name/extension/size), location (address/city/country).</span></li>
        </ul>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">You can also click column headers to cycle: ascending &rarr; descending &rarr; remove sort.</p>
      </section>

      {/* Columns */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
          Column management
        </h2>
        <p className="mb-3">Click the columns indicator to open the columns panel:</p>
        <ul className="space-y-2 ml-1">
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Show/Hide</strong> &mdash; toggle column visibility per view.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Reorder</strong> &mdash; drag-and-drop columns in the panel or directly in the table header.</span></li>
          <li className="flex gap-2"><span className="text-zinc-400 select-none">&bull;</span><span><strong>Access rules</strong> &mdash; in the <em>View for all</em> tab, the key icon sets column access per role (editable, read-only, hidden+request, fully hidden).</span></li>
        </ul>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">19 column types are supported: text, number, date, checkbox, select, status, tags, URL, phone, email, location, relation, formula, user, file, emoji, rollup, created/modified, unique ID.</p>
      </section>

      {/* Access flow */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block" />
          Permission flow
        </h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-5 font-mono text-sm leading-loose text-zinc-600 dark:text-zinc-300">
          <div>Dev configures access rules in <span className="text-blue-500">"View for all"</span></div>
          <div className="text-zinc-400 ml-8">&darr; Save for all</div>
          <div className="ml-4">Locked filters &amp; hidden columns &rarr; Owner &amp; User default views</div>
          <div className="text-zinc-400 ml-8">&darr;</div>
          <div className="ml-4">Owner can add further restrictions &rarr; User only</div>
          <div className="text-zinc-400 ml-8">&darr;</div>
          <div className="ml-4">User sees the <span className="text-red-400">most restrictive</span> result of Dev + Owner rules</div>
        </div>
      </section>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center pt-6 border-t border-zinc-100 dark:border-zinc-800">Built with React, Tailwind CSS, dnd-kit &amp; Lucide icons.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="min-h-screen flex flex-col items-center pt-16 px-8 bg-white dark:bg-zinc-950 transition-colors">
      <DataToolbar />
      <Documentation />
    </div>
  </React.StrictMode>,
);
