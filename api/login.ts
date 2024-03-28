import express, { query } from "express";
import { conn } from "../bdconnect";
import { User } from "../mobel/mobel_user";
import mysql from "mysql";
import util from "util";

export const queryAsync = util.promisify(conn.query).bind(conn);
export const router = express.Router();

router.get("/",(req,res)=>{
    conn.query('select * from  `user` ', (err, result, fields)=>{
        if(err) throw err;
          res.json(result);
        });
});
//login
router.get("/:user/:password", (req, res) => {
    let username = req.params.user;
    let password = req.params.password;
    let sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
    sql = mysql.format(sql, [username, password]);
    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
});

// uid
router.get("/inputuid/:uid",(req,res)=>{
    let id = req.params.uid;
    conn.query("SELECT * FROM user WHERE uid = ?" , [id], (err, result, fields) => {
    if (err) throw err;
        res.json(result);
    });
});

//create user || resigtration
router.post("/",(req,res)=>{
    let body : User =  req.body;
    let sql = 'INSERT INTO `user` (name,`username`, `password`,status) VALUES (?,?,?,"user")';
    sql = mysql.format(sql,[
        body.name,
        body.username,
        body.password,
    ]);
    conn.query(sql,(err,result)=>{
        if(err) throw err ;
        res
            .status(200)
            .json({ affected_row: result.affectedRows, last_idx: result.insertId });
       
    });
});
//update profile
router.put("/profile/:id", async(req,res)=>{
    let uid = req.params.id;
    let data : User = req.body;
    let data_original : User | undefined;
    // Query old data

    let sql = mysql.format('select * from user where uid = ?', [uid]);
    let result = await queryAsync(sql);
    // ข้อมูลยังไม่เป็น json จึงต้องแปลงเป็น json
    const rawData = JSON.parse(JSON.stringify(result));
    console.log("Query old data "+rawData);
    // Updata object data
    data_original = rawData[0] as User;
    console.log("Updata object data "+data_original);

    let up_data = {...data_original, ...data};
    console.log(data);
    console.log(up_data);

    // Save into database
    sql = 'update `user` set username=?,password=?,name=?,profile=?,status=? where uid = ?';
    sql = mysql.format(sql,[
        up_data.username,
        up_data.password,
        up_data.name,
        up_data.profile,
        up_data.status,
        uid

    ]);
    conn.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            if (result.affectedRows > 0) {
                res.status(200).json({ message: "Update successful", affected_rows: result.affectedRows });
            } else {
                res.status(404).json({ message: "No record found for the given ID" });
            }
        }
      });
});