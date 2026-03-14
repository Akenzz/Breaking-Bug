import { jsPDF } from "jspdf";
import type { CategoryGroup } from "@/lib/bills";
import { formatCurrencyPdf, calculateOverallTotal } from "@/lib/bills";

export function generateExpenseReport(groups: CategoryGroup[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
    };

    /* ─── Title ─── */
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Report", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, margin, y);
    y += 4;
    doc.setTextColor(0);

    /* ─── Divider ─── */
    y += 4;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    /* ─── Overall Total ─── */
    const overallTotal = calculateOverallTotal(groups);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Expenses", margin, y);
    doc.setFontSize(18);
    doc.text(formatCurrencyPdf(overallTotal), pageWidth - margin, y, { align: "right" });
    y += 10;

    /* ─── Category Summary Table ─── */
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.text("Category", margin + 2, y);
    doc.text("Bills", margin + 90, y);
    doc.text("Amount", pageWidth - margin - 2, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "normal");
    for (const group of groups) {
        checkPageBreak(8);
        doc.text(group.category, margin + 2, y);
        doc.text(String(group.bills.length), margin + 90, y);
        doc.text(formatCurrencyPdf(group.total), pageWidth - margin - 2, y, { align: "right" });
        y += 6;
    }

    /* ─── Divider ─── */
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    /* ─── Category Details ─── */
    for (const group of groups) {
        checkPageBreak(20);

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(`${group.category}`, margin, y);
        doc.setFontSize(11);
        doc.text(formatCurrencyPdf(group.total), pageWidth - margin, y, { align: "right" });
        y += 8;

        for (const bill of group.bills) {
            checkPageBreak(16);

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(bill.data.merchant || bill.filename, margin + 4, y);
            doc.setFont("helvetica", "normal");
            doc.text(formatCurrencyPdf(bill.data.total), pageWidth - margin, y, {
                align: "right",
            });
            y += 5;

            doc.setFontSize(8);
            doc.setTextColor(120);
            const meta: string[] = [];
            if (bill.data.date) meta.push(bill.data.date);
            if (bill.filename) meta.push(bill.filename);
            if (meta.length) doc.text(meta.join("  ·  "), margin + 4, y);
            y += 4;

            /* Items */
            if (bill.data.items?.length) {
                for (const item of bill.data.items) {
                    checkPageBreak(6);
                    doc.text(`  - ${item.name}`, margin + 8, y);
                    doc.text(formatCurrencyPdf(item.price), pageWidth - margin, y, {
                        align: "right",
                    });
                    y += 4;
                }
            }

            doc.setTextColor(0);
            y += 3;
        }

        /* Category divider */
        y += 2;
        doc.setDrawColor(230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
    }

    /* ─── Footer ─── */
    checkPageBreak(20);
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("SmartPay Expense Report - Auto-generated", pageWidth / 2, y, { align: "center" });

    /* ─── Save ─── */
    doc.save(`expense-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
