import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export const uploadSingle = upload.single('avatar');
export const uploadImages = upload.array('images', 6);
