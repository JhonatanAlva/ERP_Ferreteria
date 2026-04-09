const PDFDocument = require("pdfkit");
const path = require("path");

exports.generarPDF = (data, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=reporte.pdf");

  doc.pipe(res);

  const logoPath = path.join(__dirname, "../assets/logo.png");
  const centerX = doc.page.width / 2;

  // =========================
  // FECHA Y EMPRESA (TOP BAR)
  // =========================
  const fechaTexto = new Date().toLocaleString("es-GT", {
    timeZone: "America/Guatemala",
    dateStyle: "short",
    timeStyle: "short"
  });

  doc.fontSize(9).fillColor("#555").text(fechaTexto, 50, 20);
  doc.text("Aceitera Rodriguez", 0, 20, { align: "right" });

  // =========================
  // HEADER EMPRESARIAL
  // =========================
  const headerTop = 40;

  // Logo centrado
  doc.image(logoPath, centerX - 35, headerTop, { width: 70 });

  // Nombre empresa
  doc
    .fontSize(16)
    .fillColor("#000")
    .text("ACEITERA RODRIGUEZ", 0, headerTop + 80, {
      align: "center"
    });

  // Línea roja corporativa
  doc
    .moveTo(centerX - 150, headerTop + 105)
    .lineTo(centerX + 150, headerTop + 105)
    .lineWidth(2)
    .strokeColor("#c1121f")
    .stroke();

  // =========================
  // TITULO
  // =========================
  const tituloY = headerTop + 120;

  doc
    .fontSize(18)
    .fillColor("#000")
    .text("REPORTE DE INVENTARIO", 0, tituloY, {
      align: "center"
    });

  doc
    .moveTo(centerX - 120, tituloY + 25)
    .lineTo(centerX + 120, tituloY + 25)
    .lineWidth(1)
    .strokeColor("#000")
    .stroke();

  // =========================
  // SUBTITULO
  // =========================
  const subY = tituloY + 45;

  doc
    .fontSize(13)
    .text("LISTA DE PRODUCTOS A REABASTECER", 0, subY, {
      align: "center"
    });

  // =========================
  // DATOS LIMPIOS
  // =========================
  const mapa = new Map();

  [...data.bajoStock, ...data.sinStock].forEach(p => {
    const stock = p.stock ?? 0;

    if (!mapa.has(p.nombre)) {
      mapa.set(p.nombre, { nombre: p.nombre, stock });
    } else {
      const existente = mapa.get(p.nombre);
      if (stock < existente.stock) {
        mapa.set(p.nombre, { nombre: p.nombre, stock });
      }
    }
  });

  const lista = Array.from(mapa.values()).sort((a, b) => a.stock - b.stock);

  // =========================
  // TABLA
  // =========================
  const tableWidth = 500;
  const startX = centerX - tableWidth / 2;

  const col1 = startX + 15;
  const col2 = startX + 200;
  const col3 = startX + 300;
  const col4 = startX + 400;

  let y = subY + 30;

  // HEADER TABLA
  doc.rect(startX, y, tableWidth, 25).fill("#c1121f");

  doc.fillColor("#fff").fontSize(12);
  doc.text("Producto", col1, y + 7);
  doc.text("Stock", col2, y + 7);
  doc.text("Estado", col3, y + 7);
  doc.text("Acción", col4, y + 7);

  y += 25;

  // FILAS
  lista.forEach((p, index) => {
    if (index % 2 === 0) {
      doc.rect(startX, y, tableWidth, 20).fill("#f5f5f5");
    }

    doc.fillColor("#000");

    doc.text(p.nombre, col1, y + 5);
    doc.text(p.stock.toString(), col2, y + 5);

    let estado = "";
    let color = "";
    let accion = "";

    if (p.stock === 0) {
      estado = "Sin stock";
      color = "#c1121f";
      accion = "URGENTE";
    } else {
      estado = "Stock bajo";
      color = "#fca311";
      accion = "Reabastecer";
    }

    doc.fillColor(color);
    doc.text(estado, col3, y + 5);

    doc.fillColor("#000");
    doc.text(accion, col4, y + 5);

    y += 20;
  });

  // BORDE TABLA
  doc
    .rect(startX, subY + 30, tableWidth, lista.length * 20 + 25)
    .lineWidth(1)
    .strokeColor("#000")
    .stroke();

  // =========================
  // FOOTER
  // =========================
  doc
    .fontSize(9)
    .fillColor("#888")
    .text("Documento generado automáticamente por el sistema", 0, y + 40, {
      align: "center"
    });

  doc.end();
};