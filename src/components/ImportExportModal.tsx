import React, { useRef } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { Transaction, CategoryBudget, Subscription, CurrencyConfig } from '../types';
import { exportToCSV, downloadFile } from '../utils/format';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  subscriptions: Subscription[];
  currency: CurrencyConfig;
  onResetDemo: () => void;
  onClearAll: () => void;
  onImportBackup: (data: { transactions?: Transaction[]; budgets?: CategoryBudget[]; subscriptions?: Subscription[] }) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets,
  subscriptions,
  currency,
  onResetDemo,
  onClearAll,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const csv = exportToCSV(transactions, currency);
    downloadFile(csv, `finledger-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      subscriptions,
    };
    downloadFile(
      JSON.stringify(backup, null, 2),
      `finledger-backup-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          onImportBackup(parsed);
          alert(`Successfully imported ${parsed.transactions.length} transactions.`);
          onClose();
        } else {
          alert('Invalid backup format. Expected a JSON file with transactions array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Data Backup & Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Export Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Export Your Data
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-left"
              >
                <FileSpreadsheet size={20} className="text-slate-700 mb-1.5" />
                <span className="text-xs font-semibold text-slate-900">Spreadsheet CSV</span>
                <span className="text-[11px] text-slate-500">Excel & Google Sheets</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-left"
              >
                <Download size={20} className="text-slate-700 mb-1.5" />
                <span className="text-xs font-semibold text-slate-900">Full JSON Backup</span>
                <span className="text-[11px] text-slate-500">Budgets & subscriptions</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Restore from Backup
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl transition-colors text-xs font-semibold text-slate-700"
            >
              <Upload size={15} />
              <span>Import JSON Backup File</span>
            </button>
          </div>

          {/* Database Reset Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sample Data & Reset
            </h4>
            
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Reset all transactions and budgets to default realistic sample data?')) {
                    onResetDemo();
                    onClose();
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset to Sample Data</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Clear all transactions and start with a completely empty ledger?')) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
