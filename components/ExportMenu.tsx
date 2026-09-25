'use client';

import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { exportToCsv, exportToXlsx, type ExportColumn } from '@/lib/export';

export default function ExportMenu<T>({
  filename,
  data,
  columns
}: {
  filename: string;
  data: T[];
  columns: ExportColumn<T>[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button className="btn-secondary" onClick={() => setOpen((v) => !v)}>
        <Download size={15} /> Export
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-md border border-border bg-surface shadow-panel">
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-paper"
            onClick={() => { exportToCsv(filename, data, columns); setOpen(false); }}
          >
            Export as .csv
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm hover:bg-paper"
            onClick={() => { exportToXlsx(filename, data, columns); setOpen(false); }}
          >
            Export as .xlsx
          </button>
        </div>
      )}
    </div>
  );
}
