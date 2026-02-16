import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { FileSearch, History } from 'lucide-react';

export default function PlacementPrep() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Prep</h1>
        <p className="text-slate-600">Analyze job descriptions and get readiness scores, skill breakdowns, and preparation plans.</p>
      </div>

      <Card className="md:col-span-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Analyze a job description</h3>
                <p className="text-sm text-slate-600">Paste a JD to get readiness score, skill breakdown, and a 7-day plan.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dashboard/placement/analyze"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white bg-primary hover:opacity-90 transition-opacity"
              >
                Analyze JD
              </Link>
              <Link
                to="/dashboard/placement/history"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/dashboard/placement/analyze"
          className="block p-6 rounded-xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-900">Analyze JD</h3>
          </div>
          <p className="text-sm text-slate-600">
            Paste a job description to get readiness score, skill breakdown, checklist, 7-day plan, and interview questions.
          </p>
        </Link>

        <Link
          to="/dashboard/placement/history"
          className="block p-6 rounded-xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-900">History</h3>
          </div>
          <p className="text-sm text-slate-600">View your past JD analyses and preparation plans.</p>
        </Link>
      </div>
    </div>
  );
}
