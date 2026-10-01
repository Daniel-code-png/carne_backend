const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { randomUUID } = require('crypto')
const path = require('path')
const fs   = require('fs')

/**
 * S3Service — Subida y eliminación de fotos en AWS S3.
 * Las URLs públicas se guardan en MongoDB como campo photo del usuario.
 */
class S3Service {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
    this.bucket = process.env.AWS_BUCKET_NAME || 'carnet-digi'
    this.baseUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`
  }

  /**
   * Subir foto a S3.
   * @param {string} filePath - Ruta local del archivo temporal (multer)
   * @param {string} universitySlug - Para organizar por carpetas
   * @returns {string} URL pública de la foto
   */
  async uploadPhoto(filePath, universitySlug = 'general') {
    const ext      = path.extname(filePath).toLowerCase()
    const key      = `universities/${universitySlug}/photos/${randomUUID()}${ext}`
    const fileBuffer = fs.readFileSync(filePath)

    const contentTypes = {
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.webp': 'image/webp',
    }

    await this.client.send(new PutObjectCommand({
      Bucket:      this.bucket,
      Key:         key,
      Body:        fileBuffer,
      ContentType: contentTypes[ext] || 'image/jpeg',
    }))

    // Limpiar archivo temporal
    try { fs.unlinkSync(filePath) } catch {}

    const url = `${this.baseUrl}/${key}`
    console.log(`✅ S3: Foto subida → ${url}`)
    return url
  }

  /**
   * Subir logo de universidad a S3.
   */
  async uploadLogo(filePath, universitySlug) {
    const ext    = path.extname(filePath).toLowerCase()
    const key    = `universities/${universitySlug}/logo${ext}`
    const buffer = fs.readFileSync(filePath)

    await this.client.send(new PutObjectCommand({
      Bucket:      this.bucket,
      Key:         key,
      Body:        buffer,
      ContentType: ext === '.png' ? 'image/png' : 'image/jpeg',
    }))

    try { fs.unlinkSync(filePath) } catch {}

    return `${this.baseUrl}/${key}`
  }

  /**
   * Eliminar foto de S3 por URL.
   */
  async deletePhoto(photoUrl) {
    if (!photoUrl || !photoUrl.includes(this.bucket)) return

    try {
      const key = photoUrl.replace(`${this.baseUrl}/`, '')
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
      console.log(`🗑️  S3: Foto eliminada → ${key}`)
    } catch (error) {
      console.warn('⚠️  S3: Error eliminando foto:', error.message)
    }
  }
}

module.exports = new S3Service()