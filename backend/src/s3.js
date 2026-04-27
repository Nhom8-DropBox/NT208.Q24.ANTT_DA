export async function GetPresignedDownloadURL(s3Key) {
    // const AWS = await import("aws-sdk");
    // const s3 = new AWS.S3({
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //     region: process.env.AWS_REGION,
    // });
    
    // const params = {
    //     Bucket: process.env.AWS_S3_BUCKET_NAME,
    //     Key: s3Key,
    //     Expires: 60 * 60, // URL expires in 1 hour
    // };
    // return s3.getSignedUrlPromise("getObject", params);
    return 'https://' + process.env.AWS_S3_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/' + s3Key;
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