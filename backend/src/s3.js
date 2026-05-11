//import của init

import { S3Client, CreateMultipartUploadCommand } from "@aws-sdk/client-s3";

// Import của getUploadPartUrl
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//import của complete
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

//import download
import { GetObjectCommand } from "@aws-sdk/client-s3";




const endpoint = process.env.MINIO_ENDPOINT;
const port = process.env.MINIO_PORT;
const accessKey = process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_SECRET_KEY;
const bucket = process.env.MINIO_BUCKET;
const useSSL = process.env.MINIO_USE_SSL === "true";
const endpointUrl = `${useSSL ? "https" : "http"}://${endpoint}:${port}`;

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: endpointUrl,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  },
  forcePathStyle: true
});


export async function GetDownloadURL({ key }) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="note.txt"`,

    });
    
    const downloadURL = await getSignedUrl(s3Client,command,{
        expiresIn: 3600
    });
    return { downloadURL }
}

export async function deleteObject(s3Key) {
    // const AWS = await import("aws-sdk");
    // const s3 = new AWS.S3({
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //     region: process.env.AWS_REGION,
    // });

    // const params = {
    //     Bucket: process.env.AWS_S3_BUCKET_NAME,
    //     Key: s3Key
    // };
    // return s3.deleteObject(params).promise();
    console.log("Deleted object with key: " + s3Key);
}




export async function createMultipartUpload({key , contentType, metadata}) {

    console.log("Creating multipart upload with key:", key);

    const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Metadata: metadata
    })
    const response = await s3Client.send(command);
    console.log("MinIO UploadId:", response.UploadId);



    return {
        uploadId: response.UploadId
    };
    
}

export async function getPartPresignedUrl({ key, uploadId, partNumber }) {
    const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber
    })

    const uploadUrl = await getSignedUrl(s3Client , command ,{expiresIn: 3600} )
    return { uploadUrl };

};

export async function completeUpload({ key, uploadId, parts }) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
        Parts: parts
    }
  });

  const response = await s3Client.send(command);

  return {
    location: response.Location,
    etag: response.ETag
  }

}
