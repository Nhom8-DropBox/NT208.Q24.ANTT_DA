import pool from "../db.js";
import { GetDownloadURL, deleteObject } from "../s3.js";


const listController = {
    getFiles: async (req, res) => {
        const userID = req.user.userID;
        const keyword = req.query.search?.trim() || "";

        try {
            if (!keyword) {

                const result = await pool.query(
                    `SELECT f.id, f.name, f.mime_type, f.created_at, fv.version_no , fv.size_bytes
                    FROM files AS f
                    JOIN file_versions fv ON f.id = fv.file_id
                    WHERE f.owner_id = $1 AND f.deleted_at IS NULL
                    AND fv.version_no = (
                        SELECT MAX(fv2.version_no)
                        FROM file_versions fv2
                        WHERE fv2.file_id = f.id
                    )
                    ORDER BY f.created_at DESC`,
                    [userID]
                );

                return res.status(200).json({
                    files: result.rows

                });
            }

            const result = await pool.query(
                `SELECT f.id, f.name, f.mime_type, f.created_at, fv.version_no , fv.size_bytes
                FROM files AS f
                JOIN file_versions fv ON f.id = fv.file_id
                WHERE f.owner_id = $1 AND f.deleted_at IS NULL
                    AND f.name ILIKE $2
                    AND fv.version_no = (
                                        SELECT MAX(fv2.version_no)
                                        FROM file_versions fv2
                                        WHERE fv2.file_id = f.id
                                    )
                ORDER BY f.created_at DESC`,
                [userID, `%${keyword}%`]
            );

            return res.status(200).json({
                files: result.rows
            });








        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },


    resolveFile: async (req, res) => {
        const { filename, mimeType } = req.body;
        const userId = req.user.userID;

        try {
            const result = await pool.query(
                `SELECT id, name, mime_type
                FROM files
                WHERE owner_id = $1
                    AND name = $2
                    AND mime_type = $3
                    AND deleted_at IS NULL
                LIMIT 1`,
                [userId, filename, mimeType]
            );

            if (result.rows.length === 0) {
                return res.status(200).json({
                    fileId: null
                });
            }

            const file = result.rows[0];

            return res.status(200).json({
                fileId: file.id,
                name: file.name,
                mimeType: file.mime_type
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },



    getFileById: async (req, res) => {
        const fileId = req.params.id;
        const userID = req.user.userID;
        try {
            const result = await pool.query(
                `SELECT f.id, f.owner_id, f.name, f.mime_type, f.created_at, f.updated_at, fv.size_bytes
                FROM files f
                JOIN file_versions fv ON fv.file_id = f.id
                WHERE f.id = $1 AND f.deleted_at IS NULL
                ORDER BY fv.version_no DESC`,
                [fileId]
            );
            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }
            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            return res.status(200).json({
                file: file
            });




        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }

    },

    restoreFile: async (req, res) => {

        const fileId = req.params.id;
        const userID = req.user.userID;

        try {
            const result = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );

            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }
            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen xoa file"
                });
            }

            if (!file.deleted_at) {
                return res.status(400).json({
                    message: "File van con ma!"
                });
            }

            await pool.query(
                `UPDATE files
                SET deleted_at = NULL
                WHERE id = $1`,
                [fileId]
            );

            return res.status(200).json({
                success: true,
                fileId: fileId,
                message: "Da khoi phuc file"
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },
    deleteFile: async (req, res) => {

        const fileId = req.params.id;
        const userID = req.user.userID;

        try {
            const result = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );

            const file = result.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }
            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen xoa file"
                });
            }

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa truoc do"
                });
            }

            await pool.query(
                `UPDATE files
                SET deleted_at = NOW()
                WHERE id = $1`,
                [fileId]
            );

            return res.status(200).json({
                success: true,
                fileId: fileId,
                message: "Da xoa file"
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }


    },

    getTrash: async (req, res) => {
        const userID = req.user.userID;

        try {
            const trashResult = await pool.query(
                `SELECT f.id, f.name, f.mime_type, f.deleted_at, f.created_at, f.updated_at, f.deleted_at
                FROM files f
                JOIN file_versions fv ON fv.file_id = f.id
                WHERE f.owner_id = $1 AND f.deleted_at IS NOT NULL
                AND fv.version_no = (
                    SELECT MAX(fv2.version_no)
                    FROM file_versions fv2
                    WHERE fv2.file_id = f.id
                )
                ORDER BY f.deleted_at DESC`, // Sắp xếp file mới xóa lên đầu
                [userID]
            );

            const trashFiles = trashResult.rows;

            if (trashFiles?.length === 0) {
                return res.status(200).json({
                    message: "Thùng rác trống",
                    files: []
                });
            }

            const formattedTrashFiles = trashFiles?.map((file) => ({
                id: file.id,
                name: file.name,
                mimeType: file.mime_type,
                deletedAt: file.deleted_at,
                sizeBytes: file.size_bytes
            }));

            return res.status(200).json({
                totalItems: formattedTrashFiles.length,
                files: formattedTrashFiles
            });
        }
        catch (err) {
            console.error("Lỗi getTrash: ", err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    deletePermanent: async (req, res) => {
        const fileID = req.params.id;
        const userID = req.user.userID;

        try {
            // BƯỚC 1: Lấy danh sách s3_key của tất cả version để xóa trên S3 AWS
            const versionsResult = await pool.query(
                `SELECT s3_key FROM file_versions WHERE file_id = $1`,
                [fileID]
            );
            const s3Keys = versionsResult.rows.map(row => row.s3_key);

            // TODO: Viết hàm gọi AWS SDK để xóa mảng s3Keys này trên S3 bucket của bạn
            // Ví dụ: await s3.deleteObjects({ Bucket: '...', Delete: { Objects: s3Keys.map(key => ({Key: key})) } }).promise();

            // BƯỚC 2: Xóa vĩnh viễn khỏi Database (Cascade sẽ tự dọn các bảng file_versions, share_links...)
            const deleteResult = await pool.query(
                `DELETE FROM files 
                WHERE id = $1 AND owner_id = $2 
                RETURNING id`,
                [fileID, userID]
            );

            if (deleteResult.rowCount === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy file hoặc bạn không có quyền xóa"
                });
            }

            return res.status(200).json({
                message: "Đã xóa file vĩnh viễn"
            });

        } catch (err) {
            console.error("Lỗi xóa vĩnh viễn:", err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    getFileVersions: async (req, res) => {
        const fileID = req.params.id;
        const userID = req.user.userID;

        try {
            const fileResult = await pool.query(
                `SELECT id, owner_id, deleted_at
                FROM files
                WHERE id = $1`,
                [fileID]
            );

            const file = fileResult.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }

            if (file.owner_id !== userID) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa"
                });
            }

            const versionResult = await pool.query(
                `SELECT id, version_no, size_bytes, etag, created_at
                FROM file_versions
                WHERE file_id = $1
                ORDER BY version_no DESC`,
                [fileID]
            );

            const versions = versionResult.rows;


            const maxVersion = versions[0].version_no;

            const formattedVersions = versions.map((row) => ({
                id: row.id,
                versionNo: row.version_no,
                sizeBytes: row.size_bytes,
                etag: row.etag,
                createdAt: row.created_at,
                isCurrent: row.version_no === maxVersion,
                isOriginal: row.version_no === 1
            }));



            return res.status(200).json({
                fileId: fileID,
                versions: formattedVersions
            });




        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    getVersionDownloadUrl: async (req, res) => {
        const fileId = req.params.id;
        const versionNo = req.params.versionNo;
        const userId = req.user.userID;

        try {
            const fileResult = await pool.query(
                `SELECT id, owner_id, name, deleted_at
                FROM files
                WHERE id = $1`,
                [fileId]
            );

            const file = fileResult.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }

            if (file.owner_id !== userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa"
                });
            }

            const versionResult = await pool.query(
                `SELECT id, file_id, version_no, s3_key, size_bytes, etag, created_at
                FROM file_versions
                WHERE file_id = $1 AND version_no = $2`,
                [fileId, versionNo || 1]
            );

            const version = versionResult.rows[0];


            if (!version) {
                return res.status(404).json({
                    message: "Khong tim thay version"
                });
            }

            const { downloadURL } = await GetDownloadURL({
                key: version.s3_key,
                fileName: file.name
            });

            return res.status(200).json({
                fileId: fileId,
                versionId: version.id,
                versionNo: version.version_no,
                downloadURL: downloadURL
            });





        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    restoreVersion: async (req, res) => {
        const fileId = req.params.id;
        const versionNo = req.params.versionNo;
        const userId = req.user.userID;

        try {
            const fileResult = await pool.query(
                `SELECT id, owner_id, deleted_at
            FROM files
            WHERE id = $1`,
                [fileId]
            );

            const file = fileResult.rows[0];

            if (!file) {
                return res.status(404).json({
                    message: "Khong tim thay file"
                });
            }

            if (file.owner_id !== userId) {
                return res.status(403).json({
                    message: "Khong co quyen truy cap file"
                });
            }

            if (file.deleted_at) {
                return res.status(400).json({
                    message: "File da bi xoa"
                });
            }

            const versionResult = await pool.query(
                `SELECT id, file_id, version_no, s3_key, size_bytes, etag, created_at
                FROM file_versions
                WHERE file_id = $1 AND version_no = $2`,
                [fileId, versionNo]
            );

            const version = versionResult.rows[0];

            if (!version) {
                return res.status(404).json({
                    message: "Khong tim thay version"
                });
            }


            // Tìm version lớn nhất
            const maxVersionResult = await pool.query(
                `SELECT COALESCE(MAX(version_no), 0) AS max_version
            FROM file_versions
            WHERE file_id = $1`,
                [fileId]
            );

            const maxVersion = maxVersionResult.rows[0].max_version;
            const nextVersion = Number(maxVersion) + 1;

            const newVersion = await pool.query(
                `INSERT INTO file_versions (file_id, version_no, s3_key, size_bytes, etag)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, version_no`,
                [fileId, nextVersion, version.s3_key, version.size_bytes, version.etag]
            );

            const countResult = await pool.query(
                `SELECT COUNT(*) AS total
                FROM file_versions
                WHERE file_id = $1`,
                [fileId]
            );

            const total = Number(countResult.rows[0].total);

            if (total > 5) {
                const oldestResult = await pool.query(
                    `SELECT id, s3_key
                    FROM file_versions
                    WHERE file_id = $1
                    ORDER BY version_no ASC
                    LIMIT 1`,
                    [fileId]
                );

                const oldest = oldestResult.rows[0];

                const sameKeyResult = await pool.query(
                    `SELECT COUNT(*) AS total
                    FROM file_versions
                    WHERE s3_key = $1 AND id <> $2`,
                    [oldest.s3_key, oldest.id]
                );

                const sameKeyCount = Number(sameKeyResult.rows[0].total);

                if (sameKeyCount === 0) {
                    await deleteObject(oldest.s3_key);
                }

                await pool.query(
                    `DELETE FROM file_versions WHERE id = $1`,
                    [oldest.id]
                );
            }

            return res.status(200).json({
                success: true,
                fileId: fileId,
                restoredFromVersionNo: version.version_no,
                newVersionId: newVersion.rows[0].id,
                versionNo: newVersion.rows[0].version_no,
                message: "Restore thanh cong"
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Bad Server"
            });
        }
    },

    deleteVersion: async (req, res) => {
        const fileId = req.params.id;
        const versionNo = req.params.versionNo;
        const userId = req.user.userID;

        try {
        const fileResult = await pool.query(
            `SELECT id, owner_id, deleted_at
            FROM files
            WHERE id = $1`,
            [fileId]
        );
        const file = fileResult.rows[0];

        if (!file) 
            return res.status(404).json({ message: "Khong tim thay file" });
        if (file.owner_id !== userId) 
            return res.status(403).json({ message: "Khong co quyen xoa version" });
        if (file.deleted_at) 
            return res.status(400).json({ message: "File da bi xoa" });


        const versionResult = await pool.query(
            `SELECT id, file_id, version_no, s3_key
            FROM file_versions
            WHERE file_id = $1 AND version_no = $2`,
            [fileId, versionNo]
        );

        const version = versionResult.rows[0]

        const maxResult = await pool.query(
            `SELECT MAX(version_no)
            FROM file_versions
            WHERE file_id = $1`,
            [fileId]
        );

        if (!version) return res.status(404).json({message: "Khong tim thay version" });
        
        if (version == maxResult.rows[0].MAX ) return res.status(400).json({message: "Khong duoc xoa version latest" });


        //check xem ai dùng chung s3_key không
        const sameKeyResult = await pool.query(
            `SELECT COUNT(*) AS total
            FROM file_versions
            WHERE s3_key = $1 AND id <> $2`,
            [version.s3_key, version.id]
        );

        //XÓa rows version
        await pool.query(
            `DELETE FROM file_versions
            WHERE id = $1`,
            [version.id]
        );
        

        const sameKeyCount = Number(sameKeyResult.rows[0].total);
            if (sameKeyCount === 0) {
            await deleteObject(version.s3_key);
        }





        return res.status(200).json({
            fileID: fileId,
            message: "Da xoa version da chon cua file ",
        });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
            message: "Bad Server"
            });
        }
    }




};

export default listController;
