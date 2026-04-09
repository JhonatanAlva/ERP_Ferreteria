const ExcelJS = require("exceljs");

exports.generarExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reporte Inventario");

  // =========================
  // ESTILOS
  // =========================
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "C1121F" } // rojo empresa
    },
    alignment: { horizontal: "center" },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    }
  };

  const borderStyle = {
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    }
  };

  // =========================
  // TITULO
  // =========================
  sheet.mergeCells("A1:D1");
  const title = sheet.getCell("A1");
  title.value = "REPORTE DE INVENTARIO";
  title.font = { size: 16, bold: true };
  title.alignment = { horizontal: "center" };

  sheet.addRow([]);

  // =========================
  // SUBTITULO
  // =========================
  sheet.mergeCells("A3:D3");
  const subtitle = sheet.getCell("A3");
  subtitle.value = "LISTA DE PRODUCTOS A REABASTECER";
  subtitle.font = { size: 12, bold: true };
  subtitle.alignment = { horizontal: "center" };

  sheet.addRow([]);

  // =========================
  // LIMPIAR DATOS (SIN DUPLICADOS)
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
  // CABECERA TABLA
  // =========================
  const headerRow = sheet.addRow([
    "Producto",
    "Stock",
    "Estado",
    "Acción"
  ]);

  headerRow.eachCell(cell => {
    Object.assign(cell, headerStyle);
  });

  // =========================
  // FILAS
  // =========================
  lista.forEach((p, index) => {
    let estado = "";
    let accion = "";

    if (p.stock === 0) {
      estado = "Sin stock";
      accion = "URGENTE";
    } else {
      estado = "Stock bajo";
      accion = "Reabastecer";
    }

    const row = sheet.addRow([
      p.nombre,
      p.stock,
      estado,
      accion
    ]);

    // bordes
    row.eachCell(cell => {
      Object.assign(cell, borderStyle);
    });

    // color alterno
    if (index % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F5F5F5" }
        };
      });
    }

    // color estado
    if (p.stock === 0) {
      row.getCell(3).font = { color: { argb: "C1121F" }, bold: true };
    } else {
      row.getCell(3).font = { color: { argb: "FCA311" }, bold: true };
    }
  });

  // =========================
  // AJUSTAR COLUMNAS
  // =========================
  sheet.columns = [
    { width: 30 },
    { width: 10 },
    { width: 20 },
    { width: 20 }
  ];

  // =========================
  // EXPORTAR
  // =========================
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=reporte_inventario.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};