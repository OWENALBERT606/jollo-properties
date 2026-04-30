"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const tabs = [
  { id: "ownership", label: "Ownership" },
  { id: "transactions", label: "Transactions" },
  { id: "tax", label: "Tax & Payments" },
  { id: "disputes", label: "Disputes" },
];

export default function ReportsClient() {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ownership");

  async function fetchReport(type: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      setData(json.data || []);
      toast.success(`${json.data?.length || 0} records loaded`);
    } catch { toast.error("Failed to load report"); }
    finally { setLoading(false); }
  }

  function exportExcel() {
    if (!data.length) { toast.error("No data to export"); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `demo-properties-${activeTab}-report.xlsx`);
    toast.success("Excel exported");
  }

  async function exportPDF() {
    if (!data.length) { toast.error("No data to export"); return; }
    const res = await fetch("/api/reports/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeTab, data }),
    });
    if (!res.ok) { toast.error("PDF export failed"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `demo-properties-${activeTab}-report.pdf`; a.click();
    toast.success("PDF downloaded");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="space-y-1">
          <Label>From Date</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label>To Date</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
        <Button onClick={() => fetchReport(activeTab)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</> : "Generate Report"}
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={exportExcel} className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" onClick={exportPDF} className="flex items-center gap-2 border-brand-red text-brand-red hover:bg-red-50">
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setData([]); }}>
        <TabsList className="mb-4">
          {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {data.length === 0 ? (
              <div className="text-center py-16">
                <Download className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Click "Generate Report" to load {t.label} data</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{Object.keys(data[0]).map((k) => (
                      <th key={k} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{k}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700">{String(v ?? "—")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
