import express from "express";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebase";
import { getStorage,ref,getDownloadURL,uploadBytesResumable} from "firebase/storage";
import { accountJson } from "../accountjson"; 

import {  vote } from "../mobel/mobel_vote"; 

import { conn } from "../bdconnect";

import mysql from "mysql";
import util from "util";

import multer from "multer";
import { queryAsync } from "./login";

export const router = express.Router();


const admin = require("firebase-admin");
const serviceAccount = accountJson;


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test1-71f87-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "test1-71f87.appspot.com"
});

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage});


router.get("/selete", (req, res) => {
    conn.query('select * from  Images', (err, result, fields)=>{
    if(err) throw err;
      res.json(result);
    });
});
// รูปที่ User รับมา
router.get("/UidIsImage/:uid",(req,res)=>{
    let id = req.params.uid;
    conn.query('select * from Images where uid = ?',[id],(err,result,feilds)=>{
        if(err) throw err;
            res.json(result);
    }) ; 
});
// upload รูปภาพ
router.post("/", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    
    const metadata = {
        contentType: req.file.mimetype,
        cacheControl: "public,max-age=31536000"
    };
    
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        metadata,
        gzip: true
    });


    blobStream.on("finish", async () => {
        try {
            await blob.makePublic(); // Make the file publicly accessible
            const img = await blob.getSignedUrl({ action: "read", expires: "03-17-2025" }); // Get the URL for the uploaded file
            return res.status(201).json({ img });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Error getting file URL.");
        }
    });

    blobStream.end(req.file.buffer); // Write the file buffer to the blobStream
});
// การ check จำรูปภาพ
router.get("/ImageCount/:uid", (req,res)=>{
    let id = req.params.uid;
    let sql_count_uid = 'select count(*) from Images where uid = ?';
    sql_count_uid = mysql.format(sql_count_uid,[id]);
    conn.query(sql_count_uid,(err,result)=>{
        if(err) throw err;
        res.json(result);
    });
});

router.post("/uploadMySql", async (req,res)=>{
    let body : vote = req.body;
    console.log(body);

    let sql = 'INSERT INTO `Images`( `img`, `uid` ) VALUES(?,?)';
    sql = mysql.format(sql,[
        body.img,
        body.uid,
    ]);
    conn.query(sql,(err,result)=>{
        if(err) throw err;
        res
            .status(201)
            .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});
//เปลี่ยนรูปภาพ
router.put("/ChangeImage/:did", async (req,res)=>{
    let uid = req.params.did;
    let body : vote = req.body;
    let sql = 'UPDATE `Images` SET `img`=?,`uid`=? ,vote_count = 0 WHERE did=?';
    sql = mysql.format(sql,[
       body.img,
       body.uid,
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
//ลบรูปภาพ
router.delete("/deleteImage/:did", async(req,res)=>{
    let id = req.params.did;
    conn.query("delete from Images where did = ?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
});
