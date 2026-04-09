const pool = require("../config/database");


// =============================
// OBTENER PRODUCTOS
// =============================
exports.obtenerProductos = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        p.*,
        c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c
        ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo productos"
    });

  }
};



// =============================
// CREAR PRODUCTO
// =============================
exports.crearProducto = async (req, res) => {

  try {

    const {
      codigo,
      nombre,
      categoria_id,
      precio,
      costo,
      stock,
      stock_minimo,
      descripcion
    } = req.body;

    const imagen = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO productos
      (codigo,nombre,categoria_id,precio,costo,stock,stock_minimo,descripcion,imagen)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        codigo,
        nombre,
        categoria_id,
        precio,
        costo,
        stock,
        stock_minimo,
        descripcion,
        imagen
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error creando producto"
    });

  }

};



// =============================
// EDITAR PRODUCTO
// =============================
exports.editarProducto = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      codigo,
      nombre,
      categoria_id,
      precio,
      costo,
      stock,
      stock_minimo,
      descripcion
    } = req.body;

    let imagen = null;

    if (req.file) {
      imagen = req.file.filename;
    }

    if (imagen) {

      await pool.query(
        `UPDATE productos SET
        codigo=$1,
        nombre=$2,
        categoria_id=$3,
        precio=$4,
        costo=$5,
        stock=$6,
        stock_minimo=$7,
        descripcion=$8,
        imagen=$9
        WHERE id=$10`,
        [
          codigo,
          nombre,
          categoria_id,
          precio,
          costo,
          stock,
          stock_minimo,
          descripcion,
          imagen,
          id
        ]
      );

    } else {

      await pool.query(
        `UPDATE productos SET
        codigo=$1,
        nombre=$2,
        categoria_id=$3,
        precio=$4,
        costo=$5,
        stock=$6,
        stock_minimo=$7,
        descripcion=$8
        WHERE id=$9`,
        [
          codigo,
          nombre,
          categoria_id,
          precio,
          costo,
          stock,
          stock_minimo,
          descripcion,
          id
        ]
      );

    }

    res.json({
      message: "Producto actualizado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error actualizando producto"
    });

  }

};



// =============================
// DESACTIVAR PRODUCTO
// =============================
exports.desactivarProducto = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE productos SET estado=false WHERE id=$1",
      [id]
    );

    res.json({
      message: "Producto desactivado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error desactivando producto"
    });

  }

};

// =============================
// ACTIVAR PRODUCTO
// =============================
exports.activarProducto = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE productos SET estado=true WHERE id=$1",
      [id]
    );

    res.json({
      message: "Producto activado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error activando producto"
    });

  }

};