import express from "express";
import fileController from "../controllers/fileController.js";

const router = express.Router();

// upload routes
router.post("/upload/init", fileController.initMultipartUpload);
router.post("/upload/part-url", fileController.getUploadPartUrl);
router.post("/upload/part-complete", fileController.confirmUploadPart);
router.get("/upload/:sessionId/status", fileController.getUploadSessionStatus);
router.post("/upload/complete", fileController.completeMultipartUpload);
router.post("/upload/abort", fileController.abortMultipartUpload);

export default router;
