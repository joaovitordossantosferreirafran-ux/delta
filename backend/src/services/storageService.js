const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class StorageService {
  async uploadPhoto(file, folder = 'photos') {
    try {
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      console.log('Arquivo enviado para S3:', result.Location);

      return {
        url: result.Location,
        key: fileName,
        size: file.size
      };
    } catch (error) {
      console.error('Erro ao fazer upload para S3:', error);
      throw error;
    }
  }

  async deletePhoto(fileKey) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey
      };

      await s3.deleteObject(params).promise();
      console.log('Arquivo deletado do S3:', fileKey);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      throw error;
    }
  }

  async uploadDocument(file, cleanerId) {
    return this.uploadPhoto(file, `documents/${cleanerId}`);
  }

  async getSignedUrl(fileKey, expirationSeconds = 3600) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Expires: expirationSeconds
      };

      const url = await s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
}

module.exports = new StorageService();
