import express from "express";
import { conn } from "../bdconnect";
import { vote } from "../mobel/mobel_vote";
import mysql from "mysql";
import util from "util";
export const router = express.Router();

router.get("/",(req,res)=>{
    conn.query('select * from  `Images` ', (err, result, fields)=>{
        if(err) throw err;
          res.json(result);
        });
});

//เพื่มเมื่อคลิก
router.put("/scors/:did",(req,res)=>{
    let id = req.params.did;
    let sql = mysql.format('UPDATE `Images` SET `vote_count`= vote_count+1 WHERE did = ?',[id]);
    conn.query(sql,(err,result)=>{
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
//ลดเมื่อแพ้
router.put("lose/:did",(req,res)=>{
    let id = req.params.did;
    let sql = mysql.format('PDATE `Images` SET `vote_count`= vote_count-1 WHERE did = ? and vote_count > 0',[id]);
    conn.query(sql,(err,result)=>{
        if (err) {
            throw err;
        } else {
            if (result.affectedRows > 0) {
                res.status(200).json({ message: "ศose vote", affected_rows: result.affectedRows });
            } else {
                res.status(404).json({ message: "No record found for the given ID" });
            }
        }
    });
});
//เรียงดำลับมากที่สุด
router.get("/rank",(req,res)=>{
    conn.query('SELECT * FROM Images ORDER BY vote_count DESC LIMIT 10', (err, result, fields)=>{
        if(err) throw err;
          res.json(result);
        });
});