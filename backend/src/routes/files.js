import express from "express";
import fileController from "../controllers/fileController.js";
import listController from "../controllers/listController.js";
import recycleController from "../controllers/recycleController.js";



const router = express.Router();

// upload routes
router.post("/upload/init", fileController.initMultipartUpload);
router.post("/upload/part-url", fileController.getUploadPartUrl);
router.post("/upload/part-complete", fileController.confirmUploadPart);
router.post("/upload/complete", fileController.completeMultipartUpload);
router.post("/upload/abort", fileController.abortMultipartUpload);

// Static routes
router.get("/", listController.getFiles);
router.get("/trash", listController.getTrash);
router.post("/resolve", listController.resolveFile);

// Dynamic routes
router.get("/:id", listController.getFileById);
router.delete("/:id", listController.deleteFile);
router.get("/:id/download-url", fileController.GetPresignedDownloadURL);
router.get("/:id/versions", listController.getFileVersions);
router.get("/:id/versions/:versionNo/download-url", listController.getVersionDownloadUrl);
router.post("/:id/versions/:versionNo/restore", listController.restoreVersion);

//trashbin
router.post("/:id/restore" , recycleController.restore );
router.delete("/:id/permanent", recycleController.deleteForever);

//delete version
router.delete("/:id/versions/:versionNo", listController.deleteVersion);


export default router;
