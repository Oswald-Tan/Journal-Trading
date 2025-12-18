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

      let fonts;
      try {
        fonts = {
          regular: fs.readFileSync(path.join(fontPath, "Outfit-Regular.ttf")),
          bold: fs.readFileSync(path.join(fontPath, "Outfit-Bold.ttf")),
          medium: fs.readFileSync(path.join(fontPath, "Outfit-Medium.ttf")),
          semibold: fs.readFileSync(path.join(fontPath, "Outfit-SemiBold.ttf")),
          light: fs.readFileSync(path.join(fontPath, "Outfit-Light.ttf")),
        };
      } catch (error) {
        console.log("⚠️ Font Outfit tidak ditemukan, menggunakan font default");
        fonts = {
          regular: null,
          bold: null,
          medium: null,
          semibold: null,
          light: null,
        };
      }

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
      if (fonts.regular) {
        doc.registerFont("Outfit-Regular", fonts.regular);
        doc.registerFont("Outfit-Bold", fonts.bold);
        doc.registerFont("Outfit-Medium", fonts.medium);
        doc.registerFont("Outfit-SemiBold", fonts.semibold);
        doc.registerFont("Outfit-Light", fonts.light);
      }

      // Default font fallback
      const fontRegular = fonts.regular ? "Outfit-Regular" : "Helvetica";
      const fontBold = fonts.bold ? "Outfit-Bold" : "Helvetica-Bold";
      const fontMedium = fonts.medium ? "Outfit-Medium" : "Helvetica-Bold";
      const fontSemiBold = fonts.semibold
        ? "Outfit-SemiBold"
        : "Helvetica-Bold";
      const fontLight = fonts.light ? "Outfit-Light" : "Helvetica";

      // Collect chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Constants
      const PAGE_WIDTH = doc.page.width;
      const PAGE_HEIGHT = doc.page.height;
      const MARGIN = 40;
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

      // Color palette
      const COLORS = {
        darkBlue: "#1e293b",
        darkerBlue: "#0f172a",
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
        darkGray: "#334155",
        gray: "#64748b",
        lightGray: "#94a3b8",
        background: "#f8fafc",
        border: "#e2e8f0",
        white: "#ffffff",
        slate100: "#f1f5f9",
        slate200: "#e2e8f0",
        slate300: "#cbd5e1",
        slate700: "#334155",
        slate800: "#1e293b",
        violet600: "#7c3aed",
        emerald500: "#10b981",
        rose500: "#f43f5e",
      };

      // Helper functions
      const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const formatNumber = (num) => {
        if (num === undefined || num === null) return "0";
        return new Intl.NumberFormat("id-ID").format(num);
      };

      const safeStats = {
        totalTrades: stats?.totalTrades || trades.length || 0,
        wins: stats?.wins || 0,
        losses: stats?.losses || 0,
        breakEven: stats?.breakEven || 0,
        winRate: stats?.winRate || 0,
        avgPips: stats?.avgPips || 0,
        profitFactor: stats?.profitFactor || 0,
        largestWin: stats?.largestWin || 0,
        largestLoss: stats?.largestLoss || 0,
        netProfit: stats?.netProfit || 0,
        ...stats,
      };

      // =========== HEADER FUNCTION ===========
      const addHeader = () => {
        const HEADER_HEIGHT = 110;

        const headerGradient = doc
          .linearGradient(0, 0, 0, HEADER_HEIGHT)
          .stop(0, COLORS.darkBlue)
          .stop(1, COLORS.darkerBlue);

        doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill(headerGradient);

        doc
          .fillColor(COLORS.white)
          .fontSize(24)
          .font(fontBold)
          .text("Pips Diary", MARGIN, 32);

        doc
          .fillColor(COLORS.slate300)
          .fontSize(10)
          .font(fontLight)
          .text("Master Your Trading Journey", MARGIN, 60);

        const reportNumber = `TRD-${Date.now().toString().slice(-8)}`;

        doc
          .fillColor(COLORS.slate300)
          .fontSize(10)
          .font(fontRegular)
          .text(reportNumber, PAGE_WIDTH - 220, 60, {
            width: 170,
            align: "right",
          });

        return HEADER_HEIGHT + 30;
      };

      // =========== FOOTER FUNCTION ===========
      const addFooter = (pageNum, totalPages) => {
        const footerY = PAGE_HEIGHT - 75;

        doc
          .moveTo(MARGIN, footerY)
          .lineTo(PAGE_WIDTH - MARGIN, footerY)
          .stroke(COLORS.slate200)
          .lineWidth(1);

        doc
          .fillColor(COLORS.lightGray)
          .fontSize(7)
          .font(fontRegular)
          .text(
            "support@pipsdiary.com | +62 851 7324 6048",
            MARGIN,
            footerY + 12
          );

        doc
          .fillColor(COLORS.gray)
          .fontSize(7)
          .font(fontRegular)
          .text(
            `Page ${pageNum} of ${totalPages}`,
            PAGE_WIDTH / 2 - 30,
            footerY + 12,
            { align: "center" }
          );

        const rightFooterX = PAGE_WIDTH - MARGIN - 180;
        doc.text("www.pipsdiary.com", rightFooterX, footerY + 12, {
          width: 180,
          align: "right",
        });
      };

      // =========== CUSTOMER INFO SECTION ===========
      const addCustomerInfo = (startY) => {
        let currentY = startY;

        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(14)
          .font(fontSemiBold)
          .text("Informasi Pelanggan", MARGIN, currentY);

        currentY += 25;

        const INFO_BOX_HEIGHT = 100;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, INFO_BOX_HEIGHT)
          .fillAndStroke(COLORS.background, COLORS.border)
          .lineWidth(1);

        const colPadding = 20;
        const col1X = MARGIN + colPadding;
        const col2X = MARGIN + CONTENT_WIDTH / 3 + colPadding;
        const col3X = MARGIN + (CONTENT_WIDTH / 3) * 2 + colPadding;

        // Column 1: Company Info
        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(10)
          .font(fontSemiBold)
          .text("Dari:", col1X, currentY + 15);

        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text("Pips Diary", col1X, currentY + 32, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          })
          .text("Manado, Indonesia", col1X, currentY + 45, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          })
          .text("support@pipsdiary.com", col1X, currentY + 58, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          })
          .text("+62 851 7324 6048", col1X, currentY + 71, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          });

        // Column 2: Customer Info
        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(10)
          .font(fontSemiBold)
          .text("Kepada:", col2X, currentY + 15);

        const userName = user?.name || user?.email || "Trader";
        const userEmail = user?.email || "No email provided";

        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text(userName, col2X, currentY + 32, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          })
          .text(userEmail, col2X, currentY + 45, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          });

        if (user?.phone_number) {
          doc.text(user.phone_number, col2X, currentY + 58, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          });
        }

        // Column 3: Report Period
        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(10)
          .font(fontSemiBold)
          .text("Periode Laporan:", col3X, currentY + 15);

        const firstTrade =
          trades.length > 0 ? trades[trades.length - 1]?.date : null;
        const lastTrade = trades.length > 0 ? trades[0]?.date : null;

        const periodText =
          firstTrade && lastTrade
            ? `${formatDate(firstTrade)} - ${formatDate(lastTrade)}`
            : "No data period";

        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text(periodText, col3X, currentY + 32, {
            width: CONTENT_WIDTH / 3 - colPadding * 2,
          })
          .text(
            `Total: ${safeStats.totalTrades} trades`,
            col3X,
            currentY + 45,
            { width: CONTENT_WIDTH / 3 - colPadding * 2 }
          )
          .text(
            `Generated: ${formatDateTime(new Date())}`,
            col3X,
            currentY + 58,
            { width: CONTENT_WIDTH / 3 - colPadding * 2 }
          );

        return currentY + INFO_BOX_HEIGHT + 30;
      };

      // =========== KEY METRICS SECTION ===========
      const addKeyMetrics = (startY) => {
        let currentY = startY;

        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(14)
          .font(fontSemiBold)
          .text("Ringkasan Kinerja Trading", MARGIN, currentY);

        currentY += 25;

        const METRICS_BOX_HEIGHT = 180;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, METRICS_BOX_HEIGHT)
          .fillAndStroke(COLORS.white, COLORS.border)
          .lineWidth(1);

        const boxPadding = 15;
        const metricWidth = (CONTENT_WIDTH - boxPadding * 3) / 2;
        const metricHeight = (METRICS_BOX_HEIGHT - boxPadding * 4) / 3;

        const metrics = [
          {
            label: "Total Trades",
            value: formatNumber(safeStats.totalTrades),
            color: COLORS.violet600,
            row: 0,
            col: 0,
          },
          {
            label: "Win Rate",
            value: `${safeStats.winRate.toFixed(1)}%`,
            color: COLORS.emerald500,
            row: 0,
            col: 1,
          },
          {
            label: "Net Profit",
            value: formatCurrency(
              safeStats.netProfit || 0,
              user?.currency || "IDR"
            ),
            color:
              safeStats.netProfit >= 0 ? COLORS.emerald500 : COLORS.rose500,
            row: 1,
            col: 0,
          },
          {
            label: "Profit Factor",
            value: safeStats.profitFactor?.toFixed(2) || "0.00",
            color:
              (safeStats.profitFactor || 0) >= 1.5
                ? COLORS.emerald500
                : (safeStats.profitFactor || 0) >= 1.0
                ? COLORS.warning
                : COLORS.rose500,
            row: 1,
            col: 1,
          },
          {
            label: "Avg Pips/Trade",
            value: safeStats.avgPips?.toFixed(1) || "0.0",
            color: COLORS.violet600,
            row: 2,
            col: 0,
          },
          {
            label: "Wins/Losses",
            value: `${safeStats.wins || 0} / ${safeStats.losses || 0}`,
            color: COLORS.info,
            row: 2,
            col: 1,
          },
        ];

        metrics.forEach((metric) => {
          const x =
            MARGIN + boxPadding + metric.col * (metricWidth + boxPadding);
          const y =
            currentY + boxPadding + metric.row * (metricHeight + boxPadding);

          // Metric box dengan border
          doc
            .rect(x, y, metricWidth, metricHeight)
            .fillAndStroke(COLORS.background, COLORS.border)
            .lineWidth(0.5);

          // Garis aksen warna di kiri
          doc.rect(x, y, 4, metricHeight).fill(metric.color);

          // Layout flex row dengan space between dan center vertical
          const contentPadding = 10;

          // Posisi Y tengah untuk semua teks
          const centerY = y + metricHeight / 2;

          // Label di kiri - dengan baseline middle untuk center vertical
          doc
            .fillColor(COLORS.gray)
            .fontSize(9)
            .font(fontRegular)
            .text(metric.label, x + contentPadding + 4, centerY, {
              width: metricWidth * 0.5,
              align: "left",
              baseline: "middle",
            });

          // Value di kanan - dengan baseline middle untuk center vertical, font size 12
          doc
            .fillColor(COLORS.darkBlue)
            .fontSize(12)
            .font(fontBold)
            .text(metric.value, x + contentPadding, centerY, {
              width: metricWidth - contentPadding * 2,
              align: "right",
              baseline: "middle",
            });
        });

        return currentY + METRICS_BOX_HEIGHT + 30;
      };

      // =========== WIN/LOSS DISTRIBUTION SECTION ===========
      const addWinLossDistribution = (startY) => {
        let currentY = startY;

        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(14)
          .font(fontSemiBold)
          .text("Analisis Distribusi Hasil Trading", MARGIN, currentY);

        currentY += 25;

        // Prepare data
        const winLossData = [
          {
            name: "Win",
            value: safeStats.wins || 0,
            color: COLORS.emerald500,
            description: "Trading dengan profit",
          },
          {
            name: "Loss",
            value: safeStats.losses || 0,
            color: COLORS.rose500,
            description: "Trading dengan kerugian",
          },
          {
            name: "Break Even",
            value: safeStats.breakEven || 0,
            color: COLORS.warning,
            description: "Trading tanpa untung/rugi",
          },
        ].filter((item) => item.value > 0);

        const total = safeStats.totalTrades || 0;

        // Box utama
        const DIST_BOX_HEIGHT = 140;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, DIST_BOX_HEIGHT)
          .fillAndStroke(COLORS.background, COLORS.border)
          .lineWidth(1);

        // === Bagian Kiri: Visual Diagram ===
        const leftSectionWidth = CONTENT_WIDTH * 0.35;
        const leftStartX = MARGIN + 20;

        // Judul diagram
        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(11)
          .font(fontSemiBold)
          .text("Visualisasi Distribusi", leftStartX, currentY + 15);

        if (total > 0) {
          // Pie chart atau progress bars
          const chartCenterX = leftStartX + leftSectionWidth / 2;
          const chartCenterY = currentY + 70;
          const chartRadius = 35;

          // Gambar pie chart segments
          let startAngle = 0;
          winLossData.forEach((item) => {
            const segmentAngle = (item.value / total) * 360;

            doc
              .moveTo(chartCenterX, chartCenterY)
              .arc(
                chartCenterX,
                chartCenterY,
                chartRadius,
                startAngle,
                startAngle + segmentAngle,
                false
              )
              .fill(item.color)
              .fillOpacity(0.8);

            startAngle += segmentAngle;
          });

          // Reset fill opacity
          doc.fillOpacity(1);

          // Total di tengah pie chart
          doc
            .fillColor(COLORS.darkBlue)
            .fontSize(16)
            .font(fontBold)
            .text(`${total}`, chartCenterX - 20, chartCenterY - 10, {
              width: 40,
              align: "center",
            });
          doc
            .fillColor(COLORS.darkBlue) // Ganti warna dari white ke darkBlue agar terlihat
            .fontSize(8)
            .font(fontRegular)
            .text("Total Trades", chartCenterX - 25, chartCenterY + 8, {
              width: 50,
              align: "center",
            });
        } else {
          doc
            .fillColor(COLORS.gray)
            .fontSize(9)
            .font(fontRegular)
            .text("Tidak ada data trading", leftStartX, currentY + 50, {
              width: leftSectionWidth - 10,
              align: "center",
            });
        }

        // === Bagian Kanan: Detail Statistik ===
        const rightStartX = MARGIN + leftSectionWidth + 30;
        const rightSectionWidth = CONTENT_WIDTH - leftSectionWidth - 40;

        // Judul statistik
        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(11)
          .font(fontSemiBold)
          .text("Detail Statistik", rightStartX, currentY + 15);

        // Tentukan posisi X untuk setiap kolom
        const col1X = rightStartX + 12; // Hasil (setelah bullet)
        const col1Width = 58; // 70-12

        const col2X = rightStartX + 70; // Jumlah
        const col2Width = 45;

        const col3X = rightStartX + 120; // Persentase
        const col3Width = 50;

        const progressBarX = rightStartX + 160; // Progress bar
        const progressBarWidth = 30;

        const col4X = progressBarX + progressBarWidth + 20; // Insight
        const col4Width = rightSectionWidth - (col4X - rightStartX);

        // Header tabel detail - TURUNKAN POSISINYA UNTUK MEMBERI GAP
        const detailHeaderY = currentY + 40; // Dari 35 menjadi 40 untuk memberi gap

        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontSemiBold)
          .text("Hasil", col1X, detailHeaderY, {
            width: col1Width,
            align: "left",
          })
          .text("Jumlah", col2X, detailHeaderY, {
            width: col2Width,
            align: "left",
          })
          .text("Persentase", col3X, detailHeaderY, {
            width: col3Width,
            align: "left",
          })
          .text("Insight", col4X, detailHeaderY, {
            width: col4Width,
            align: "left",
          });

        // Garis header - TURUNKAN POSISINYA LEBIH BAWAH LAGI
        doc
          .moveTo(rightStartX, detailHeaderY + 15) // Dari 8 menjadi 15 untuk gap lebih besar
          .lineTo(rightStartX + rightSectionWidth - 10, detailHeaderY + 15)
          .stroke(COLORS.slate300)
          .lineWidth(0.5);

        // Data detail - TAMBAH JARAK DARI HEADER
        let detailY = detailHeaderY + 25; // Dari 15 menjadi 25 untuk gap lebih besar

        winLossData.forEach((item, index) => {
          const percentage =
            total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          const rowY = detailY + index * 22; // Kurangi dari 22 menjadi 20 jika perlu

          // Bullet warna
          doc.circle(rightStartX + 4, rowY + 4, 3).fill(item.color);

          // Nama hasil
          doc
            .fillColor(COLORS.darkBlue)
            .fontSize(9)
            .font(fontMedium)
            .text(item.name, col1X, rowY, { width: col1Width, align: "left" });

          // Jumlah
          doc
            .fillColor(COLORS.slate700)
            .fontSize(9)
            .font(fontRegular)
            .text(item.value.toString(), col2X, rowY, {
              width: col2Width,
              align: "left",
            });

          // Persentase
          doc
            .fillColor(COLORS.gray)
            .fontSize(9)
            .font(fontSemiBold)
            .text(`${percentage}%`, col3X, rowY, {
              width: col3Width,
              align: "left",
            });

          // Progress bar kecil untuk persentase
          const progressFill = (percentage / 100) * progressBarWidth;
          doc
            .rect(progressBarX, rowY + 3, progressBarWidth, 6)
            .fill(COLORS.slate200);
          doc.rect(progressBarX, rowY + 3, progressFill, 6).fill(item.color);

          // Insight/description singkat
          doc
            .fillColor(COLORS.slate700)
            .fontSize(8)
            .font(fontRegular)
            .text(item.description, col4X, rowY, {
              width: col4Width,
              align: "left",
              lineBreak: false,
            });
        });

        // === Summary di Bawah ===
        const summaryY = currentY + DIST_BOX_HEIGHT - 20; // Dari -25 menjadi -20 untuk kompensasi gap

        if (total > 0) {
          // Win Rate summary
          const winRateText = `Win Rate: ${safeStats.winRate.toFixed(1)}%`;
          const winRateColor =
            safeStats.winRate >= 60
              ? COLORS.emerald500
              : safeStats.winRate >= 40
              ? COLORS.warning
              : COLORS.rose500;

          doc
            .fillColor(winRateColor)
            .fontSize(10)
            .font(fontSemiBold)
            .text(winRateText, leftStartX, summaryY);

          // Loss Rate
          const lossRate =
            total > 0 ? ((safeStats.losses / total) * 100).toFixed(1) : 0;
          doc
            .fillColor(COLORS.slate700)
            .fontSize(9)
            .font(fontRegular)
            .text(`Loss Rate: ${lossRate}%`, leftStartX + 80, summaryY);

          // Net Profit indicator
          const netProfitPerTrade = total > 0 ? safeStats.netProfit / total : 0;
          let profitPerTradeText = `Avg Profit/Trade: ${formatCurrency(
            netProfitPerTrade,
            user?.currency || "IDR"
          )}`;

          doc
            .fillColor(
              netProfitPerTrade >= 0 ? COLORS.emerald500 : COLORS.rose500
            )
            .fontSize(9)
            .font(fontSemiBold)
            .text(profitPerTradeText, rightStartX, summaryY, {
              width: rightSectionWidth,
              align: "left",
            });

          // Garis pemisah - TURUNKAN POSISINYA
          doc
            .moveTo(MARGIN + 20, summaryY - 8) // Dari -5 menjadi -8
            .lineTo(MARGIN + CONTENT_WIDTH - 20, summaryY - 8)
            .stroke(COLORS.slate300)
            .lineWidth(0.5);
        }

        return currentY + DIST_BOX_HEIGHT + 30;
      };

      // =========== RECENT TRADES TABLE ===========
      const addRecentTradesTable = (startY) => {
        let currentY = startY;

        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(14)
          .font(fontSemiBold)
          .text("Trading History", MARGIN, currentY);

        currentY += 25;

        // Table Header
        const TABLE_HEADER_HEIGHT = 32;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, TABLE_HEADER_HEIGHT)
          .fill(COLORS.slate700);

        // Definisikan kolom dengan properti lengkap
        const columns = [
          {
            name: "date",
            header: "Tanggal",
            width: 65,
            align: "left",
            dataWidth: 60, // Lebar untuk data (width - padding)
            padding: 5,
          },
          {
            name: "instrument",
            header: "Instrumen",
            width: 70,
            align: "left",
            dataWidth: 65,
            padding: 5,
          },
          {
            name: "type",
            header: "Tipe",
            width: 42,
            align: "left",
            dataWidth: 37,
            padding: 5,
          },
          {
            name: "lot",
            header: "Lot",
            width: 42,
            align: "left",
            dataWidth: 37,
            padding: 5,
          },
          {
            name: "entry",
            header: "Entry",
            width: 60,
            align: "left",
            dataWidth: 55,
            padding: 5,
          },
          {
            name: "exit",
            header: "Exit",
            width: 60,
            align: "left",
            dataWidth: 55,
            padding: 5,
          },
          {
            name: "pips",
            header: "Pips",
            width: 50,
            align: "left",
            dataWidth: 45,
            padding: 5,
          },
          {
            name: "profit",
            header: "Profit/Loss",
            width: 70,
            align: "left",
            dataWidth: 65,
            padding: 5,
          },
          {
            name: "result",
            header: "Status",
            width: 55,
            align: "left",
            dataWidth: 50,
            padding: 5,
          },
        ];

        // Hitung total width untuk validasi
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const totalDataWidth = columns.reduce(
          (sum, col) => sum + col.dataWidth,
          0
        );

        // Header: Gambar semua kolom dengan posisi yang sama dengan data
        let colX = MARGIN + 8;
        doc.fillColor(COLORS.white).fontSize(9).font(fontSemiBold);

        columns.forEach((column) => {
          // Header menggunakan dataWidth yang sama dengan data
          doc.text(column.header, colX, currentY + 11, {
            width: column.dataWidth,
            lineBreak: false,
            align: column.align,
          });
          colX += column.width; // Gunakan width penuh untuk perpindahan kolom
        });

        currentY += TABLE_HEADER_HEIGHT;

        // Table Rows
        const recentTrades = trades.slice(0, 15);
        const ROW_HEIGHT = 28;

        recentTrades.forEach((trade, index) => {
          if (currentY > PAGE_HEIGHT - 150) {
            doc.addPage();
            currentY = addHeader();
            currentY += 20;

            // Re-add header dengan alignment yang sama
            doc
              .rect(MARGIN, currentY, CONTENT_WIDTH, TABLE_HEADER_HEIGHT)
              .fill(COLORS.slate700);

            doc.fillColor(COLORS.white).fontSize(9).font(fontSemiBold);
            colX = MARGIN + 8;
            columns.forEach((column) => {
              doc.text(column.header, colX, currentY + 11, {
                width: column.dataWidth,
                lineBreak: false,
                align: column.align,
              });
              colX += column.width;
            });

            currentY += TABLE_HEADER_HEIGHT;
          }

          // Row background
          const rowColor = index % 2 === 0 ? COLORS.white : COLORS.slate100;
          doc
            .rect(MARGIN, currentY, CONTENT_WIDTH, ROW_HEIGHT)
            .fillAndStroke(rowColor, COLORS.border)
            .lineWidth(0.5);

          colX = MARGIN + 8;
          const rowY = currentY + 10;

          // Process each column
          columns.forEach((column) => {
            let text = "-";
            let color = COLORS.slate700;
            let fontStyle = fontRegular;
            let fontSize = 8;

            // Format data berdasarkan kolom
            switch (column.name) {
              case "date":
                text = formatDate(trade.date);
                fontStyle = fontRegular;
                break;

              case "instrument":
                text = trade.instrument || "-";
                fontStyle = fontMedium;
                break;

              case "type":
                text = trade.type || "-";
                color =
                  trade.type === "Buy" ? COLORS.emerald500 : COLORS.rose500;
                fontStyle = fontSemiBold;
                break;

              case "lot":
                text = trade.lot ? formatNumber(trade.lot) : "-";
                fontStyle = fontRegular;
                break;

              case "entry":
                text = trade.entry ? formatNumber(trade.entry) : "-";
                fontStyle = fontRegular;
                break;

              case "exit":
                text = trade.exit ? formatNumber(trade.exit) : "-";
                fontStyle = fontRegular;
                break;

              case "pips":
                text = trade.pips ? formatNumber(trade.pips) : "0";
                color =
                  (trade.pips || 0) >= 0 ? COLORS.emerald500 : COLORS.rose500;
                fontStyle = fontMedium;
                break;

              case "profit":
                text = formatCurrency(
                  trade.profit || 0,
                  user?.currency || "IDR"
                );
                color =
                  (trade.profit || 0) >= 0 ? COLORS.emerald500 : COLORS.rose500;
                fontStyle = fontSemiBold;
                break;

              case "result":
                text = trade.result || "Pending";
                color =
                  trade.result === "Win"
                    ? COLORS.emerald500
                    : trade.result === "Lose"
                    ? COLORS.rose500
                    : trade.result === "Break Even"
                    ? COLORS.warning
                    : COLORS.gray;
                fontStyle = fontSemiBold;
                break;
            }

            // Gambar teks dengan properti yang konsisten
            doc
              .fillColor(color)
              .fontSize(fontSize)
              .font(fontStyle)
              .text(text, colX, rowY, {
                width: column.dataWidth,
                align: column.align,
                lineBreak: false,
              });

            colX += column.width; // Pindah ke kolom berikutnya
          });

          currentY += ROW_HEIGHT;
        });

        // Summary row
        const summaryY = currentY + 2;
        const SUMMARY_HEIGHT = 32;

        doc
          .rect(MARGIN, summaryY, CONTENT_WIDTH, SUMMARY_HEIGHT)
          .fill(COLORS.slate800);

        doc
          .fillColor(COLORS.white)
          .fontSize(10)
          .font(fontSemiBold)
          .text(
            `Total: ${recentTrades.length} trades`,
            MARGIN + 15,
            summaryY + 11
          );

        const totalProfit = recentTrades.reduce(
          (sum, trade) => sum + (trade.profit || 0),
          0
        );
        const profitColor =
          totalProfit >= 0 ? COLORS.emerald500 : COLORS.rose500;

        doc
          .fillColor(profitColor)
          .fontSize(12)
          .font(fontBold)
          .text(
            formatCurrency(totalProfit, user?.currency || "IDR"),
            MARGIN + CONTENT_WIDTH - 130,
            summaryY + 10,
            {
              width: 115,
              align: "right",
            }
          );

        return summaryY + SUMMARY_HEIGHT + 30;
      };

      // =========== PERFORMANCE INSIGHTS SECTION ===========
      const addPerformanceInsights = (startY) => {
        let currentY = startY;

        doc
          .fillColor(COLORS.darkBlue)
          .fontSize(14)
          .font(fontSemiBold)
          .text("Analisis & Rekomendasi", MARGIN, currentY);

        currentY += 25;

        const INSIGHTS_HEIGHT = 150;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, INSIGHTS_HEIGHT)
          .fillAndStroke(COLORS.background, COLORS.border)
          .lineWidth(1);

        const padding = 20;
        let insightY = currentY + padding;

        // Win Rate Analysis
        let winRateText = "";
        let winRateColor = COLORS.gray;

        if (safeStats.winRate >= 60) {
          winRateText =
            "Win rate sangat baik! Pertahankan konsistensi dan manajemen risiko Anda.";
          winRateColor = COLORS.emerald500;
        } else if (safeStats.winRate >= 40) {
          winRateText =
            "Performansi baik. Fokus pada peningkatan risk-reward ratio.";
          winRateColor = COLORS.warning;
        } else {
          winRateText =
            "Perlu evaluasi strategi trading dan manajemen risiko lebih ketat.";
          winRateColor = COLORS.rose500;
        }

        // Win Rate Title
        doc
          .fillColor(winRateColor)
          .fontSize(11)
          .font(fontSemiBold)
          .text(`Win Rate: ${safeStats.winRate}%`, MARGIN + padding, insightY);

        // Win Rate Description
        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text(winRateText, MARGIN + padding, insightY + 15, {
            width: CONTENT_WIDTH - padding * 2,
          });

        insightY += 40;

        // Profit Factor Analysis
        let pfText = "";
        let pfColor = COLORS.gray;

        if (safeStats.profitFactor >= 2) {
          pfText =
            "Profit factor kuat menunjukkan manajemen risiko yang efektif.";
          pfColor = COLORS.emerald500;
        } else if (safeStats.profitFactor >= 1.5) {
          pfText =
            "Profit factor wajar. Pertimbangkan optimasi entry/exit strategy.";
          pfColor = COLORS.warning;
        } else {
          pfText =
            "Profit factor perlu perbaikan. Fokus pada cutting losses dengan cepat.";
          pfColor = COLORS.rose500;
        }

        // Profit Factor Title
        doc
          .fillColor(pfColor)
          .fontSize(11)
          .font(fontSemiBold)
          .text(
            `Profit Factor: ${safeStats.profitFactor?.toFixed(2) || "0.00"}`,
            MARGIN + padding,
            insightY
          );

        // Profit Factor Description
        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text(pfText, MARGIN + padding, insightY + 15, {
            width: CONTENT_WIDTH - padding * 2,
          });

        insightY += 40;

        // Risk Assessment
        const largestLoss = Math.abs(safeStats.largestLoss) || 1;
        const riskLevel = largestLoss / (Math.abs(safeStats.netProfit) || 1);
        let riskText = "";
        let riskColor = COLORS.emerald500;

        if (riskLevel > 0.5) {
          riskText =
            "Eksposur risiko tinggi terdeteksi. Pertimbangkan mengurangi ukuran posisi.";
          riskColor = COLORS.rose500;
        } else if (riskLevel > 0.3) {
          riskText =
            "Level risiko moderat. Pantau kerugian terbesar dengan hati-hati.";
          riskColor = COLORS.warning;
        } else {
          riskText =
            "Level risiko terkelola dengan baik. Lanjutkan mengikuti aturan risiko Anda.";
          riskColor = COLORS.emerald500;
        }

        // Risk Assessment Title
        doc
          .fillColor(riskColor)
          .fontSize(11)
          .font(fontSemiBold)
          .text("Analisis Risiko", MARGIN + padding, insightY);

        // Risk Assessment Description
        doc
          .fillColor(COLORS.slate700)
          .fontSize(9)
          .font(fontRegular)
          .text(riskText, MARGIN + padding, insightY + 15, {
            width: CONTENT_WIDTH - padding * 2,
          });

        return currentY + INSIGHTS_HEIGHT + 25;
      };

      // =========== DISCLAIMER SECTION ===========
      const addDisclaimer = (startY) => {
        let currentY = startY;

        // Disclaimer Box
        const DISCLAIMER_HEIGHT = 60;
        doc
          .rect(MARGIN, currentY, CONTENT_WIDTH, DISCLAIMER_HEIGHT)
          .fillAndStroke(COLORS.slate100, COLORS.border)
          .lineWidth(1);

        doc
          .fillColor(COLORS.slate700)
          .fontSize(8)
          .font(fontRegular)
          .text(
            "DISCLAIMER: Laporan ini dibuat untuk tujuan informasional saja. Performa masa lalu tidak menjamin hasil di masa depan. Trading melibatkan risiko kerugian yang substansial. Selalu lakukan analisis independen dan konsultasikan dengan penasihat keuangan sebelum mengambil keputusan trading.",
            MARGIN + 15,
            currentY + 15,
            {
              width: CONTENT_WIDTH - 30,
              align: "center",
              lineGap: 4,
            }
          );

        return currentY + DISCLAIMER_HEIGHT + 20;
      };

      // =========== GENERATE PAGES ===========

      // Page 1: Executive Summary
      let currentY = addHeader();
      currentY = addCustomerInfo(currentY);
      currentY = addKeyMetrics(currentY);
      currentY = addWinLossDistribution(currentY);

      // Check if we need new page for trades table
      if (currentY > PAGE_HEIGHT - 300 && trades.length > 0) {
        doc.addPage();
        currentY = addHeader();
      }

      // Page 2: Recent Trades
      if (trades.length > 0) {
        currentY = addRecentTradesTable(currentY);
      }

      // Check if we need new page for insights
      if (currentY > PAGE_HEIGHT - 250) {
        doc.addPage();
        currentY = addHeader();
      }

      // Page 3: Performance Insights
      currentY = addPerformanceInsights(currentY);
      currentY = addDisclaimer(currentY);

      // Add footers to all pages
      const pageRange = doc.bufferedPageRange();
      for (let i = 0; i < pageRange.count; i++) {
        doc.switchToPage(i);
        addFooter(i + 1, pageRange.count);
      }

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};
