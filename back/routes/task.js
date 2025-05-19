import express from "express"
const router=express.Router()
import task from "../controller/task.js"

router.get('/gettask/',task.gettask)
router.patch('/updatetask/:taskId',task.updatetask)

export default router