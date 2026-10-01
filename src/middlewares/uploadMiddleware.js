const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

// Carpeta temporal antes de subir a S3
const tmpDir = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

// Storage temporal (se sube a S3 en el controlador y se borra)
const tmpStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `tmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
    cb(null, name)
  },
})

const photoFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'))
}

const importFilter = (req, file, cb) => {
  const allowed = ['.csv', '.xlsx', '.xls']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Solo se permiten archivos CSV, XLSX o XLS'))
}

const uploadPhoto  = multer({ storage: tmpStorage, fileFilter: photoFilter,  limits: { fileSize: 5  * 1024 * 1024 } })
const uploadImport = multer({ storage: tmpStorage, fileFilter: importFilter, limits: { fileSize: 10 * 1024 * 1024 } })
const uploadLogo   = multer({ storage: tmpStorage, fileFilter: photoFilter,  limits: { fileSize: 2  * 1024 * 1024 } })

module.exports = { uploadPhoto, uploadImport, uploadLogo }