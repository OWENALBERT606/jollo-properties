"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Printer } from "lucide-react";
import { format } from "date-fns";

interface Props { open: boolean; onClose: () => void; valuation: any; }

export default function ReceiptDialog({ open, onClose, valuation }: Props) {
  const payment = valuation?.payments?.[0];

  function handlePrint() {
    const el = document.getElementById("receipt-content");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Receipt</title><style>
      body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
      .header { background: #1B3FA0; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 16px; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px; }
      .total { font-weight: bold; font-size: 16px; color: #1B3FA0; }
      .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; }
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div id="receipt-content">
          <div className="bg-brand-blue text-white p-4 rounded-xl text-center mb-4">
            <div className="flex justify-center mb-2">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="font-bold text-lg">DEMO PROPERTIES</div>
            <div className="text-blue-200 text-xs">Uganda Land Registry</div>
            <div className="text-blue-200 text-xs mt-1">TAX PAYMENT RECEIPT</div>
          </div>

          <div className="space-y-2 text-sm">
            {[
              { label: "Receipt No.", value: payment?.receiptNumber || "—" },
              { label: "Property", value: valuation?.property?.title || "—" },
              { label: "Plot No.", value: valuation?.property?.plotNumber || "—" },
              { label: "Assessed Value", value: `UGX ${Number(valuation?.valuedAmount).toLocaleString()}` },
              { label: "Tax Rate", value: `${(Number(valuation?.taxRate) * 100).toFixed(1)}%` },
              { label: "Payment Method", value: payment?.method || "—" },
              { label: "Date Paid", value: payment?.paidAt ? format(new Date(payment.paidAt), "dd MMM yyyy HH:mm") : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-1">
              <span className="font-bold text-gray-700">Amount Paid</span>
              <span className="font-bold text-brand-blue text-lg">UGX {Number(payment?.amount || valuation?.taxAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center text-xs text-gray-400">
            <div className="mb-2">Officer Signature: ___________________</div>
            <div>This is an official receipt from Demo Properties</div>
            <div>Plot 13, Kampala Road, Kampala, Uganda</div>
          </div>
        </div>

        <Button onClick={handlePrint} className="w-full mt-4 bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </DialogContent>
    </Dialog>
  );
}
