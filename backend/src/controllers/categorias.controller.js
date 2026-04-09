const pool = require("../config/database");

exports.obtenerCategorias = async (req,res)=>{

 const result = await pool.query(
   "SELECT * FROM categorias ORDER BY nombre"
 );

 res.json(result.rows);

};

exports.crearCategoria = async (req,res)=>{

 const {nombre} = req.body;

 const result = await pool.query(
   "INSERT INTO categorias(nombre) VALUES($1) RETURNING *",
   [nombre]
 );

 res.json(result.rows[0]);

};