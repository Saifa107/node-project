import express from "express";
import { conn } from "../bdconnect";
import { backup } from "../mobel/mobel_backup";
export const router = express.Router();
import mysql from "mysql";
import util from "util";

//แสดง backup ทั้งหมด
router.get("/",(req,res)=>{
    conn.query('select * from  `score` ', (err, result, fields)=>{
        if(err) throw err;
          res.json(result);
        });
});

router.post("/upBack/:did",(req,res)=>{
    let body : backup =  req.body;
    let did = req.params.did;
    let sql = 'INSERT INTO `score`(`score_v`, `did`, `date`) VALUES(?, ? ,?)';
    sql = mysql.format(sql,[
        body.score_v,
        did,
        new Date().toISOString().slice(0, 10)
    ]);
    conn.query(sql,(err,result)=>{
        if(err) throw err ;
        res
            .status(200)
            .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});

