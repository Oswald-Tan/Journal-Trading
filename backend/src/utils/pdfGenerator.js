import PDFDocument from "pdfkit";
import { formatCurrency } from "./currencyFormatter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateTradingReportPDF = (
  trades,
  stats,
  user,
  analyticsData
) => {
  return new Promise((resolve, reject) => {
    try {
      // Load font files
      const fontPath = path.join(__dirname, "../../fonts");

      const fonts = {
        regular: fs.readFileSync(path.join(fontPath, "Outfit-Regular.ttf")),
        bold: fs.readFileSync(path.join(fontPath, "Outfit-Bold.ttf")),
        medium: fs.readFileSync(path.join(fontPath, "Outfit-Medium.ttf")),
        semibold: fs.readFileSync(path.join(fontPath, "Outfit-SemiBold.ttf")),
        light: fs.readFileSync(path.join(fontPath, "Outfit-Light.ttf")),
      };

      const chunks = [];
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        bufferPages: true,
        info: {
          Title: "Trading Performance Report",
          Author: "Pips Diary",
          Subject: "Trading Analytics Report",
          Keywords: "trading, forex, stocks, analytics, report",
          CreationDate: new Date(),
        },
      });

      // Register custom fonts
      doc.registerFont("Outfit", fonts.regular);
      doc.registerFont("Outfit-Regular", fonts.regular);
      doc.registerFont("Outfit-Bold", fonts.bold);
      doc.registerFont("Outfit-Medium", fonts.medium);
      doc.registerFont("Outfit-SemiBold", fonts.semibold);
      doc.registerFont("Outfit-Light", fonts.light);

      // Set default font
      doc.font("Outfit");

      // Collect chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Constants
      const PAGE_WIDTH = 595.28; // A4 width in points
      const PAGE_HEIGHT = 841.89; // A4 height in points
      const MARGIN = 40;
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

      // Color palette
      const COLORS = {
        primary: "#7c3aed",
        primaryLight: "#a78bfa",
        primaryDark: "#6d28d9",
        success: "#10b981",
        successLight: "#34d399",
        danger: "#ef4444",
        dangerLight: "#f87171",
        warning: "#f59e0b",
        warningLight: "#fbbf24",
        info: "#3b82f6",
        dark: "#1e293b",
        darkGray: "#334155",
        gray: "#64748b",
        lightGray: "#94a3b8",
        background: "#f8fafc",
        border: "#e2e8f0",
        white: "#ffffff",
      };

      // Helper functions
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const formatNumber = (num) => {
        return new Intl.NumberFormat("id-ID").format(num);
      };

      // Draw gradient background for header
      const drawGradientHeader = () => {
        // Gradient effect using multiple rectangles
        for (let i = 0; i < 60; i++) {
          const opacity = 0.08 - i * 0.001;
          doc
            .rect(0, i, PAGE_WIDTH, 1)
            .fillOpacity(opacity)
            .fill(COLORS.primary);
        }
        doc.fillOpacity(1);
      };

      // Header untuk halaman tertentu
      const addHeader = (pageNum) => {
        drawGradientHeader();

        // Logo/Brand area with accent
        doc.rect(MARGIN - 5, 25, 5, 50).fill(COLORS.primary);

        doc
          .fillColor(COLORS.primary)
          .fontSize(28)
          .font("Outfit-Bold")
          .text("Pips Diary", MARGIN + 5, 30);

        doc
          .fillColor(COLORS.darkGray)
          .fontSize(11)
          .font("Outfit-Medium")
          .text("Professional Trading Performance Report", MARGIN + 5, 62);

        // Username di kanan
        doc
          .fontSize(10)
          .fillColor(COLORS.gray)
          .font("Outfit")
          .text(
            user?.name || user?.email || "User",
            PAGE_WIDTH - MARGIN - 150,
            62,
            {
              width: 150,
              align: "right",
              ellipsis: true,
            }
          );

        // Separator line with gradient effect
        doc
          .moveTo(MARGIN, 95)
          .lineTo(PAGE_WIDTH - MARGIN, 95)
          .lineWidth(2)
          .strokeColor(COLORS.primary)
          .stroke();

        doc
          .moveTo(MARGIN, 97)
          .lineTo(PAGE_WIDTH - MARGIN, 97)
          .lineWidth(0.5)
          .strokeColor(COLORS.primaryLight)
          .strokeOpacity(0.3)
          .stroke()
          .strokeOpacity(1);
      };

      const addSectionTitle = (title, yPos, subtitle = null) => {
        // Section title with underline accent
        doc
          .fontSize(18)
          .font("Outfit-Bold")
          .fillColor(COLORS.dark)
          .text(title, MARGIN, yPos);

        if (subtitle) {
          doc
            .fontSize(10)
            .font("Outfit")
            .fillColor(COLORS.gray)
            .text(subtitle, MARGIN, yPos + 22);
        }

        // Accent line
        doc
          .moveTo(MARGIN, yPos + (subtitle ? 38 : 26))
          .lineTo(MARGIN + 80, yPos + (subtitle ? 38 : 26))
          .lineWidth(3)
          .strokeColor(COLORS.primary)
          .stroke();

        return yPos + (subtitle ? 50 : 40);
      };

      const addKeyMetrics = (startY) => {
        let y = startY;

        // Metrics container with shadow effect
        doc
          .rect(MARGIN - 2, y + 2, CONTENT_WIDTH, 180, 10)
          .fillOpacity(0.03)
          .fill(COLORS.dark);

        doc.fillOpacity(1);
        doc
          .roundedRect(MARGIN, y, CONTENT_WIDTH, 180, 10)
          .fill(COLORS.white)
          .stroke(COLORS.border);

        // Grid layout for metrics (2 columns, 5 rows)
        const metrics = [
          {
            label: "Total Trades",
            value: formatNumber(stats.totalTrades || trades.length),
            color: COLORS.primary,
          },
          {
            label: "Win Rate",
            value: `${stats.winRate || 0}%`,
            color: COLORS.success,
          },
          {
            label: "Net Profit",
            value: formatCurrency(
              stats.netProfit || 0,
              user?.currency || "IDR"
            ),
            color: stats.netProfit >= 0 ? COLORS.success : COLORS.danger,
          },
          {
            label: "Profit Factor",
            value: stats.profitFactor?.toFixed(2) || "0.00",
            color: COLORS.warning,
          },
          {
            label: "Avg Pips/Trade",
            value: stats.avgPips?.toFixed(1) || "0.0",
            color: COLORS.info,
          },
          {
            label: "Largest Win",
            value: formatCurrency(
              stats.largestWin || 0,
              user?.currency || "IDR"
            ),
            color: COLORS.success,
          },
          {
            label: "Largest Loss",
            value: formatCurrency(
              stats.largestLoss || 0,
              user?.currency || "IDR"
            ),
            color: COLORS.danger,
          },
          {
            label: "Total Wins",
            value: formatNumber(stats.wins || 0),
            color: COLORS.success,
          },
          {
            label: "Total Losses",
            value: formatNumber(stats.losses || 0),
            color: COLORS.danger,
          },
          {
            label: "Break Even",
            value: formatNumber(stats.breakEven || 0),
            color: COLORS.warning,
          },
        ];

        let col = 0;
        let row = 0;
        const colWidth = (CONTENT_WIDTH - 20) / 2;
        const rowHeight = 32;

        metrics.forEach((metric) => {
          const x = MARGIN + 10 + col * colWidth;
          const metricY = y + 15 + row * rowHeight;

          // Metric label
          doc
            .fontSize(9)
            .font("Outfit")
            .fillColor(COLORS.gray)
            .text(metric.label, x + 5, metricY);

          // Metric value
          doc
            .fontSize(13)
            .font("Outfit-Bold")
            .fillColor(metric.color)
            .text(metric.value, x + 5, metricY + 12);

          // Separator line between columns
          if (col === 0) {
            doc
              .moveTo(x + colWidth - 5, metricY)
              .lineTo(x + colWidth - 5, metricY + rowHeight - 8)
              .lineWidth(0.5)
              .strokeColor(COLORS.border)
              .strokeOpacity(0.5)
              .stroke()
              .strokeOpacity(1);
          }

          col++;
          if (col > 1) {
            col = 0;
            row++;
          }
        });

        return y + 195;
      };

      const addTradesTable = (startY) => {
        let y = startY;

        // Table container
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 5).fill(COLORS.primary);

        // Table header
        doc.fillColor(COLORS.white);
        doc.fontSize(10).font("Outfit-SemiBold");

        const headers = [
          { text: "Date", x: MARGIN + 8, width: 55 },
          { text: "Instrument", x: MARGIN + 68, width: 70 },
          { text: "Type", x: MARGIN + 143, width: 35 },
          { text: "Lot", x: MARGIN + 183, width: 40 },
          { text: "Entry", x: MARGIN + 228, width: 55 },
          { text: "Exit", x: MARGIN + 288, width: 55 },
          { text: "Profit/Loss", x: MARGIN + 348, width: 75 },
          { text: "Result", x: MARGIN + 428, width: 45 },
          { text: "Pips", x: MARGIN + 478, width: 35 },
        ];

        headers.forEach((header) => {
          doc.text(header.text, header.x, y + 10, { width: header.width });
        });

        y += 30;

        // Table rows with alternating colors
        const recentTrades = trades.slice(0, 20);

        recentTrades.forEach((trade, index) => {
          // Row background
          if (index % 2 === 0) {
            doc.rect(MARGIN, y, CONTENT_WIDTH, 24).fill(COLORS.background);
          } else {
            doc.rect(MARGIN, y, CONTENT_WIDTH, 24).fill(COLORS.white);
          }

          // Row border
          doc.rect(MARGIN, y, CONTENT_WIDTH, 24).stroke(COLORS.border);

          const profitColor =
            trade.profit >= 0 ? COLORS.success : COLORS.danger;
          const resultColor =
            trade.result === "Win"
              ? COLORS.success
              : trade.result === "Lose"
              ? COLORS.danger
              : COLORS.warning;

          doc
            .fontSize(8.5)
            .font("Outfit")
            .fillColor(COLORS.darkGray)
            .text(formatDate(trade.date), MARGIN + 8, y + 7, { width: 55 })
            .font("Outfit-Medium")
            .text(trade.instrument, MARGIN + 68, y + 7, { width: 70 })
            .font("Outfit")
            .text(trade.type, MARGIN + 143, y + 7, { width: 35 })
            .text(
              trade.lot ? formatNumber(trade.lot) : "-",
              MARGIN + 183,
              y + 7,
              { width: 40 }
            )
            .text(
              trade.entry ? formatNumber(trade.entry) : "-",
              MARGIN + 228,
              y + 7,
              { width: 55 }
            )
            .text(
              trade.exit ? formatNumber(trade.exit) : "-",
              MARGIN + 288,
              y + 7,
              { width: 55 }
            )
            .fillColor(profitColor)
            .font("Outfit-SemiBold")
            .text(
              formatCurrency(trade.profit || 0, user?.currency || "IDR"),
              MARGIN + 348,
              y + 7,
              { width: 75 }
            )
            .fillColor(resultColor)
            .font("Outfit-Medium")
            .text(trade.result || "-", MARGIN + 428, y + 7, { width: 45 })
            .fillColor(COLORS.darkGray)
            .font("Outfit")
            .text(trade.pips || 0, MARGIN + 478, y + 7, { width: 35 });

          y += 24;
        });

        // Summary row
        y += 5;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 5).fill(COLORS.dark);

        const netProfitColor =
          stats.netProfit >= 0 ? COLORS.successLight : COLORS.dangerLight;

        doc
          .fontSize(11)
          .font("Outfit-Bold")
          .fillColor(COLORS.white)
          .text(`Total: ${trades.length} Trades`, MARGIN + 15, y + 10)
          .text("Net Profit:", MARGIN + 300, y + 10)
          .fillColor(netProfitColor)
          .text(
            formatCurrency(stats.netProfit || 0, user?.currency || "IDR"),
            MARGIN + 380,
            y + 10
          );

        return y + 45;
      };

      const addAnalyticsCharts = (startY) => {
        let y = startY;

        // Win/Loss Distribution
        y = addSectionTitle(
          "Performance Distribution",
          y,
          "Breakdown of trading outcomes"
        );

        const winLossData = analyticsData.winLossData || [];
        const total = winLossData.reduce((sum, item) => sum + item.value, 0);

        // Distribution cards
        winLossData.forEach((item, index) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          const x = MARGIN + index * 170;

          // Card background
          doc
            .roundedRect(x, y, 160, 70, 8)
            .fill(COLORS.white)
            .stroke(COLORS.border);

          // Color indicator
          doc
            .roundedRect(x + 10, y + 10, 8, 50, 4)
            .fill(item.color || COLORS.primary);

          // Content
          doc
            .fontSize(11)
            .font("Outfit-SemiBold")
            .fillColor(COLORS.dark)
            .text(item.name, x + 25, y + 15);

          doc
            .fontSize(20)
            .font("Outfit-Bold")
            .fillColor(item.color || COLORS.primary)
            .text(item.value, x + 25, y + 32);

          doc
            .fontSize(9)
            .font("Outfit")
            .fillColor(COLORS.gray)
            .text(`${percentage}% of total`, x + 25, y + 52);

          // Progress bar
          doc
            .rect(x + 10, y + 65, 140, 3)
            .fillOpacity(0.2)
            .fill(item.color || COLORS.primary);

          doc.fillOpacity(1);
          doc
            .rect(x + 10, y + 65, (140 * percentage) / 100, 3)
            .fill(item.color || COLORS.primary);
        });

        y += 90;

        // Instrument Performance
        y = addSectionTitle(
          "Top Performing Instruments",
          y,
          "Best and worst performers by profit/loss"
        );

        const instrumentData = analyticsData.instrumentData || [];

        instrumentData.slice(0, 6).forEach((instrument, index) => {
          const maxProfit = Math.max(
            ...instrumentData.map((i) => Math.abs(i.profit))
          );
          const barWidth = Math.min(
            250,
            (Math.abs(instrument.profit) / maxProfit) * 250
          );
          const x = MARGIN;

          // Instrument row
          if (index % 2 === 0) {
            doc.rect(x, y - 2, CONTENT_WIDTH, 28).fill(COLORS.background);
          }

          // Instrument name
          doc
            .fontSize(10)
            .font("Outfit-Medium")
            .fillColor(COLORS.dark)
            .text(instrument.instrument, x + 10, y + 6, { width: 100 });

          // Profit bar
          const barColor =
            instrument.profit >= 0 ? COLORS.success : COLORS.danger;
          const barX = instrument.profit >= 0 ? x + 120 : x + 120;

          doc
            .roundedRect(barX, y + 8, barWidth, 12, 3)
            .fill(barColor)
            .fillOpacity(0.8);

          doc.fillOpacity(1);

          // Profit value with improved badge
          const profitText = formatCurrency(
            instrument.profit,
            user?.currency || "IDR"
          );
          const profitX = x + CONTENT_WIDTH - 120;

          // Background badge yang lebih solid
          doc
            .roundedRect(profitX - 5, y + 4, 115, 20, 10)
            .fill(barColor)
            .fillOpacity(0.8);

          doc.fillOpacity(1);

          // Teks putih untuk kontras maksimal
          doc
            .fontSize(10)
            .font("Outfit-Bold")
            .fillColor(COLORS.white)
            .text(profitText, profitX, y + 8, { width: 105, align: "center" });

          y += 28;
        });

        return y + 10;
      };

      const addPerformanceInsights = (startY) => {
        let y = startY;

        y = addSectionTitle(
          "Performance Insights",
          y,
          "Key observations and recommendations"
        );

        // Insights box
        doc
          .roundedRect(MARGIN, y, CONTENT_WIDTH, 140, 10)
          .fill(COLORS.background)
          .stroke(COLORS.border);

        y += 15;

        // Trading period insight
        doc
          .fontSize(10)
          .font("Outfit")
          .fillColor(COLORS.darkGray)
          .text("📅  ", MARGIN + 15, y, { continued: true })
          .text("Trading Period: ", { continued: true })
          .font("Outfit-SemiBold")
          .fillColor(COLORS.dark)
          .text(
            `${trades.length} trades across ${
              new Set(trades.map((t) => t.date?.substring(0, 7))).size
            } months`
          );

        y += 25;

        // Win rate assessment
        let winRateIcon = "🎯";
        let winRateText = "";
        let winRateColor = COLORS.gray;

        if (stats.winRate >= 60) {
          winRateIcon = "🏆";
          winRateText =
            "Excellent win rate! Maintain consistency and risk management.";
          winRateColor = COLORS.success;
        } else if (stats.winRate >= 40) {
          winRateIcon = "📊";
          winRateText =
            "Good performance. Focus on improving risk-reward ratios.";
          winRateColor = COLORS.warning;
        } else {
          winRateIcon = "⚠️";
          winRateText =
            "Review trading strategy and risk management practices.";
          winRateColor = COLORS.danger;
        }

        doc
          .fontSize(10)
          .font("Outfit")
          .fillColor(winRateColor)
          .text(winRateIcon + "  ", MARGIN + 15, y, { continued: true })
          .text(winRateText, { width: CONTENT_WIDTH - 30 });

        y += 25;

        // Profit factor assessment
        let pfIcon = "📈";
        let pfText = "";
        let pfColor = COLORS.gray;

        if (stats.profitFactor >= 2) {
          pfIcon = "💎";
          pfText = "Strong profit factor indicates effective risk management.";
          pfColor = COLORS.success;
        } else if (stats.profitFactor >= 1.5) {
          pfIcon = "📈";
          pfText =
            "Reasonable profit factor. Consider optimizing entry/exit strategies.";
          pfColor = COLORS.warning;
        } else {
          pfIcon = "⚡";
          pfText =
            "Profit factor needs improvement. Focus on cutting losses quickly.";
          pfColor = COLORS.danger;
        }

        doc
          .fontSize(10)
          .font("Outfit")
          .fillColor(pfColor)
          .text(pfIcon + "  ", MARGIN + 15, y, { continued: true })
          .text(pfText, { width: CONTENT_WIDTH - 30 });

        y += 25;

        // Risk assessment
        const riskLevel = stats.largestLoss / (stats.netProfit || 1);
        let riskIcon = "🛡️";
        let riskText = "";
        let riskColor = COLORS.success;

        if (riskLevel > 0.5) {
          riskIcon = "⚠️";
          riskText =
            "High risk exposure detected. Consider reducing position sizes.";
          riskColor = COLORS.danger;
        } else if (riskLevel > 0.3) {
          riskIcon = "📊";
          riskText =
            "Moderate risk levels. Monitor your largest losses carefully.";
          riskColor = COLORS.warning;
        } else {
          riskIcon = "🛡️";
          riskText =
            "Well-managed risk levels. Continue following your risk rules.";
          riskColor = COLORS.success;
        }

        doc
          .fontSize(10)
          .font("Outfit")
          .fillColor(riskColor)
          .text(riskIcon + "  ", MARGIN + 15, y, { continued: true })
          .text(riskText, { width: CONTENT_WIDTH - 30 });

        y += 40; // Spacing after insights box

        // ======== PERUBAHAN DI SINI ========
        // Tambahkan lebih banyak spasi sebelum Recommendations
        // untuk membuat jarak yang jelas dari konten di atas

        // Optional: Tambahkan garis pemisah tipis
        doc
          .moveTo(MARGIN + 50, y - 15)
          .lineTo(PAGE_WIDTH - MARGIN - 50, y - 15)
          .lineWidth(0.5)
          .strokeColor(COLORS.border)
          .stroke();

        // Tambah spasi ekstra
        y += 25; // <-- Ini yang menambah jarak antara konten dan judul Recommendations
        // ======== AKHIR PERUBAHAN ========

        // Recommendations section
        y = addSectionTitle("Recommendations", y);

        // Recommendations box - pindahkan sedikit ke bawah
        doc
          .roundedRect(MARGIN, y, CONTENT_WIDTH, 125, 10)
          .fill(COLORS.white)
          .stroke(COLORS.primary);

        y += 15;

        const recommendations = [
          {
            icon: "📝",
            text: "Maintain a detailed trading journal for every trade",
          },
          {
            icon: "🔍",
            text: "Review losing trades weekly to identify patterns",
          },
          { icon: "🎯", text: "Stick strictly to your risk management rules" },
          {
            icon: "📉",
            text: "Scale down position sizes during drawdown periods",
          },
          {
            icon: "📚",
            text: "Update your trading plan based on performance data",
          },
        ];

        recommendations.forEach((rec, index) => {
          doc
            .fontSize(10)
            .font("Outfit")
            .fillColor(COLORS.darkGray)
            .text(rec.icon, MARGIN + 15, y)
            .text(rec.text, MARGIN + 35, y, { width: CONTENT_WIDTH - 50 });
          y += 20;
        });

        return y + 20;
      };

      // ========== GENERATE PDF ==========

      // Page 1: Executive Summary
      addHeader(1);

      let currentY = 115;
      currentY = addSectionTitle(
        "Executive Summary",
        currentY,
        "Your trading performance at a glance"
      );
      currentY = addKeyMetrics(currentY);

      // Disclaimer
      doc
        .roundedRect(MARGIN, PAGE_HEIGHT - 90, CONTENT_WIDTH, 35, 8)
        .fill(COLORS.background)
        .stroke(COLORS.border);

      doc
        .fontSize(8)
        .fillColor(COLORS.gray)
        .font("Outfit")
        .text(
          "⚠️ Disclaimer: This report is for informational purposes only. Past performance is not indicative of future results. Trading involves substantial risk of loss.",
          MARGIN + 15,
          PAGE_HEIGHT - 77,
          { width: CONTENT_WIDTH - 30, align: "center" }
        );

      // Page 2: Recent Trades
      if (trades.length > 0) {
        doc.addPage();
        addHeader(2);

        currentY = 115;
        currentY = addSectionTitle(
          "Recent Trades",
          currentY,
          `Showing up to 20 most recent trades from your journal`
        );
        currentY = addTradesTable(currentY);
      }

      // Page 3: Analytics & Insights
      if (trades.length > 0) {
        doc.addPage();
        addHeader(3);

        currentY = 115;
        currentY = addAnalyticsCharts(currentY);

        // Check if we need a new page for insights
        if (currentY > PAGE_HEIGHT - 300) {
          doc.addPage();
          addHeader(4);
          currentY = 115;
        }

        currentY = addPerformanceInsights(currentY);
      }

      // Add footers to all pages
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);

        // Footer
        doc
          .fontSize(7)
          .fillColor(COLORS.lightGray)
          .font("Outfit")
          .text(
            `Pips Diary © ${new Date().getFullYear()}`,
            MARGIN,
            PAGE_HEIGHT - 30,
            { align: "left", lineBreak: false }
          )
          .text(
            `Page ${i + 1} of ${range.count}`,
            PAGE_WIDTH / 2 - 30,
            PAGE_HEIGHT - 30,
            { align: "center", lineBreak: false }
          )
          .text(
            new Date().toLocaleDateString("id-ID"),
            PAGE_WIDTH - MARGIN - 80,
            PAGE_HEIGHT - 30,
            { align: "right", lineBreak: false }
          );
      }

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};
